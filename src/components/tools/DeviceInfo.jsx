import React, { useState, useEffect } from 'react';
import { Device } from '@capacitor/device';
import { Network } from '@capacitor/network';
import { STRINGS } from '../../strings';

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

  const s = STRINGS.tools.deviceInfo;

  const metrics = [
    { label: s.manufacturer, value: deviceInfo.manufacturer, icon: 'factory' },
    { label: s.model, value: deviceInfo.model, icon: 'smartphone' },
    { label: s.os, value: deviceInfo.osVersion, icon: 'android' },
    { label: s.battery, value: `${battery.level}% ${battery.charging ? '⚡' : ''}`, icon: battery.charging ? 'battery_charging_full' : 'battery_full' },
    { label: s.connection, value: network.type, icon: 'wifi' },
    { label: s.platform, value: deviceInfo.platform, icon: 'settings_input_component' }
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
    if (data.length < 2) return <div style={{ height }} />;
    const points = data.map((d, i) => `${(i / (data.length - 1)) * width},${height - (d / max) * height}`).join(' ');

    return (
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" points={points} />
      </svg>
    );
  };

  return (
    <div className="tool-form">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
        {metrics.map(m => (
          <div key={m.label} className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div className="card-icon" style={{ marginBottom: '0.75rem', width: '40px', height: '40px' }}>
              <span className="material-icons" style={{ fontSize: '1.25rem' }}>{m.icon}</span>
            </div>
            <div style={{ fontSize: '0.7rem', opacity: 0.6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</div>
            <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--nature-primary)' }}>{m.value || STRINGS.common.detecting}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ marginTop: '1.5rem', padding: '1.5rem' }}>
        <h4 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--nature-primary)' }}>
          <span className="material-icons">analytics</span> {s.metrics}
        </h4>

        <div style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{s.cpu}</span>
            <span className="pill" style={{ fontSize: '0.75rem', padding: '2px 8px', background: 'var(--nature-mist)', color: 'var(--nature-primary)' }}>
              {Math.round(history.cpu[history.cpu.length - 1] || 0)}%
            </span>
          </div>
          {renderGraph(history.cpu, 'var(--nature-primary)')}
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{s.ram}</span>
            <span className="pill" style={{ fontSize: '0.75rem', padding: '2px 8px', background: 'var(--nature-gold)', color: 'white' }}>
              {Math.round(history.ram[history.ram.length - 1] || 0)}%
            </span>
          </div>
          {renderGraph(history.ram, 'var(--nature-gold)')}
        </div>
      </div>

      <div className="empty-state" style={{ opacity: 0.5, padding: '2rem 0' }}>
        <span className="material-icons">info</span>
        <p style={{ fontSize: '0.8rem', maxWidth: '280px', margin: '0 auto' }}>{s.disclaimer}</p>
      </div>
    </div>
  );
};

export default DeviceInfo;
