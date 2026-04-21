import React, { useState, useEffect } from 'react';

const NetworkAnalyzer = ({ onResultChange }) => {
  const [target, setTarget] = useState('8.8.8.8');
  const [results, setResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState('ping');

  const runPing = async () => {
    setIsRunning(true);
    const start = Date.now();
    try {
      await fetch(`https://${target}`, { mode: 'no-cors' });
      const end = Date.now();
      const latency = end - start;
      setResults(prev => [`Ping ${target}: ${latency}ms`, ...prev]);
    } catch (err) {
      setResults(prev => [`Ping ${target} failed`, ...prev]);
    }
    setIsRunning(false);
  };

  const runPortScan = async () => {
    setIsRunning(true);
    const ports = [80, 443, 21, 22, 25, 3306, 5432, 8080];
    setResults(prev => [`Starting Port Scan on ${target}...`, ...prev]);
    for (const port of ports) {
      const start = Date.now();
      try {
        // Simple fetch timeout to check port
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);
        await fetch(`https://${target}:${port}`, { mode: 'no-cors', signal: controller.signal });
        clearTimeout(timeoutId);
        setResults(prev => [`Port ${port}: OPEN (or filtered)`, ...prev]);
      } catch (err) {
        if (err.name === 'AbortError') {
           setResults(prev => [`Port ${port}: CLOSED (timeout)`, ...prev]);
        } else {
           setResults(prev => [`Port ${port}: CLOSED`, ...prev]);
        }
      }
    }
    setResults(prev => [`Scan complete.`, ...prev]);
    setIsRunning(false);
  };

  const runDns = async () => {
    setIsRunning(true);
    try {
      const res = await fetch(`https://dns.google/resolve?name=${target}`);
      const data = await res.json();
      const ips = data.Answer?.map(a => a.data).join(', ') || 'No records found';
      setResults(prev => [`DNS ${target}: ${ips}`, ...prev]);
    } catch (err) {
      setResults(prev => [`DNS Lookup failed: ${err.message}`, ...prev]);
    }
    setIsRunning(false);
  };

  useEffect(() => {
    onResultChange({
      text: results.join('\n'),
      filename: 'network_results.txt'
    });
  }, [results, onResultChange]);

  return (
    <div className="tool-form">
      <div className="form-group">
        <label>Target Host</label>
        <input
          type="text"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder="e.g. google.com"
        />
      </div>
      <div className="pill-group" style={{ marginBottom: '1.5rem' }}>
        <button className={`pill ${activeTab === 'ping' ? 'active' : ''}`} onClick={() => setActiveTab('ping')}>Ping</button>
        <button className={`pill ${activeTab === 'dns' ? 'active' : ''}`} onClick={() => setActiveTab('dns')}>DNS</button>
        <button className={`pill ${activeTab === 'port' ? 'active' : ''}`} onClick={() => setActiveTab('port')}>Ports</button>
      </div>

      <button className="btn-primary" onClick={activeTab === 'ping' ? runPing : (activeTab === 'dns' ? runDns : runPortScan)} disabled={isRunning}>
        {isRunning ? 'Running...' : `Run ${activeTab.toUpperCase()}`}
      </button>
      <div className="tool-result" style={{ marginTop: '20px' }}>
        <h4 style={{ marginBottom: '10px' }}>Logs</h4>
        {results.map((res, i) => (
          <div key={i} style={{ fontSize: '0.9rem', opacity: 0.8, borderBottom: '1px solid var(--border)', padding: '4px 0' }}>
            {res}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NetworkAnalyzer;
