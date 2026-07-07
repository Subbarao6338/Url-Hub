import React, { useState } from 'react';
import ToolResult from '../ToolResult';

const TextHub = () => {
    const [input, setInput] = useState('');
    const [res, setRes] = useState(null);

    const countSyllables = (word) => {
        word = word.toLowerCase();
        if (word.length <= 3) return 1;
        word = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '');
        word = word.replace(/^y/, '');
        const syllables = word.match(/[aeiouy]{1,2}/g);
        return syllables ? syllables.length : 1;
    };

    const run = () => {
        if (!input.trim()) return;

        const lines = input.split(/\r\n|\r|\n/).length;
        const words = input.trim().split(/\s+/).filter(w => w.length > 0);
        const charCount = input.length;
        const charNoSpaces = input.replace(/\s/g, '').length;
        const sentences = input.split(/[.!?]+/).filter(s => s.trim().length > 0);
        const sentenceCount = sentences.length || 1;

        const avgWordLength = words.length > 0
            ? (words.reduce((acc, word) => acc + word.length, 0) / words.length).toFixed(2)
            : 0;

        const readingTime = Math.ceil(words.length / 200);

        // Flesch-Kincaid
        let totalSyllables = 0;
        words.forEach(w => {
            totalSyllables += countSyllables(w.replace(/[^a-z]/gi, ''));
        });

        const wordCount = words.length || 1;
        const readingEase = 206.835 - 1.015 * (wordCount / sentenceCount) - 84.6 * (totalSyllables / wordCount);
        const gradeLevel = 0.39 * (wordCount / sentenceCount) + 11.8 * (totalSyllables / wordCount) - 15.59;

        // Word Frequency
        const freq = {};
        words.forEach(w => {
            const word = w.toLowerCase().replace(/[^a-z0-9]/g, '');
            if (word.length > 2) {
                freq[word] = (freq[word] || 0) + 1;
            }
        });
        const topWords = Object.entries(freq)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([word, count]) => `${word} (${count})`)
            .join(', ');

        const analytics = [
            `Lines: ${lines}`,
            `Words: ${wordCount}`,
            `Sentences: ${sentenceCount}`,
            `Characters (total): ${charCount}`,
            `Characters (no spaces): ${charNoSpaces}`,
            `Average Word Length: ${avgWordLength}`,
            `Estimated Reading Time: ~${readingTime} min`,
            `Flesch Reading Ease: ${readingEase.toFixed(2)}`,
            `Flesch-Kincaid Grade Level: ${gradeLevel.toFixed(2)}`,
            `Top Words: ${topWords || 'N/A'}`
        ].join('\n');

        setRes({ text: analytics });
    };

    const copyToClipboard = () => {
        if (res && res.text) {
            navigator.clipboard.writeText(res.text);
            alert('Results copied to clipboard!');
        }
    };

    return (
        <div className="card p-20 glass-card grid gap-15">
            <h3 className="text-center">Advanced Text Analytics</h3>
            <textarea
                className="pill w-full"
                rows="8"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Paste text here for deep analysis and readability scores..."
                style={{ borderRadius: '16px', padding: '15px' }}
            />
            <div className="flex gap-10">
                <button className="btn-primary flex-1" onClick={run}>
                    <span className="material-icons mr-10">analytics</span>
                    Analyze Text
                </button>
                {res && (
                    <button className="pill" onClick={copyToClipboard}>
                        <span className="material-icons">content_copy</span>
                    </button>
                )}
            </div>
            <ToolResult result={res} />
        </div>
    );
};

export default TextHub;
