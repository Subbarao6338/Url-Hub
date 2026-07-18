import React, { useState, useMemo } from 'react';
import ToolResult from '../ToolResult';

const TEST_URLS = [
    { label: 'Sample API URL', value: 'https://api.github.com:443/repos/octocat/Hello-World/issues?state=open&assignee=octocat&milestone=1#comments' },
    { label: 'Sample Web URL', value: 'https://www.example.com/search/products?category=developer-utilities&sort=popular&page=2&ref=toolbox#results' }
];

const UrlTool = () => {
    const [input, setInput] = useState('');
    const [result, setResult] = useState(null);
    const [copyParamSuccess, setCopyParamSuccess] = useState(null);

    const encode = () => {
        try {
            if (!input) return;
            const encoded = encodeURIComponent(input);
            setResult({ text: encoded, filename: 'encoded_url.txt', copyText: encoded });
        } catch (e) {
            setResult({ error: e.message });
        }
    };

    const decode = () => {
        try {
            if (!input) return;
            const decoded = decodeURIComponent(input);
            setResult({ text: decoded, filename: 'decoded_url.txt', copyText: decoded });
        } catch (e) {
            setResult({ error: e.message });
        }
    };

    const handleClear = () => {
        setInput('');
        setResult(null);
    };

    // Live URL Parsing logic
    const parsedDetails = useMemo(() => {
        if (!input.trim()) return null;
        try {
            let attemptUrl = input.trim();
            // If it has no scheme, prepend https:// for parsing purposes if it looks like a hostname
            if (!/^[a-zA-Z]+:\/\//.test(attemptUrl)) {
                attemptUrl = 'https://' + attemptUrl;
            }
            const urlObj = new URL(attemptUrl);

            const params = [];
            urlObj.searchParams.forEach((value, key) => {
                params.push({ key, value });
            });

            return {
                protocol: urlObj.protocol,
                host: urlObj.host,
                hostname: urlObj.hostname,
                port: urlObj.port || 'Default',
                pathname: urlObj.pathname,
                hash: urlObj.hash,
                params
            };
        } catch (err) {
            return null; // Not a valid parseable URL
        }
    }, [input]);

    const handleCopyParam = (val, keyIndex) => {
        navigator.clipboard.writeText(val);
        setCopyParamSuccess(keyIndex);
        setTimeout(() => setCopyParamSuccess(null), 2000);
    };

    return (
        <div className="card p-30 glass-card grid gap-20">
            <h3 className="text-center">URL Encoder / Decoder & Analyzer</h3>
            <p className="smallest opacity-6 text-center mb-10">Encode/decode web-safe strings, parse standard URLs, and analyze query parameters instantly in an interactive table.</p>

            <div className="flex gap-5 flex-wrap justify-center">
                {TEST_URLS.map(t => (
                    <button
                        key={t.label}
                        type="button"
                        className="pill smallest"
                        onClick={() => {
                            setInput(t.value);
                            setResult(null);
                        }}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="form-group relative">
                <label className="smallest opacity-6 uppercase ml-10 font-bold">Input URL or Text</label>
                <textarea
                    className="pill w-full font-mono mt-5"
                    rows="4"
                    placeholder="Enter URL or text to encode, decode, or parse..."
                    value={input}
                    onChange={e => {
                        setInput(e.target.value);
                        setResult(null);
                    }}
                    style={{ borderRadius: '16px', padding: '15px' }}
                />
            </div>

            <div className="flex gap-10">
                <button className="btn-primary flex-1" onClick={encode} disabled={!input}>Encode</button>
                <button className="pill flex-1" onClick={decode} disabled={!input}>Decode</button>
                {(input || result) && (
                    <button className="pill" onClick={handleClear} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                        Clear
                    </button>
                )}
            </div>

            <ToolResult result={result} onClear={() => setResult(null)} />

            {parsedDetails && (
                <div className="url-parser-results card p-25 bg-surface animate-fadeIn grid gap-15 mt-10" style={{ border: '1px solid var(--border-color)', borderRadius: '16px' }}>
                    <div className="flex-between align-center border-bottom pb-10">
                        <span className="smallest opacity-6 uppercase font-bold tracking-wider">URL Parser & Query Analyzer</span>
                        <span className="badge smallest text-success font-bold flex-center gap-5">
                            <span className="material-icons" style={{ fontSize: '0.9rem' }}>check_circle</span> Valid URL Structure
                        </span>
                    </div>

                    <div className="grid cols-2 gap-15" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
                        <div>
                            <div className="smallest opacity-6 uppercase font-bold">Protocol</div>
                            <div className="font-mono font-bold text-truncate" style={{ color: 'var(--brand-accent)' }}>{parsedDetails.protocol}</div>
                        </div>
                        <div>
                            <div className="smallest opacity-6 uppercase font-bold">Host / Domain</div>
                            <div className="font-mono font-bold text-truncate" title={parsedDetails.host}>{parsedDetails.host}</div>
                        </div>
                        <div>
                            <div className="smallest opacity-6 uppercase font-bold">Port</div>
                            <div className="font-mono">{parsedDetails.port}</div>
                        </div>
                        <div>
                            <div className="smallest opacity-6 uppercase font-bold">Pathname</div>
                            <div className="font-mono text-truncate" title={parsedDetails.pathname}>{parsedDetails.pathname}</div>
                        </div>
                        {parsedDetails.hash && (
                            <div style={{ gridColumn: 'span 2' }}>
                                <div className="smallest opacity-6 uppercase font-bold">Hash / Fragment</div>
                                <div className="font-mono text-truncate text-danger">{parsedDetails.hash}</div>
                            </div>
                        )}
                    </div>

                    {parsedDetails.params.length > 0 ? (
                        <div className="mt-15">
                            <div className="smallest opacity-6 uppercase font-bold mb-10">Query Parameters ({parsedDetails.params.length})</div>
                            <div style={{ overflowX: 'auto', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--bg-surface)' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                    <thead>
                                        <tr style={{ background: 'rgba(255, 255, 255, 0.05)', borderBottom: '2px solid var(--border-color)' }}>
                                            <th style={{ padding: '10px 15px', fontWeight: 'bold', fontSize: '0.8rem', textTransform: 'uppercase' }}>Key</th>
                                            <th style={{ padding: '10px 15px', fontWeight: 'bold', fontSize: '0.8rem', textTransform: 'uppercase' }}>Value</th>
                                            <th style={{ padding: '10px 15px', width: '80px' }}></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {parsedDetails.params.map((param, index) => (
                                            <tr key={index} style={{ borderBottom: '1px solid var(--border-color)' }}>
                                                <td className="font-bold font-mono" style={{ padding: '8px 15px', color: 'var(--brand-accent)', wordBreak: 'break-all', fontSize: '0.85rem' }}>{param.key}</td>
                                                <td className="font-mono" style={{ padding: '8px 15px', wordBreak: 'break-all', fontSize: '0.85rem' }}>{param.value}</td>
                                                <td style={{ padding: '8px 15px', textAlign: 'right' }}>
                                                    <button
                                                        type="button"
                                                        className="icon-btn"
                                                        onClick={() => handleCopyParam(param.value, index)}
                                                        title="Copy parameter value"
                                                        style={{ width: '28px', height: '28px' }}
                                                    >
                                                        <span className="material-icons" style={{ fontSize: '1rem' }}>
                                                            {copyParamSuccess === index ? 'check' : 'content_copy'}
                                                        </span>
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="p-15 bg-surface text-center opacity-6 smallest italic rounded-lg border mt-5">
                            No query parameters found in the URL.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default UrlTool;
