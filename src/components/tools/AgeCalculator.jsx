import React, { useState } from 'react';

const AgeCalculator = () => {
  const [dob, setDob] = useState('');
  const [result, setResult] = useState(null);

  const calculateAge = (dateStr) => {
    setDob(dateStr);
    if (!dateStr) {
      setResult(null);
      return;
    }
    const birthDate = new Date(dateStr);
    const now = new Date();
    let years = now.getFullYear() - birthDate.getFullYear();
    let months = now.getMonth() - birthDate.getMonth();
    let days = now.getDate() - birthDate.getDate();
    if (days < 0) {
      months--;
      days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }
    setResult({
      years,
      months: years * 12 + months,
      days: Math.floor((now - birthDate) / 86400000)
    });
  };

  return (
    <div className="tool-form">
      <div className="form-group">
        <label>Date of Birth</label>
        <input type="date" value={dob} onChange={(e) => calculateAge(e.target.value)} style={{ width: '100%' }} />
      </div>
      {result && (
        <div style={{ marginTop: '2rem' }}>
          <div className="tool-result" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary)' }}>{result.years}</div>
            <div style={{ fontSize: '1.1rem', opacity: 0.7 }}>Years Old</div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '1.5rem' }}>
            <div className="tool-result" style={{ textAlign: 'center', fontSize: '0.9rem' }}>
              <div style={{ fontWeight: 'bold' }}>{result.months}</div> Months
            </div>
            <div className="tool-result" style={{ textAlign: 'center', fontSize: '0.9rem' }}>
              <div style={{ fontWeight: 'bold' }}>{result.days}</div> Days
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AgeCalculator;
