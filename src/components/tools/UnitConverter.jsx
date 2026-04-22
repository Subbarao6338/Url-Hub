import React, { useState, useEffect } from 'react';

const UnitConverter = ({ onResultChange }) => {
  const [value, setValue] = useState(1);
  const [fromUnit, setFromUnit] = useState('km');
  const [toUnit, setToUnit] = useState('m');
  const [result, setResult] = useState(0);

  const rates = {
    'km_m': 1000, 'm_km': 0.001, 'km_mi': 0.621371, 'mi_km': 1.60934, 'm_mi': 0.000621371, 'mi_m': 1609.34,
    'kg_lb': 2.20462, 'lb_kg': 0.453592,
    'mps_kph': 3.6, 'kph_mps': 1/3.6, 'mps_mph': 2.23694, 'mph_mps': 0.44704,
    'kb_mb': 0.001, 'mb_kb': 1000, 'mb_gb': 0.001, 'gb_mb': 1000,
    'sqm_sqft': 10.7639, 'sqft_sqm': 0.092903
  };

  useEffect(() => {
    convertUnits();
  }, [value, fromUnit, toUnit]);

  const convertUnits = () => {
    const val = parseFloat(value) || 0;
    let res = val;

    if (fromUnit === 'c' && toUnit === 'f') res = (val * 9/5) + 32;
    else if (fromUnit === 'f' && toUnit === 'c') res = (val - 32) * 5/9;
    else if (fromUnit === 'c' && toUnit === 'k') res = val + 273.15;
    else if (fromUnit === 'k' && toUnit === 'c') res = val - 273.15;
    else if (fromUnit !== toUnit) {
      const key = `${fromUnit}_${toUnit}`;
      res = rates[key] ? val * rates[key] : (rates[`${toUnit}_${fromUnit}`] ? val / rates[`${toUnit}_${fromUnit}`] : "Invalid");
    }
    setResult(typeof res === 'number' ? parseFloat(res.toFixed(4)) : res);
  };

  useEffect(() => {
    onResultChange({
      text: `${value} ${fromUnit} = ${result} ${toUnit}`,
      filename: 'unit_conversion.txt'
    });
  }, [value, fromUnit, toUnit, result, onResultChange]);

  return (
    <div className="tool-form">
      <div className="form-group">
        <label>Value</label>
        <input type="number" value={value} onChange={(e) => setValue(e.target.value)} />
      </div>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '15px' }}>
        <select value={fromUnit} onChange={(e) => setFromUnit(e.target.value)} style={{ flex: 1 }}>
          <optgroup label="Length">
            <option value="km">Kilometers (km)</option>
            <option value="m">Meters (m)</option>
            <option value="mi">Miles (mi)</option>
          </optgroup>
          <optgroup label="Weight">
            <option value="kg">Kilograms (kg)</option>
            <option value="lb">Pounds (lb)</option>
          </optgroup>
          <optgroup label="Temperature">
            <option value="c">Celsius (°C)</option>
            <option value="f">Fahrenheit (°F)</option>
            <option value="k">Kelvin (K)</option>
          </optgroup>
          <optgroup label="Speed">
            <option value="mps">Meters/sec (m/s)</option>
            <option value="kph">Kilometers/hr (km/h)</option>
            <option value="mph">Miles/hr (mph)</option>
          </optgroup>
          <optgroup label="Data">
            <option value="kb">Kilobytes (KB)</option>
            <option value="mb">Megabytes (MB)</option>
            <option value="gb">Gigabytes (GB)</option>
          </optgroup>
          <optgroup label="Area">
            <option value="sqm">Sq Meters (m²)</option>
            <option value="sqft">Sq Feet (ft²)</option>
          </optgroup>
        </select>
        <span className="material-icons" style={{ opacity: 0.3 }}>arrow_forward</span>
        <select value={toUnit} onChange={(e) => setToUnit(e.target.value)} style={{ flex: 1 }}>
          <optgroup label="Length">
            <option value="m">Meters (m)</option>
            <option value="km">Kilometers (km)</option>
            <option value="mi">Miles (mi)</option>
          </optgroup>
          <optgroup label="Weight">
            <option value="kg">Kilograms (kg)</option>
            <option value="lb">Pounds (lb)</option>
          </optgroup>
          <optgroup label="Temperature">
            <option value="f">Fahrenheit (°F)</option>
            <option value="c">Celsius (°C)</option>
            <option value="k">Kelvin (K)</option>
          </optgroup>
          <optgroup label="Speed">
             <option value="kph">Kilometers/hr (km/h)</option>
             <option value="mps">Meters/sec (m/s)</option>
             <option value="mph">Miles/hr (mph)</option>
          </optgroup>
          <optgroup label="Data">
            <option value="mb">Megabytes (MB)</option>
            <option value="kb">Kilobytes (KB)</option>
            <option value="gb">Gigabytes (GB)</option>
          </optgroup>
          <optgroup label="Area">
            <option value="sqft">Sq Feet (ft²)</option>
            <option value="sqm">Sq Meters (m²)</option>
          </optgroup>
        </select>
      </div>
      <div className="tool-result" style={{ marginTop: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: 0.8, textTransform: 'uppercase', opacity: 0.5, marginBottom: '5px' }}>Result</div>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>{result}</div>
      </div>
    </div>
  );
};

export default UnitConverter;
