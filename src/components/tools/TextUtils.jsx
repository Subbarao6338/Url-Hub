import React, { useState } from 'react';

const TextUtils = () => {
  const [input, setInput] = useState('');

  const modifyText = (type) => {
    let val = input;
    if (type === 'up') val = val.toUpperCase();
    else if (type === 'low') val = val.toLowerCase();
    else if (type === 'cap') val = val.replace(/\b\w/g, l => l.toUpperCase());
    else if (type === 'trim') val = val.trim();
    else if (type === 'clean') val = val.replace(/\s+/g, ' ');
    setInput(val);
  };

  return (
    <div className="tool-form">
      <textarea rows="8" placeholder="Enter text here..." style={{ width: '100%', marginBottom: '15px' }} value={input} onChange={e => setInput(e.target.value)} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
        <button className="pill" onClick={() => modifyText('up')}>UPPER</button>
        <button className="pill" onClick={() => modifyText('low')}>lower</button>
        <button className="pill" onClick={() => modifyText('cap')}>Capitalize</button>
        <button className="pill" onClick={() => modifyText('trim')}>Trim</button>
        <button className="pill" onClick={() => modifyText('clean')}>Clean Space</button>
        <button className="pill" onClick={() => navigator.clipboard.writeText(input)}>Copy</button>
      </div>
    </div>
  );
};

export default TextUtils;
