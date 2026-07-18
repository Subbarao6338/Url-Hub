import React, { useState } from 'react';
import ToolResult from '../ToolResult';

const Base64Tool = () => {
    const [input, setInput] = useState('');
    const [file, setFile] = useState(null);
    const [result, setResult] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    // Helpers to compute byte size
    const getByteSize = (str) => {
        if (!str) return 0;
        return new Blob([str]).size;
    };

    const formatBytes = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const validateBase64 = (str) => {
        const cleaned = str.replace(/\s+/g, '');
        if (!cleaned) return { valid: false, reason: 'Input is empty.' };
        if (cleaned.length % 4 !== 0) {
            return { valid: false, reason: 'Invalid length (must be a multiple of 4).' };
        }
        if (!/^[a-zA-Z0-9+/]*={0,2}$/.test(cleaned)) {
            return { valid: false, reason: 'Contains characters outside the Base64 alphabet (A-Z, a-z, 0-9, +, /, =).' };
        }
        return { valid: true };
    };

    const encodeText = () => {
        try {
            if (!input) return;
            const encoded = btoa(unescape(encodeURIComponent(input))); // safe unicode btoa
            setResult({
                text: encoded,
                filename: 'encoded_base64.txt',
                copyText: encoded
            });
        } catch (e) {
            setResult({ error: 'Text encoding failed: ' + e.message });
        }
    };

    const decodeText = () => {
        try {
            if (!input) return;
            const cleanedInput = input.trim();
            const validation = validateBase64(cleanedInput);

            if (!validation.valid) {
                // Try decoding anyway as fallback, but warn if it crashes
                try {
                    const decoded = decodeURIComponent(escape(atob(cleanedInput)));
                    setResult({
                        text: decoded,
                        filename: 'decoded_text.txt',
                        copyText: decoded
                    });
                } catch (err) {
                    setResult({ error: `Text decoding failed. ${validation.reason}` });
                }
                return;
            }

            const decoded = decodeURIComponent(escape(atob(cleanedInput)));
            setResult({
                text: decoded,
                filename: 'decoded_text.txt',
                copyText: decoded
            });
        } catch (e) {
            setResult({ error: 'Text decoding failed: ' + e.message + ' (Check if input is valid Base64)' });
        }
    };

    const handleFile = (selectedFile) => {
        if (!selectedFile) return;
        setFile(selectedFile);
        setResult(null); // Clear previous results
    };

    const encodeFile = () => {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target.result;
            setResult({
                text: base64,
                filename: `${file.name}_base64.txt`,
                copyText: base64
            });
        };
        reader.onerror = () => setResult({ error: 'File reading failed.' });
        reader.readAsDataURL(file);
    };

    const clearTextSection = () => {
        setInput('');
        setResult(null);
    };

    const clearFileSection = () => {
        setFile(null);
        setResult(null);
        const fileInput = document.getElementById('b64-file');
        if (fileInput) fileInput.value = '';
    };

    // Drag & Drop event handlers
    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const inputBytes = getByteSize(input);
    const resultBytes = result && result.text ? getByteSize(result.text) : 0;

    return (
        <div className="card p-30 glass-card grid gap-20">
            <h3 className="text-center">Base64 Text Tool</h3>
            <p className="smallest opacity-6 text-center mb-10">Encode regular text into secure Base64 format or decode existing Base64 back to raw text with full Unicode support.</p>

            <div className="form-group relative">
                <div className="flex-between mb-5">
                    <span className="smallest opacity-6 uppercase ml-10">Input Text</span>
                    {input && (
                        <span className="smallest opacity-6 mr-10 font-mono">
                            {input.length.toLocaleString()} chars | {formatBytes(inputBytes)}
                        </span>
                    )}
                </div>
                <textarea
                    className="pill w-full font-mono"
                    rows="6"
                    placeholder="Enter text to encode or decode..."
                    value={input}
                    onChange={e => {
                        setInput(e.target.value);
                        setResult(null);
                    }}
                    style={{ borderRadius: '16px', padding: '15px', minHeight: '120px' }}
                />
            </div>

            <div className="flex gap-10">
                <button className="btn-primary flex-1" onClick={encodeText} disabled={!input}>
                    Encode Text
                </button>
                <button className="pill flex-1" onClick={decodeText} disabled={!input}>
                    Decode Text
                </button>
                {input && (
                    <button className="pill" onClick={clearTextSection} title="Clear Input" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                        Clear
                    </button>
                )}
            </div>

            <hr className="my-10 opacity-2" />

            <h3 className="text-center">File to Base64 Encoder</h3>
            <p className="smallest opacity-6 text-center mb-10">Convert any file (image, PDF, document, audio) directly into a browser-compatible Base64 Data URL.</p>

            <div
                className={`file-input-wrapper ${isDragging ? 'dragging' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                    border: isDragging ? '2px dashed var(--brand-accent)' : '2px dashed var(--border-color)',
                    backgroundColor: isDragging ? 'rgba(var(--brand-accent-rgb), 0.05)' : 'transparent',
                    borderRadius: '16px',
                    padding: '25px',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease-in-out'
                }}
            >
                <input
                    type="file"
                    id="b64-file"
                    onChange={e => handleFile(e.target.files[0])}
                    style={{ display: 'none' }}
                />
                <label htmlFor="b64-file" style={{ cursor: 'pointer', display: 'block' }}>
                    <span className="material-icons opacity-6" style={{ fontSize: '3rem', marginBottom: '10px' }}>upload_file</span>
                    <div className="font-bold">{file ? file.name : 'Choose File or Drag & Drop here'}</div>
                    <div className="smallest opacity-6 mt-5">
                        {file ? `${formatBytes(file.size)} | ${file.type || 'unknown type'}` : 'Supports all file types'}
                    </div>
                </label>
            </div>

            <div className="flex gap-10">
                <button className="btn-primary flex-1" onClick={encodeFile} disabled={!file}>
                    Convert File to Base64
                </button>
                {file && (
                    <button className="pill" onClick={clearFileSection} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                        Clear
                    </button>
                )}
            </div>

            {result && result.text && (
                <div className="mt-15 p-15 card bg-surface flex-between align-center" style={{ border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                    <span className="smallest opacity-6 uppercase font-bold">Result Analytics</span>
                    <span className="smallest opacity-7 font-mono font-bold">
                        Output Size: {result.text.length.toLocaleString()} chars | {formatBytes(resultBytes)}
                    </span>
                </div>
            )}

            <ToolResult result={result} onClear={() => setResult(null)} />
        </div>
    );
};

export default Base64Tool;
