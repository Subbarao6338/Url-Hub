import React, { useState, useEffect } from 'react';

const AndroidSensors = ({ onResultChange }) => {
  const [motion, setMotion] = useState({ acc: { x: 0, y: 0, z: 0 }, gyro: { alpha: 0, beta: 0, gamma: 0 } });
  const [orientation, setOrientation] = useState({ alpha: 0, beta: 0, gamma: 0 });
  const [ambient, setAmbient] = useState({ light: 'N/A', proximity: 'N/A' });
  const [error, setError] = useState(null);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const requestPermission = async () => {
    if (!window.confirm("Sensor tools need access to device motion and orientation sensors to function. Proceed?")) {
      return;
    }
    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      try {
        const response = await DeviceMotionEvent.requestPermission();
        if (response === 'granted') {
          setPermissionGranted(true);
        } else {
          setError('Permission denied');
        }
      } catch (err) {
        setError('Error requesting permission: ' + err.message);
      }
    } else {
      // For browsers that don't need explicit permission request or don't support it
      setPermissionGranted(true);
    }
  };

  useEffect(() => {
    if (!permissionGranted) return;

    const handleMotion = (event) => {
      setMotion({
        acc: {
          x: event.accelerationIncludingGravity?.x?.toFixed(2) || 0,
          y: event.accelerationIncludingGravity?.y?.toFixed(2) || 0,
          z: event.accelerationIncludingGravity?.z?.toFixed(2) || 0,
        },
        gyro: {
          alpha: event.rotationRate?.alpha?.toFixed(2) || 0,
          beta: event.rotationRate?.beta?.toFixed(2) || 0,
          gamma: event.rotationRate?.gamma?.toFixed(2) || 0,
        }
      });
    };

    const handleOrientation = (event) => {
      setOrientation({
        alpha: event.alpha?.toFixed(2) || 0,
        beta: event.beta?.toFixed(2) || 0,
        gamma: event.gamma?.toFixed(2) || 0,
      });
    };

    window.addEventListener('devicemotion', handleMotion);
    window.addEventListener('deviceorientation', handleOrientation);

    // Generic Sensor API (Chrome/Android)
    let lightSensor, proximitySensor, magnetometer, accelerometer, gyroscope;

    const startSensors = async () => {
        try {
            if ('AmbientLightSensor' in window) {
                lightSensor = new window.AmbientLightSensor();
                lightSensor.onreading = () => setAmbient(prev => ({ ...prev, light: lightSensor.illuminance.toFixed(1) + ' lx' }));
                lightSensor.start();
            }

            if ('ProximitySensor' in window) {
                proximitySensor = new window.ProximitySensor();
                proximitySensor.onreading = () => setAmbient(prev => ({ ...prev, proximity: (proximitySensor.distance || 'Near') + ' cm' }));
                proximitySensor.start();
            }

            if ('Magnetometer' in window) {
              magnetometer = new window.Magnetometer({frequency: 10});
              magnetometer.onreading = () => {
                // Add magnetic field data handling if needed
              };
              magnetometer.start();
            }
        } catch (e) {
            console.warn('Generic Sensor API error:', e);
        }
    };

    startSensors();

    return () => {
      window.removeEventListener('devicemotion', handleMotion);
      window.removeEventListener('deviceorientation', handleOrientation);
      lightSensor?.stop();
      proximitySensor?.stop();
    };
  }, [permissionGranted]);

  useEffect(() => {
    onResultChange({
      text: `Sensor Data:\n` +
            `Accelerometer: X:${motion.acc.x} Y:${motion.acc.y} Z:${motion.acc.z}\n` +
            `Gyroscope: A:${motion.gyro.alpha} B:${motion.gyro.beta} G:${motion.gyro.gamma}\n` +
            `Orientation: A:${orientation.alpha} B:${orientation.beta} G:${orientation.gamma}\n` +
            `Light: ${ambient.light}, Proximity: ${ambient.proximity}`,
      filename: 'sensor_data.txt'
    });
  }, [motion, orientation, ambient, onResultChange]);

  const SensorValue = ({ label, value, unit = '', color = 'var(--primary)' }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--border)' }}>
      <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>{label}</span>
      <b style={{ fontSize: '0.9rem', color: color }}>{value}{unit}</b>
    </div>
  );

  return (
    <div className="tool-form">
      {!permissionGranted ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', background: 'var(--surface)', borderRadius: '24px', border: '1px solid var(--border)' }}>
          <div style={{ width: '80px', height: '80px', background: 'rgba(var(--primary-rgb), 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <span className="material-icons" style={{ fontSize: '2.5rem', color: 'var(--primary)' }}>sensors</span>
          </div>
          <h3 style={{ marginBottom: '10px' }}>Sensor Access</h3>
          <p style={{ opacity: 0.7, marginBottom: '25px', maxWidth: '300px', margin: '0 auto 25px' }}>We need permission to access your device's motion and orientation sensors for real-time data.</p>
          <button className="btn-primary" onClick={requestPermission} style={{ width: '100%', maxWidth: '200px' }}>Enable Sensors</button>
          {error && <div style={{ color: 'var(--danger)', marginTop: '20px', fontSize: '0.9rem' }}>{error}</div>}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div className="sensor-card" style={{ padding: '20px', background: 'var(--surface)', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '36px', height: '36px', background: 'rgba(var(--primary-rgb), 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-icons" style={{ color: 'var(--primary)', fontSize: '1.25rem' }}>speed</span>
              </div>
              <h5 style={{ margin: 0, fontWeight: 700 }}>Accelerometer</h5>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <SensorValue label="X-axis" value={motion.acc.x} unit=" m/s²" color="#ef4444" />
              <SensorValue label="Y-axis" value={motion.acc.y} unit=" m/s²" color="#10b981" />
              <SensorValue label="Z-axis" value={motion.acc.z} unit=" m/s²" color="#3b82f6" />
            </div>
          </div>

          <div className="sensor-card" style={{ padding: '20px', background: 'var(--surface)', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '36px', height: '36px', background: 'rgba(var(--primary-rgb), 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-icons" style={{ color: 'var(--primary)', fontSize: '1.25rem' }}>sync</span>
              </div>
              <h5 style={{ margin: 0, fontWeight: 700 }}>Gyroscope</h5>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <SensorValue label="Alpha" value={motion.gyro.alpha} unit=" °/s" color="#8b5cf6" />
              <SensorValue label="Beta" value={motion.gyro.beta} unit=" °/s" color="#f59e0b" />
              <SensorValue label="Gamma" value={motion.gyro.gamma} unit=" °/s" color="#ec4899" />
            </div>
          </div>

          <div className="sensor-card" style={{ padding: '20px', background: 'var(--surface)', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '36px', height: '36px', background: 'rgba(var(--primary-rgb), 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-icons" style={{ color: 'var(--primary)', fontSize: '1.25rem' }}>explore</span>
              </div>
              <h5 style={{ margin: 0, fontWeight: 700 }}>Orientation</h5>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <SensorValue label="Yaw" value={orientation.alpha} unit="°" />
              <SensorValue label="Pitch" value={orientation.beta} unit="°" />
              <SensorValue label="Roll" value={orientation.gamma} unit="°" />
            </div>
          </div>

          <div className="sensor-card" style={{ padding: '20px', background: 'var(--surface)', borderRadius: '20px', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ width: '36px', height: '36px', background: 'rgba(var(--primary-rgb), 0.1)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-icons" style={{ color: 'var(--primary)', fontSize: '1.25rem' }}>visibility</span>
              </div>
              <h5 style={{ margin: 0, fontWeight: 700 }}>Environment</h5>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <SensorValue label="Light" value={ambient.light} />
              <SensorValue label="Proximity" value={ambient.proximity} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AndroidSensors;
