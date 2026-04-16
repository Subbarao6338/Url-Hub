import React, { useState, useEffect } from 'react';

const OmniHub = ({ onResultChange }) => {
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (query) {
      onResultChange({
        text: `Search Query: ${query}`,
        filename: 'search_query.txt'
      });
    } else {
      onResultChange(null);
    }
  }, [query, onResultChange]);
  const engines = {
    'google': 'https://google.com/search?q=',
    'duck': 'https://duckduckgo.com/?q=',
    'bing': 'https://bing.com/search?q=',
    'wiki': 'https://en.wikipedia.org/wiki/Special:Search?search=',
    'git': 'https://github.com/search?q=',
    'ai': 'https://perplexity.ai/search?q='
  };

  const search = (eng) => {
    if (!query) return;
    window.open(engines[eng] + encodeURIComponent(query), '_blank');
  };

  return (
    <div className="tool-form">
      <p style={{ opacity: 0.7, marginBottom: '20px' }}>Quick access to various web search engines.</p>
      <div className="form-group">
        <input
          type="text"
          placeholder="Enter search query..."
          style={{ width: '100%', height: '50px', fontSize: '1.1rem', padding: '0 15px' }}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '15px' }}>
        <button className="pill" onClick={() => search('google')}>Google</button>
        <button className="pill" onClick={() => search('duck')}>DuckDuckGo</button>
        <button className="pill" onClick={() => search('bing')}>Bing</button>
        <button className="pill" onClick={() => search('wiki')}>Wikipedia</button>
        <button className="pill" onClick={() => search('git')}>GitHub</button>
        <button className="pill" onClick={() => search('ai')}>Perplexity</button>
      </div>
    </div>
  );
};

export default OmniHub;
