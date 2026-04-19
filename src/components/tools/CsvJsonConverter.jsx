import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';

const CsvJsonConverter = ({ onResultChange }) => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    if (output) {
      onResultChange({
        text: output,
        filename: output.startsWith('[') || output.startsWith('{') ? 'data.json' : 'data.csv'
      });
    } else {
      onResultChange(null);
    }
  }, [output, onResultChange]);

  const handleConvert = (mode) => {
    try {
      setError(null);
      if (mode === 'csv2json') {
        const results = Papa.parse(input, { header: true, skipEmptyLines: true });
        if (results.errors.length > 0) {
          setError(results.errors[0].message);
        } else {
          setOutput(JSON.stringify(results.data, null, 4));
        }
      } else {
        const json = JSON.parse(input);
        const csv = Papa.unparse(json);
        setOutput(csv);
      }
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="tool-form">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="form-group">
          <label>INPUT</label>
          <textarea
            rows="10"
            style={{ width: '100%', fontFamily: 'monospace', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--on-surface)' }}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Paste CSV or JSON here..."
          />
        </div>
        <div className="form-group">
          <label>OUTPUT</label>
          <textarea
            rows="10"
            style={{ width: '100%', fontFamily: 'monospace', padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface-solid)', color: 'var(--on-surface)' }}
            value={output}
            readOnly
            placeholder="Result will appear here..."
          />
        </div>
      </div>

      {error && (
        <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span className="material-icons" style={{ fontSize: '1rem' }}>error_outline</span>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px' }}>
        <button className="btn-primary" style={{ flex: 1 }} onClick={() => handleConvert('csv2json')}>CSV to JSON</button>
        <button className="btn-primary" style={{ flex: 1 }} onClick={() => handleConvert('json2csv')}>JSON to CSV</button>
      </div>
    </div>
  );
};

export default CsvJsonConverter;
