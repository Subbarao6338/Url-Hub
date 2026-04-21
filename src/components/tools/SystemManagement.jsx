import React, { useState, useEffect } from 'react';

const SystemManagement = ({ onResultChange }) => {
  const [clipboardText, setClipboardText] = useState('');

  const readClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setClipboardText(text);
    } catch (err) {
      setClipboardText('Permission denied or clipboard empty');
    }
  };

  useEffect(() => {
    onResultChange({ text: `Clipboard Content: ${clipboardText}`, filename: 'clipboard.txt' });
  }, [clipboardText, onResultChange]);

  return (
    <div className="tool-form">
      <div className="tool-result">
        <h3>Clipboard Manager</h3>
        <button className="btn-primary" onClick={readClipboard} style={{ marginBottom: '1rem' }}>Read Clipboard</button>
        <div style={{ background: 'var(--surface)', padding: '1rem', borderRadius: '12px', minHeight: '100px', opacity: 0.8 }}>
          {clipboardText || 'Click button to read...'}
        </div>
      </div>
    </div>
  );
};

export default SystemManagement;
