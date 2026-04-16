import React, { useState } from 'react';

const SpecializedTools = () => {
  const [activeTab, setActiveTab] = useState('regex');
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');

  const generateRegex = () => {
    if (!input) return;
    setResult(`^${input.replace(/[^a-zA-Z0-9]/g, '\\$&')}.*`);
  };

  return (
    <div className="tool-form">
      <div style={{ marginBottom: '20px' }}>
        <p style={{ opacity: 0.7 }}>Niche tools for data engineering: Reconciliation, OpenRefine cleaning, and Regex Generation.</p>
      </div>

      <div className="pill-group" style={{ marginBottom: '20px', justifyContent: 'center' }}>
        <button className={`pill ${activeTab === 'regex' ? 'active' : ''}`} onClick={() => setActiveTab('regex')}>Regex Gen</button>
        <button className={`pill ${activeTab === 'refine' ? 'active' : ''}`} onClick={() => setActiveTab('refine')}>OpenRefine</button>
        <button className={`pill ${activeTab === 'recon' ? 'active' : ''}`} onClick={() => setActiveTab('recon')}>Reconciliation</button>
      </div>

      {activeTab === 'regex' && (
        <div style={{ display: 'grid', gap: '15px' }}>
          <div className="form-group">
            <label>Sample String</label>
            <input
              type="text"
              placeholder="e.g. graviton-logs-2024"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
            />
          </div>
          <button className="btn-primary" onClick={generateRegex}>Generate Regex (Elixir)</button>
          {result && (
            <div className="tool-result" style={{ fontFamily: 'monospace', fontSize: '1rem', textAlign: 'center', background: 'rgba(var(--primary-rgb), 0.05)' }}>
              {result}
              <button className="icon-btn" onClick={() => navigator.clipboard.writeText(result)} style={{ marginLeft: '10px' }}>
                <span className="material-icons" style={{ fontSize: '1rem' }}>content_copy</span>
              </button>
            </div>
          )}
        </div>
      )}

      {activeTab === 'refine' && (
        <div style={{ display: 'grid', gap: '10px' }}>
          <div className="tool-result">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="material-icons" style={{ color: 'var(--primary)' }}>cleaning_services</span>
              <span>OpenRefine API Integration</span>
            </div>
            <p style={{ fontSize: '0.85rem', opacity: 0.6, marginTop: '8px' }}>Transform, reconcile, and clean datasets via the OpenRefine backend service.</p>
          </div>
          <button className="pill">Launch Refine Workspace</button>
        </div>
      )}

      {activeTab === 'recon' && (
        <div style={{ display: 'grid', gap: '12px' }}>
          <div className="tool-result" style={{ padding: '15px' }}>
            <div style={{ fontWeight: 600, marginBottom: '10px' }}>Data Consistency Check</div>
            <div style={{ fontSize: '0.85rem' }}>Source: <b>ADLS-Raw</b></div>
            <div style={{ fontSize: '0.85rem' }}>Sink: <b>Snowflake-Gold</b></div>
            <div style={{ marginTop: '10px', height: '8px', background: 'var(--bg)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '99.8%', height: '100%', background: '#10b981' }}></div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '0.75rem', marginTop: '5px', color: '#10b981' }}>99.8% Consistent</div>
          </div>
          <button className="btn-primary">Run Global Reconciliation</button>
        </div>
      )}
    </div>
  );
};

export default SpecializedTools;
