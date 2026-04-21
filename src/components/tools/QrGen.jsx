import React, { useState, useEffect, useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const QrGen = ({ onResultChange }) => {
  const [input, setInput] = useState('');
  const qrRef = useRef(null);

  useEffect(() => {
    if (input && qrRef.current) {
        const canvas = qrRef.current.querySelector('canvas');
        if (canvas) {
            canvas.toBlob((blob) => {
                onResultChange({
                    text: input,
                    blob: blob,
                    filename: 'qrcode.png'
                });
            });
        }
    } else {
      onResultChange(null);
    }
  }, [input, onResultChange]);

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
      {input && (
        <div id="qr-result-container" style={{textAlign: 'center', marginTop: '2rem', padding: '20px', background: 'white', borderRadius: '16px', border: '1px solid #eee'}}>
          <div ref={qrRef} style={{ display: 'inline-block', padding: '10px', background: 'white' }}>
            <QRCodeCanvas
                value={input}
                size={250}
                level={"H"}
                includeMargin={true}
            />
          </div>
          <p style={{marginTop: '15px', fontSize: '0.8rem', color: '#888'}}>Scan this code with your camera</p>
        </div>
      )}
    </div>
  );
};

export default QrGen;
