import React, { useState, useEffect } from 'react';

const ConnectivityTools = ({ onResultChange }) => {
  const [btStatus, setBtStatus] = useState('Idle');

  const scanBT = async () => {
    if (!navigator.bluetooth) {
      setBtStatus('Web Bluetooth not supported');
      return;
    }
    setBtStatus('Scanning...');
    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true
      });
      setBtStatus(`Found: ${device.name || 'Unknown Device'}`);
    } catch (err) {
      setBtStatus(`Scan failed: ${err.message}`);
    }
  };

  useEffect(() => {
    onResultChange({ text: `Bluetooth Status: ${btStatus}`, filename: 'connectivity.txt' });
  }, [btStatus, onResultChange]);

  return (
    <div className="tool-form">
      <div className="tool-result" style={{ textAlign: 'center', padding: '2rem' }}>
        <span className="material-icons" style={{ fontSize: '3rem', color: 'var(--primary)', marginBottom: '1rem' }}>bluetooth</span>
        <h3>Bluetooth Scanner</h3>
        <p style={{ opacity: 0.7 }}>{btStatus}</p>
        <button className="btn-primary" onClick={scanBT} style={{ marginTop: '20px' }}>Scan for Devices</button>
      </div>
    </div>
  );
};

export default ConnectivityTools;
