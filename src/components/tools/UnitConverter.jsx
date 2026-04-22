import React, { useState, useEffect } from 'react';

const UnitConverter = ({ onResultChange }) => {
  const [value, setValue] = useState(1);
  const [category, setCategory] = useState('Length');
  const [fromUnit, setFromUnit] = useState('meters');
  const [toUnit, setToUnit] = useState('feet');

  const conversions = {
    Length: {
      meters: 1,
      kilometers: 0.001,
      centimeters: 100,
      millimeters: 1000,
      miles: 0.000621371,
      yards: 1.09361,
      feet: 3.28084,
      inches: 39.3701,
      nanometers: 1e9,
      micrometers: 1e6,
      nautical_miles: 0.000539957
    },
    Weight: {
      kilograms: 1,
      grams: 1000,
      milligrams: 1000000,
      pounds: 2.20462,
      ounces: 35.274,
      tons: 0.001,
      stones: 0.157473,
      carats: 5000
    },
    Temperature: {
      celsius: (v) => v,
      fahrenheit: (v) => (v * 9/5) + 32,
      kelvin: (v) => v + 273.15
    },
    Area: {
      square_meters: 1,
      square_kilometers: 1e-6,
      square_miles: 3.861e-7,
      acres: 0.000247105,
      hectares: 1e-4,
      square_feet: 10.7639
    },
    Volume: {
      liters: 1,
      milliliters: 1000,
      gallons: 0.264172,
      quarts: 1.05669,
      pints: 2.11338,
      cups: 4.22675,
      cubic_meters: 0.001
    },
    Speed: {
      meters_per_second: 1,
      kilometers_per_hour: 3.6,
      miles_per_hour: 2.23694,
      knots: 1.94384,
      mach: 0.00293867
    },
    Data: {
      bytes: 1,
      kilobytes: 1/1024,
      megabytes: 1/(1024**2),
      gigabytes: 1/(1024**3),
      terabytes: 1/(1024**4),
      bits: 8
    },
    Time: {
      seconds: 1,
      minutes: 1/60,
      hours: 1/3600,
      days: 1/86400,
      weeks: 1/604800,
      months: 1/2.628e+6,
      years: 1/3.154e+7
    }
  };

  useEffect(() => {
    const units = Object.keys(conversions[category]);
    setFromUnit(units[0]);
    setToUnit(units[1] || units[0]);
  }, [category]);

  const convert = () => {
    if (category === 'Temperature') {
      let base;
      if (fromUnit === 'celsius') base = value;
      else if (fromUnit === 'fahrenheit') base = (value - 32) * 5/9;
      else if (fromUnit === 'kelvin') base = value - 273.15;

      if (toUnit === 'celsius') return base;
      if (toUnit === 'fahrenheit') return (base * 9/5) + 32;
      if (toUnit === 'kelvin') return base + 273.15;
      return base;
    }

    const fromRate = conversions[category][fromUnit];
    const toRate = conversions[category][toUnit];
    return (value / fromRate) * toRate;
  };

  const result = convert();

  useEffect(() => {
    onResultChange({
      text: `${value} ${fromUnit} = ${result.toFixed(6).replace(/\.?0+$/, '')} ${toUnit}`,
      filename: `conversion_${category.toLowerCase()}.txt`
    });
  }, [value, fromUnit, toUnit, category, result, onResultChange]);

  return (
    <div className="tool-form">
      <div className="tool-nav scroll-nav">
        {Object.keys(conversions).map((cat) => (
          <button
            key={cat}
            className={`pill ${category === cat ? 'active' : ''}`}
            onClick={() => setCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="form-group">
        <label className="label-bold">Input Value</label>
        <input
          type="number"
          value={value}
          onChange={(e) => setValue(parseFloat(e.target.value) || 0)}
          placeholder="Enter value..."
        />
      </div>

      <div className="grid-2-col">
        <div className="form-group">
          <label className="label-bold">From</label>
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
          >
            {Object.keys(conversions[category]).map(u => <option key={u} value={u}>{u.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="label-bold">To</label>
          <select
            value={toUnit}
            onChange={(e) => setToUnit(e.target.value)}
          >
            {Object.keys(conversions[category]).map(u => <option key={u} value={u}>{u.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
      </div>

      <div className="result-area">
        <div className="result-label">CONVERTED VALUE</div>
        <div className="result-value">
          {result.toLocaleString(undefined, { maximumFractionDigits: 6 })}
        </div>
        <div className="result-subtext">
          {toUnit.replace(/_/g, ' ')}
        </div>
      </div>

      <div className="tool-footer-note">
        <p>Precise conversions for all your natural and technical measurements.</p>
      </div>
    </div>
  );
};

export default UnitConverter;
