import React, { useState, useEffect } from 'react';

const TimestampConverter = ({ onResultChange }) => {
  const [unix, setUnix] = useState(Math.floor(Date.now() / 1000));

  useEffect(() => {
    onResultChange({
      text: `Unix: ${unix}\nLocal: ${local}\nISO: ${iso}`,
      filename: 'timestamp.txt'
    });
  }, [unix, local, iso, onResultChange]);
  const [local, setLocal] = useState('');
  const [iso, setIso] = useState('');

  useEffect(() => {
    const d = new Date(unix * 1000);
    setLocal(d.toLocaleString());
    setIso(d.toISOString());
  }, [unix]);

  return (
    <div className="tool-form">
      <div className="form-group">
        <label>Unix Timestamp (seconds)</label>
        <input type="number" value={unix} onChange={(e) => setUnix(e.target.value)} />
      </div>
      <div className="tool-result" style={{ marginTop: '1.5rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', opacity: 0.5, marginBottom: '5px' }}>Local Time</div>
        <div style={{ fontSize: '1.3rem', fontWeight: 500 }}>{local}</div>
        <div style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: '5px', fontFamily: 'monospace' }}>{iso}</div>
      </div>
      <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
        <button className="pill" onClick={() => setUnix(Math.floor(Date.now() / 1000))}>Current Time</button>
      </div>
    </div>
  );
};

export default TimestampConverter;
