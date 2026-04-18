import React, { useState, useEffect } from 'react';

const JsonToCsv = ({ onResultChange }) => {
  const [input, setInput] = useState('');
  const [csvOutput, setCsvOutput] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (csvOutput) {
      onResultChange({
        text: csvOutput,
        filename: 'data.csv'
      });
    } else {
      onResultChange(null);
    }
  }, [csvOutput, onResultChange]);

  const convertToCsv = () => {
    setError('');
    try {
      const json = JSON.parse(input);
      const data = Array.isArray(json) ? json : [json];

      if (data.length === 0) {
        setCsvOutput('');
        return;
      }

      const headers = Object.keys(data[0]);
      const csvRows = [];

      // Add headers
      csvRows.push(headers.join(','));

      // Add data rows
      for (const row of data) {
        const values = headers.map(header => {
          const val = row[header];
          const escaped = ('' + val).replace(/"/g, '""');
          return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
      }

      setCsvOutput(csvRows.join('\n'));
    } catch (e) {
      setError('Invalid JSON input: ' + e.message);
      setCsvOutput('');
    }
  };

  return (
    <div className="tool-form">
      <div className="form-group">
        <label>JSON Input (Object or Array)</label>
        <textarea
          rows="8"
          placeholder='[{"name": "John", "age": 30}, {"name": "Jane", "age": 25}]'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          style={{ width: '100%', fontFamily: 'monospace' }}
        />
      </div>

      <button className="btn-primary" onClick={convertToCsv}>Convert to CSV</button>

      {error && (
        <div style={{ color: 'var(--danger)', fontSize: '0.9rem', marginTop: '10px' }}>
          {error}
        </div>
      )}

      {csvOutput && (
        <div className="tool-result" style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
            <span style={{ fontWeight: 600 }}>CSV Output</span>
            <button className="icon-btn" onClick={() => navigator.clipboard.writeText(csvOutput)} style={{ width: '28px', height: '28px' }}>
              <span className="material-icons" style={{ fontSize: '1rem' }}>content_copy</span>
            </button>
          </div>
          <pre style={{ margin: 0, fontSize: '0.85rem', color: 'var(--primary)', whiteSpace: 'pre-wrap', maxHeight: '300px', overflowY: 'auto' }}>
            {csvOutput}
          </pre>
        </div>
      )}
    </div>
  );
};

export default JsonToCsv;
