import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QrScanner = ({ onResultChange }) => {
  const [scannedData, setScannedData] = useState(null);
  const scannerRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true,
      supportedScanTypes: [0] // Camera
    }, false);

    const onScanSuccess = (decodedText) => {
      setScannedData(decodedText);
      scanner.clear();
    };

    scanner.render(onScanSuccess, (err) => {
      // Ignore scanning errors as they happen constantly during search
    });

    scannerRef.current = scanner;

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.error("Scanner cleanup failed:", err));
      }
    };
  }, []);

  useEffect(() => {
    onResultChange({ text: scannedData || 'No data', filename: 'qr_data.txt' });
  }, [scannedData, onResultChange]);

  return (
    <div className="tool-form">
      <div id="reader" style={{ borderRadius: '24px', overflow: 'hidden', border: 'none' }}></div>
      {scannedData && (
        <div className="tool-result" style={{ marginTop: '1.5rem' }}>
          <h4>Result</h4>
          <code style={{ wordBreak: 'break-all' }}>{scannedData}</code>
          <button className="pill" style={{ width: '100%', marginTop: '10px' }} onClick={() => window.location.reload()}>Scan Again</button>
        </div>
      )}
    </div>
  );
};

export default QrScanner;
