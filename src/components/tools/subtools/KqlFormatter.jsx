import React, { useState } from 'react';
import ToolResult from '../ToolResult';

const KqlFormatter = () => {
    const [input, setInput] = useState('');
    const [result, setResult] = useState(null);

    const formatKql = () => {
        if (!input.trim()) return;
        try {
            const operators = [
                'where', 'project', 'summarize', 'extend', 'sort by', 'take', 'top',
                'join', 'union', 'render', 'distinct', 'parse', 'mvexpand', 'evaluate',
                'lookup', 'make-series', 'mv-expand', 'order by', 'count', 'limit'
            ];

            const functions = ['bin', 'count', 'now', 'ago', 'datetime', 'tostring', 'toint', 'tolong', 'todatetime', 'extract', 'split', 'strcat', 'iff', 'case', 'format_datetime'];

            let kql = input;
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

            const finalKql = formattedSegments.join('\n| ');
            setResult({ text: finalKql, filename: 'formatted.kql' });
        } catch (e) {
            setResult({ error: e.message });
        }
    };

    return (
        <div className="grid gap-15">
            <div className="alert-info smallest p-10 rounded-lg opacity-8">
                <span className="material-icons v-middle mr-5" style={{fontSize:'1rem'}}>info</span>
                Kusto Query Language (KQL) formatter with function normalization and improved indentation.
            </div>
            <textarea className="pill w-full font-mono text-sm" rows="12" style={{lineHeight: '1.6', borderRadius: '16px', padding: '15px'}} placeholder="SecurityEvent | where EventID == 4624 | project TimeGenerated, Account..." value={input} onChange={e=>setInput(e.target.value)} />
            <div className="flex gap-10">
                <button className="btn-primary flex-1" onClick={formatKql}>
                    <span className="material-icons mr-10">auto_awesome</span>
                    Format KQL
                </button>
                <button className="pill" onClick={() => { setInput(''); setResult(null); }}>Clear</button>
            </div>
            <ToolResult result={result} />
        </div>
    );
};

export default KqlFormatter;
