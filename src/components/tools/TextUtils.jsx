import React, { useState, useEffect } from 'react';

const TextUtils = ({ onResultChange }) => {
  const [input, setInput] = useState('');
  const [caesarShift, setCaesarShift] = useState(3);

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
    else if (type === 'binary') val = val.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
    else if (type === 'hex') val = val.split('').map(char => char.charCodeAt(0).toString(16).padStart(2, '0')).join(' ');
    else if (type === 'caesar') {
        val = val.replace(/[a-z]/gi, (char) => {
            const start = char <= 'Z' ? 65 : 97;
            return String.fromCharCode(((char.charCodeAt(0) - start + caesarShift) % 26) + start);
        });
    }
    else if (type === 'braille') {
        const brailleMap = {
            'a': '⠁', 'b': '⠃', 'c': '⠉', 'd': '⠙', 'e': '⠑', 'f': '⠋', 'g': '⠛', 'h': '⠓', 'i': '⠊', 'j': '⠚',
            'k': '⠅', 'l': '⠇', 'm': '⠍', 'n': '⠝', 'o': '⠕', 'p': '⠏', 'q': '⠟', 'r': '⠗', 's': '⠎', 't': '⠞',
            'u': '⠥', 'v': '⠧', 'w': '⠺', 'x': '⠭', 'y': '⠽', 'z': '⠵', ' ': ' ',
            '1': '⠼⠁', '2': '⠼⠃', '3': '⠼⠉', '4': '⠼⠙', '5': '⠼⠑', '6': '⠼⠋', '7': '⠼⠛', '8': '⠼⠓', '9': '⠼⠊', '0': '⠼⠚'
        };
        val = val.toLowerCase().split('').map(c => brailleMap[c] || c).join('');
    }
    else if (type === 'ascii') {
        const art = `
  _   _       _
 | \ | | __ _| |_ _   _ _ __ ___
 |  \| |/ _' | __| | | | '__/ _ \\
 | |\  | (_| | |_| |_| | | |  __/
 |_| \_|\__,_|\__|\__,_|_|  \___|

        `;
        val = art + "\n\n" + val;
    }
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

      <div className="card mb-20" style={{ padding: '15px' }}>
          <label style={{ fontSize: '0.8rem', opacity: 0.7, display: 'block', marginBottom: '8px' }}>Caesar Cipher Shift: {caesarShift}</label>
          <input type="range" min="1" max="25" value={caesarShift} onChange={e => setCaesarShift(parseInt(e.target.value))} className="w-full" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '10px' }}>
        <button className="pill" onClick={() => modifyText('up')}>UPPERCASE</button>
        <button className="pill" onClick={() => modifyText('low')}>lowercase</button>
        <button className="pill" onClick={() => modifyText('cap')}>Capitalize</button>
        <button className="pill" onClick={() => modifyText('trim')}>Trim Edges</button>
        <button className="pill" onClick={() => modifyText('clean')}>Clean Spaces</button>
        <button className="pill" onClick={() => modifyText('slug')}>Slugify</button>
        <button className="pill" onClick={() => modifyText('rev')}>Reverse</button>
        <button className="pill" onClick={() => modifyText('binary')}>Binary</button>
        <button className="pill" onClick={() => modifyText('hex')}>Hex</button>
        <button className="pill" onClick={() => modifyText('caesar')}>Caesar Cipher</button>
        <button className="pill" onClick={() => modifyText('braille')}>Braille</button>
        <button className="pill" onClick={() => modifyText('ascii')}>ASCII Art</button>
      </div>
    </div>
  );
};

export default TextUtils;
