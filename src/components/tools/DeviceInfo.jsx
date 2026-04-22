import React, { useState, useEffect } from 'react';

const DeviceInfo = ({ onResultChange }) => {
  const [battery, setBattery] = useState({ level: 'N/A', charging: 'N/A' });
  const [network, setNetwork] = useState({ type: 'N/A', speed: 'N/A' });
  const [memory, setMemory] = useState(navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'N/A');

  useEffect(() => {
    // Battery API
    if (navigator.getBattery) {
      navigator.getBattery().then(batt => {
        const updateBattery = () => {
          setBattery({
            level: `${Math.round(batt.level * 100)}%`,
            charging: batt.charging ? 'Charging' : 'Discharging'
          });
        };
        updateBattery();
        batt.addEventListener('levelchange', updateBattery);
        batt.addEventListener('chargingchange', updateBattery);
      });
    }

    // Network Information API
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      const updateNetwork = () => {
        setNetwork({
          type: connection.effectiveType || 'N/A',
          speed: connection.downlink ? `${connection.downlink} Mbps` : 'N/A'
        });
      };
      updateNetwork();
      connection.addEventListener('change', updateNetwork);
    }
  }, []);

  const info = [
    { l: 'Platform', v: navigator.platform },
    { l: 'Language', v: navigator.language },
    { l: 'Screen', v: `${window.screen.width}x${window.screen.height} (${window.screen.orientation?.type || 'N/A'})` },
    { l: 'Pixel Ratio', v: window.devicePixelRatio },
    { l: 'CPU Cores', v: navigator.hardwareConcurrency || 'N/A' },
    { l: 'Device Memory', v: memory },
    { l: 'Battery', v: `${battery.level} (${battery.charging})` },
    { l: 'Network', v: `${network.type} (~${network.speed})` },
    { l: 'Dark Mode', v: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'Enabled' : 'Disabled' },
    { l: 'Cookies Enabled', v: navigator.cookieEnabled ? 'Yes' : 'No' }
  ];

  useEffect(() => {
    onResultChange({
      text: info.map(i => `${i.l}: ${i.v}`).join('\n') + `\nUser Agent: ${navigator.userAgent}`,
      filename: 'device_info.txt'
    });
  }, [onResultChange, battery, network, memory]);

  return (
    <div className="tool-form">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
        {info.map(i => (
          <div key={i.l} className="tool-result" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px' }}>
            <span style={{ opacity: 0.7, fontSize: '0.9rem' }}>{i.l}</span>
            <b style={{ fontSize: '0.95rem' }}>{i.v}</b>
          </div>
        ))}
      </div>
      <div className="tool-result" style={{ marginTop: '10px', fontSize: '0.8rem', overflowX: 'auto', padding: '10px' }}>
        <div style={{ opacity: 0.5, marginBottom: '5px' }}>User Agent</div>
        <code style={{ color: 'var(--primary)', wordBreak: 'break-all' }}>{navigator.userAgent}</code>
      </div>
    </div>
  );
};

export default DeviceInfo;
