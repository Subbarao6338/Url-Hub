import React, { useState, useEffect } from 'react';

const DevOpsTools = ({ toolId, onResultChange }) => {
  const [activeTab, setActiveTab] = useState('jwt');

  useEffect(() => {
    if (toolId) {
      if (toolId === 'devops-main' || toolId === 'jwt-decoder') setActiveTab('jwt');
      else if (toolId === 'cron-gen') setActiveTab('cron');
      else if (toolId === 'sql-format') setActiveTab('sql');
      else if (toolId === 'http-client') setActiveTab('http');
      else if (toolId === 'regex-tester') setActiveTab('regex');
      else setActiveTab(toolId);
    }
  }, [toolId]);

  return (
    <div className="tool-form">
      {!toolId && (
        <div className="pill-group mb-20 scrollable-x">
          <button className={`pill ${activeTab === 'jwt' ? 'active' : ''}`} onClick={() => setActiveTab('jwt')}>JWT Decoder</button>
          <button className={`pill ${activeTab === 'cron' ? 'active' : ''}`} onClick={() => setActiveTab('cron')}>Cron Gen</button>
          <button className={`pill ${activeTab === 'sql' ? 'active' : ''}`} onClick={() => setActiveTab('sql')}>SQL Formatter</button>
          <button className={`pill ${activeTab === 'http' ? 'active' : ''}`} onClick={() => setActiveTab('http')}>HTTP Client</button>
          <button className={`pill ${activeTab === 'regex' ? 'active' : ''}`} onClick={() => setActiveTab('regex')}>Regex Tester</button>
        </div>
      )}

      {activeTab === 'jwt' && <JwtDecoder />}
      {activeTab === 'cron' && <CronGenerator />}
      {activeTab === 'sql' && <SqlFormatter />}
      {activeTab === 'http' && <HttpClient onResultChange={onResultChange} />}
      {activeTab === 'regex' && <RegexTester onResultChange={onResultChange} />}
    </div>
  );
};

const JwtDecoder = () => {
  const [token, setToken] = useState('');
  const [header, setHeader] = useState(null);
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState(null);

  const decode = (val) => {
    setToken(val);
    setError(null);
    if (!val) {
      setHeader(null);
      setPayload(null);
      return;
    }
    try {
      const parts = val.split('.');
      if (parts.length !== 3) throw new Error("Invalid JWT format");
      setHeader(JSON.parse(atob(parts[0])));
      setPayload(JSON.parse(atob(parts[1])));
    } catch (e) {
      setError(e.message);
      setHeader(null);
      setPayload(null);
    }
  };

  return (
    <div className="grid gap-15">
      <textarea
        className="pill w-full font-mono"
        rows="4"
        placeholder="Paste JWT here..."
        value={token}
        onChange={e => decode(e.target.value)}
      />
      {error && <div className="tool-result danger" style={{ color: 'var(--danger)', borderLeftColor: 'var(--danger)' }}>{error}</div>}
      {header && (
        <div className="card">
          <h3 className="font-bold mb-10">Header</h3>
          <pre className="font-mono" style={{ fontSize: '0.8rem', overflow: 'auto' }}>{JSON.stringify(header, null, 2)}</pre>
        </div>
      )}
      {payload && (
        <div className="card">
          <h3 className="font-bold mb-10">Payload</h3>
          <pre className="font-mono" style={{ fontSize: '0.8rem', overflow: 'auto' }}>{JSON.stringify(payload, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

const CronGenerator = () => {
  const [cron, setCron] = useState('* * * * *');
  const [desc, setDesc] = useState('Every minute');

  const updateCron = (val) => {
    setCron(val);
    setDesc("Cron expression updated: " + val);
  };

  return (
    <div className="grid gap-15">
      <div className="card text-center">
        <div className="font-mono" style={{ fontSize: '2rem', color: 'var(--primary)' }}>{cron}</div>
        <div className="mt-10 opacity-7">{desc}</div>
      </div>
      <div className="grid gap-10">
        {['Minutes', 'Hours', 'Day of Month', 'Month', 'Day of Week'].map((label, i) => (
          <div key={label} className="flex-between">
            <span>{label}</span>
            <input className="pill" style={{ width: '100px' }} value={cron.split(' ')[i]} onChange={e => {
              const p = cron.split(' '); p[i] = e.target.value; updateCron(p.join(' '));
            }} />
          </div>
        ))}
      </div>
    </div>
  );
};

const SqlFormatter = () => {
  const [sql, setSql] = useState('');
  const [formatted, setFormatted] = useState('');

  const format = () => {
    let res = sql
      .replace(/\s+/g, ' ')
      .replace(/\s*SELECT\s*/gi, '\nSELECT ')
      .replace(/\s*FROM\s*/gi, '\nFROM ')
      .replace(/\s*WHERE\s*/gi, '\nWHERE ')
      .replace(/\s*AND\s*/gi, '\n  AND ')
      .replace(/\s*OR\s*/gi, '\n  OR ')
      .replace(/\s*ORDER BY\s*/gi, '\nORDER BY ')
      .replace(/\s*GROUP BY\s*/gi, '\nGROUP BY ')
      .replace(/\s*LIMIT\s*/gi, '\nLIMIT ')
      .trim();
    setFormatted(res);
  };

  return (
    <div className="grid gap-15">
      <textarea
        className="pill w-full font-mono"
        rows="6"
        placeholder="Enter messy SQL..."
        value={sql}
        onChange={e => setSql(e.target.value)}
      />
      <button className="btn-primary" onClick={format}>Format SQL</button>
      {formatted && (
        <pre className="tool-result font-mono" style={{ fontSize: '0.85rem', overflow: 'auto' }}>{formatted}</pre>
      )}
    </div>
  );
};

const HttpClient = ({ onResultChange }) => {
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts/1');
  const [method, setMethod] = useState('GET');
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const sendRequest = async () => {
    setLoading(true);
    try {
      const start = Date.now();
      const res = await fetch(url, { method });
      const text = await res.text();
      let body;
      try { body = JSON.parse(text); } catch (e) { body = text; }
      const time = Date.now() - start;
      const result = { status: res.status, time: `${time}ms`, body };
      setResponse(result);
      if (onResultChange) onResultChange({ text: JSON.stringify(result, null, 2), filename: 'response.json' });
    } catch (err) {
      setResponse({ status: 'Error', body: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-15">
      <div className="flex-gap">
        <select className="pill" style={{ width: '120px' }} value={method} onChange={e => setMethod(e.target.value)}>
          {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <input type="text" className="pill flex-1" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://api.example.com" />
      </div>
      <button className="btn-primary" onClick={sendRequest} disabled={loading}>
        {loading ? 'Sending...' : 'Send Request'}
      </button>
      {response && (
        <div className="tool-result">
          <div className="flex-between mb-10">
            <span className="font-bold">Status: {response.status}</span>
            <span className="opacity-6">{response.time}</span>
          </div>
          <pre className="font-mono" style={{ fontSize: '0.8rem', overflow: 'auto', maxHeight: '300px' }}>
            {JSON.stringify(response.body, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};

const RegexTester = ({ onResultChange }) => {
  const [pattern, setPattern] = useState('\\d+');
  const [text, setText] = useState('Nature 2024 Hub 123');
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    try {
      const regex = new RegExp(pattern, 'g');
      const m = [...text.matchAll(regex)];
      const found = m.map(match => match[0]);
      setMatches(found);
      if (onResultChange) onResultChange({ text: found.join('\n'), filename: 'matches.txt' });
    } catch (e) { setMatches([]); }
  }, [pattern, text, onResultChange]);

  return (
    <div className="grid gap-15">
      <div className="form-group">
        <label className="uppercase tracking-wider opacity-6" style={{ fontSize: '0.8rem' }}>Regex Pattern</label>
        <input type="text" className="pill w-full font-mono mt-5" value={pattern} onChange={e => setPattern(e.target.value)} />
      </div>
      <div className="form-group">
        <label className="uppercase tracking-wider opacity-6" style={{ fontSize: '0.8rem' }}>Test Text</label>
        <textarea className="pill w-full mt-5" rows="4" value={text} onChange={e => setText(e.target.value)} />
      </div>
      <div className="card">
        <div className="font-bold mb-10">Matches ({matches.length})</div>
        <div className="flex-wrap" style={{ gap: '8px' }}>
          {matches.map((m, i) => <span key={i} className="pill" style={{ fontSize: '0.8rem', padding: '4px 12px' }}>{m}</span>)}
          {matches.length === 0 && <span className="opacity-5">No matches found</span>}
        </div>
      </div>
    </div>
  );
};

export default DevOpsTools;
