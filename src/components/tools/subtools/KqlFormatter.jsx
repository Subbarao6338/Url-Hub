import React, { useState } from 'react';
import ToolResult from '../ToolResult';

const KqlFormatter = () => {
    const [mode, setMode] = useState('format'); // 'format' or 'build'
    const [input, setInput] = useState('');
    const [result, setResult] = useState(null);

    // Builder State
    const [table, setTable] = useState('SecurityEvent');
    const [fields, setFields] = useState('TimeGenerated, EventID, Account, Computer');
    const [filters, setFilters] = useState('EventID == 4624');
    const [joins, setJoins] = useState('');
    const [loading, setLoading] = useState(false);

    const formatEngine = (kqlRaw) => {
        const operators = [
            'where', 'project', 'summarize', 'extend', 'sort by', 'take', 'top',
            'join', 'union', 'render', 'distinct', 'parse', 'mvexpand', 'evaluate',
            'lookup', 'make-series', 'mv-expand', 'order by', 'count', 'limit'
        ];

        const functions = ['bin', 'count', 'now', 'ago', 'datetime', 'tostring', 'toint', 'tolong', 'todatetime', 'extract', 'split', 'strcat', 'iff', 'case', 'format_datetime'];

        let kql = kqlRaw;
        // Standardize function casing
        functions.forEach(fn => {
            const regex = new RegExp(`\\b${fn}\\b(?=\\s*\\()`, 'gi');
            kql = kql.replace(regex, fn.toLowerCase());
        });

        // Split into pipe segments
        const segments = kql.split(/\s*\|\s*/);
        const formattedSegments = segments.map((seg, index) => {
            let s = seg.trim();
            if (index === 0) return s;

            // Capitalize operator if it's in our list
            operators.forEach(op => {
                const regex = new RegExp(`^${op}\\b`, 'i');
                if (s.match(regex)) {
                    s = op.toLowerCase() + s.substring(op.length);
                }
            });

            // Handle indentation for common multi-line operators
            if (s.match(/^(project|summarize|extend|where|order by|sort by)/i)) {
                // Try to split by commas that are not inside parentheses
                const parts = [];
                let currentPart = "";
                let depth = 0;
                for (let i = 0; i < s.length; i++) {
                    const char = s[i];
                    if (char === '(') depth++;
                    if (char === ')') depth--;
                    if (char === ',' && depth === 0) {
                        parts.push(currentPart.trim());
                        currentPart = "";
                    } else {
                        currentPart += char;
                    }
                }
                parts.push(currentPart.trim());

                if (parts.length > 1) {
                    return [parts[0], ...parts.slice(1).map(p => `    ${p}`)].join('\n  ');
                }
            }
            return s;
        });

        return formattedSegments.join('\n| ');
    };

    const formatKql = () => {
        if (!input.trim()) return;
        try {
            const formatted = formatEngine(input);
            setResult({ text: formatted, filename: 'formatted.kql' });
        } catch (e) {
            setResult({ error: e.message });
        }
    };

    const buildKql = async () => {
        if (!table.trim() || !fields.trim()) {
            setResult({ error: 'Table Name and Fields are required to build a query.' });
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const payload = {
                table: table.trim(),
                fields: fields.trim(),
                joins: joins.trim() || null,
                filters: filters.trim() || null
            };

            const response = await fetch('/api/utils/kusto-gen', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.detail || `Server returned status ${response.status}`);
            }

            const data = await response.json();
            if (data && data.query) {
                // Prettify the generated query using our formatting engine
                const formatted = formatEngine(data.query);
                setResult({ text: formatted, filename: 'built_query.kql' });
            } else {
                throw new Error('Query generation failed. Invalid response.');
            }
        } catch (e) {
            setResult({ error: `KQL Builder failed: ${e.message}` });
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        if (mode === 'format') {
            setInput('');
        } else {
            setTable('SecurityEvent');
            setFields('TimeGenerated, EventID, Account, Computer');
            setFilters('EventID == 4624');
            setJoins('');
        }
        setResult(null);
    };

    return (
        <div className="card p-30 glass-card grid gap-20 animate-fadeIn">
            <h3 className="text-center">KQL Formatter & Builder</h3>
            <p className="smallest opacity-6 text-center mb-10">
                Format and deconstruct complex Kusto Query Language (KQL) queries, or build them server-side using our query generator.
            </p>

            <div className="pill-group" style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                <button
                    className={`pill ${mode === 'format' ? 'active' : ''}`}
                    onClick={() => { setMode('format'); setResult(null); }}
                    style={{ flex: 1 }}
                >
                    KQL Formatter
                </button>
                <button
                    className={`pill ${mode === 'build' ? 'active' : ''}`}
                    onClick={() => { setMode('build'); setResult(null); }}
                    style={{ flex: 1 }}
                >
                    KQL Query Builder
                </button>
            </div>

            {mode === 'format' ? (
                <div className="grid gap-15 animate-fadeIn">
                    <div className="alert-info smallest p-10 rounded-lg opacity-8">
                        <span className="material-icons v-middle mr-5" style={{ fontSize: '1rem' }}>info</span>
                        Kusto Query Language (KQL) formatter with function normalization and improved pipe indentation.
                    </div>
                    <textarea
                        className="pill w-full font-mono text-sm"
                        rows="12"
                        style={{ lineHeight: '1.6', borderRadius: '16px', padding: '15px' }}
                        placeholder="SecurityEvent | where EventID == 4624 | project TimeGenerated, Account..."
                        value={input}
                        onChange={e => {
                            setInput(e.target.value);
                            setResult(null);
                        }}
                    />
                    <div className="flex gap-10">
                        <button className="btn-primary flex-1" onClick={formatKql}>
                            <span className="material-icons mr-10">auto_awesome</span>
                            Format KQL
                        </button>
                        {(input || result) && (
                            <button className="pill" onClick={handleClear} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="grid gap-15 text-left animate-fadeIn">
                    <div className="grid cols-2 gap-15" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                        <div className="form-group">
                            <label className="smallest opacity-6 uppercase ml-10 font-bold">Source Table</label>
                            <input
                                className="pill w-full mt-5"
                                value={table}
                                onChange={e => { setTable(e.target.value); setResult(null); }}
                                placeholder="SecurityEvent"
                            />
                        </div>
                        <div className="form-group">
                            <label className="smallest opacity-6 uppercase ml-10 font-bold">Project Fields</label>
                            <input
                                className="pill w-full mt-5"
                                value={fields}
                                onChange={e => { setFields(e.target.value); setResult(null); }}
                                placeholder="TimeGenerated, EventID, Account"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="smallest opacity-6 uppercase ml-10 font-bold">Filters (Where Clause)</label>
                        <input
                            className="pill w-full mt-5 font-mono"
                            value={filters}
                            onChange={e => { setFilters(e.target.value); setResult(null); }}
                            placeholder="EventID == 4624"
                        />
                    </div>

                    <div className="form-group">
                        <label className="smallest opacity-6 uppercase ml-10 font-bold">Join Query / Table (Optional)</label>
                        <input
                            className="pill w-full mt-5 font-mono"
                            value={joins}
                            onChange={e => { setJoins(e.target.value); setResult(null); }}
                            placeholder="SigninLogs"
                        />
                    </div>

                    <div className="flex gap-10 mt-10">
                        <button className="btn-primary flex-1" onClick={buildKql} disabled={loading}>
                            <span className="material-icons mr-10">build</span>
                            {loading ? 'Building Query...' : 'Generate KQL Query'}
                        </button>
                        <button className="pill" onClick={handleClear} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                            Reset / Clear
                        </button>
                    </div>
                </div>
            )}

            <ToolResult result={result} />
        </div>
    );
};

export default KqlFormatter;
