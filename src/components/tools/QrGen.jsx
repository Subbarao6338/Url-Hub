import React, { useState, useEffect } from 'react';

const QrGen = ({ onResultChange }) => {
  const [input, setInput] = useState('');

  const qrUrl = input ? `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(input)}` : null;

  useEffect(() => {
    if (qrUrl) {
      fetch(qrUrl)
        .then(res => res.blob())
        .then(blob => {
          onResultChange({
            text: input,
            blob: blob,
            filename: 'qrcode.png'
          });
        });
    } else {
      onResultChange(null);
    }
  }, [qrUrl, input, onResultChange]);

  return (
    <div className="tool-form">
      <div className="form-group">
        <label>URL or Text</label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="https://google.com"
          style={{width: '100%'}}
        />
      </div>
      {qrUrl && (
        <div id="qr-result-container" style={{textAlign: 'center', marginTop: '2rem', padding: '20px', background: 'white', borderRadius: '16px', border: '1px solid #eee'}}>
          <img src={qrUrl} alt="QR Code" style={{maxWidth: '100%', height: 'auto'}} />
          <p style={{marginTop: '15px', fontSize: '0.8rem', color: '#888'}}>Scan this code with your camera</p>
        </div>
      )}
    </div>
  );
};

export default QrGen;
