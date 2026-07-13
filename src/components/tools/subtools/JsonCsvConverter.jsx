import React, { useState } from 'react';
import Papa from 'papaparse';
import ToolResult from '../ToolResult';

const JsonCsvConverter = () => {
    const [val, setVal] = useState('');
    const [res, setRes] = useState(null);

    const toCsv = () => {
        try {
            if (!val.trim()) return;
            const parsed = JSON.parse(val);
            setRes({ text: Papa.unparse(parsed), filename: 'converted.csv' });
        } catch (e) {
            setRes({ error: 'Invalid JSON: ' + e.message });
        }
    };

    return (
        <div className="card p-20 glass-card grid gap-15">
            <h3>Format Conversion</h3>
            <textarea
                className="pill font-mono w-full"
                rows="6"
                value={val}
                onChange={e => setVal(e.target.value)}
                placeholder='Paste JSON array here...'
            />
            <div className="flex gap-10">
                <button className="btn-primary flex-1" onClick={toCsv}>Convert to CSV</button>
                <button className="pill" onClick={() => { setVal(''); setRes(null); }}>Clear</button>
            </div>
            <ToolResult result={res} />
        </div>
    );
};

export default JsonCsvConverter;
