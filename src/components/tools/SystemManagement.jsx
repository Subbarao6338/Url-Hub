import React, { useState, useEffect } from 'react';

const SystemManagement = ({ onResultChange }) => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(false);

  // In a real Android environment, we would use a native plugin to list apps.
  // Here we provide a functional UI for the App Manager concept.
  const mockApps = [
    { name: 'Nature Toolbox', package: 'com.nature.toolbox', size: '24 MB', version: '1.0.0' },
    { name: 'System Settings', package: 'com.android.settings', size: '12 MB', version: '13' },
    { name: 'Camera', package: 'com.android.camera', size: '45 MB', version: '2.4.1' }
  ];

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setApps(mockApps);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    onResultChange({
      text: apps.map(a => `${a.name} (${a.package}) - ${a.size}`).join('\n'),
      filename: 'installed_apps.txt'
    });
  }, [apps, onResultChange]);

  return (
    <div className="tool-form">
      <h3 style={{ color: 'var(--nature-primary)', marginBottom: '1.5rem' }}>App Manager</h3>

      {loading ? (
        <div className="loading-seed">
          <span className="material-icons seed-icon">sync</span>
          <p>Scanning ecosystem...</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {apps.map(app => (
            <div key={app.package} className="card" style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div className="card-icon" style={{ width: '40px', height: '40px' }}>
                  <span className="material-icons">apps</span>
                </div>
                <div>
                  <div style={{ fontWeight: '600' }}>{app.name}</div>
                  <div style={{ fontSize: '0.75rem', opacity: 0.6 }}>{app.package}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '500' }}>{app.size}</div>
                <button className="btn-primary" style={{ padding: '4px 12px', fontSize: '0.7rem', marginTop: '4px' }}>
                  Manage
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="empty-state" style={{ padding: '2rem 0', opacity: 0.6 }}>
        <span className="material-icons">security</span>
        <p style={{ fontSize: '0.8rem' }}>Advanced system management requires Root access or ADB integration.</p>
      </div>
    </div>
  );
};

export default SystemManagement;
