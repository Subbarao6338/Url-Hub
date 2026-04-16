import React, { useState } from 'react';

const DataQuality = () => {
  const [activeTab, setActiveTab] = useState('ge');
  const [isValidating, setIsValidating] = useState(false);
  const [report, setReport] = useState(null);

  const runValidation = () => {
    setIsValidating(true);
    setReport(null);
    setTimeout(() => {
      setReport({
        score: 98.2,
        passed: 45,
        failed: 1,
        suite: 'Production_Core_v2',
        timestamp: new Date().toLocaleString()
      });
      setIsValidating(false);
    }, 1500);
  };

  return (
    <div className="tool-form">
      <div style={{ marginBottom: '20px' }}>
        <p style={{ opacity: 0.7 }}>Ensure data accuracy and consistency using Great Expectations and Apache Griffin metrics.</p>
      </div>

      <div className="pill-group" style={{ marginBottom: '20px', justifyContent: 'center' }}>
        <button className={`pill ${activeTab === 'ge' ? 'active' : ''}`} onClick={() => setActiveTab('ge')}>Great Expectations</button>
        <button className={`pill ${activeTab === 'griffin' ? 'active' : ''}`} onClick={() => setActiveTab('griffin')}>Apache Griffin</button>
        <button className={`pill ${activeTab === 'profiling' ? 'active' : ''}`} onClick={() => setActiveTab('profiling')}>Profiling</button>
      </div>

      {activeTab === 'ge' && (
        <div>
          <div className="form-group">
            <label>Expectation Suite</label>
            <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}>
              <option>Production_Core_v2</option>
              <option>Raw_Ingestion_Check</option>
              <option>Customer_PII_Rules</option>
            </select>
          </div>
          <button className="btn-primary" style={{ width: '100%', marginTop: '20px' }} onClick={runValidation} disabled={isValidating}>
            {isValidating ? 'Validating...' : 'Run GE Checkpoint'}
          </button>
        </div>
      )}

      {activeTab === 'griffin' && (
        <div style={{ padding: '10px', background: 'rgba(var(--primary-rgb), 0.05)', borderRadius: '12px', textAlign: 'center' }}>
          <span className="material-icons" style={{ fontSize: '3rem', opacity: 0.3 }}>analytics</span>
          <p>Apache Griffin integration for model-driven DQ measures.</p>
          <button className="pill" style={{ marginTop: '10px' }}>View Griffin Dashboard</button>
        </div>
      )}

      {activeTab === 'profiling' && (
        <div style={{ display: 'grid', gap: '10px' }}>
          <div className="tool-result">
            <div style={{ fontWeight: 600, fontSize: '0.8rem', opacity: 0.6 }}>COLUMNS PROFILED</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>124</div>
          </div>
          <div className="tool-result">
            <div style={{ fontWeight: 600, fontSize: '0.8rem', opacity: 0.6 }}>SKEWNESS DETECTED</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b' }}>High</div>
          </div>
          <button className="btn-primary" style={{ width: '100%' }}>Generate New Profile</button>
        </div>
      )}

      {report && (
        <div className="tool-result" style={{ marginTop: '20px', borderLeft: '4px solid #10b981' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontWeight: 600 }}>Validation Success</span>
            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#10b981' }}>{report.score}%</span>
          </div>
          <div style={{ fontSize: '0.85rem', opacity: 0.8 }}>
            <div>Suite: <b>{report.suite}</b></div>
            <div style={{ display: 'flex', gap: '15px', marginTop: '5px' }}>
              <span>Passed: <b style={{ color: '#10b981' }}>{report.passed}</b></span>
              <span>Failed: <b style={{ color: '#ef4444' }}>{report.failed}</b></span>
            </div>
            <div style={{ marginTop: '10px', fontSize: '0.75rem', opacity: 0.6 }}>Completed at: {report.timestamp}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataQuality;
