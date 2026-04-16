import React, { useState } from 'react';

const WordCounter = () => {
  const [input, setInput] = useState('');

  const countWords = (text) => {
    setInput(text);
  };

  const getStats = () => {
    const text = input.trim();
    return {
      words: text ? text.split(/\s+/).length : 0,
      chars: text.length,
      sent: text ? text.split(/[.!?]+/).filter(Boolean).length : 0,
      para: text ? text.split(/\n+/).filter(Boolean).length : 0
    };
  };

  const stats = getStats();

  return (
    <div className="tool-form">
      <textarea rows="8" placeholder="Paste your text here..." value={input} onChange={e => countWords(e.target.value)} style={{ width: '100%' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginTop: '20px' }}>
        <div className="tool-result"><div style={{ opacity: 0.5, fontSize: '0.8rem' }}>Words</div><div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.words}</div></div>
        <div className="tool-result"><div style={{ opacity: 0.5, fontSize: '0.8rem' }}>Characters</div><div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.chars}</div></div>
        <div className="tool-result"><div style={{ opacity: 0.5, fontSize: '0.8rem' }}>Sentences</div><div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.sent}</div></div>
        <div className="tool-result"><div style={{ opacity: 0.5, fontSize: '0.8rem' }}>Paragraphs</div><div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.para}</div></div>
      </div>
    </div>
  );
};

export default WordCounter;
