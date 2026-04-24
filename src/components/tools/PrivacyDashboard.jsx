import React, { useState, useEffect } from 'react';

const PrivacyDashboard = ({ onResultChange }) => {
  const [activeTab, setActiveTab] = useState('auditor');

  return (
    <div className="tool-form">
      <div className="pill-group mb-20">
        <button className={`pill ${activeTab === 'auditor' ? 'active' : ''}`} onClick={() => setActiveTab('auditor')}>Privacy Auditor</button>
        <button className={`pill ${activeTab === 'password' ? 'active' : ''}`} onClick={() => setActiveTab('password')}>Strength Meter</button>
      </div>

      {activeTab === 'auditor' && <PermissionAuditor />}
      {activeTab === 'password' && <PasswordStrengthMeter onResultChange={onResultChange} />}
    </div>
  );
};

const PermissionAuditor = () => {
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    const check = async () => {
      const perms = ['camera', 'microphone', 'geolocation', 'notifications'];
      const results = await Promise.all(perms.map(async p => {
        try {
          const status = await navigator.permissions.query({ name: p });
          return { name: p, state: status.state };
        } catch (e) { return { name: p, state: 'unsupported' }; }
      }));
      setPermissions(results);
    };
    check();
  }, []);

  return (
    <>
      <div className="card" style={{ padding: '20px', marginBottom: '20px' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--nature-primary)' }}>
          <span className="material-icons">shield</span> Privacy Auditor
        </h3>
        <p style={{ fontSize: '0.8rem', opacity: 0.7, margin: '10px 0' }}>Review data access for the Nature Toolbox app.</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {permissions.map(p => (
            <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'var(--nature-bg)', borderRadius: '12px' }}>
              <span style={{ textTransform: 'capitalize', fontWeight: '600' }}>{p.name}</span>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 'bold',
                padding: '4px 12px',
                borderRadius: '20px',
                background: p.state === 'granted' ? 'var(--nature-mist)' : (p.state === 'denied' ? '#BA1A1A' : '#eee'),
                color: p.state === 'granted' ? 'var(--nature-primary)' : (p.state === 'denied' ? 'white' : 'black')
              }}>
                {p.state.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="card" style={{ padding: '20px' }}>
        <h4 style={{ marginBottom: '10px' }}>Permission Rationale</h4>
        <div style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span className="material-icons" style={{ fontSize: '1rem', color: 'var(--nature-moss)' }}>camera</span>
            <span>Used for Magnifier and QR Scanner tools.</span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span className="material-icons" style={{ fontSize: '1rem', color: 'var(--nature-moss)' }}>mic</span>
            <span>Used for the Sound Meter decibel analyzer.</span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <span className="material-icons" style={{ fontSize: '1rem', color: 'var(--nature-moss)' }}>location_on</span>
            <span>Used for Altitude and GPS info in Outdoor tools.</span>
          </div>
        </div>
      </div>
    </>
  );
};

const PasswordStrengthMeter = ({ onResultChange }) => {
    const [password, setPassword] = useState('');
    const [strength, setStrength] = useState(0);
    const [feedback, setFeedback] = useState('');

    const checkStrength = (p) => {
        let s = 0;
        if (p.length > 8) s++;
        if (p.length > 12) s++;
        if (/[A-Z]/.test(p)) s++;
        if (/[0-9]/.test(p)) s++;
        if (/[^A-Za-z0-9]/.test(p)) s++;

        setStrength(s);
        const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
        setFeedback(labels[s]);
        onResultChange({ text: `Password Strength: ${labels[s]} (${s}/5)`, filename: 'pwd_strength.txt' });
    };

    return (
        <div className="card p-20">
            <input
                type="password"
                placeholder="Type password to test..."
                className="pill w-full mb-10"
                value={password}
                onChange={e => { setPassword(e.target.value); checkStrength(e.target.value); }}
            />
            <div className="water-progress-container">
                <div className="water-progress-bar" style={{
                    width: `${(strength / 5) * 100}%`,
                    background: strength < 2 ? '#ef4444' : (strength < 4 ? '#f59e0b' : '#10b981')
                }} />
            </div>
            <div className="text-center mt-10" style={{ fontWeight: 'bold' }}>
                {feedback}
            </div>
            <ul style={{ fontSize: '0.8rem', marginTop: '15px', opacity: 0.7 }}>
                <li>Length {password.length > 12 ? '✅' : '❌'}</li>
                <li>Uppercase {/[A-Z]/.test(password) ? '✅' : '❌'}</li>
                <li>Numbers {/[0-9]/.test(password) ? '✅' : '❌'}</li>
                <li>Symbols {/[^A-Za-z0-9]/.test(password) ? '✅' : '❌'}</li>
            </ul>
        </div>
    );
};

export default PrivacyDashboard;
