import React, { useState, useEffect } from 'react';

const TextUtils = ({ onResultChange }) => {
  const [input, setInput] = useState('');

  useEffect(() => {
    if (input) {
      onResultChange({
        text: input,
        filename: 'text_result.txt'
      });
    } else {
      onResultChange(null);
    }
  }, [input, onResultChange]);

  const modifyText = (type) => {
    let val = input;
    if (type === 'up') val = val.toUpperCase();
    else if (type === 'low') val = val.toLowerCase();
    else if (type === 'cap') val = val.replace(/\b\w/g, l => l.toUpperCase());
    else if (type === 'trim') val = val.trim();
    else if (type === 'clean') val = val.replace(/\s+/g, ' ');
    else if (type === 'slug') val = val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    else if (type === 'no-space') val = val.replace(/\s+/g, '');
    else if (type === 'rev') val = val.split('').reverse().join('');
    setInput(val);
  };

  return (
    <div className="tool-form">
      <textarea
        rows="8"
        placeholder="Enter text here..."
        style={{
          width: '100%',
          marginBottom: '20px',
          padding: '12px',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          color: 'var(--on-surface)',
          fontFamily: 'inherit'
        }}
        value={input}
        onChange={e => setInput(e.target.value)}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
        <button className="pill" onClick={() => modifyText('up')}>UPPERCASE</button>
        <button className="pill" onClick={() => modifyText('low')}>lowercase</button>
        <button className="pill" onClick={() => modifyText('cap')}>Capitalize</button>
        <button className="pill" onClick={() => modifyText('trim')}>Trim Edges</button>
        <button className="pill" onClick={() => modifyText('clean')}>Clean Spaces</button>
        <button className="pill" onClick={() => modifyText('slug')}>Slugify</button>
        <button className="pill" onClick={() => modifyText('no-space')}>Remove Spaces</button>
        <button className="pill" onClick={() => modifyText('rev')}>Reverse</button>
      </div>
    </div>
  );
};

export default TextUtils;
