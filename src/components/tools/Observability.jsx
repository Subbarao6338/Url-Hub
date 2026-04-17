import React, { useState } from 'react';

const Observability = ({ onResultChange }) => {
  const [activeTab, setActiveTab] = useState('airflow');
  const [fileName, setFileName] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      onResultChange({
        text: `Loaded log file: ${file.name}\nSize: ${file.size} bytes`,
        filename: `log_analysis_${Date.now()}.txt`
      });
    }
  };

  const clusters = [
    { name: 'Prod-US-East', status: 'Healthy', lag: '2ms', load: '45%' },
    { name: 'Dev-Sandbox', status: 'Warning', lag: '450ms', load: '88%' },
    { name: 'Data-Ingest-K8s', status: 'Healthy', lag: '12ms', load: '32%' }
  ];

  return (
    <div className="tool-form">
      <div style={{ marginBottom: '20px' }}>
        <p style={{ opacity: 0.7 }}>Unified observability for Airflow pipelines, Databand lineage, and core infrastructure metrics.</p>
      </div>

      <div className="pill-group" style={{ marginBottom: '20px', justifyContent: 'center' }}>
        <button className={`pill ${activeTab === 'airflow' ? 'active' : ''}`} onClick={() => setActiveTab('airflow')}>Airflow Logs</button>
        <button className={`pill ${activeTab === 'metrics' ? 'active' : ''}`} onClick={() => setActiveTab('metrics')}>Metrics Stack</button>
        <button className={`pill ${activeTab === 'lineage' ? 'active' : ''}`} onClick={() => setActiveTab('lineage')}>Databand</button>
      </div>

      {activeTab === 'airflow' && (
        <div style={{ display: 'grid', gap: '10px' }}>
          <div className="form-group">
            <label>Upload & Search Logs</label>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
              <input type="file" accept=".log,.txt" onChange={handleFileUpload} style={{ display: 'none' }} id="log-upload" />
              <label htmlFor="log-upload" className="pill" style={{ cursor: 'pointer', margin: 0, padding: '8px 16px' }}>
                <span className="material-icons" style={{ fontSize: '1rem' }}>upload_file</span>
                {fileName ? 'Change Log' : 'Upload Log'}
              </label>
              <input type="text" placeholder="Search entries..." style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }} />
            </div>
          </div>
          <div style={{ maxHeight: '200px', overflowY: 'auto', background: '#1e1e1e', padding: '10px', borderRadius: '8px', fontSize: '0.8rem', color: '#d4d4d4', fontFamily: 'monospace' }}>
            <div>[2024-05-12 10:20:01] INFO - Executing task: data_mask_01</div>
            <div>[2024-05-12 10:20:05] INFO - Successfully connected to Snowflake</div>
            <div style={{ color: '#f59e0b' }}>[2024-05-12 10:20:12] WARNING - Retrying connection (1/3)...</div>
          </div>
        </div>
      )}

      {activeTab === 'metrics' && (
        <div style={{ display: 'grid', gap: '12px' }}>
          {clusters.map((c, i) => (
            <div key={i} className="tool-result" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}>
              <div>
                <div style={{ fontWeight: 600 }}>{c.name}</div>
                <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>Lag: {c.lag} | Load: {c.load}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: c.status === 'Healthy' ? '#10b981' : '#f59e0b' }}></div>
                <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{c.status}</span>
              </div>
            </div>
          ))}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '5px' }}>
            <button className="pill"><span className="material-icons" style={{ fontSize: '1rem' }}>insights</span> Grafana</button>
            <button className="pill"><span className="material-icons" style={{ fontSize: '1rem' }}>storage</span> InfluxDB</button>
          </div>
        </div>
      )}

      {activeTab === 'lineage' && (
        <div style={{ textAlign: 'center', padding: '20px', background: 'rgba(var(--primary-rgb), 0.05)', borderRadius: '12px' }}>
          <span className="material-icons" style={{ fontSize: '3rem', color: 'var(--primary)' }}>account_tree</span>
          <p style={{ marginTop: '10px' }}>Visualize data lineage and track pipeline performance via Databand (dbnd) integration.</p>
          <button className="btn-primary" style={{ marginTop: '10px' }}>Open Lineage Explorer</button>
        </div>
      )}
    </div>
  );
};

export default Observability;
