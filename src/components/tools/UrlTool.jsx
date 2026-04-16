import React, { useState } from 'react';

const UrlTool = () => {
  const [urlInput, setUrlInput] = useState(window.location.href);
  const [result, setResult] = useState(null);

  const parseUrl = () => {
    try {
      const url = new URL(urlInput);
      setResult({
        protocol: url.protocol,
        hostname: url.hostname,
        pathname: url.pathname,
        search: url.search || 'None'
      });
    } catch(e) {
      setResult('Invalid URL');
    }
  };

  return (
    <div className="tool-form">
      <div className="form-group">
        <label>URL</label>
        <input type="text" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} style={{ width: '100%', fontFamily: 'monospace' }} />
      </div>
      {result && (
        <div className="tool-result" style={{ marginTop: '1.5rem', fontFamily: 'monospace', fontSize: '0.9rem', lineHeight: '1.6' }}>
          {typeof result === 'string' ? result : (
            <>
              <b>Protocol:</b> {result.protocol}<br />
              <b>Hostname:</b> {result.hostname}<br />
              <b>Path:</b> {result.pathname}<br />
              <b>Search:</b> {result.search}
            </>
          )}
        </div>
      )}
      <button className="pill" style={{ width: '100%', marginTop: '15px' }} onClick={parseUrl}>Parse URL</button>
    </div>
  );
};

export default UrlTool;
