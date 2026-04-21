import React, { useState, useEffect } from 'react';

const DevTools = ({ onResultChange }) => {
  const [activeTab, setActiveTab] = useState('http');

  return (
    <div className="tool-form">
      <div className="main-category-nav" style={{ padding: '0 0 1.5rem 0' }}>
        <button className={`pill ${activeTab === 'http' ? 'active' : ''}`} onClick={() => setActiveTab('http')}>HTTP Client</button>
        <button className={`pill ${activeTab === 'regex' ? 'active' : ''}`} onClick={() => setActiveTab('regex')}>Regex Tester</button>
        <button className={`pill ${activeTab === 'jwt' ? 'active' : ''}`} onClick={() => setActiveTab('jwt')}>JWT Decoder</button>
      </div>

      {activeTab === 'http' && <HttpClient onResultChange={onResultChange}/>}
      {activeTab === 'regex' && <RegexTester onResultChange={onResultChange}/>}
      {activeTab === 'jwt' && <JwtDecoder onResultChange={onResultChange}/>}
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
      const data = await res.json();
      const time = Date.now() - start;
      setResponse({ status: res.status, time: `${time}ms`, body: data });
    } catch (err) {
      setResponse({ status: 'Error', body: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (response) onResultChange({ text: JSON.stringify(response, null, 2), filename: 'http_response.json' });
  }, [response]);

  return (
    <div>
      <div className="form-group" style={{ display: 'flex', gap: '10px' }}>
        <select className="form-control" style={{ width: '100px' }} value={method} onChange={e => setMethod(e.target.value)}>
          {['GET', 'POST', 'PUT', 'DELETE'].map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <input type="text" className="form-control" value={url} onChange={e => setUrl(e.target.value)} />
      </div>
      <button className="btn-primary" style={{ width: '100%', marginBottom: '20px' }} onClick={sendRequest} disabled={loading}>
        {loading ? 'Sending...' : 'Send Request'}
      </button>
      {response && (
        <pre className="tool-result" style={{ background: '#1B2430', color: '#88E0D0', padding: '15px', borderRadius: '12px', fontSize: '0.8rem', overflow: 'auto' }}>
          {JSON.stringify(response, null, 2)}
        </pre>
      )}
    </div>
  );
};

const RegexTester = ({ onResultChange }) => {
  const [pattern, setPattern] = useState('\\d+');
  const [text, setText] = useState('Hello 123 World 456');
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    try {
      const regex = new RegExp(pattern, 'g');
      const m = [...text.matchAll(regex)];
      setMatches(m.map(match => match[0]));
    } catch (e) { setMatches([]); }
  }, [pattern, text]);

  return (
    <div>
      <div className="form-group">
        <label>Regex Pattern</label>
        <input type="text" className="form-control" value={pattern} onChange={e => setPattern(e.target.value)} />
      </div>
      <div className="form-group">
        <label>Test Text</label>
        <textarea className="form-control" value={text} onChange={e => setText(e.target.value)} style={{ height: '100px' }} />
      </div>
      <div className="card" style={{ padding: '15px' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '10px' }}>Matches ({matches.length})</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
          {matches.map((m, i) => <span key={i} className="pill" style={{ background: 'var(--nature-mist)' }}>{m}</span>)}
        </div>
      </div>
    </div>
  );
};

const JwtDecoder = ({ onResultChange }) => {
  const [token, setToken] = useState('');
  const [decoded, setDecoded] = useState(null);

  const decode = () => {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) throw new Error("Invalid JWT format");
      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));
      setDecoded({ header, payload });
    } catch (e) { setDecoded({ error: "Could not decode token" }); }
  };

  return (
    <div>
      <textarea className="form-control" placeholder="Paste JWT here..." value={token} onChange={e => setToken(e.target.value)} style={{ height: '100px', marginBottom: '10px' }} />
      <button className="btn-primary" style={{ width: '100%', marginBottom: '20px' }} onClick={decode}>Decode JWT</button>
      {decoded && (
         <pre className="tool-result" style={{ background: '#1B2430', color: '#88E0D0', padding: '15px', borderRadius: '12px', fontSize: '0.8rem', overflow: 'auto' }}>
           {JSON.stringify(decoded, null, 2)}
         </pre>
      )}
    </div>
  );
};

export default DevTools;
