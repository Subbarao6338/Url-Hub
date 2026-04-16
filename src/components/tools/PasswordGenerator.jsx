import React, { useState, useEffect } from 'react';

const PasswordGenerator = ({ onResultChange }) => {
  const [length, setLength] = useState(16);
  const [useUpper, setUseUpper] = useState(true);
  const [useNumbers, setUseNumbers] = useState(true);
  const [useSymbols, setUseSymbols] = useState(true);
  const [password, setPassword] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (password) {
      onResultChange({
        text: password,
        filename: 'password.txt'
      });
    } else {
      onResultChange(null);
    }
  }, [password, onResultChange]);

  const generatePassword = () => {
    let charset = "abcdefghijklmnopqrstuvwxyz";
    if (useUpper) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (useNumbers) charset += "0123456789";
    if (useSymbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";

    let res = "";
    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);

    for (let i = 0; i < length; i++) {
      res += charset.charAt(array[i] % charset.length);
    }
    setPassword(res);
    setCopied(false);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="tool-form">
      <div className="form-group">
        <label>Length: <span id="pw-len-val">{length}</span></label>
        <input
          type="range"
          min="8"
          max="64"
          value={length}
          onChange={(e) => setLength(parseInt(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '20px' }}>
        <label className={`pill ${useUpper ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input type="checkbox" checked={useUpper} onChange={() => setUseUpper(!useUpper)} style={{ display: 'none' }} />
          <span className="material-icons" style={{ fontSize: '1.2rem' }}>{useUpper ? 'check_box' : 'check_box_outline_blank'}</span>
          ABC
        </label>
        <label className={`pill ${useNumbers ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input type="checkbox" checked={useNumbers} onChange={() => setUseNumbers(!useNumbers)} style={{ display: 'none' }} />
          <span className="material-icons" style={{ fontSize: '1.2rem' }}>{useNumbers ? 'check_box' : 'check_box_outline_blank'}</span>
          123
        </label>
        <label className={`pill ${useSymbols ? 'active' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
          <input type="checkbox" checked={useSymbols} onChange={() => setUseSymbols(!useSymbols)} style={{ display: 'none' }} />
          <span className="material-icons" style={{ fontSize: '1.2rem' }}>{useSymbols ? 'check_box' : 'check_box_outline_blank'}</span>
          !@#
        </label>
      </div>
      <button className="btn-primary" style={{ width: '100%' }} onClick={generatePassword}>
        Generate Secure Password
      </button>

      {password && (
        <div className="tool-result" style={{ marginTop: '1.5rem', position: 'relative', paddingRight: '50px' }}>
          <div style={{ wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '1.2rem', letterSpacing: '0.05em' }}>
            {password}
          </div>
          <button
            className="icon-btn"
            style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}
            onClick={copyToClipboard}
          >
            <span className="material-icons">{copied ? 'check' : 'content_copy'}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default PasswordGenerator;
