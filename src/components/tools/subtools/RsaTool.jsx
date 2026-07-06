import React, { useState } from 'react';
import ToolResult from '../ToolResult';

const RsaTool = () => {
    const [keySize, setKeySize] = useState(2048);
    const [keys, setKeys] = useState({ publicKey: '', privateKey: '' });
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const arrayBufferToBase64 = (buffer) => {
        let binary = '';
        const bytes = new Uint8Array(buffer);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return window.btoa(binary);
    };

    const formatPEM = (base64, type) => {
        const header = `-----BEGIN ${type}-----`;
        const footer = `-----END ${type}-----`;
        let pem = header + '\n';
        for (let i = 0; i < base64.length; i += 64) {
            pem += base64.substring(i, i + 64) + '\n';
        }
        pem += footer;
        return pem;
    };

    const generateKeys = async () => {
        setLoading(true);
        setResult(null);
        try {
            const keyPair = await window.crypto.subtle.generateKey(
                {
                    name: "RSA-OAEP",
                    modulusLength: keySize,
                    publicExponent: new Uint8Array([1, 0, 1]),
                    hash: "SHA-256",
                },
                true,
                ["encrypt", "decrypt"]
            );

            const exportedPublic = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
            const exportedPrivate = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

            setKeys({
                publicKey: formatPEM(arrayBufferToBase64(exportedPublic), "PUBLIC KEY"),
                privateKey: formatPEM(arrayBufferToBase64(exportedPrivate), "PRIVATE KEY")
            });
            setResult({ success: true, text: 'RSA Key Pair Generated Successfully!' });
        } catch (e) {
            setResult({ error: 'Failed to generate keys: ' + e.message });
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text, type) => {
        navigator.clipboard.writeText(text);
        setResult({ success: true, text: `${type} copied to clipboard!` });
        setTimeout(() => setResult(null), 2000);
    };

    return (
        <div className="card p-30 glass-card grid gap-20">
            <div className="flex-between">
                <h3 className="m-0">RSA Key Pair Generator</h3>
                <div className="pill-group">
                    {[1024, 2048, 4096].map(size => (
                        <button
                            key={size}
                            className={`pill ${keySize === size ? 'active' : ''}`}
                            onClick={() => setKeySize(size)}
                        >
                            {size} bit
                        </button>
                    ))}
                </div>
            </div>

            <button className="btn-primary w-full" onClick={generateKeys} disabled={loading}>
                <span className="material-icons mr-10">{loading ? 'sync' : 'vpn_key'}</span>
                {loading ? 'Generating...' : 'Generate New RSA Key Pair'}
            </button>

            {keys.publicKey && (
                <div className="grid gap-15">
                    <div className="form-group">
                        <div className="flex-between mb-5">
                            <label>Public Key (SPKI)</label>
                            <span className="material-icons cursor-pointer text-sm" onClick={() => copyToClipboard(keys.publicKey, 'Public Key')}>content_copy</span>
                        </div>
                        <textarea readOnly className="pill w-full font-mono text-xs" rows="8" value={keys.publicKey} />
                    </div>
                    <div className="form-group">
                        <div className="flex-between mb-5">
                            <label>Private Key (PKCS#8)</label>
                            <span className="material-icons cursor-pointer text-sm" onClick={() => copyToClipboard(keys.privateKey, 'Private Key')}>content_copy</span>
                        </div>
                        <textarea readOnly className="pill w-full font-mono text-xs" rows="12" value={keys.privateKey} />
                    </div>
                </div>
            )}

            <ToolResult result={result} />
        </div>
    );
};

export default RsaTool;
