import React, { useState, useEffect } from 'react';

const UnitConverter = ({ onResultChange }) => {
  const [value, setValue] = useState(1);
  const [fromUnit, setFromUnit] = useState('km');
  const [toUnit, setToUnit] = useState('m');
  const [result, setResult] = useState(0);

  const rates = {
    'km_m': 1000, 'm_km': 0.001, 'km_mi': 0.621371, 'mi_km': 1.60934, 'm_mi': 0.000621371, 'mi_m': 1609.34,
    'kg_lb': 2.20462, 'lb_kg': 0.453592
  };

  useEffect(() => {
    convertUnits();
  }, [value, fromUnit, toUnit]);

  const convertUnits = () => {
    const val = parseFloat(value) || 0;
    let res = val;
    if (fromUnit !== toUnit) {
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
          <option value="km">Kilometers (km)</option>
          <option value="m">Meters (m)</option>
          <option value="mi">Miles (mi)</option>
          <option value="kg">Kilograms (kg)</option>
          <option value="lb">Pounds (lb)</option>
        </select>
        <span className="material-icons" style={{ opacity: 0.3 }}>arrow_forward</span>
        <select value={toUnit} onChange={(e) => setToUnit(e.target.value)} style={{ flex: 1 }}>
          <option value="m">Meters (m)</option>
          <option value="km">Kilometers (km)</option>
          <option value="mi">Miles (mi)</option>
          <option value="kg">Kilograms (kg)</option>
          <option value="lb">Pounds (lb)</option>
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
