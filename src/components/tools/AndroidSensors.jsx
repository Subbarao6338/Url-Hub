import React, { useState, useEffect, useRef } from 'react';

const AndroidSensors = ({ onResultChange }) => {
  const [sensors, setSensors] = useState({
    accelerometer: { x: 0, y: 0, z: 0 },
    gyroscope: { alpha: 0, beta: 0, gamma: 0 },
    magnetometer: { x: 0, y: 0, z: 0 },
    orientation: { alpha: 0, beta: 0, gamma: 0 },
    light: 0,
    proximity: 'N/A'
  });
  const [history, setHistory] = useState({ acc: [] });

  useEffect(() => {
    const handleMotion = (e) => {
      const acc = e.accelerationIncludingGravity || { x: 0, y: 0, z: 0 };
      setSensors(prev => ({ ...prev, accelerometer: acc }));
      setHistory(h => ({ acc: [...h.acc, Math.sqrt(acc.x**2 + acc.y**2 + acc.z**2)].slice(-20) }));
    };

    const handleOrientation = (e) => {
      setSensors(prev => ({
        ...prev,
        orientation: { alpha: e.alpha || 0, beta: e.beta || 0, gamma: e.gamma || 0 }
      }));
    };

    window.addEventListener('devicemotion', handleMotion);
    window.addEventListener('deviceorientation', handleOrientation);

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      window.removeEventListener('deviceorientation', handleOrientation);
    };
  }, []);

  useEffect(() => {
    onResultChange({
      text: JSON.stringify(sensors, null, 2),
      filename: 'sensor_data.json'
    });
  }, [sensors, onResultChange]);

  const renderCompass = () => {
    const angle = sensors.orientation.alpha;
    return (
      <div style={{ position: 'relative', width: '180px', height: '180px', margin: '0 auto', border: '4px solid var(--nature-primary)', borderRadius: '50%', background: 'var(--nature-white)' }}>
        <div style={{
          position: 'absolute', top: '50%', left: '50%', width: '4px', height: '140px',
          background: 'linear-gradient(to bottom, #BA1A1A 50%, #1B2430 50%)',
          transform: `translate(-50%, -50%) rotate(${angle}deg)`,
          transition: 'transform 0.1s linear'
        }} />
        {['N', 'E', 'S', 'W'].map((d, i) => (
          <div key={d} style={{ position: 'absolute', top: '50%', left: '50%', transform: `translate(-50%, -50%) rotate(${i * 90}deg) translateY(-70px)`, fontWeight: 'bold', fontSize: '0.8rem', color: i === 0 ? '#BA1A1A' : 'var(--nature-primary)' }}>{d}</div>
        ))}
      </div>
    );
  };

  const renderSpiritLevel = () => {
    const { beta, gamma } = sensors.orientation;
    const x = Math.min(50, Math.max(-50, gamma)) * 1.5;
    const y = Math.min(50, Math.max(-50, beta)) * 1.5;
    return (
        <div style={{ width: '180px', height: '180px', margin: '0 auto', borderRadius: '50%', border: '2px solid var(--border)', position: 'relative', background: 'rgba(var(--primary-rgb), 0.05)' }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '24px',
            height: '24px',
            background: 'var(--nature-moss)',
            borderRadius: '50%',
            transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
            boxShadow: 'inset -4px -4px 8px rgba(0,0,0,0.2)',
            transition: 'transform 0.1s ease-out'
          }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: '30px', height: '30px', border: '1px solid var(--nature-primary)', borderRadius: '50%', transform: 'translate(-50%, -50%)', opacity: 0.3 }} />
        </div>
    );
  };

  return (
    <div className="tool-form">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h4 style={{ fontSize: '0.8rem', marginBottom: '1rem', opacity: 0.6 }}>COMPASS</h4>
          {renderCompass()}
          <div style={{ marginTop: '1rem', fontWeight: 'bold' }}>{Math.round(sensors.orientation.alpha)}°</div>
        </div>
        <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
          <h4 style={{ fontSize: '0.8rem', marginBottom: '1rem', opacity: 0.6 }}>SPIRIT LEVEL</h4>
          {renderSpiritLevel()}
          <div style={{ marginTop: '1rem', fontSize: '0.75rem' }}>
            β: {sensors.orientation.beta.toFixed(1)}° <br/>
            γ: {sensors.orientation.gamma.toFixed(1)}°
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="material-icons">query_stats</span> All Sensors
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
           <SensorItem label="Acc X" value={sensors.accelerometer.x.toFixed(2)} />
           <SensorItem label="Acc Y" value={sensors.accelerometer.y.toFixed(2)} />
           <SensorItem label="Acc Z" value={sensors.accelerometer.z.toFixed(2)} />
           <SensorItem label="Light" value={`${sensors.light} lx`} />
        </div>
      </div>
    </div>
  );
};

const SensorItem = ({ label, value }) => (
  <div style={{ padding: '10px', background: 'var(--nature-bg)', borderRadius: '12px', border: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{label}</span>
    <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>{value}</span>
  </div>
);

export default AndroidSensors;
