import React, { useState, useEffect } from 'react';

const JsonFormatter = ({ onResultChange }) => {
  const [input, setInput] = useState('');

  useEffect(() => {
    if (input) {
      onResultChange({
        text: input,
        filename: 'formatted.json'
      });
    } else {
      onResultChange(null);
    }
  }, [input, onResultChange]);

  const format = () => {
    try { setInput(JSON.stringify(JSON.parse(input), null, 4)); } catch(e) { alert("Invalid JSON"); }
  };
  const minify = () => {
    try { setInput(JSON.stringify(JSON.parse(input))); } catch(e) { alert("Invalid JSON"); }
  };

  return (
    <div className="tool-form">
      <textarea rows="10" placeholder='{"key":"value"}' style={{ width: '100%', fontFamily: 'monospace', fontSize: '0.9rem', marginBottom: '15px' }} value={input} onChange={e => setInput(e.target.value)} />
      <div style={{ display: 'flex', gap: '10px' }}>
        <button className="btn-primary" style={{ flex: 2 }} onClick={format}>Format / Beautify</button>
        <button className="pill" style={{ flex: 1 }} onClick={minify}>Minify</button>
      </div>
    </div>
  );
};

export default JsonFormatter;
