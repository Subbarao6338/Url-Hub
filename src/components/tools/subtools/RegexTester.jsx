import React, { useState, useMemo } from 'react';
import ToolResult from '../ToolResult';

const PRESETS = [
    { label: 'Email Address', value: 'email', isServer: true, description: 'Matches standard email formats.' },
    { label: 'Web URL', value: 'url', isServer: true, description: 'Matches web URLs starting with http or https.' },
    { label: 'IPv4 Address', value: 'ipv4', isServer: false, pattern: '^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$', description: 'Matches standard IPv4 addresses.' },
    { label: 'Date (YYYY-MM-DD)', value: 'date', isServer: false, pattern: '^\\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])$', description: 'Matches dates in ISO YYYY-MM-DD format.' },
    { label: 'Phone Number', value: 'phone', isServer: false, pattern: '^\\+?\\d{1,4}?[-.\\s]?\\(?\\d{1,3}?\\)?[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,9}$', description: 'Matches diverse international phone numbers.' },
    { label: 'Hex Color', value: 'hex', isServer: false, pattern: '^#?([a-fA-F0-9]{6}|[a-fA-F0-9]{3})$', description: 'Matches hex color codes (e.g., #fff, #a3b2c1).' }
];

const RegexTester = () => {
    const [regex, setRegex] = useState('');
    const [flags, setFlags] = useState('g');
    const [text, setText] = useState('Contact us at support@example.com or sales-dept@corp.net. Check our website at https://epic-toolbox.io/docs and http://localhost:5173 for details.');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const loadPreset = async (preset) => {
        setResult(null);
        if (preset.isServer) {
            setLoading(true);
            try {
                const res = await fetch(`/api/utils/regex-gen?pattern_type=${preset.value}`);
                if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);
                const data = await res.json();
                if (data && data.regex) {
                    setRegex(data.regex);
                } else {
                    throw new Error('No regex returned.');
                }
            } catch (e) {
                console.error("Server regex-gen failed, loading fallback local regex:", e);
                if (preset.value === 'email') {
                    setRegex('([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})');
                } else if (preset.value === 'url') {
                    setRegex('(https?://[^\\s$.?#].[^\\s]*)');
                }
            } finally {
                setLoading(false);
            }
        } else {
            setRegex(preset.pattern);
        }
    };

    // Calculate matches reactively for live visualization!
    const highlightedSegments = useMemo(() => {
        if (!regex || !text) return [{ text, isMatch: false }];

        try {
            // Force global flag for correct matching in loop
            const safeFlags = flags.includes('g') ? flags : flags + 'g';
            const re = new RegExp(regex, safeFlags);

            const segments = [];
            let lastIndex = 0;
            let match;
            let matchCount = 0;
            const maxSafeMatches = 1000;

            re.lastIndex = 0;
            while ((match = re.exec(text)) !== null) {
                matchCount++;
                if (matchCount > maxSafeMatches) break;

                const matchIndex = match.index;
                const matchText = match[0];

                if (matchText.length === 0) {
                    if (re.lastIndex === matchIndex) {
                        re.lastIndex++;
                    }
                    continue;
                }

                if (matchIndex > lastIndex) {
                    segments.push({
                        text: text.substring(lastIndex, matchIndex),
                        isMatch: false
                    });
                }

                segments.push({
                    text: matchText,
                    isMatch: true,
                    matchNum: matchCount
                });

                lastIndex = re.lastIndex;
            }

            if (lastIndex < text.length) {
                segments.push({
                    text: text.substring(lastIndex),
                    isMatch: false
                });
            }

            return segments;
        } catch (e) {
            return [{ text, isMatch: false, error: e.message }];
        }
    }, [regex, flags, text]);

    const testRegex = () => {
        if (!regex) {
            setResult({ error: 'Please enter or select a Regular Expression pattern first.' });
            return;
        }
        try {
            const re = new RegExp(regex, flags);
            const matches = [...text.matchAll(re)];

            if (matches.length === 0) {
                setResult({ text: 'No matches found.' });
                return;
            }

            let info = `🔍 Found ${matches.length} matches:\n\n`;
            matches.forEach((m, i) => {
                const captured = m.slice(1);
                const groupsInfo = captured.length > 0
                    ? `\n   ↳ Captured Groups: ${captured.map((g, idx) => `Group ${idx + 1}: "${g || ''}"`).join(', ')}`
                    : '';
                info += `Match ${i + 1}: "${m[0]}" (Index: ${m.index})${groupsInfo}\n`;
            });
            setResult({ text: info });
        } catch (e) {
            setResult({ error: 'Regex Error: ' + e.message });
        }
    };

    const handleClear = () => {
        setRegex('');
        setFlags('g');
        setText('');
        setResult(null);
    };

    const matchCount = highlightedSegments.filter(s => s.isMatch).length;

    return (
        <div className="card p-30 glass-card grid gap-20 animate-fadeIn">
            <h3 className="text-center m-0 flex-center gap-10">
                <span className="material-icons" style={{ color: 'var(--brand-accent)' }}>find_in_page</span>
                Enterprise Regex Workstation
            </h3>
            <p className="smallest opacity-6 text-center m-0">
                Design, evaluate, and visualize regular expressions with real-time match highlighting and deep group capture analytics.
            </p>

            <div className="preset-container">
                <div className="smallest opacity-6 uppercase text-left mb-10 font-bold ml-10">Popular Regex Presets</div>
                <div className="flex gap-5 flex-wrap justify-start">
                    {PRESETS.map(p => (
                        <button
                            key={p.label}
                            type="button"
                            className="pill smallest"
                            onClick={() => loadPreset(p)}
                            title={p.description}
                            disabled={loading}
                        >
                            {p.label} {p.isServer && '⚙️'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid gap-15">
                <div className="flex gap-10">
                    <div className="form-group text-left flex-1">
                        <label className="smallest opacity-6 uppercase ml-10 font-bold">Regular Expression</label>
                        <input
                            className="pill w-full font-mono mt-5"
                            placeholder="e.g. ([a-zA-Z0-9]+) or choose a preset above"
                            value={regex}
                            onChange={e => {
                                setRegex(e.target.value);
                                setResult(null);
                            }}
                            disabled={loading}
                        />
                    </div>
                    <div className="form-group text-left" style={{ width: '100px' }}>
                        <label className="smallest opacity-6 uppercase ml-10 font-bold">Flags</label>
                        <input
                            className="pill w-full mt-5 text-center font-mono"
                            placeholder="g"
                            value={flags}
                            onChange={e => {
                                setFlags(e.target.value);
                                setResult(null);
                            }}
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="form-group text-left">
                    <label className="smallest opacity-6 uppercase ml-10 font-bold">Test Subject Text</label>
                    <textarea
                        className="pill w-full font-mono mt-5"
                        rows="6"
                        placeholder="Paste text to test against the regex..."
                        value={text}
                        onChange={e => {
                            setText(e.target.value);
                            setResult(null);
                        }}
                        style={{ borderRadius: '16px', padding: '15px' }}
                    />
                </div>

                <div className="flex gap-10">
                    <button className="btn-primary flex-1" onClick={testRegex} disabled={loading}>
                        <span className="material-icons mr-10" style={{ fontSize: '1rem' }}>play_arrow</span>
                        {loading ? 'Fetching Preset...' : 'Analyze Captured Groups'}
                    </button>
                    {(regex || text || result) && (
                        <button className="pill" onClick={handleClear} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Visual Match Highlight Area */}
            {text && regex && (
                <div className="regex-visual-panel text-left">
                    <div className="flex-between mb-10">
                        <span className="smallest opacity-6 uppercase font-bold tracking-wider">Live Match Highlight Preview</span>
                        <span className={`badge ${matchCount > 0 ? 'bg-success' : 'bg-secondary'}`}>
                            {matchCount} {matchCount === 1 ? 'match' : 'matches'} found
                        </span>
                    </div>
                    <div className="highlight-content font-mono text-sm">
                        {highlightedSegments[0]?.error ? (
                            <span className="text-danger">{highlightedSegments[0].error}</span>
                        ) : (
                            highlightedSegments.map((seg, idx) => (
                                seg.isMatch ? (
                                    <span key={idx} className="regex-match-token" title={`Match #${seg.matchNum}`}>
                                        {seg.text}
                                    </span>
                                ) : (
                                    <span key={idx}>{seg.text}</span>
                                )
                            ))
                        )}
                    </div>
                </div>
            )}

            {result && <ToolResult result={result} onClear={() => setResult(null)} />}

            <style>{`
                .regex-visual-panel {
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    padding: 15px;
                    background: var(--bg-surface);
                }
                .highlight-content {
                    white-space: pre-wrap;
                    word-break: break-all;
                    line-height: 1.6;
                    color: var(--text-primary);
                }
                .regex-match-token {
                    background-color: rgba(var(--brand-accent-rgb), 0.25);
                    border-bottom: 2px solid var(--brand-accent);
                    padding: 1px 4px;
                    margin: 0 1px;
                    border-radius: 3px;
                    font-weight: bold;
                    display: inline-block;
                    color: var(--text-primary);
                    transition: all 0.2s ease;
                }
                .regex-match-token:hover {
                    background-color: rgba(var(--brand-accent-rgb), 0.45);
                    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
                    transform: scale(1.05);
                }
                .badge {
                    font-size: 0.75rem;
                    padding: 3px 8px;
                    border-radius: 10px;
                    font-weight: bold;
                }
                .bg-success {
                    background-color: rgba(102, 187, 106, 0.2);
                    color: #2e7d32;
                }
                .bg-secondary {
                    background-color: rgba(0, 0, 0, 0.05);
                    color: var(--text-primary);
                    opacity: 0.6;
                }
                [data-theme='dark'] .bg-success {
                    color: #81c784;
                }
            `}</style>
        </div>
    );
};

export default RegexTester;