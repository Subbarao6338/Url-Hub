import React, { useState, useEffect } from 'react';

const HashGenerator = ({ onResultChange }) => {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState({});

  const generateHashes = async (text) => {
    if (!text) {
      setHashes({});
      return;
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(text);

    const hashBuffer256 = await crypto.subtle.digest('SHA-256', data);
    const hashBuffer1 = await crypto.subtle.digest('SHA-1', data);

    const hashArray256 = Array.from(new Uint8Array(hashBuffer256));
    const hashHex256 = hashArray256.map(b => b.toString(16).padStart(2, '0')).join('');

    const hashArray1 = Array.from(new Uint8Array(hashBuffer1));
    const hashHex1 = hashArray1.map(b => b.toString(16).padStart(2, '0')).join('');

    setHashes({
      'SHA-256': hashHex256,
      'SHA-1': hashHex1,
      'Base64': btoa(text)
    });
  };

  useEffect(() => {
    generateHashes(input);
  }, [input]);

  useEffect(() => {
    onResultChange({
      text: Object.entries(hashes).map(([k, v]) => `${k}: ${v}`).join('\n'),
      filename: 'hashes.txt'
    });
  }, [hashes, onResultChange]);

  return (
    <div className="tool-form">
      <div className="form-group">
        <label>Input Text</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter text to secure..."
          style={{ width: '100%', height: '120px', padding: '15px', borderRadius: '16px', border: '1px solid var(--border)', fontFamily: 'monospace' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {Object.entries(hashes).map(([algo, val]) => (
          <div key={algo} className="card" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: 'bold', color: 'var(--nature-primary)' }}>{algo}</span>
              <button
                className="icon-btn"
                onClick={() => navigator.clipboard.writeText(val)}
                style={{ width: '32px', height: '32px' }}
              >
                <span className="material-icons" style={{ fontSize: '1.1rem' }}>content_copy</span>
              </button>
            </div>
            <div style={{
              fontFamily: 'monospace',
              fontSize: '0.8rem',
              wordBreak: 'break-all',
              background: 'var(--nature-mist)',
              padding: '10px',
              borderRadius: '8px'
            }}>
              {val}
            </div>
          </div>
        ))}
      </div>

      {input && (
        <div className="empty-state" style={{ padding: '1rem 0' }}>
           <span className="material-icons" style={{ color: 'var(--nature-moss)' }}>shield</span>
           <p style={{ fontSize: '0.8rem' }}>Hashing is performed locally in your browser. No data is sent to servers.</p>
        </div>
      )}
    </div>
  );
};

export default HashGenerator;
