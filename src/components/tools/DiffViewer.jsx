import React, { useState, useEffect } from 'react';
import * as Diff from 'diff';

const DiffViewer = ({ onResultChange }) => {
  const [s1, setS1] = useState('');
  const [s2, setS2] = useState('');
  const [diffResult, setDiffResult] = useState([]);
  const [isCalculated, setIsCalculated] = useState(false);

  const runDiff = () => {
    const diff = Diff.diffLines(s1, s2);
    setDiffResult(diff);
    setIsCalculated(true);
  };

  useEffect(() => {
    if (isCalculated) {
      const summary = diffResult.map(part => {
        const prefix = part.added ? '+ ' : part.removed ? '- ' : '  ';
        return part.value.split('\n').filter(line => line).map(line => prefix + line).join('\n');
      }).join('\n');

      onResultChange({
        text: `Diff Result:\n\n${summary}`,
        filename: 'diff_result.txt'
      });
    } else {
      onResultChange(null);
    }
  }, [diffResult, isCalculated, onResultChange]);

  return (
    <div className="tool-form">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div className="form-group">
          <label>Original Text</label>
          <textarea
            placeholder="Paste original text here..."
            style={{ width: '100%', height: '200px', fontFamily: 'monospace', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--on-surface)' }}
            value={s1}
            onChange={e => { setS1(e.target.value); setIsCalculated(false); }}
          />
        </div>
        <div className="form-group">
          <label>Modified Text</label>
          <textarea
            placeholder="Paste modified text here..."
            style={{ width: '100%', height: '200px', fontFamily: 'monospace', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--on-surface)' }}
            value={s2}
            onChange={e => { setS2(e.target.value); setIsCalculated(false); }}
          />
        </div>
      </div>

      <button className="btn-primary" style={{ width: '100%' }} onClick={runDiff}>Compare Text</button>

      {isCalculated && (
        <div className="tool-result" style={{ marginTop: '24px', padding: '20px', background: 'var(--surface-solid)', borderRadius: '16px', border: '1px solid var(--border)' }}>
          <div style={{ fontWeight: 600, marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-icons" style={{ color: 'var(--primary)' }}>difference</span>
            Changes
          </div>
          <div style={{
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            fontSize: '0.9rem',
            maxHeight: '400px',
            overflowY: 'auto',
            padding: '12px',
            background: 'rgba(0,0,0,0.02)',
            borderRadius: '8px'
          }}>
            {diffResult.length === 1 && !diffResult[0].added && !diffResult[0].removed ? (
              <div style={{ color: '#10b981', textAlign: 'center', padding: '20px' }}>Texts are identical.</div>
            ) : (
              diffResult.map((part, index) => (
                <span
                  key={index}
                  style={{
                    color: part.added ? '#065f46' : part.removed ? '#991b1b' : 'inherit',
                    background: part.added ? '#d1fae5' : part.removed ? '#fee2e2' : 'transparent',
                    display: 'block',
                    padding: '0 4px'
                  }}
                >
                  {part.value}
                </span>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DiffViewer;
