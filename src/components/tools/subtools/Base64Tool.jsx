import React, { useState } from 'react';
import ToolResult from '../ToolResult';
import { copyToClipboard } from '../../../utils/helpers';

const Base64Tool = () => {
    const [input, setInput] = useState('');
    const [file, setFile] = useState(null);
    const [result, setResult] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [previewUrl, setPreviewUrl] = useState(null);

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

    // Auto-detect if string is more likely Base64 encoded, or plain text
    const getAutoDetectionMessage = (str) => {
        if (!str) return null;
        const cleaned = str.trim().replace(/\s+/g, '');
        if (cleaned.length < 4) return null;

        const validation = validateBase64(cleaned);
        if (validation.valid) {
            if (/^[a-zA-Z0-9+/=]+$/.test(cleaned)) {
                if (cleaned.includes('=') || cleaned.length > 20) {
                    return { type: 'decode', text: 'Detected Base64 format. You might want to Decode this.' };
                }
            }
        }
        return { type: 'encode', text: 'Detected Plain Text format. You might want to Encode this.' };
    };

    const handleAutoCopy = (textToCopy) => {
        if (textToCopy) {
            copyToClipboard(textToCopy);
        }
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
            setPreviewUrl(null);
            handleAutoCopy(encoded);
        } catch (e) {
            setResult({ error: 'Text encoding failed: ' + e.message });
        }
    };

    const detectAndSetPreview = (text) => {
        const trimmed = text.trim();
        if (trimmed.startsWith('data:image/')) {
            setPreviewUrl(trimmed);
        } else {
            if (trimmed.startsWith('iVBORw0KGgo')) {
                setPreviewUrl(`data:image/png;base64,${trimmed}`);
            } else if (trimmed.startsWith('/9j/')) {
                setPreviewUrl(`data:image/jpeg;base64,${trimmed}`);
            } else if (trimmed.startsWith('R0lGODlh') || trimmed.startsWith('R0lGODdh')) {
                setPreviewUrl(`data:image/gif;base64,${trimmed}`);
            } else if (trimmed.startsWith('UklGR')) {
                setPreviewUrl(`data:image/webp;base64,${trimmed}`);
            } else {
                setPreviewUrl(null);
            }
        }
    };

    const decodeText = () => {
        try {
            if (!input) return;
            const cleanedInput = input.trim();
            const validation = validateBase64(cleanedInput);

            if (!validation.valid) {
                try {
                    const decoded = decodeURIComponent(escape(atob(cleanedInput)));
                    setResult({
                        text: decoded,
                        filename: 'decoded_text.txt',
                        copyText: decoded
                    });
                    detectAndSetPreview(decoded);
                    handleAutoCopy(decoded);
                } catch (err) {
                    setResult({ error: `Text decoding failed. ${validation.reason}` });
                    setPreviewUrl(null);
                }
                return;
            }

            const decoded = decodeURIComponent(escape(atob(cleanedInput)));
            setResult({
                text: decoded,
                filename: 'decoded_text.txt',
                copyText: decoded
            });
            detectAndSetPreview(decoded);
            handleAutoCopy(decoded);
        } catch (e) {
            if (input.trim().startsWith('data:image/')) {
                setPreviewUrl(input.trim());
                setResult({
                    text: 'Image Data URL detected! Image preview loaded below.',
                    filename: 'decoded_image.txt',
                    copyText: input.trim()
                });
                return;
            }
            setResult({ error: 'Text decoding failed: ' + e.message + ' (Check if input is valid Base64)' });
            setPreviewUrl(null);
        }
    };

    const handleFile = (selectedFile) => {
        if (!selectedFile) return;
        setFile(selectedFile);
        setResult(null);
        setPreviewUrl(null);
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
            if (file.type.startsWith('image/')) {
                setPreviewUrl(base64);
            } else {
                setPreviewUrl(null);
            }
            handleAutoCopy(base64);
        };
        reader.onerror = () => setResult({ error: 'File reading failed.' });
        reader.readAsDataURL(file);
    };

    const clearTextSection = () => {
        setInput('');
        setResult(null);
        setPreviewUrl(null);
    };

    const clearFileSection = () => {
        setFile(null);
        setResult(null);
        setPreviewUrl(null);
        const fileInput = document.getElementById('b64-file');
        if (fileInput) fileInput.value = '';
    };

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
    const detection = getAutoDetectionMessage(input);

    const isInputExtremelyLarge = inputBytes > 5 * 1024 * 1024;

    return (
        <div className="card p-30 glass-card grid gap-20 animate-fadeIn">
            <h3 className="text-center">Base64 Text Tool</h3>
            <p className="smallest opacity-6 text-center mb-10">Encode regular text into secure Base64 format or decode existing Base64 back to raw text with full Unicode support.</p>

            <div className="form-group relative">
                <div className="flex-between mb-5">
                    <span className="smallest opacity-6 uppercase ml-10">Input Text</span>
                    {input && (
                        <span className={`smallest mr-10 font-mono ${isInputExtremelyLarge ? 'text-danger font-bold' : 'opacity-6'}`}>
                            {input.length.toLocaleString()} chars | {formatBytes(inputBytes)}
                            {isInputExtremelyLarge && ' (Performance warning: Input exceeds 5MB)'}
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
                        setPreviewUrl(null);
                    }}
                    style={{ borderRadius: '16px', padding: '15px', minHeight: '120px' }}
                />
            </div>

            {detection && (
                <div className="p-10 rounded text-center small animate-fadeIn" style={{
                    background: 'rgba(var(--brand-accent-rgb), 0.08)',
                    border: '1px solid var(--brand-accent)',
                    color: 'var(--text-primary)'
                }}>
                    <span className="material-icons align-middle mr-5" style={{ fontSize: '1.1rem', color: 'var(--brand-accent)' }}>info</span>
                    <span className="font-bold">{detection.text}</span>
                </div>
            )}

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

            {previewUrl && (
                <div className="mt-15 p-15 card bg-surface text-center animate-fadeIn" style={{ border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                    <div className="smallest opacity-6 uppercase font-bold mb-10">Image Preview</div>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <img src={previewUrl} alt="Base64 Preview" style={{ maxWidth: '100%', maxHeight: '250px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} />
                    </div>
                </div>
            )}

            {result && result.text && (
                <div className="mt-15 p-15 card bg-surface flex-between align-center" style={{ border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                    <span className="smallest opacity-6 uppercase font-bold">Result Analytics</span>
                    <span className="smallest opacity-7 font-mono font-bold">
                        Output Size: {result.text.length.toLocaleString()} chars | {formatBytes(resultBytes)}
                    </span>
                </div>
            )}

            <ToolResult result={result} onClear={() => { setResult(null); setPreviewUrl(null); }} />
        </div>
    );
};

export default Base64Tool;
