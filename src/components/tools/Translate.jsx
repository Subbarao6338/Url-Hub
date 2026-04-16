import React, { useState } from 'react';

const Translate = () => {
  const [input, setInput] = useState('');
  const [to, setTo] = useState('te');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const mockTranslate = () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult('');
    setTimeout(() => {
      const mocks = {
        'te': 'ఇది నమూనా అనువాదం.',
        'hi': 'यह एक नमूना अनुवाद है।',
        'en': 'This is a sample translation.'
      };
      setResult(mocks[to] || "Translation not available in offline mode.");
      setLoading(false);
    }, 800);
  };

  return (
    <div className="tool-form">
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', alignItems: 'center' }}>
        <select style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid rgba(var(--primary-rgb), 0.2)' }}>
          <option value="auto">Detect Language</option>
          <option value="en">English</option>
          <option value="te">Telugu</option>
          <option value="hi">Hindi</option>
        </select>
        <span className="material-icons" style={{ opacity: 0.5 }}>sync_alt</span>
        <select
          value={to}
          onChange={(e) => setTo(e.target.value)}
          style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid rgba(var(--primary-rgb), 0.2)' }}
        >
          <option value="te">Telugu</option>
          <option value="en">English</option>
          <option value="hi">Hindi</option>
        </select>
      </div>
      <textarea
        rows="5"
        placeholder="Enter text to translate..."
        style={{ width: '100%', marginBottom: '15px' }}
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button className="btn-primary" style={{ width: '100%' }} onClick={mockTranslate}>
        Translate
      </button>
      {(loading || result) && (
        <div className="tool-result" style={{ marginTop: '1.5rem', background: 'rgba(var(--primary-rgb), 0.05)' }}>
          <div style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.6, marginBottom: '8px' }}>
            Translation Result
          </div>
          <div style={{ fontSize: '1.1rem', lineHeight: '1.5' }}>
            {loading ? <i>Translating...</i> : result}
          </div>
        </div>
      )}
    </div>
  );
};

export default Translate;
