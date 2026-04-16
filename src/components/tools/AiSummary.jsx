import React, { useState } from 'react';

const AiSummary = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const mockAiSummary = () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult('');
    setTimeout(() => {
      setResult(`
        <p>Simulated AI summary based on input:</p>
        <ul>
          <li><b>Key Point 1:</b> Effective summarization reduces cognitive load by highlighting essential facts.</li>
          <li><b>Key Point 2:</b> This tool provides an offline-first approach to content digestion.</li>
          <li><b>Key Point 3:</b> Structured data extraction helps in quick scanning and recall.</li>
        </ul>
      `);
      setLoading(false);
    }, 1200);
  };

  return (
    <div className="tool-form">
      <div className="form-group">
        <label>Article URL or Text Content</label>
        <textarea
          rows="6"
          placeholder="Paste link or long text here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>
      <button className="btn-primary" style={{ width: '100%' }} onClick={mockAiSummary}>
        Generate AI Summary
      </button>
      {(loading || result) && (
        <div className="tool-result" style={{ marginTop: '1.5rem' }}>
          <div style={{ fontWeight: 500, marginBottom: '10px', color: 'var(--primary)' }}>
            <span className="material-icons" style={{ verticalAlign: 'middle', fontSize: '1.2rem' }}>auto_fix_high</span> AI Generated Summary
          </div>
          <div style={{ lineHeight: 1.6, opacity: 0.9 }} dangerouslySetInnerHTML={{ __html: loading ? '<i>Processing with local AI model...</i>' : result }} />
        </div>
      )}
    </div>
  );
};

export default AiSummary;
