import React, { useState, useEffect } from 'react';
import { Device } from '@capacitor/device';
import { Network } from '@capacitor/network';

const DeviceInfo = ({ onResultChange }) => {
  const [deviceInfo, setDeviceInfo] = useState({});
  const [battery, setBattery] = useState({ level: 'N/A', charging: 'N/A' });
  const [network, setNetwork] = useState({ type: 'N/A', connected: false });
  const [memInfo, setMemInfo] = useState({ total: 'N/A', free: 'N/A' });

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const info = await Device.getInfo();
        setDeviceInfo(info);

        const batt = await Device.getBatteryInfo();
        setBattery({
           level: `${Math.round((batt.batteryLevel || 0) * 100)}%`,
           charging: batt.isCharging ? 'Charging' : 'Discharging'
        });

        const net = await Network.getStatus();
        setNetwork({ type: net.connectionType, connected: net.connected });

        // Memory info often requires specific platform implementation
        // For now, we use navigator.deviceMemory as fallback
        setMemInfo({
          total: navigator.deviceMemory ? `${navigator.deviceMemory} GB` : 'N/A',
          free: 'N/A'
        });
      } catch (err) {
        console.error("Capacitor API failed:", err);
      }
    };

    fetchInfo();
    const interval = setInterval(fetchInfo, 10000);
    return () => clearInterval(interval);
  }, []);

  const info = [
    { l: 'Manufacturer', v: deviceInfo.manufacturer || 'N/A' },
    { l: 'Model', v: deviceInfo.model || 'N/A' },
    { l: 'Platform', v: deviceInfo.platform || navigator.platform },
    { l: 'OS Version', v: deviceInfo.osVersion || 'N/A' },
    { l: 'Battery', v: `${battery.level} (${battery.charging})` },
    { l: 'Network', v: `${network.type} (${network.connected ? 'Online' : 'Offline'})` },
    { l: 'Device Memory', v: memInfo.total },
    { l: 'Screen', v: `${window.screen.width}x${window.screen.height}` },
    { l: 'Language', v: navigator.language },
    { l: 'CPU Cores', v: navigator.hardwareConcurrency || 'N/A' }
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
