import React, { useState } from 'react';
import ToolResult from '../ToolResult';

const OtpGenerator = () => {
    const [length, setLength] = useState(16);
    const [options, setOptions] = useState({
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true
    });
    const [result, setResult] = useState(null);

    const generate = () => {
        const charSets = {
            uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            lowercase: 'abcdefghijklmnopqrstuvwxyz',
            numbers: '0123456789',
            symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-='
        };

        let chars = '';
        Object.keys(options).forEach(key => {
            if (options[key]) chars += charSets[key];
        });

        if (!chars) return setResult({ error: 'Select at least one character set.' });

        let secret = '';
        const array = new Uint32Array(length);
        window.crypto.getRandomValues(array);

        for (let i = 0; i < length; i++) {
            secret += chars.charAt(array[i] % chars.length);
        }

        setResult({ text: secret, filename: 'secret.txt' });
    };

    return (
        <div className="card p-30 glass-card text-center grid gap-15">
            <h3>Secret & Password Generator</h3>

            <div className="flex-center gap-15 mb-10">
                <label className="smallest opacity-6 uppercase">Length: {length}</label>
                <input type="range" min="4" max="64" value={length} onChange={e=>setLength(parseInt(e.target.value))} className="flex-1" />
            </div>

            <div className="grid grid-2-cols gap-10">
                {Object.keys(options).map(key => (
                    <label key={key} className="flex gap-10 items-center cursor-pointer pill p-10 bg-surface border hover-scale transition-all">
                        <input
                            type="checkbox"
                            checked={options[key]}
                            onChange={e => setOptions({...options, [key]: e.target.checked})}
                            style={{ width: '18px', height: '18px' }}
                        />
                        <span className="capitalize small">{key}</span>
                    </label>
                ))}
            </div>

            <button className="btn-primary w-full mt-10" onClick={generate}>
                <span className="material-icons mr-10">security</span>
                Generate Secret
            </button>

            <ToolResult result={result} />
        </div>
    );
};

export default OtpGenerator;
