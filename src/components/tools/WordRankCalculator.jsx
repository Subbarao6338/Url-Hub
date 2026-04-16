import React, { useState } from 'react';

const WordRankCalculator = () => {
  const [word, setWord] = useState('');
  const [result, setResult] = useState(null);

  const factorial = (n) => {
    let res = 1n;
    for (let i = 2n; i <= BigInt(n); i++) res *= i;
    return res;
  };

  const calculateRank = () => {
    const input = word.trim().toUpperCase();
    if (!input) {
      setResult("Please enter a word.");
      return;
    }

    const len = input.length;
    let rank = 1n;
    let mul = factorial(len);
    const charCount = {};

    for (const ch of input) {
      charCount[ch] = (charCount[ch] || 0) + 1;
    }

    const getFactorialDivisor = (counts) => {
      let divisor = 1n;
      for (const key in counts) {
        divisor *= factorial(counts[key]);
      }
      return divisor;
    };

    const currentCounts = { ...charCount };

    for (let i = 0; i < len; i++) {
      mul /= BigInt(len - i);
      const divisor = getFactorialDivisor(currentCounts);
      let countSmaller = 0;

      for (const key in currentCounts) {
        if (key < input[i]) {
          countSmaller += currentCounts[key];
        }
      }

      rank += (BigInt(countSmaller) * mul) / divisor;

      currentCounts[input[i]]--;
      if (currentCounts[input[i]] === 0) {
        delete currentCounts[input[i]];
      }
    }

    setResult(rank.toString());
  };

  return (
    <div className="tool-form">
      <div className="form-group">
        <label>Enter Word</label>
        <input
          type="text"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          placeholder="e.g. SECRET"
          style={{ textTransform: 'uppercase' }}
          onKeyDown={(e) => e.key === 'Enter' && calculateRank()}
        />
      </div>
      <button className="btn-primary" style={{ width: '100%' }} onClick={calculateRank}>
        Calculate Rank
      </button>

      {result && (
        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <div className="tool-result" style={{ padding: '2rem' }}>
            <div style={{ opacity: 0.6, fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Rank of the word
            </div>
            <div style={{ fontSize: '2.5rem', fontWeight: 'bold', marginTop: '10px', wordBreak: 'break-all' }}>
              {result}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordRankCalculator;
