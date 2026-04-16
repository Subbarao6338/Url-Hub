import React, { useState, useEffect } from 'react';

const LoremIpsum = ({ onResultChange }) => {
  const [count, setCount] = useState(3);
  const [result, setResult] = useState('');

  useEffect(() => {
    if (result) {
      onResultChange({
        text: result,
        filename: 'lorem_ipsum.txt'
      });
    } else {
      onResultChange(null);
    }
  }, [result, onResultChange]);

  const generateLorem = () => {
    const text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
    let res = [];
    for (let i = 0; i < count; i++) res.push(text);
    setResult(res.join('\n\n'));
  };

  return (
    <div className="tool-form">
      <div className="form-group"><label>Paragraphs</label><input type="number" value={count} onChange={e => setCount(parseInt(e.target.value))} min="1" max="10" /></div>
      <button className="btn-primary" onClick={generateLorem}>Generate Placeholder Text</button>
      {result && (
        <div className="tool-result" style={{ marginTop: '1.5rem', position: 'relative' }}>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem' }}>{result}</pre>
          <button className="icon-btn" style={{ position: 'absolute', right: '5px', top: '5px' }} onClick={() => navigator.clipboard.writeText(result)}><span className="material-icons">content_copy</span></button>
        </div>
      )}
    </div>
  );
};

export default LoremIpsum;
