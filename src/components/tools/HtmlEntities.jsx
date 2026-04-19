import React, { useState, useEffect } from 'react';

const HtmlEntities = ({ onResultChange }) => {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState('encode');
  const [output, setOutput] = useState('');

  const encode = (str) => {
    return str.replace(/[\u00A0-\u9999<>&"']/g, (i) => {
        return '&#' + i.charCodeAt(0) + ';';
    });
  };

  const decode = (str) => {
    const txt = document.createElement("textarea");
    txt.innerHTML = str;
    return txt.value;
  };

  useEffect(() => {
    const result = mode === 'encode' ? encode(input) : decode(input);
    setOutput(result);
    onResultChange({
      text: result,
      filename: `html_entities_${mode}.txt`
    });
  }, [input, mode]);

  return (
    <div className="tool-form">
      <div className="pill-group" style={{ marginBottom: '1.5rem', justifyContent: 'center' }}>
        <button className={`pill ${mode === 'encode' ? 'active' : ''}`} onClick={() => setMode('encode')}>Encode</button>
        <button className={`pill ${mode === 'decode' ? 'active' : ''}`} onClick={() => setMode('decode')}>Decode</button>
      </div>
      <div className="form-group">
        <label>Input</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={mode === 'encode' ? '<div>Hello & World</div>' : '&#60;div&#62;Hello &#38; World&#60;/div&#62;'}
          rows={6}
          style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--on-surface)' }}
        />
      </div>
      <div className="form-group">
        <label>Output</label>
        <textarea
          value={output}
          readOnly
          rows={6}
          style={{ width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', background: 'rgba(var(--primary-rgb), 0.05)', color: 'var(--on-surface)' }}
        />
      </div>
    </div>
  );
};

export default HtmlEntities;
