import React from 'react';

const DeviceInfo = () => {
  const info = [
    { l: 'Platform', v: navigator.platform },
    { l: 'Language', v: navigator.language },
    { l: 'Screen', v: `${window.screen.width}x${window.screen.height}` },
    { l: 'Pixel Ratio', v: window.devicePixelRatio },
    { l: 'Cookies Enabled', v: navigator.cookieEnabled ? 'Yes' : 'No' }
  ];
  return (
    <div className="tool-form">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px' }}>
        {info.map(i => <div key={i.l} className="tool-result" style={{ display: 'flex', justifyContent: 'space-between' }}><span>{i.l}</span><b>{i.v}</b></div>)}
        <div className="tool-result" style={{ fontSize: '0.8rem', overflowX: 'auto' }}><div style={{ opacity: 0.5, marginBottom: '5px' }}>User Agent</div>{navigator.userAgent}</div>
      </div>
    </div>
  );
};

export default DeviceInfo;
