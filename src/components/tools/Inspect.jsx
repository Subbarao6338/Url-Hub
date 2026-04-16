import React, { useState, useEffect } from 'react';

const Inspect = ({ onResultChange }) => {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    const s = {};
    document.querySelectorAll('*').forEach(el => s[el.tagName] = (s[el.tagName] || 0) + 1);
    setStats(Object.entries(s).sort((a,b) => b[1]-a[1]).slice(0, 10));
  }, []);

  useEffect(() => {
    onResultChange({
      text: stats.map(([tag, count]) => `${tag}: ${count}`).join('\n'),
      filename: 'page_inspect.txt'
    });
  }, [stats, onResultChange]);

  return (
    <div className="tool-form">
      <p style={{ opacity: 0.7, marginBottom: '15px' }}>Simple page structure analyzer.</p>
      <div className="tool-result" style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
        <div><b>Tags count:</b></div>
        {stats.map(([tag, count]) => (
          <div key={tag}>{tag}: {count}</div>
        ))}
      </div>
    </div>
  );
};

export default Inspect;
