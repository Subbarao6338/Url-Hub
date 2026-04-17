import React, { useState } from 'react';

const AzureIntegration = ({ onResultChange }) => {
  const [activeTab, setActiveTab] = useState('aion');
  const [isRunning, setIsRunning] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      onResultChange({
        text: `Telemetry payload ${file.name} ready for stream processing.`,
        filename: 'payload_summary.json'
      });
    }
  };

  const functions = [
    { name: 'anonymize-stream-processor', status: 'Enabled', trigger: 'EventHub' },
    { name: 'classify-columns-v2', status: 'Enabled', trigger: 'Blob' },
    { name: 'telemetry-pre-processor', status: 'Disabled', trigger: 'HTTP' }
  ];

  return (
    <div className="tool-form">
      <div style={{ marginBottom: '20px' }}>
        <p style={{ opacity: 0.7 }}>Serverless integration for real-time telemetry predictions and stream data processing.</p>
      </div>

      <div className="pill-group" style={{ marginBottom: '20px', justifyContent: 'center' }}>
        <button className={`pill ${activeTab === 'aion' ? 'active' : ''}`} onClick={() => setActiveTab('aion')}>AION Predictions</button>
        <button className={`pill ${activeTab === 'functions' ? 'active' : ''}`} onClick={() => setActiveTab('functions')}>Azure Functions</button>
      </div>

      {activeTab === 'aion' && (
        <div style={{ display: 'grid', gap: '15px' }}>
          <div className="form-group">
            <label>Upload Telemetry Payload</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input type="file" accept=".json,.csv" onChange={handleFileUpload} style={{ display: 'none' }} id="az-upload" />
              <label htmlFor="az-upload" className="pill" style={{ cursor: 'pointer', margin: 0 }}>
                <span className="material-icons" style={{ fontSize: '1.2rem' }}>upload_file</span>
                {fileName ? 'Change Payload' : 'Select Payload'}
              </label>
              {fileName && <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>{fileName}</span>}
            </div>
          </div>
          <div className="tool-result" style={{ textAlign: 'center', padding: '20px' }}>
            <span className="material-icons" style={{ fontSize: '3rem', color: 'var(--primary)' }}>psychology</span>
            <div style={{ fontSize: '1.2rem', fontWeight: 600, marginTop: '10px' }}>AION Engine</div>
            <p style={{ fontSize: '0.85rem', opacity: 0.6 }}>Real-time machine learning predictions for IoT telemetry.</p>
          </div>
          <div className="form-group">
            <label>Model Version</label>
            <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}>
              <option>telemetry-outlier-v4.2</option>
              <option>failure-prediction-v1.0</option>
            </select>
          </div>
          <button className="btn-primary" onClick={() => { setIsRunning(true); setTimeout(() => setIsRunning(false), 2000); }}>
            {isRunning ? 'Predicting...' : 'Run Real-time Prediction'}
          </button>
        </div>
      )}

      {activeTab === 'functions' && (
        <div style={{ display: 'grid', gap: '12px' }}>
          {functions.map((f, i) => (
            <div key={i} className="tool-result" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{f.name}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Trigger: {f.trigger}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '0.8rem', color: f.status === 'Enabled' ? '#10b981' : '#ef4444' }}>{f.status}</span>
                <button className="icon-btn" style={{ padding: '4px' }}><span className="material-icons" style={{ fontSize: '1.2rem' }}>settings</span></button>
              </div>
            </div>
          ))}
          <div className="tool-result" style={{ marginTop: '10px', background: 'rgba(var(--primary-rgb), 0.05)', fontSize: '0.85rem' }}>
            <b>Classification:</b> Automated PII discovery and column typing enabled for storage triggers.
          </div>
        </div>
      )}
    </div>
  );
};

export default AzureIntegration;
