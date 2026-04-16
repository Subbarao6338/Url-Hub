import React from 'react';

const NetworkTools = () => {
  const isOnline = navigator.onLine;
  return (
    <div className="tool-form">
      <div className="tool-result" style={{ textAlign: 'center', padding: '2rem' }}>
        <div style={{ opacity: 0.5, marginBottom: '10px' }}>Connection Status</div>
        <div style={{ fontSize: '2rem', fontWeight: 'bold', color: isOnline ? '#10b981' : '#ef4444' }}>
          {isOnline ? 'ONLINE' : 'OFFLINE'}
        </div>
        <div style={{ marginTop: '1.5rem', fontSize: '0.9rem', opacity: 0.7 }}>
          Platform: {navigator.platform}<br />
          Max Touch Points: {navigator.maxTouchPoints}
        </div>
      </div>
      <button className="btn-primary" style={{ width: '100%', marginTop: '20px' }} onClick={() => window.location.reload()}>
        Refresh Connection
      </button>
    </div>
  );
};

export default NetworkTools;
