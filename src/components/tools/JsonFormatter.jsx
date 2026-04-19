import React, { useState, useEffect } from 'react';

const JsonFormatter = ({ onResultChange }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (input && !error) {
      onResultChange({
        text: input,
        filename: 'formatted.json'
      });
    } else {
      onResultChange(null);
    }
  }, [input, error, onResultChange]);

  const format = () => {
    try {
      setError(null);
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed, null, 4));
    } catch(e) {
      setError(e.message);
    }
  };

  const minify = () => {
    try {
      setError(null);
      const parsed = JSON.parse(input);
      setInput(JSON.stringify(parsed));
    } catch(e) {
      setError(e.message);
    }
  };

  return (
    <div className="tool-form">
      <div className="form-group">
        <label>JSON INPUT</label>
        <textarea
          rows="12"
          placeholder='{"key": "value"}'
          style={{
            width: '100%',
            fontFamily: 'monospace',
            fontSize: '0.9rem',
            padding: '12px',
            borderRadius: '12px',
            border: error ? '1px solid #ef4444' : '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--on-surface)',
            marginBottom: '10px'
          }}
          value={input}
          onChange={e => { setInput(e.target.value); setError(null); }}
        />
        {error && (
          <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span className="material-icons" style={{ fontSize: '1rem' }}>error_outline</span>
            Invalid JSON: {error}
          </div>
        )}
      </div>
      <div style={{ display: 'flex', gap: '12px' }}>
        <button className="btn-primary" style={{ flex: 2 }} onClick={format}>
          <span className="material-icons" style={{ fontSize: '1.2rem', verticalAlign: 'middle', marginRight: '8px' }}>format_align_left</span>
          Beautify
        </button>
        <button className="pill" style={{ flex: 1 }} onClick={minify}>
          Minify
        </button>
      </div>
    </div>
  );
};

export default JsonFormatter;
