import React, { useState, useEffect } from 'react';

const JsonValidator = ({ onResultChange }) => {
  const [jsonInput, setJsonInput] = useState('');
  const [status, setStatus] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);

  const validateJson = (input) => {
    if (!input.trim()) {
      setStatus(null);
      setErrorDetails(null);
      onResultChange(null);
      return;
    }
    try {
      const parsed = JSON.parse(input);
      setStatus('valid');
      setErrorDetails(null);
      onResultChange({
        text: JSON.stringify(parsed, null, 2),
        filename: 'validated.json'
      });
    } catch (e) {
      setStatus('invalid');
      setErrorDetails(e.message);
      onResultChange(null);
    }
  };

  useEffect(() => {
    validateJson(jsonInput);
  }, [jsonInput]);

  return (
    <div className="tool-form">
      <div className="form-group">
        <label>JSON Input</label>
        <textarea
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder='{"key": "value"}'
          rows={10}
          style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--on-surface)', fontFamily: 'monospace' }}
        />
      </div>
      {status === 'valid' && (
        <div className="tool-result" style={{ background: 'rgba(16, 185, 129, 0.1)', borderColor: '#10b981' }}>
          <div style={{ color: '#10b981', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-icons">check_circle</span> Valid JSON
          </div>
        </div>
      )}
      {status === 'invalid' && (
        <div className="tool-result" style={{ background: 'rgba(239, 68, 68, 0.1)', borderColor: '#ef4444' }}>
          <div style={{ color: '#ef4444', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="material-icons">error</span> Invalid JSON
          </div>
          <p style={{ fontSize: '0.9rem', color: 'var(--on-surface)', margin: 0 }}>{errorDetails}</p>
        </div>
      )}
    </div>
  );
};

export default JsonValidator;
