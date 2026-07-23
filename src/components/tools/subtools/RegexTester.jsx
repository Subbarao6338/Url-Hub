import React, { useState } from 'react';
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
    const [text, setText] = useState('');
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
                    setRegex('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$');
                } else if (preset.value === 'url') {
                    setRegex('https?://[^\\s$.?#].[^\\s]*');
                }
            } finally {
                setLoading(false);
            }
        } else {
            setRegex(preset.pattern);
        }
    };

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

    return (
        <div className="card p-30 glass-card grid gap-20 animate-fadeIn">
            <h3 className="text-center">Regex Tester & Generator</h3>
            <p className="smallest opacity-6 text-center mb-10">
                Design, test, and explain regular expressions with real-time match evaluation and AI server-driven patterns.
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
                            placeholder="[a-zA-Z0-9]+ or choose a preset above"
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
                        <span className="material-icons mr-10">find_replace</span>
                        {loading ? 'Fetching Preset...' : 'Run Regex Test'}
                    </button>
                    {(regex || text || result) && (
                        <button className="pill" onClick={handleClear} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                            Clear
                        </button>
                    )}
                </div>
            </div>

            <ToolResult result={result} />
        </div>
    );
};

export default RegexTester;
