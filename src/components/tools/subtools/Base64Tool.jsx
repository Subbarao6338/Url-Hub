import React, { useState } from 'react';
import ToolResult from '../ToolResult';

const Base64Tool = () => {
    const [input, setInput] = useState('');
    const [file, setFile] = useState(null);
    const [result, setResult] = useState(null);

    const encodeText = () => {
        try {
            if (!input) return;
            setResult({ text: btoa(input), filename: 'encoded.txt' });
        } catch (e) {
            setResult({ error: 'Text encoding failed: ' + e.message });
        }
    };

    const decodeText = () => {
        try {
            if (!input) return;
            setResult({ text: atob(input), filename: 'decoded.txt' });
        } catch (e) {
            setResult({ error: 'Text decoding failed: ' + e.message + ' (Check if input is valid Base64)' });
        }
    };

    const encodeFile = () => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target.result;
            setResult({ text: base64, filename: 'file_base64.txt' });
        };
        reader.onerror = () => setResult({ error: 'File reading failed.' });
        reader.readAsDataURL(file);
    };

    return (
        <div className="card p-30 glass-card grid gap-15">
            <h3>Base64 Text Tool</h3>
            <textarea className="pill w-full font-mono" rows="6" placeholder="Enter text to encode/decode..." value={input} onChange={e=>setInput(e.target.value)} />
            <div className="grid grid-2-cols gap-10">
                <button className="btn-primary" onClick={encodeText}>Encode Text</button>
                <button className="pill" onClick={decodeText}>Decode Text</button>
            </div>

            <hr className="my-10 opacity-2" />

            <h3>File to Base64</h3>
            <div className="file-input-wrapper">
                <input type="file" id="b64-file" onChange={e => setFile(e.target.files[0])} />
                <label htmlFor="b64-file" className="file-input-label">{file ? file.name : 'Choose File'}</label>
            </div>
            <button className="btn-primary w-full" onClick={encodeFile} disabled={!file}>Convert File to Base64</button>

            <ToolResult result={result} />
        </div>
    );
};

export default Base64Tool;
