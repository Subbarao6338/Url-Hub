import React, { useState } from 'react';
import Papa from 'papaparse';
import ToolResult from '../ToolResult';

const JsonCsvConverter = () => {
    const [mode, setMode] = useState('json-to-csv'); // 'json-to-csv' or 'csv-to-json'
    const [val, setVal] = useState('');
    const [res, setRes] = useState(null);

    const handleConvert = () => {
        if (!val.trim()) {
            setRes({ error: 'Input text is empty. Please paste some data to convert.' });
            return;
        }

        if (mode === 'json-to-csv') {
            try {
                const parsed = JSON.parse(val.trim());
                if (typeof parsed !== 'object' || parsed === null) {
                    throw new Error('Input must be a valid JSON Array or Object.');
                }
                const csvResult = Papa.unparse(parsed);
                setRes({ text: csvResult, filename: 'converted.csv' });
            } catch (e) {
                setRes({ error: 'Invalid JSON: ' + e.message + '\n\nMake sure you paste a valid JSON array or object, e.g., [{"name": "John", "age": 30}]' });
            }
        } else {
            try {
                const parsedCsv = Papa.parse(val.trim(), {
                    header: true,
                    skipEmptyLines: true,
                    dynamicTyping: true
                });

                if (parsedCsv.errors && parsedCsv.errors.length > 0) {
                    throw new Error(parsedCsv.errors[0].message);
                }

                if (!parsedCsv.data || parsedCsv.data.length === 0) {
                    throw new Error('No valid CSV records could be parsed.');
                }

                const jsonResult = JSON.stringify(parsedCsv.data, null, 2);
                setRes({ text: jsonResult, filename: 'converted.json' });
            } catch (e) {
                setRes({ error: 'Invalid CSV: ' + e.message + '\n\nMake sure your CSV has valid column headers and row values.' });
            }
        }
    };

    const handleClear = () => {
        setVal('');
        setRes(null);
    };

    const handleModeChange = (newMode) => {
        setMode(newMode);
        setVal('');
        setRes(null);
    };

    return (
        <div className="card p-30 glass-card grid gap-20 animate-fadeIn">
            <h3 className="text-center">JSON ↔ CSV Converter</h3>
            <p className="smallest opacity-6 text-center mb-10">
                Easily convert structured data between JSON arrays and CSV tables. Supports automatic type detection.
            </p>

            <div className="pill-group" style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                <button
                    className={`pill ${mode === 'json-to-csv' ? 'active' : ''}`}
                    onClick={() => handleModeChange('json-to-csv')}
                    style={{ flex: 1 }}
                >
                    JSON to CSV
                </button>
                <button
                    className={`pill ${mode === 'csv-to-json' ? 'active' : ''}`}
                    onClick={() => handleModeChange('csv-to-json')}
                    style={{ flex: 1 }}
                >
                    CSV to JSON
                </button>
            </div>

            <div className="form-group text-left">
                <label className="smallest opacity-6 uppercase ml-10 font-bold">
                    {mode === 'json-to-csv' ? 'Input JSON Array' : 'Input CSV Content'}
                </label>
                <textarea
                    className="pill font-mono w-full mt-5"
                    rows="8"
                    value={val}
                    onChange={e => {
                        setVal(e.target.value);
                        setRes(null);
                    }}
                    placeholder={
                        mode === 'json-to-csv'
                            ? '[\n  { "name": "John", "age": 30, "city": "New York" },\n  { "name": "Jane", "age": 25, "city": "Los Angeles" }\n]'
                            : 'name,age,city\nJohn,30,New York\nJane,25,Los Angeles'
                    }
                    style={{ borderRadius: '16px', padding: '15px' }}
                />
            </div>

            <div className="flex gap-10">
                <button className="btn-primary flex-1" onClick={handleConvert}>
                    <span className="material-icons mr-10">swap_horiz</span>
                    {mode === 'json-to-csv' ? 'Convert to CSV' : 'Convert to JSON'}
                </button>
                {(val || res) && (
                    <button className="pill" onClick={handleClear} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                        Clear
                    </button>
                )}
            </div>

            <ToolResult result={res} />
        </div>
    );
};

export default JsonCsvConverter;
