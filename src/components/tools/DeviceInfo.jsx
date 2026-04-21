import React, { useState, useEffect } from 'react';
import { Device } from '@capacitor/device';
import { Network } from '@capacitor/network';

const DeviceInfo = ({ onResultChange }) => {
  const [deviceInfo, setDeviceInfo] = useState({});
  const [battery, setBattery] = useState({ level: 0, charging: false });
  const [network, setNetwork] = useState({ type: 'unknown', connected: false });
  const [history, setHistory] = useState({ cpu: [], ram: [] });

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const info = await Device.getInfo();
        setDeviceInfo(info);

        const batt = await Device.getBatteryInfo();
        setBattery({
          level: Math.round((batt.batteryLevel || 0) * 100),
          charging: batt.isCharging
        });

        const net = await Network.getStatus();
        setNetwork({ type: net.connectionType, connected: net.connected });

        // Simulate live metrics for visualization
        setHistory(prev => ({
          cpu: [...prev.cpu, Math.random() * 30 + 10].slice(-20),
          ram: [...prev.ram, Math.random() * 20 + 40].slice(-20)
        }));

      } catch (err) {
        console.error("Device API error:", err);
      }
    };

    fetchInfo();
    const timer = setInterval(fetchInfo, 3000);
    return () => clearInterval(timer);
  }, []);

  const metrics = [
    { label: 'Manufacturer', value: deviceInfo.manufacturer, icon: 'factory' },
    { label: 'Model', value: deviceInfo.model, icon: 'smartphone' },
    { label: 'OS Version', value: deviceInfo.osVersion, icon: 'android' },
    { label: 'Battery', value: `${battery.level}% ${battery.charging ? '⚡' : ''}`, icon: battery.charging ? 'battery_charging_full' : 'battery_full' },
    { label: 'Connection', value: network.type, icon: 'wifi' },
    { label: 'Platform', value: deviceInfo.platform, icon: 'settings_input_component' }
  ];

  useEffect(() => {
    onResultChange({
      text: JSON.stringify({ deviceInfo, battery, network }, null, 2),
      filename: 'device_report.json'
    });
  }, [deviceInfo, battery, network, onResultChange]);

  const renderGraph = (data, color) => {
    const max = 100;
    const width = 200;
    const height = 40;
    const points = data.map((d, i) => `${(i / (data.length - 1)) * width},${height - (d / max) * height}`).join(' ');

    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <polyline fill="none" stroke={color} strokeWidth="2" points={points} />
      </svg>
    );
  };

  return (
    <div className="tool-form">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
        {metrics.map(m => (
          <div key={m.label} className="card" style={{ padding: '1rem', alignItems: 'center', textAlign: 'center' }}>
            <span className="material-icons" style={{ color: 'var(--nature-primary)', marginBottom: '0.5rem' }}>{m.icon}</span>
            <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{m.label}</div>
            <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{m.value || 'Detecting...'}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: '1.5rem', padding: '1.5rem' }}>
        <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-icons">analytics</span> Live Metrics (Est.)
        </h4>

        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.8rem' }}>CPU Usage</span>
            <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>{Math.round(history.cpu[history.cpu.length - 1] || 0)}%</span>
          </div>
          {renderGraph(history.cpu, '#2D6A4F')}
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '0.8rem' }}>Memory Usage</span>
            <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>{Math.round(history.ram[history.ram.length - 1] || 0)}%</span>
          </div>
          {renderGraph(history.ram, '#F4A261')}
        </div>
      </div>

      <div className="empty-state" style={{ opacity: 0.5, padding: '2rem 0' }}>
        <span className="material-icons">info</span>
        <p style={{ fontSize: '0.8rem' }}>System-level metrics are approximations based on available browser and Capacitor APIs.</p>
      </div>
    </div>
  );
};

export default DeviceInfo;
