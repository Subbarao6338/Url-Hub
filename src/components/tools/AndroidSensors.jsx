import React, { useState, useEffect } from 'react';
import { STRINGS } from '../../strings';
import { NATURE_THEME } from '../../constants';

const AndroidSensors = ({ onResultChange }) => {
  const [sensors, setSensors] = useState({
    accelerometer: { x: 0, y: 0, z: 0 },
    orientation: { alpha: 0, beta: 0, gamma: 0 },
    light: 0
  });

  useEffect(() => {
    const handleMotion = (e) => {
      const acc = e.accelerationIncludingGravity || { x: 0, y: 0, z: 0 };
      setSensors(prev => ({ ...prev, accelerometer: acc }));
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

  const s = STRINGS.tools.sensors;

  const renderCompass = () => {
    const angle = sensors.orientation.alpha;
    return (
      <div style={{
        position: 'relative',
        width: '180px',
        height: '180px',
        margin: '0 auto',
        border: `8px solid var(--nature-mist)`,
        borderRadius: '50%',
        background: 'var(--nature-bg)',
        boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.05)'
      }}>
        {/* Needle */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', width: '6px', height: '140px',
          background: `linear-gradient(to bottom, ${NATURE_THEME.palette.sunlight} 50%, ${NATURE_THEME.palette.earth} 50%)`,
          transform: `translate(-50%, -50%) rotate(${angle}deg)`,
          transition: 'transform 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
          borderRadius: '3px',
          zIndex: 2
        }} />
        {/* Center pin */}
        <div style={{
          position: 'absolute', top: '50%', left: '50%', width: '12px', height: '12px',
          background: 'var(--nature-mist)', border: '2px solid white',
          borderRadius: '50%', transform: 'translate(-50%, -50%)', zIndex: 3
        }} />

        {['N', 'E', 'S', 'W'].map((d, i) => (
          <div key={d} style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: `translate(-50%, -50%) rotate(${i * 90}deg) translateY(-65px)`,
            fontWeight: '800',
            fontSize: '0.9rem',
            fontFamily: 'Outfit',
            color: i === 0 ? NATURE_THEME.palette.sunlight : 'var(--nature-primary)'
          }}>
            {d}
          </div>
        ))}
      </div>
    );
  };

  const renderSpiritLevel = () => {
    const { beta, gamma } = sensors.orientation;
    const x = Math.min(60, Math.max(-60, gamma)) * 1.2;
    const y = Math.min(60, Math.max(-60, beta)) * 1.2;
    return (
        <div style={{
          width: '180px',
          height: '180px',
          margin: '0 auto',
          borderRadius: '50%',
          border: '4px solid var(--nature-mist)',
          position: 'relative',
          background: 'rgba(82, 183, 136, 0.05)',
          overflow: 'hidden'
        }}>
          {/* Grid lines */}
          <div style={{ position: 'absolute', top: '50%', left: '0', right: '0', height: '1px', background: 'var(--border)' }} />
          <div style={{ position: 'absolute', left: '50%', top: '0', bottom: '0', width: '1px', background: 'var(--border)' }} />

          {/* The Bubble */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '32px',
            height: '32px',
            background: 'var(--nature-moss)',
            borderRadius: '50%',
            transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`,
            boxShadow: 'inset -4px -4px 12px rgba(0,0,0,0.2), 0 4px 8px rgba(82, 183, 136, 0.3)',
            transition: 'transform 0.1s ease-out',
            display: 'grid',
            placeItems: 'center'
          }}>
             <div style={{ width: '8px', height: '8px', background: 'rgba(255,255,255,0.4)', borderRadius: '50%' }} />
          </div>

          {/* Center ring */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '40px',
            height: '40px',
            border: '2px solid var(--nature-primary)',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
            opacity: 0.2
          }} />
        </div>
    );
  };

  return (
    <div className="tool-form">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <h4 style={{ fontSize: '0.75rem', marginBottom: '1.5rem', opacity: 0.6, letterSpacing: '0.1em' }}>{s.compass}</h4>
          {renderCompass()}
          <div style={{ marginTop: '1.5rem', fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--nature-primary)' }}>
            {Math.round(sensors.orientation.alpha)}°
          </div>
        </div>
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <h4 style={{ fontSize: '0.75rem', marginBottom: '1.5rem', opacity: 0.6, letterSpacing: '0.1em' }}>{s.spiritLevel}</h4>
          {renderSpiritLevel()}
          <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <span className="pill" style={{ background: 'var(--nature-mist)', color: 'var(--nature-primary)', fontSize: '0.8rem' }}>β: {sensors.orientation.beta.toFixed(1)}°</span>
            <span className="pill" style={{ background: 'var(--nature-mist)', color: 'var(--nature-primary)', fontSize: '0.8rem' }}>γ: {sensors.orientation.gamma.toFixed(1)}°</span>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <h4 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--nature-primary)' }}>
          <span className="material-icons">query_stats</span> {s.allSensors}
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px' }}>
           <SensorItem label={s.accX} value={sensors.accelerometer.x.toFixed(2)} />
           <SensorItem label={s.accY} value={sensors.accelerometer.y.toFixed(2)} />
           <SensorItem label={s.accZ} value={sensors.accelerometer.z.toFixed(2)} />
        </div>
      </div>
    </div>
  );
};

const SensorItem = ({ label, value }) => (
  <div style={{
    padding: '12px',
    background: 'rgba(255,255,255,0.5)',
    borderRadius: '16px',
    border: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  }}>
    <span style={{ fontSize: '0.7rem', opacity: 0.5, textTransform: 'uppercase' }}>{label}</span>
    <span style={{ fontWeight: '700', fontSize: '0.9rem', color: 'var(--nature-primary)' }}>{value}</span>
  </div>
);

export default AndroidSensors;
