import React, { useState, useEffect } from 'react';

const PrivacyDashboard = ({ onResultChange }) => {
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    const checkPermissions = async () => {
      const names = ['camera', 'microphone', 'geolocation', 'notifications', 'bluetooth'];
      const results = [];
      for (const name of names) {
        try {
          const status = await navigator.permissions.query({ name });
          results.push({ name, state: status.state });
        } catch (e) {
          results.push({ name, state: 'Unsupported' });
        }
      }
      setPermissions(results);
    };
    checkPermissions();
  }, []);

  useEffect(() => {
    onResultChange({ text: JSON.stringify(permissions, null, 2), filename: 'privacy_report.json' });
  }, [permissions, onResultChange]);

  const permUsage = {
    camera: ['Flashlight', 'QR Scanner', 'Camera Color Picker'],
    microphone: ['Soundmeter'],
    geolocation: ['Altitude & GPS'],
    bluetooth: ['Connectivity Tools'],
    notifications: ['Security Info']
  };

  return (
    <div className="tool-form">
      <div className="tool-result">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
           <span className="material-icons" style={{ fontSize: '2rem', color: 'var(--primary)' }}>security</span>
           <h3 style={{ margin: 0 }}>Privacy Dashboard</h3>
        </div>
        <p style={{ opacity: 0.7, marginBottom: '2rem' }}>Detailed overview of system permissions and which tools use them. No data is ever transmitted off-device.</p>

        <div style={{ display: 'grid', gap: '16px' }}>
          {permissions.map(p => (
            <div key={p.name} style={{ padding: '16px', background: 'var(--surface)', borderRadius: '16px', border: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <b style={{ textTransform: 'capitalize', fontSize: '1.1rem' }}>{p.name}</b>
                <span className={`fallback-badge`} style={{ background: p.state === 'granted' ? 'var(--accent-green)' : 'var(--text-muted)', boxShadow: 'none' }}>
                  {p.state.toUpperCase()}
                </span>
              </div>
              <div style={{ fontSize: '0.85rem', opacity: 0.6 }}>
                Used by: {permUsage[p.name]?.join(', ') || 'None'}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '2rem', padding: '16px', background: 'var(--md-sys-color-primary-container)', color: 'var(--md-sys-color-on-primary-container)', borderRadius: '16px' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
            <span className="material-icons">info</span>
            <div style={{ fontSize: '0.9rem' }}>
              <b>Your Privacy is Protected</b>
              <p style={{ margin: '4px 0 0', opacity: 0.8 }}>This app runs entirely locally. We do not track your location, record your audio, or save your images to any server.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyDashboard;
