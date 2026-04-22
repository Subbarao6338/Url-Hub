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
        <label className="flex-between">
          <span>Password Length</span>
          <span className="badge">{length}</span>
        </label>
        <input
          type="range"
          min="8"
          max="64"
          value={length}
          onChange={(e) => setLength(parseInt(e.target.value))}
        />
      </div>

      <div className="checkbox-grid">
        <label className={`pill ${useUpper ? 'active' : ''}`}>
          <input type="checkbox" checked={useUpper} onChange={() => setUseUpper(!useUpper)} />
          <span className="material-icons">{useUpper ? 'check_circle' : 'circle'}</span>
          ABC
        </label>
        <label className={`pill ${useNumbers ? 'active' : ''}`}>
          <input type="checkbox" checked={useNumbers} onChange={() => setUseNumbers(!useNumbers)} />
          <span className="material-icons">{useNumbers ? 'check_circle' : 'circle'}</span>
          123
        </label>
        <label className={`pill ${useSymbols ? 'active' : ''}`}>
          <input type="checkbox" checked={useSymbols} onChange={() => setUseSymbols(!useSymbols)} />
          <span className="material-icons">{useSymbols ? 'check_circle' : 'circle'}</span>
          !@#
        </label>
      </div>

      <button className="btn-primary full-width" onClick={generatePassword}>
        Generate Password
      </button>

      {password && (
        <div className="result-area">
          <div className="result-label">YOUR SECURE PASSWORD</div>
          <div className="result-value mono">
            {password}
          </div>
          <button
            className="icon-btn copy-btn"
            onClick={copyToClipboard}
          >
            <span className="material-icons">{copied ? 'check' : 'content_copy'}</span>
          </button>
        </div>
      )}

      <div className="tool-footer-note">
        <p>Randomly generated in your browser for maximum security.</p>
      </div>
    </div>
  );
};

export default PasswordGenerator;
