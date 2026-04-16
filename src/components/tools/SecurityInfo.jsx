import React, { useState, useEffect } from 'react';

const SecurityInfo = () => {
  const [camera, setCamera] = useState('Checking...');

  useEffect(() => {
    navigator.permissions?.query({name:'camera'}).then(res => setCamera(res.state.toUpperCase()));
  }, []);

  return (
    <div className="tool-form">
      <div className="tool-result" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Secure Context</span>
          <b style={{ color: window.isSecureContext ? '#10b981' : '#ef4444' }}>{window.isSecureContext ? 'YES' : 'NO'}</b>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>HTTPS</span>
          <b style={{ color: window.location.protocol === 'https:' ? '#10b981' : '#ef4444' }}>{window.location.protocol === 'https:' ? 'YES' : 'NO'}</b>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Permissions (Camera)</span>
          <b>{camera}</b>
        </div>
      </div>
    </div>
  );
};

export default SecurityInfo;
