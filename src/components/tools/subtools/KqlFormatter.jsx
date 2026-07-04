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

            // Split into pipe segments
            const segments = input.split(/\s*\|\s*/);
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
                    const parts = s.split(/,\s*/);
                    if (parts.length > 1) {
                        return [parts[0], ...parts.slice(1).map(p => `    ${p.trim()}`)].join('\n  ');
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
                Kusto Query Language (KQL) formatter for Azure Data Explorer / Log Analytics.
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
