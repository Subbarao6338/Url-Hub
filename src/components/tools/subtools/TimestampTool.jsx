import React, { useState, useEffect, useRef } from 'react';
import { copyToClipboard } from '../../../utils/helpers';

const TimestampTool = () => {
  const [currentTs, setCurrentTs] = useState(Math.floor(Date.now() / 1000));
  const [isLive, setIsLive] = useState(true);

  // Convert inputs
  const [inputTs, setInputTs] = useState('');
  const [convertedDate, setConvertedDate] = useState(null);

  const [inputDate, setInputDate] = useState('');
  const [convertedTs, setConvertedTs] = useState(null);

  const [copyStatus, setCopyStatus] = useState('');

  // Live update ticker
  useEffect(() => {
    if (!isLive) return;
    const interval = setInterval(() => {
      setCurrentTs(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isLive]);

  const handleCopyCurrent = () => {
    copyToClipboard(currentTs.toString(), () => showCopyFeedback('Copied current timestamp!'));
  };

  const showCopyFeedback = (msg) => {
    setCopyStatus(msg);
    setTimeout(() => setCopyStatus(''), 2500);
  };

  const handleConvertTs = () => {
    if (!inputTs) return;
    const val = parseInt(inputTs.trim(), 10);
    if (isNaN(val)) {
      setConvertedDate({ error: 'Invalid timestamp. Please enter a numeric value.' });
      return;
    }
    // Handle milliseconds vs seconds
    const isMs = inputTs.trim().length > 11;
    const dateObj = new Date(isMs ? val : val * 1000);
    if (isNaN(dateObj.getTime())) {
      setConvertedDate({ error: 'Out of range date representation.' });
      return;
    }
    setConvertedDate({
      local: dateObj.toLocaleString(),
      utc: dateObj.toUTCString(),
      iso: dateObj.toISOString(),
    });
  };

  const handleConvertDate = () => {
    if (!inputDate) return;
    const dateObj = new Date(inputDate);
    if (isNaN(dateObj.getTime())) {
      setConvertedTs({ error: 'Invalid date/time format. Use YYYY-MM-DDTHH:MM or standard format.' });
      return;
    }
    const secs = Math.floor(dateObj.getTime() / 1000);
    const ms = dateObj.getTime();
    setConvertedTs({ secs, ms });
  };

  return (
    <div className="card p-30 glass-card grid gap-20 animate-fadeIn">
      <h3 className="text-center">Unix Timestamp Converter</h3>
      <p className="smallest opacity-6 text-center mb-10">
        Epoch/Unix timestamps represent seconds since January 1, 1970 (UTC). Track real-time changes or convert dates dynamically.
      </p>

      {/* Real-time Ticker */}
      <div className="card p-20 bg-surface rounded-xl text-center border relative" style={{ borderColor: 'var(--border-color)' }}>
        <div className="smallest opacity-6 uppercase tracking-wider font-bold mb-5 flex-center gap-10" style={{ justifyContent: 'center' }}>
          <span className={`material-icons ${isLive ? 'rotating text-success' : 'text-muted'}`} style={{ fontSize: '1.2rem' }}>
            {isLive ? 'autorenew' : 'pause_circle'}
          </span>
          <span>Current Unix Timestamp</span>
        </div>
        <div className="text-3xl font-mono font-bold my-10 text-brand" style={{ color: 'var(--brand-accent)' }}>
          {currentTs}
        </div>
        <div className="smallest opacity-7 mb-10">
          <strong>Local:</strong> {new Date(currentTs * 1000).toLocaleString()}<br />
          <strong>UTC:</strong> {new Date(currentTs * 1000).toUTCString()}
        </div>
        <div className="flex gap-10 justify-center">
          <button className={`pill smallest ${isLive ? 'active' : ''}`} onClick={() => setIsLive(!isLive)}>
            {isLive ? 'Pause Live' : 'Resume Live'}
          </button>
          <button className="pill smallest" onClick={() => setCurrentTs(Math.floor(Date.now() / 1000))}>
            Sync Now
          </button>
          <button className="pill smallest active" style={{ background: 'var(--brand-accent)' }} onClick={handleCopyCurrent}>
            Copy
          </button>
        </div>
        {copyStatus && (
          <div className="smallest text-success mt-10 animate-fadeIn">
            {copyStatus}
          </div>
        )}
      </div>

      <div className="grid cols-2 gap-20" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
        {/* Timestamp to Date Converter */}
        <div className="card p-20 bg-surface rounded-xl border grid gap-15" style={{ borderColor: 'var(--border-color)' }}>
          <h5 className="font-bold">Convert Timestamp to Date</h5>
          <div className="form-group text-left">
            <label className="smallest opacity-6 uppercase">Unix Timestamp (Seconds or MS)</label>
            <input
              type="text"
              className="pill w-full font-mono mt-5"
              placeholder="e.g. 1700000000"
              value={inputTs}
              onChange={(e) => setInputTs(e.target.value)}
            />
          </div>
          <div className="flex gap-10">
            <button className="btn-primary flex-1 smallest" onClick={handleConvertTs} disabled={!inputTs}>
              Convert
            </button>
            {inputTs && (
              <button className="pill smallest" onClick={() => { setInputTs(''); setConvertedDate(null); }}>
                Clear
              </button>
            )}
          </div>

          {convertedDate && (
            <div className="p-10 rounded bg-body font-mono text-left smallest animate-fadeIn">
              {convertedDate.error ? (
                <div className="text-danger">{convertedDate.error}</div>
              ) : (
                <div className="grid gap-5">
                  <div><strong>Local:</strong> {convertedDate.local}</div>
                  <div><strong>UTC:</strong> {convertedDate.utc}</div>
                  <div><strong>ISO 8601:</strong> {convertedDate.iso}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Date to Timestamp Converter */}
        <div className="card p-20 bg-surface rounded-xl border grid gap-15" style={{ borderColor: 'var(--border-color)' }}>
          <h5 className="font-bold">Convert Date/Time to Timestamp</h5>
          <div className="form-group text-left">
            <label className="smallest opacity-6 uppercase">Date / Time string</label>
            <input
              type="datetime-local"
              className="pill w-full font-mono mt-5"
              value={inputDate}
              onChange={(e) => setInputDate(e.target.value)}
            />
          </div>
          <div className="flex gap-10">
            <button className="btn-primary flex-1 smallest" onClick={handleConvertDate} disabled={!inputDate}>
              Convert
            </button>
            {inputDate && (
              <button className="pill smallest" onClick={() => { setInputDate(''); setConvertedTs(null); }}>
                Clear
              </button>
            )}
          </div>

          {convertedTs && (
            <div className="p-10 rounded bg-body font-mono text-left smallest animate-fadeIn">
              {convertedTs.error ? (
                <div className="text-danger">{convertedTs.error}</div>
              ) : (
                <div className="grid gap-5">
                  <div className="flex-between">
                    <span><strong>Seconds:</strong> <span className="text-brand font-bold">{convertedTs.secs}</span></span>
                    <button className="pill smallest px-10 py-2" onClick={() => copyToClipboard(convertedTs.secs.toString(), () => showCopyFeedback('Copied seconds!'))}>Copy</button>
                  </div>
                  <div className="flex-between">
                    <span><strong>Milliseconds:</strong> <span className="text-brand">{convertedTs.ms}</span></span>
                    <button className="pill smallest px-10 py-2" onClick={() => copyToClipboard(convertedTs.ms.toString(), () => showCopyFeedback('Copied milliseconds!'))}>Copy</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimestampTool;
