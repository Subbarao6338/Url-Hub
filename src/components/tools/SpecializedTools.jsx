import React, { useState, useEffect } from 'react';

const SpecializedTools = ({ onResultChange }) => {
  const [activeTab, setActiveTab] = useState('regex');
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');

  // Reconciliation state
  const [listA, setListA] = useState('');
  const [listB, setListB] = useState('');
  const [reconResult, setReconResult] = useState(null);

  const generateRegex = () => {
    if (!input) return;
    const res = `^${input.replace(/[^a-zA-Z0-9]/g, '\\$&')}.*`;
    setResult(res);
    if (onResultChange) {
      onResultChange({
        text: res,
        filename: 'regex.txt'
      });
    }
  };

  const runReconciliation = () => {
    const arrA = listA.split(',').map(s => s.trim()).filter(Boolean);
    const arrB = listB.split(',').map(s => s.trim()).filter(Boolean);

    const setA = new Set(arrA);
    const setB = new Set(arrB);

    const added = arrB.filter(x => !setA.has(x));
    const removed = arrA.filter(x => !setB.has(x));
    const common = arrA.filter(x => setB.has(x));

    const res = {
      added: [...new Set(added)],
      removed: [...new Set(removed)],
      common: [...new Set(common)],
      consistency: arrA.length === 0 ? 0 : (common.length / arrA.length) * 100
    };

    setReconResult(res);

    if (onResultChange) {
      const text = `Added: ${res.added.join(', ')}\nRemoved: ${res.removed.join(', ')}\nCommon: ${res.common.join(', ')}\nConsistency: ${res.consistency.toFixed(2)}%`;
      onResultChange({
        text,
        filename: 'reconciliation.txt'
      });
    }
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
          <div className="form-group">
            <label>Source List (Comma separated)</label>
            <textarea
              rows="3"
              value={listA}
              onChange={(e) => setListA(e.target.value)}
              placeholder="id1, id2, id3"
              style={{ width: '100%', fontFamily: 'monospace' }}
            />
          </div>
          <div className="form-group">
            <label>Sink List (Comma separated)</label>
            <textarea
              rows="3"
              value={listB}
              onChange={(e) => setListB(e.target.value)}
              placeholder="id2, id3, id4"
              style={{ width: '100%', fontFamily: 'monospace' }}
            />
          </div>
          <button className="btn-primary" onClick={runReconciliation}>Run Reconciliation</button>

          {reconResult && (
            <div className="tool-result" style={{ padding: '15px' }}>
              <div style={{ fontWeight: 600, marginBottom: '10px' }}>Reconciliation Results</div>
              <div style={{ fontSize: '0.85rem' }}>Added in Sink: <b style={{ color: 'var(--accent-green)' }}>{reconResult.added.length}</b></div>
              <div style={{ fontSize: '0.85rem' }}>Removed from Sink: <b style={{ color: 'var(--danger)' }}>{reconResult.removed.length}</b></div>
              <div style={{ fontSize: '0.85rem' }}>Common: <b>{reconResult.common.length}</b></div>
              <div style={{ marginTop: '10px', height: '8px', background: 'var(--bg)', borderRadius: '4px', overflow: 'hidden' }}>
                <div style={{ width: `${reconResult.consistency}%`, height: '100%', background: reconResult.consistency > 95 ? '#10b981' : '#f59e0b' }}></div>
              </div>
              <div style={{ textAlign: 'right', fontSize: '0.75rem', marginTop: '5px', color: reconResult.consistency > 95 ? '#10b981' : '#f59e0b' }}>
                {reconResult.consistency.toFixed(1)}% Consistent
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SpecializedTools;
