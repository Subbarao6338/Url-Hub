import React, { useState } from 'react';

const BMICalculator = () => {
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [result, setResult] = useState(null);

  const calculateBmi = () => {
    const w = parseFloat(weight);
    const h = parseFloat(height) / 100;
    if (!w || !h) return;
    const bmi = parseFloat((w / (h * h)).toFixed(1));

    let label = "Normal", color = "var(--primary)";
    if (bmi < 18.5) { label = "Underweight"; color = "#3b82f6"; }
    else if (bmi >= 25 && bmi < 30) { label = "Overweight"; color = "#f59e0b"; }
    else if (bmi >= 30) { label = "Obese"; color = "#ef4444"; }

    setResult({ bmi, label, color });
  };

  return (
    <div className="tool-form">
      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Weight (kg)</label>
          <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="70" />
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Height (cm)</label>
          <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="175" />
        </div>
      </div>
      <button className="btn-primary" style={{ width: '100%' }} onClick={calculateBmi}>Calculate BMI</button>
      {result && (
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <div className="tool-result" style={{ padding: '2rem' }}>
            <div style={{ fontSize: '3.5rem', fontWeight: 'bold', color: result.color }}>{result.bmi}</div>
            <div style={{ fontSize: '1.2rem', fontWeight: 500, marginTop: '10px', color: result.color }}>{result.label}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BMICalculator;
