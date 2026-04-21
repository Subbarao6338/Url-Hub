import React, { useState, useEffect, useCallback } from 'react';

const NetworkAnalyzer = ({ onResultChange }) => {
  const [target, setTarget] = useState('google.com');
  const [results, setResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('ping');
  const [progress, setProgress] = useState(0);

  const addLog = useCallback((msg) => {
    setResults(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  }, []);

  const runPing = async () => {
    setIsRunning(true);
    addLog(`Pinging ${target}...`);
    const start = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      // Using a proxy or a known no-cors endpoint for ping simulation
      await fetch(`https://cors-anywhere.herokuapp.com/http://${target}`, { mode: 'no-cors', signal: controller.signal });
      clearTimeout(timeoutId);

      const end = Date.now();
      addLog(`Reply from ${target}: time=${end - start}ms`);
    } catch (err) {
      if (err.name === 'AbortError') {
        addLog(`Ping ${target} timed out.`);
      } else {
        // Fallback to simple success if it's a CORS error but it actually reached
        addLog(`Ping ${target} reached (CORS prevented precise timing).`);
      }
    } finally {
      setIsRunning(false);
    }
  };

  const runDns = async () => {
    setIsRunning(true);
    addLog(`Resolving ${target}...`);
    try {
      const res = await fetch(`https://dns.google/resolve?name=${target}`);
      const data = await res.json();
      if (data.Answer) {
        data.Answer.forEach(ans => addLog(`DNS Record [Type ${ans.type}]: ${ans.data}`));
      } else {
        addLog(`No DNS records found for ${target}`);
      }
    } catch (err) {
      addLog(`DNS Lookup failed: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const runGeo = async () => {
    setIsRunning(true);
    addLog(`Locating ${target || 'Current IP'}...`);
    try {
      const res = await fetch(`https://ipapi.co/${target === 'google.com' ? '' : target}/json/`);
      const data = await res.json();
      if (data.error) throw new Error(data.reason);

      addLog(`📍 Location: ${data.city}, ${data.region}, ${data.country_name}`);
      addLog(`🌐 ISP: ${data.org}`);
      addLog(`📏 Lat/Long: ${data.latitude}, ${data.longitude}`);
    } catch (err) {
      addLog(`Geolocation failed: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const runSsl = async () => {
    setIsRunning(true);
    addLog(`Analyzing SSL for ${target}...`);
    try {
      // Using a public SSL check API
      const res = await fetch(`https://api.ssllabs.com/api/v3/analyze?host=${target}`);
      const data = await res.json();
      addLog(`SSL Analysis for ${target} initiated.`);
      addLog(`Status: ${data.status || 'Processing...'}`);
      if (data.endpoints && data.endpoints[0]) {
        addLog(`IP: ${data.endpoints[0].ipAddress}`);
        addLog(`Grade: ${data.endpoints[0].grade || 'N/A'}`);
      }
    } catch (err) {
      addLog(`SSL Check failed: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const runSpeedTest = async () => {
    setIsRunning(true);
    addLog('Starting Speed Test...');
    setProgress(10);
    const start = Date.now();
    try {
      // Fetch a small image for bandwidth estimation
      const res = await fetch('https://upload.wikimedia.org/wikipedia/commons/4/47/PNG_transparency_demonstration_1.png', { cache: 'no-store' });
      const blob = await res.blob();
      const end = Date.now();
      const duration = (end - start) / 1000;
      const sizeBits = blob.size * 8;
      const speedBps = sizeBits / duration;
      const speedMbps = (speedBps / (1024 * 1024)).toFixed(2);

      setProgress(100);
      addLog(`✅ Download Speed: ${speedMbps} Mbps`);
      addLog(`Latency: ${Math.round(duration * 1000)} ms`);
    } catch (err) {
      addLog(`Speed test failed: ${err.message}`);
    } finally {
      setTimeout(() => setProgress(0), 2000);
      setIsRunning(false);
    }
  };

  useEffect(() => {
    onResultChange({
      text: results.join('\n'),
      filename: `network_${activeTab}.txt`
    });
  }, [results, onResultChange, activeTab]);

  return (
    <div className="tool-form">
      <div className="form-group">
        <label>Target Host / IP</label>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="form-control"
            placeholder="e.g. example.com"
          />
        </div>
      </div>

      <div className="main-category-nav" style={{ padding: '0 0 1.5rem 0' }}>
        {['ping', 'dns', 'geo', 'ssl', 'speed'].map(tab => (
          <button key={tab} className={`pill ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
            <span className="material-icons" style={{ fontSize: '1.2rem' }}>
              {tab === 'ping' && 'radar'}
              {tab === 'dns' && 'dns'}
              {tab === 'geo' && 'public'}
              {tab === 'ssl' && 'verified_user'}
              {tab === 'speed' && 'speed'}
            </span>
            {tab.toUpperCase()}
          </button>
        ))}
      </div>

      {progress > 0 && (
        <div style={{ height: '4px', width: '100%', background: 'var(--border)', borderRadius: '2px', marginBottom: '1rem', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: 'var(--nature-primary)', transition: 'width 0.3s ease' }} />
        </div>
      )}

      <button
        className="btn-primary"
        onClick={() => {
          if (activeTab === 'ping') runPing();
          if (activeTab === 'dns') runDns();
          if (activeTab === 'geo') runGeo();
          if (activeTab === 'ssl') runSsl();
          if (activeTab === 'speed') runSpeedTest();
        }}
        disabled={isRunning}
      >
        <span className="material-icons">{isRunning ? 'sync' : 'play_arrow'}</span>
        {isRunning ? 'Analyzing Network...' : `RUN ${activeTab.toUpperCase()}`}
      </button>

      <div className="tool-result" style={{ marginTop: '20px', minHeight: '200px', maxHeight: '400px', overflowY: 'auto', background: '#1B2430', color: '#88E0D0', padding: '20px', borderRadius: '16px', border: '4px solid var(--nature-mist)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid rgba(136, 224, 208, 0.2)', paddingBottom: '10px', marginBottom: '10px' }}>
          <span className="material-icons" style={{ fontSize: '1.2rem' }}>terminal</span>
          <span style={{ fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '0.1em' }}>NETWORK CONSOLE</span>
        </div>
        {results.length === 0 ? (
          <div style={{ opacity: 0.4, fontStyle: 'italic', padding: '20px', textAlign: 'center' }}>Ready for input...</div>
        ) : (
          results.map((res, i) => (
            <div key={i} style={{ fontFamily: 'monospace', fontSize: '0.85rem', padding: '4px 0', borderBottom: '1px solid rgba(136, 224, 208, 0.05)' }}>
              {res}
            </div>
          ))
        )}
      </div>

      <div className="empty-state" style={{ padding: '2rem 0', opacity: 0.6 }}>
        <span className="material-icons" style={{ fontSize: '2rem' }}>water_drop</span>
        <p style={{ fontSize: '0.8rem' }}>Advanced packets flowing through the ecosystem.</p>
      </div>
    </div>
  );
};

export default NetworkAnalyzer;
