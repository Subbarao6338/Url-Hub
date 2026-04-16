import React, { useState } from 'react';

const Cookies = () => {
  const [cookies, setCookies] = useState(document.cookie.split(';').filter(Boolean));

  const clearCookies = () => {
    document.cookie.split(';').forEach(c => {
      document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/');
    });
    setCookies([]);
  };

  return (
    <div className="tool-form">
      <p style={{ opacity: 0.7, marginBottom: '15px' }}>Local storage and session identifiers for this domain.</p>
      <div className="tool-result" style={{ maxHeight: '300px', overflowY: 'auto' }}>
        {cookies.length ? cookies.map((c, i) => (
          <div key={i} style={{ padding: '10px', borderBottom: '1px solid #eee', wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '0.85rem' }}>
            {c.trim()}
          </div>
        )) : <div style={{ opacity: 0.5, padding: 20, textAlign: 'center' }}>No cookies found.</div>}
      </div>
      <button className="pill" style={{ width: '100%', marginTop: '15px', color: '#ef4444' }} onClick={clearCookies}>
        Clear Cookies
      </button>
    </div>
  );
};

export default Cookies;
