import React, { useState, useEffect, useCallback } from 'react';

const HashGenerator = ({ onResultChange }) => {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState({
    'SHA-256': '',
    'SHA-384': '',
    'SHA-512': ''
  });

  const generateHashes = useCallback(async (text) => {
    if (!text) {
      setHashes({ 'SHA-256': '', 'SHA-384': '', 'SHA-512': '' });
      return;
    }

    const msgUint8 = new TextEncoder().encode(text);
    const algorithms = ['SHA-256', 'SHA-384', 'SHA-512'];
    const newHashes = {};

    for (const algo of algorithms) {
      const hashBuffer = await crypto.subtle.digest(algo, msgUint8);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      newHashes[algo] = hashHex;
    }

    setHashes(newHashes);
  }, []);

  useEffect(() => {
    generateHashes(input);
  }, [input, generateHashes]);

  useEffect(() => {
    if (input) {
      const resultText = Object.entries(hashes)
        .map(([algo, hash]) => `${algo}:\n${hash}`)
        .join('\n\n');
      onResultChange({
        text: resultText,
        filename: 'hashes.txt'
      });
    } else {
      onResultChange(null);
    }
  }, [hashes, input, onResultChange]);

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="tool-form">
      <div className="form-group">
        <label>Input Text</label>
        <textarea
          rows="4"
          placeholder="Enter text to hash..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ width: '100%', fontFamily: 'monospace' }}
        />
      </div>

      <div style={{ display: 'grid', gap: '15px' }}>
        {Object.entries(hashes).map(([algo, hash]) => (
          <div key={algo} className="tool-result" style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600, fontSize: '0.85rem', opacity: 0.7 }}>{algo}</span>
              {hash && (
                <button className="icon-btn" onClick={() => copyToClipboard(hash)} style={{ width: '28px', height: '28px' }}>
                  <span className="material-icons" style={{ fontSize: '1rem' }}>content_copy</span>
                </button>
              )}
            </div>
            <div style={{ wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.9rem', color: 'var(--primary)' }}>
              {hash || <span style={{ opacity: 0.3 }}>Hash will appear here...</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HashGenerator;
