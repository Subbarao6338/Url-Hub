import React, { useState, useEffect } from 'react';

const UserScripts = ({ onResultChange }) => {
  const [script, setScript] = useState("console.log('Hello from Hub');");

  useEffect(() => {
    if (script) {
      onResultChange({
        text: script,
        filename: 'script.js'
      });
    } else {
      onResultChange(null);
    }
  }, [script, onResultChange]);

  const runScript = () => {
    try {
      eval(script);
    } catch(e) {
      alert(e.message);
    }
  };

  return (
    <div className="tool-form">
      <p style={{ opacity: 0.7, marginBottom: '15px' }}>Execute custom JS in the context of this app.</p>
      <textarea
        rows="6"
        style={{ width: '100%', fontFamily: 'monospace', marginBottom: '15px' }}
        value={script}
        onChange={(e) => setScript(e.target.value)}
      />
      <button className="btn-primary" style={{ width: '100%' }} onClick={runScript}>Run Script</button>
    </div>
  );
};

export default UserScripts;
