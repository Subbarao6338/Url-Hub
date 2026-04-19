import React, { useState, useEffect } from 'react';

const AiSummary = ({ onResultChange }) => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (result) {
      const plainText = result.replace(/<[^>]*>/g, '').trim();
      onResultChange({
        text: plainText,
        filename: 'summary.txt'
      });
    } else {
      onResultChange(null);
    }
  }, [result, onResultChange]);

  const runSummarization = () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult('');

    // Simulate some "processing" time for UX
    setTimeout(() => {
      const summary = generateExtractiveSummary(input);
      setResult(summary);
      setLoading(false);
    }, 1000);
  };

  const generateExtractiveSummary = (text) => {
    // 1. Sentence splitting (basic)
    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
    if (sentences.length <= 3) return `<p>${text}</p>`;

    // 2. Tokenization and frequency count
    const words = text.toLowerCase().match(/\w+/g) || [];
    const stopWords = new Set(['the', 'is', 'at', 'which', 'on', 'and', 'a', 'an', 'of', 'for', 'in', 'with', 'to', 'this', 'that', 'it']);
    const frequencies = {};

    words.forEach(word => {
      if (!stopWords.has(word)) {
        frequencies[word] = (frequencies[word] || 0) + 1;
      }
    });

    // 3. Score sentences
    const scoredSentences = sentences.map(sentence => {
      const sentenceWords = sentence.toLowerCase().match(/\w+/g) || [];
      let score = 0;
      sentenceWords.forEach(word => {
        if (frequencies[word]) score += frequencies[word];
      });
      return { sentence, score: score / (sentenceWords.length || 1) };
    });

    // 4. Select top sentences (e.g., top 30% or at least 3 sentences)
    const countToSelect = Math.max(3, Math.ceil(sentences.length * 0.3));
    const topSentences = [...scoredSentences]
      .sort((a, b) => b.score - a.score)
      .slice(0, countToSelect)
      .sort((a, b) => scoredSentences.indexOf(a) - scoredSentences.indexOf(b)); // Restore original order

    return `
      <p><b>Heuristic Extractive Summary:</b></p>
      <ul>
        ${topSentences.map(s => `<li>${s.sentence.trim()}</li>`).join('')}
      </ul>
      <p style="font-size: 0.8rem; opacity: 0.6; margin-top: 10px;">
        Generated using sentence-ranking algorithm based on word frequency.
      </p>
    `;
  };

  return (
    <div className="tool-form">
      <div className="form-group">
        <label>Text Content to Summarize</label>
        <textarea
          rows="10"
          placeholder="Paste long text here..."
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '12px',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--on-surface)'
          }}
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>
      <button className="btn-primary" style={{ width: '100%' }} onClick={runSummarization} disabled={loading}>
        {loading ? 'Processing...' : 'Generate Summary'}
      </button>
      {(loading || result) && (
        <div className="tool-result" style={{ marginTop: '1.5rem' }}>
          <div style={{ fontWeight: 500, marginBottom: '10px', color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-icons">auto_fix_high</span> Result
          </div>
          <div style={{ lineHeight: 1.6, opacity: 0.9 }} dangerouslySetInnerHTML={{ __html: loading ? '<i>Analyzing text structure and frequency...</i>' : result }} />
        </div>
      )}
    </div>
  );
};

export default AiSummary;
