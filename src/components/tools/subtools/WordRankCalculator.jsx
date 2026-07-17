import React, { useState } from 'react';
import ToolResult from '../ToolResult';

const WordRankCalculator = () => {
    const [input, setInput] = useState('');
    const [result, setResult] = useState(null);

    const getFactorials = (n) => {
        const factorials = [BigInt(1)];
        for (let i = 1; i <= n; i++) {
            factorials[i] = factorials[i - 1] * BigInt(i);
        }
        return factorials;
    };

    const run = () => {
        const word = input.toUpperCase().replace(/[^A-Z]/g, '');
        if (!word) return setResult({ error: "Please enter a valid word containing only alphabetic characters." });
        if (word.length > 50) return setResult({ error: "Word too long for browser-side calculation (max 50 characters)." });

        try {
            const len = word.length;
            const factorials = getFactorials(len);

            let charCount = {};
            for (const ch of word) charCount[ch] = (charCount[ch] || 0n) + 1n;

            const getFactorialDivisor = (counts) => {
                let divisor = BigInt(1);
                for (const key in counts) divisor *= factorials[Number(counts[key])];
                return divisor;
            };

            // Calculate total unique permutations
            const totalPermutations = factorials[len] / getFactorialDivisor(charCount);

            let rank = BigInt(1);
            let currentCounts = { ...charCount };

            for (let i = 0; i < len; i++) {
                let countSmaller = 0n;
                const sortedKeys = Object.keys(currentCounts).sort();
                for (const key of sortedKeys) {
                    if (key < word[i]) countSmaller += currentCounts[key];
                    else break;
                }

                if (countSmaller > 0n) {
                    const combinations = factorials[len - 1 - i];
                    const divisor = getFactorialDivisor(currentCounts);
                    rank += (countSmaller * combinations) / divisor;
                }

                currentCounts[word[i]]--;
                if (currentCounts[word[i]] === 0n) delete currentCounts[word[i]];
            }

            const rankStr = rank.toString();
            const uniqueChars = Object.keys(charCount).sort().join(', ');

            setResult({
                text: `Lexicographical rank of "${word}":\n${rank.toLocaleString()}`,
                details: {
                    word,
                    length: len,
                    uniqueLetters: uniqueChars,
                    totalPermutations: totalPermutations.toLocaleString(),
                    rank: rank.toLocaleString()
                },
                copyText: rankStr
            });
        } catch (e) {
            setResult({ error: e.message });
        }
    };

    const isLongWord = input.replace(/[^A-Za-z]/g, '').length > 12;

    return (
        <div className="card p-30 glass-card text-center grid gap-15 animate-fadeIn">
            <h3 className="m-0 flex-center gap-10">
                <span className="material-icons" style={{ color: 'var(--brand-accent)' }}>sort_by_alpha</span>
                Word Rank (Lexicographical)
            </h3>
            <p className="smallest opacity-6">
                Calculate the alphabetical position of a word among all its sorted unique permutations.
            </p>

            <div className="form-group text-left">
                <label className="smallest opacity-6 uppercase ml-10">Enter Word</label>
                <input
                    type="text"
                    className="pill w-full uppercase text-center font-bold font-mono tracking-wider"
                    style={{ letterSpacing: '2px', fontSize: '1.1rem' }}
                    placeholder="E.g., BANANA"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                />
            </div>

            {isLongWord && (
                <div className="p-10 border-radius-8 text-left flex gap-10 small opacity-8 animate-fadeIn" style={{ background: 'rgba(255, 193, 7, 0.1)', border: '1px solid var(--amber)', color: 'var(--amber)' }}>
                    <span className="material-icons" style={{ fontSize: '1.2rem' }}>warning</span>
                    <span>Note: This word has &gt; 12 letters. Large words involve high-precision big integer factorials, processed locally in real-time.</span>
                </div>
            )}

            <div className="flex gap-10">
                <button className="btn-primary flex-1" onClick={run}>
                    Calculate Rank
                </button>
                <button className="pill" onClick={() => { setInput(''); setResult(null); }} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                    Reset
                </button>
            </div>

            {result && !result.error && result.details && (
                <div className="result-container animate-fadeIn text-left mt-15">
                    <div className="flex-between mb-5">
                        <span className="smallest opacity-6 uppercase font-bold tracking-wider">Permutation Analysis</span>
                        <button
                            className="pill smallest active"
                            style={{ background: 'var(--brand-accent)', borderColor: 'var(--brand-accent)' }}
                            onClick={() => {
                                navigator.clipboard.writeText(result.copyText);
                                alert('Rank copied to clipboard!');
                            }}
                        >
                            <span className="material-icons" style={{ fontSize: '1rem' }}>content_copy</span> Copy Rank
                        </button>
                    </div>
                    <div className="card p-20 glass-card grid gap-15">
                        <div className="text-center border-bottom pb-15" style={{ borderColor: 'var(--border-color)' }}>
                            <div className="smallest opacity-6 uppercase font-bold">Lexicographical Rank</div>
                            <div className="text-2xl font-bold font-mono mt-5" style={{ color: 'var(--brand-accent)' }}>
                                #{result.details.rank}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-10 small">
                            <div>
                                <span className="opacity-6">Analyzed Word:</span>
                                <strong className="float-right font-mono uppercase">{result.details.word}</strong>
                            </div>
                            <div>
                                <span className="opacity-6">Word Length:</span>
                                <strong className="float-right font-mono">{result.details.length}</strong>
                            </div>
                            <div>
                                <span className="opacity-6">Unique Letters:</span>
                                <strong className="float-right font-mono">{result.details.uniqueLetters}</strong>
                            </div>
                            <div>
                                <span className="opacity-6">Total Permutations:</span>
                                <strong className="float-right font-mono">{result.details.totalPermutations}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {result && result.error && <ToolResult result={result} />}
        </div>
    );
};

export default WordRankCalculator;
