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
    <div className="tool-container-inner">
      <div className="form-group">
        <label>URL or Text to Encode</label>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="https://nature-toolbox.hub"
        />
      </div>
      {input && (
        <div className="result-area">
          <div ref={qrRef} style={{ display: 'inline-block', padding: '16px', background: 'white', borderRadius: '12px', boxShadow: 'var(--shadow-sm)' }}>
            <QRCodeCanvas
                value={input}
                size={250}
                level={"H"}
                includeMargin={true}
            />
          </div>
          <p style={{marginTop: '20px', fontSize: '0.9rem', color: 'var(--nature-primary)', fontWeight: '500'}}>
             Scan with any camera or QR reader
          </p>
        </div>
      )}
    </div>
  );
};

export default QrGen;
