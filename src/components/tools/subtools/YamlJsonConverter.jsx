import React, { useState } from 'react';
import ToolResult from '../ToolResult';
import * as yaml from 'js-yaml';

const YamlJsonConverter = () => {
    const [input, setInput] = useState('');
    const [result, setResult] = useState(null);

    const toYaml = () => {
        if (!input.trim()) return;
        try {
            const parsed = JSON.parse(input);
            const output = yaml.dump(parsed);
            setResult({ text: output, filename: 'converted.yaml' });
        } catch (e) {
            setResult({ error: 'Invalid JSON for conversion: ' + e.message });
        }
    };

    const toJson = () => {
        if (!input.trim()) return;
        try {
            const parsed = yaml.load(input);
            const output = JSON.stringify(parsed, null, 2);
            setResult({ text: output, filename: 'converted.json' });
        } catch (e) {
            setResult({ error: 'Invalid YAML for conversion: ' + e.message });
        }
    };

    return (
        <div className="card p-30 glass-card grid gap-15">
            <textarea
                className="pill w-full font-mono"
                rows="10"
                placeholder="Paste JSON or YAML here..."
                value={input}
                onChange={e=>setInput(e.target.value)}
            />
            <div className="grid grid-2-cols gap-10">
                <button className="btn-primary" onClick={toYaml}>JSON to YAML</button>
                <button className="pill" onClick={toJson}>YAML to JSON</button>
            </div>
            <ToolResult result={result} />
        </div>
    );
};

export default YamlJsonConverter;
