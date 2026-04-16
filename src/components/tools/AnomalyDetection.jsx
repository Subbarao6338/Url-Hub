import React, { useState } from 'react';

const AnomalyDetection = () => {
  const [datasource, setDatasource] = useState('local');
  const [sensitivity, setSensitivity] = useState(85);
  const [isDetecting, setIsDetecting] = useState(false);
  const [results, setResults] = useState(null);

  const startDetection = () => {
    setIsDetecting(true);
    setResults(null);
    setTimeout(() => {
      setResults({
        status: 'Complete',
        anomaliesFound: 12,
        confidence: '94%',
        lastRun: new Date().toLocaleString()
      });
      setIsDetecting(false);
    }, 2000);
  };

  return (
    <div className="tool-form">
      <div style={{ marginBottom: '20px' }}>
        <p style={{ opacity: 0.7 }}>Identify outliers and unusual patterns in timeseries data using Azure Cognitive Services or Graviton algorithms.</p>
      </div>

      <div className="form-group">
        <label>Datasource</label>
        <select value={datasource} onChange={(e) => setDatasource(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}>
          <option value="local">Local CSV File</option>
          <option value="mssql">MSSQL Database</option>
          <option value="postgresql">PostgreSQL (Django)</option>
          <option value="kafka">Apache Kafka Topic</option>
        </select>
      </div>

      <div className="form-group" style={{ marginTop: '15px' }}>
        <label>Sensitivity ({sensitivity}%)</label>
        <input
          type="range"
          min="0"
          max="100"
          value={sensitivity}
          onChange={(e) => setSensitivity(e.target.value)}
          style={{ width: '100%' }}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px' }}>
        <button className="pill" style={{ opacity: 0.8 }}>Azure Detector</button>
        <button className="pill" style={{ opacity: 0.8 }}>Multivariate</button>
      </div>

      <button className="btn-primary" style={{ width: '100%', marginTop: '20px' }} onClick={startDetection} disabled={isDetecting}>
        {isDetecting ? 'Analyzing...' : 'Run Anomaly Detection'}
      </button>

      {results && (
        <div className="tool-result" style={{ marginTop: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px', color: 'var(--primary)' }}>
            <span className="material-icons">notifications_active</span>
            <span style={{ fontWeight: 600 }}>Detection Results</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.9rem' }}>
            <div>Anomalies: <b>{results.anomaliesFound}</b></div>
            <div>Confidence: <b>{results.confidence}</b></div>
            <div style={{ gridColumn: 'span 2' }}>Status: <span style={{ color: '#10b981' }}>{results.status}</span></div>
            <div style={{ gridColumn: 'span 2', opacity: 0.6, fontSize: '0.8rem' }}>Last Run: {results.lastRun}</div>
          </div>
          <div style={{ marginTop: '15px', height: '60px', background: 'rgba(var(--primary-rgb), 0.1)', borderRadius: '8px', display: 'flex', alignItems: 'flex-end', padding: '5px', gap: '2px' }}>
            {[40, 45, 38, 42, 85, 41, 39, 44, 40, 90, 38, 42, 41, 39].map((h, i) => (
              <div key={i} style={{ flex: 1, height: `${h}%`, background: h > 70 ? '#ef4444' : 'var(--primary)', borderRadius: '2px' }}></div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnomalyDetection;
