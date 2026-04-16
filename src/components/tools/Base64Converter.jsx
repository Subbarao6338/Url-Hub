import React, { useState } from 'react';

const Base64Converter = () => {
  const [input, setInput] = useState('');

  const encode = () => {
    try { setInput(btoa(input)); } catch(e) { alert('Error encoding'); }
  };
  const decode = () => {
    try { setInput(atob(input)); } catch(e) { alert('Invalid Base64'); }
  };

  return (
    <div className="tool-form">
      <textarea rows="5" placeholder="Plain text or Base64 string..." style={{ width: '100%', fontFamily: 'monospace', marginBottom: '15px' }} value={input} onChange={e => setInput(e.target.value)} />
      <div style={{ display: 'flex', gap: '10px' }}>
        <button className="btn-primary" style={{ flex: 1 }} onClick={encode}>Encode</button>
        <button className="pill" style={{ flex: 1 }} onClick={decode}>Decode</button>
      </div>
    </div>
  );
};

export default Base64Converter;
