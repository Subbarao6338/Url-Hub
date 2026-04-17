import React, { useState } from 'react';

const DataPortal = ({ onResultChange }) => {
  const [activeTab, setActiveTab] = useState('resources');
  const [fileName, setFileName] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
      onResultChange({
        text: `Config file ${file.name} uploaded for resource management.`,
        filename: 'portal_config.json'
      });
    }
  };

  const resources = [
    { type: 'Kubernetes', name: 'graviton-k8s-cluster', status: 'Running', region: 'East US' },
    { type: 'Storage', name: 'adls-raw-data-gen2', status: 'Ready', region: 'West Europe' },
    { type: 'Compute', name: 'spark-job-executor-01', status: 'Idle', region: 'East US' }
  ];

  return (
    <div className="tool-form">
      <div style={{ marginBottom: '20px' }}>
        <p style={{ opacity: 0.7 }}>Centralized interface for Graviton resource management and semantic data access.</p>
      </div>

      <div className="pill-group" style={{ marginBottom: '20px', justifyContent: 'center' }}>
        <button className={`pill ${activeTab === 'resources' ? 'active' : ''}`} onClick={() => setActiveTab('resources')}>Resources</button>
        <button className={`pill ${activeTab === 'semantic' ? 'active' : ''}`} onClick={() => setActiveTab('semantic')}>Semantic Layer</button>
        <button className={`pill ${activeTab === 'terraform' ? 'active' : ''}`} onClick={() => setActiveTab('terraform')}>Terraform</button>
      </div>

      {activeTab === 'resources' && (
        <div style={{ display: 'grid', gap: '10px' }}>
          {resources.map((r, i) => (
            <div key={i} className="tool-result" style={{ padding: '12px 16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontWeight: 600 }}>{r.name}</span>
                <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '10px', background: 'rgba(var(--primary-rgb), 0.1)', color: 'var(--primary)' }}>{r.type}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', opacity: 0.7 }}>
                <span>{r.region}</span>
                <span style={{ color: '#10b981' }}>{r.status}</span>
              </div>
            </div>
          ))}
          <button className="btn-primary" style={{ marginTop: '5px' }}>Deploy New Resource</button>
        </div>
      )}

      {activeTab === 'semantic' && (
        <div style={{ display: 'grid', gap: '12px' }}>
          <div className="form-group">
            <label>Business Object Mapping</label>
            <div style={{ padding: '10px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '0.85rem' }}>
              <code>CUSTOMER_DATA</code> &rarr; <code>adls://raw/customer_v2/*.parquet</code>
            </div>
          </div>
          <button className="pill">Execute Semantic Query</button>
          <div style={{ fontSize: '0.85rem', padding: '10px', opacity: 0.6, fontStyle: 'italic' }}>
            Layering business logic over raw ADLS Gen2 storage.
          </div>
        </div>
      )}

      {activeTab === 'terraform' && (
        <div style={{ background: '#1e1e1e', color: '#d4d4d4', padding: '15px', borderRadius: '8px', fontFamily: 'monospace', fontSize: '0.8rem' }}>
          <div style={{ marginBottom: '15px', display: 'flex', gap: '10px' }}>
            <input type="file" accept=".tf,.json" onChange={handleFileUpload} style={{ display: 'none' }} id="tf-upload" />
            <label htmlFor="tf-upload" className="pill" style={{ cursor: 'pointer', margin: 0, background: '#333', color: '#fff', fontSize: '0.7rem' }}>
              <span className="material-icons" style={{ fontSize: '1rem' }}>upload_file</span>
              {fileName ? 'Update Plan' : 'Upload .tf Plan'}
            </label>
          </div>
          <div style={{ color: '#569cd6', marginBottom: '5px' }}># Provisioning Log</div>
          <div>$ terraform init</div>
          <div>$ terraform plan -out=tfplan</div>
          <div style={{ color: '#ce9178' }}>Plan: 2 to add, 0 to change, 0 to destroy.</div>
          <button className="pill" style={{ marginTop: '15px', background: '#333', color: '#fff' }}>Run Terraform Apply</button>
        </div>
      )}
    </div>
  );
};

export default DataPortal;
