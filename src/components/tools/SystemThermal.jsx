import React, { useState, useEffect } from 'react';
import { STRINGS } from '../../strings';
import { NATURE_THEME } from '../../constants';

const SystemThermal = ({ onResultChange }) => {
  const [thermalStatus, setThermalStatus] = useState(0); // 0-5
  const [temp, setTemp] = useState(32);

  useEffect(() => {
    // Simulate thermal monitoring
    const interval = setInterval(() => {
      setTemp(t => {
        const next = t + (Math.random() * 2 - 0.9);
        return Math.max(30, Math.min(45, next));
      });
      // Mock logic: map temp to status
      if (temp < 35) setThermalStatus(0);
      else if (temp < 38) setThermalStatus(1);
      else if (temp < 40) setThermalStatus(2);
      else setThermalStatus(3);
    }, 2000);

    return () => clearInterval(interval);
  }, [temp]);

  useEffect(() => {
    onResultChange({
      text: `Thermal Status: ${STRINGS.tools.thermal[NATURE_THEME.thermalLevels[thermalStatus].label]}\nTemperature: ${temp.toFixed(1)}°C`,
      filename: 'thermal_report.txt'
    });
  }, [thermalStatus, temp, onResultChange]);

  const levels = NATURE_THEME.thermalLevels;
  const current = levels[thermalStatus];

  return (
    <div className="tool-form">
      <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
        <h4 style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '2rem', textTransform: 'uppercase' }}>
          {STRINGS.tools.thermal.status}
        </h4>

        <div style={{ position: 'relative', width: '200px', height: '100px', margin: '0 auto 2rem', overflow: 'hidden' }}>
          {/* Gauge semi-circle */}
          <svg viewBox="0 0 100 50" style={{ width: '100%' }}>
            <path d="M10,50 A40,40 0 0,1 90,50" fill="none" stroke="#E9F5EB" strokeWidth="8" strokeLinecap="round" />
            <path
              d="M10,50 A40,40 0 0,1 90,50"
              fill="none"
              stroke={current.color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray="125.6"
              strokeDashoffset={125.6 - (thermalStatus / 5) * 125.6}
              style={{ transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
            />
          </svg>
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, textAlign: 'center' }}>
            <span className="material-icons" style={{ color: current.color, fontSize: '2rem' }}>
              {thermalStatus > 2 ? 'thermostat' : 'eco'}
            </span>
          </div>
        </div>

        <h3 style={{ margin: '0 0 0.5rem', color: current.color }}>
          {STRINGS.tools.thermal[current.label]}
        </h3>
        <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: 0, color: 'var(--nature-primary)' }}>
          {temp.toFixed(1)}°C
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px', marginTop: '1rem' }}>
        {[0, 1, 2, 3, 4, 5].map(lv => (
          <div key={lv} style={{
            height: '4px',
            borderRadius: '2px',
            background: lv <= thermalStatus ? levels[lv].color : 'var(--border)',
            opacity: lv <= thermalStatus ? 1 : 0.3
          }} />
        ))}
      </div>

      <div className="empty-state" style={{ opacity: 0.6, marginTop: '2rem' }}>
        <p style={{ fontSize: '0.8rem' }}>
           🍃 Your device is breathing at its natural pace. Keep it out of direct sunlight for optimal health.
        </p>
      </div>
    </div>
  );
};

export default SystemThermal;
