import React, { useState, useEffect } from 'react';

const DiffViewer = ({ onResultChange }) => {
  const [s1, setS1] = useState('');
  const [s2, setS2] = useState('');
  const [result, setResult] = useState(null);

  const runDiff = () => {
    setResult(s1 === s2 ? "Texts are identical." : "Texts are different.");
  };

  useEffect(() => {
    if (result) {
      onResultChange({
        text: `Result: ${result}\n\n--- TEXT 1 ---\n${s1}\n\n--- TEXT 2 ---\n${s2}`,
        filename: 'diff_result.txt'
      });
    } else {
      onResultChange(null);
    }
  }, [result, s1, s2, onResultChange]);

  return (
    <div className="tool-form">
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
        <textarea placeholder="Original text..." style={{ flex: 1, height: '150px', fontFamily: 'monospace' }} value={s1} onChange={e => setS1(e.target.value)} />
        <textarea placeholder="Modified text..." style={{ flex: 1, height: '150px', fontFamily: 'monospace' }} value={s2} onChange={e => setS2(e.target.value)} />
      </div>
      <button className="btn-primary" style={{ width: '100%' }} onClick={runDiff}>Compare Text</button>
      {result && (
        <div className="tool-result" style={{ marginTop: '1.5rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap', color: s1 === s2 ? '#10b981' : '#ef4444' }}>
          {result}
        </div>
      )}
    </div>
  );
};

export default DiffViewer;
