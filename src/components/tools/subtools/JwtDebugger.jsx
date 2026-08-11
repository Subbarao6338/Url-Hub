import React, { useState, useEffect } from 'react';
import ToolResult from '../ToolResult';

// Base64Url Helpers with proper UTF-8 handling
function base64urlEncode(str) {
    try {
        const base64 = btoa(unescape(encodeURIComponent(str)));
        return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    } catch (e) {
        return '';
    }
}

function base64urlDecode(str) {
    try {
        let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        while (base64.length % 4) {
            base64 += '=';
        }
        return decodeURIComponent(escape(atob(base64)));
    } catch (e) {
        throw new Error('Base64Url decoding failed: ' + e.message);
    }
}

function bufferToBase64Url(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    const base64 = btoa(binary);
    return base64.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

const JWT_PRESETS = {
    oauth: {
        name: 'OAuth 2.0 Access Token',
        header: { alg: 'HS256', typ: 'JWT' },
        payload: {
            iss: 'https://auth.epic-toolbox.com/',
            sub: 'usr_998234',
            aud: 'https://api.epic-toolbox.com/v1',
            exp: 1893456000,
            nbf: 1700000000,
            scope: 'read:write admin'
        },
        secret: 'super-secure-jwt-secret-epic-toolbox-2026'
    },
    session: {
        name: 'User Session Token',
        header: { alg: 'HS256', typ: 'JWT' },
        payload: {
            sub: '1234567890',
            name: 'John Doe',
            admin: true,
            iat: 1516239022
        },
        secret: 'my-awesome-secret-key-12345'
    }
};

const JwtDebugger = () => {
    // Paste/Decoder State
    const [pastedToken, setPastedToken] = useState('');
    const [decodedHeader, setDecodedHeader] = useState(null);
    const [decodedPayload, setDecodedPayload] = useState(null);
    const [verifySecret, setVerifySecret] = useState('super-secure-jwt-secret-epic-toolbox-2026');
    const [verificationStatus, setVerificationStatus] = useState({ status: 'idle', message: '' });

    // Generator State
    const [selectedPreset, setSelectedPreset] = useState('oauth');
    const [genHeaderStr, setGenHeaderStr] = useState(JSON.stringify(JWT_PRESETS.oauth.header, null, 2));
    const [genPayloadStr, setGenPayloadStr] = useState(JSON.stringify(JWT_PRESETS.oauth.payload, null, 2));
    const [genSecret, setGenSecret] = useState(JWT_PRESETS.oauth.secret);
    const [generatedToken, setGeneratedToken] = useState('');
    const [genError, setGenError] = useState('');

    const [activeTab, setActiveTab] = useState('decode'); // 'decode' or 'generate'

    // Automatically decode and verify whenever pastedToken or verifySecret changes
    useEffect(() => {
        if (!pastedToken) {
            setDecodedHeader(null);
            setDecodedPayload(null);
            setVerificationStatus({ status: 'idle', message: '' });
            return;
        }

        const parts = pastedToken.split('.');
        if (parts.length !== 3) {
            setDecodedHeader(null);
            setDecodedPayload(null);
            setVerificationStatus({ status: 'invalid', message: 'Malformed Token: Must have exactly 3 segments separated by dots.' });
            return;
        }

        try {
            const h = JSON.parse(base64urlDecode(parts[0]));
            const p = JSON.parse(base64urlDecode(parts[1]));
            setDecodedHeader(h);
            setDecodedPayload(p);

            // Verify signature locally if alg is HS256
            const alg = h.alg || 'HS256';
            if (alg.toUpperCase() === 'HS256') {
                const unsignedToken = parts[0] + '.' + parts[1];
                const encoder = new TextEncoder();
                crypto.subtle.importKey(
                    'raw',
                    encoder.encode(verifySecret),
                    { name: 'HMAC', hash: { name: 'SHA-256' } },
                    false,
                    ['sign']
                ).then(cryptoKey => {
                    return crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(unsignedToken));
                }).then(signatureBuffer => {
                    const expectedSig = bufferToBase64Url(signatureBuffer);
                    if (expectedSig === parts[2]) {
                        setVerificationStatus({ status: 'valid', message: 'Signature Verified successfully!' });
                    } else {
                        setVerificationStatus({ status: 'invalid', message: 'Invalid Signature: Does not match the secret key.' });
                    }
                }).catch(err => {
                    setVerificationStatus({ status: 'invalid', message: 'Verification error: ' + err.message });
                });
            } else {
                setVerificationStatus({ status: 'unknown', message: `Signature verification not supported for algorithm: ${alg}. Supported locally: HS256.` });
            }
        } catch (e) {
            setDecodedHeader(null);
            setDecodedPayload(null);
            setVerificationStatus({ status: 'invalid', message: 'Decoding failed: ' + e.message });
        }
    }, [pastedToken, verifySecret]);

    // Apply presets
    const handlePresetChange = (presetKey) => {
        setSelectedPreset(presetKey);
        const preset = JWT_PRESETS[presetKey];
        if (preset) {
            setGenHeaderStr(JSON.stringify(preset.header, null, 2));
            setGenPayloadStr(JSON.stringify(preset.payload, null, 2));
            setGenSecret(preset.secret);
            setGenError('');
        }
    };

    // Load sample preset into decoder
    const loadSampleToDecoder = (presetKey) => {
        const preset = JWT_PRESETS[presetKey];
        if (preset) {
            const hStr = JSON.stringify(preset.header);
            const pStr = JSON.stringify(preset.payload);
            const secret = preset.secret;
            setVerifySecret(secret);

            // Generate token for decoder
            const unsigned = base64urlEncode(hStr) + '.' + base64urlEncode(pStr);
            const encoder = new TextEncoder();
            crypto.subtle.importKey(
                'raw',
                encoder.encode(secret),
                { name: 'HMAC', hash: { name: 'SHA-256' } },
                false,
                ['sign']
            ).then(cryptoKey => {
                return crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(unsigned));
            }).then(sigBuffer => {
                const sig = bufferToBase64Url(sigBuffer);
                setPastedToken(unsigned + '.' + sig);
            }).catch(e => {
                console.error(e);
            });
        }
    };

    // Generate Token
    const handleGenerate = async () => {
        setGenError('');
        setGeneratedToken('');
        try {
            // Validate JSON syntax first
            let hObj, pObj;
            try {
                hObj = JSON.parse(genHeaderStr);
            } catch (e) {
                throw new Error('Header JSON is invalid: ' + e.message);
            }
            try {
                pObj = JSON.parse(genPayloadStr);
            } catch (e) {
                throw new Error('Payload JSON is invalid: ' + e.message);
            }

            const hB64 = base64urlEncode(JSON.stringify(hObj));
            const pB64 = base64urlEncode(JSON.stringify(pObj));
            const unsigned = hB64 + '.' + pB64;

            const alg = hObj.alg || 'HS256';
            if (alg.toUpperCase() !== 'HS256') {
                throw new Error('Unsupported signature algorithm in Header. Currently HS256 is supported.');
            }

            const encoder = new TextEncoder();
            const cryptoKey = await crypto.subtle.importKey(
                'raw',
                encoder.encode(genSecret),
                { name: 'HMAC', hash: { name: 'SHA-256' } },
                false,
                ['sign']
            );
            const sigBuffer = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(unsigned));
            const sig = bufferToBase64Url(sigBuffer);

            setGeneratedToken(unsigned + '.' + sig);
        } catch (e) {
            setGenError(e.message);
        }
    };

    // Split token visualization helper
    const renderTokenVisual = () => {
        if (!pastedToken) return null;
        const parts = pastedToken.split('.');
        return (
            <div className="font-mono break-all text-sm p-15 rounded bg-surface" style={{ lineHeight: '1.6', border: '1px solid var(--border-color)' }}>
                <span style={{ color: 'var(--brand-danger, #e056fd)', fontWeight: 'bold' }}>{parts[0]}</span>
                {parts[1] && <span style={{ color: 'var(--text-primary)' }}>.</span>}
                {parts[1] && <span style={{ color: 'var(--brand-accent, #3867d6)', fontWeight: 'bold' }}>{parts[1]}</span>}
                {parts[2] && <span style={{ color: 'var(--text-primary)' }}>.</span>}
                {parts[2] && <span style={{ color: 'var(--brand-success, #20bf6b)', fontWeight: 'bold' }}>{parts[2]}</span>}
            </div>
        );
    };

    return (
        <div className="card p-30 glass-card grid gap-20 animate-fadeIn">
            <h3 className="text-center">JSON Web Token (JWT) Workstation</h3>
            <p className="smallest opacity-6 text-center mb-15">
                Inspect, decode, sign, verify, and generate secure client-side JSON Web Tokens locally in your browser.
            </p>

            {/* Segmented controls / Tabs */}
            <div className="tabs-container flex gap-10 mb-15">
                <button
                    className={`btn-tab flex-1 ${activeTab === 'decode' ? 'btn-primary' : 'pill'}`}
                    onClick={() => setActiveTab('decode')}
                >
                    <span className="material-icons align-middle mr-5">troubleshoot</span>
                    Decode & Verify
                </button>
                <button
                    className={`btn-tab flex-1 ${activeTab === 'generate' ? 'btn-primary' : 'pill'}`}
                    onClick={() => setActiveTab('generate')}
                >
                    <span className="material-icons align-middle mr-5">rate_review</span>
                    Generate & Sign
                </button>
            </div>

            {activeTab === 'decode' ? (
                <div className="grid gap-20 animate-fadeIn">
                    {/* Presets load button */}
                    <div className="flex gap-10 align-center">
                        <span className="smallest opacity-6 font-bold">Try Sample Token:</span>
                        <button className="pill text-xs py-5 px-10" onClick={() => loadSampleToDecoder('oauth')}>OAuth Access</button>
                        <button className="pill text-xs py-5 px-10" onClick={() => loadSampleToDecoder('session')}>Session Token</button>
                    </div>

                    <div className="form-group">
                        <label className="smallest opacity-6 uppercase font-bold ml-10">Paste Encoded Token (JWT)</label>
                        <textarea
                            className="pill w-full font-mono mt-5"
                            rows="4"
                            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIi... (paste token here)"
                            value={pastedToken}
                            onChange={e => setPastedToken(e.target.value.trim())}
                            style={{ borderRadius: '12px', padding: '12px' }}
                        />
                    </div>

                    {renderTokenVisual()}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-15">
                        <div className="form-group">
                            <label className="smallest opacity-6 uppercase font-bold ml-10">HMAC Verification Secret</label>
                            <input
                                type="text"
                                className="pill w-full font-mono mt-5"
                                placeholder="Signature key / secret"
                                value={verifySecret}
                                onChange={e => setVerifySecret(e.target.value)}
                            />
                        </div>

                        {/* Signature verification badge */}
                        <div className="flex align-end">
                            {verificationStatus.status !== 'idle' && (
                                <div className={`p-15 rounded flex align-center w-full ${
                                    verificationStatus.status === 'valid'
                                        ? 'bg-success text-success-content'
                                        : verificationStatus.status === 'invalid'
                                        ? 'bg-danger text-danger-content'
                                        : 'bg-surface border'
                                }`} style={{
                                    border: '1px solid',
                                    borderColor: verificationStatus.status === 'valid' ? '#20bf6b' : verificationStatus.status === 'invalid' ? '#e056fd' : 'var(--border-color)',
                                    borderRadius: '12px',
                                    color: 'var(--text-primary)',
                                    backgroundColor: 'var(--bg-surface)'
                                }}>
                                    <span className="material-icons mr-10" style={{
                                        color: verificationStatus.status === 'valid' ? '#20bf6b' : '#e056fd'
                                    }}>
                                        {verificationStatus.status === 'valid' ? 'verified_user' : 'gpp_maybe'}
                                    </span>
                                    <div>
                                        <div className="font-bold small">
                                            {verificationStatus.status === 'valid' ? 'Signature Verified' : 'Verification Issue'}
                                        </div>
                                        <div className="smallest opacity-8">{verificationStatus.message}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                        {/* Header Output */}
                        <div className="card bg-surface p-15" style={{ border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                            <div className="flex-between align-center mb-10">
                                <span className="smallest font-bold uppercase" style={{ color: 'var(--brand-danger, #e056fd)' }}>Header (Algorithm & Type)</span>
                                {decodedHeader && (
                                    <button
                                        className="pill text-xs py-5 px-10"
                                        onClick={() => navigator.clipboard.writeText(JSON.stringify(decodedHeader, null, 2))}
                                    >
                                        Copy
                                    </button>
                                )}
                            </div>
                            <pre className="font-mono text-xs overflow-auto" style={{ maxHeight: '200px', margin: 0, padding: '10px', background: 'rgba(0,0,0,0.03)', borderRadius: '8px' }}>
                                {decodedHeader ? JSON.stringify(decodedHeader, null, 2) : 'Paste token to view decoded header'}
                            </pre>
                        </div>

                        {/* Payload Output */}
                        <div className="card bg-surface p-15" style={{ border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                            <div className="flex-between align-center mb-10">
                                <span className="smallest font-bold uppercase" style={{ color: 'var(--brand-accent, #3867d6)' }}>Payload (Claims / Data)</span>
                                {decodedPayload && (
                                    <button
                                        className="pill text-xs py-5 px-10"
                                        onClick={() => navigator.clipboard.writeText(JSON.stringify(decodedPayload, null, 2))}
                                    >
                                        Copy
                                    </button>
                                )}
                            </div>
                            <pre className="font-mono text-xs overflow-auto" style={{ maxHeight: '200px', margin: 0, padding: '10px', background: 'rgba(0,0,0,0.03)', borderRadius: '8px' }}>
                                {decodedPayload ? JSON.stringify(decodedPayload, null, 2) : 'Paste token to view decoded claims'}
                            </pre>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="grid gap-20 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                        {/* Preset & Secret controls */}
                        <div className="form-group">
                            <label className="smallest opacity-6 uppercase font-bold ml-10">Select Template Preset</label>
                            <select
                                className="pill w-full mt-5"
                                value={selectedPreset}
                                onChange={e => handlePresetChange(e.target.value)}
                            >
                                <option value="oauth">OAuth 2.0 Access Token</option>
                                <option value="session">User Session Token</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="smallest opacity-6 uppercase font-bold ml-10">HMAC Signing Secret Key</label>
                            <input
                                type="text"
                                className="pill w-full font-mono mt-5"
                                placeholder="secret key"
                                value={genSecret}
                                onChange={e => setGenSecret(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-20">
                        {/* Header Editor */}
                        <div className="form-group">
                            <label className="smallest opacity-6 uppercase font-bold ml-10">Edit Header JSON</label>
                            <textarea
                                className="pill w-full font-mono mt-5"
                                rows="6"
                                value={genHeaderStr}
                                onChange={e => setGenHeaderStr(e.target.value)}
                                style={{ borderRadius: '12px', padding: '12px', fontSize: '12px' }}
                            />
                        </div>

                        {/* Payload Editor */}
                        <div className="form-group">
                            <label className="smallest opacity-6 uppercase font-bold ml-10">Edit Payload JSON</label>
                            <textarea
                                className="pill w-full font-mono mt-5"
                                rows="6"
                                value={genPayloadStr}
                                onChange={e => setGenPayloadStr(e.target.value)}
                                style={{ borderRadius: '12px', padding: '12px', fontSize: '12px' }}
                            />
                        </div>
                    </div>

                    {genError && (
                        <div className="p-10 rounded text-center small animate-fadeIn bg-danger" style={{ color: 'var(--text-primary)', border: '1px solid #e056fd' }}>
                            <span className="material-icons align-middle mr-5" style={{ fontSize: '1.1rem', color: '#e056fd' }}>error_outline</span>
                            <span className="font-bold">{genError}</span>
                        </div>
                    )}

                    <button className="btn-primary w-full py-12" onClick={handleGenerate}>
                        <span className="material-icons align-middle mr-5">lock</span>
                        Generate & Sign JWT Token
                    </button>

                    {generatedToken && (
                        <div className="animate-fadeIn mt-10">
                            <ToolResult
                                result={{
                                    text: generatedToken,
                                    filename: 'signed_token.txt',
                                    copyText: generatedToken
                                }}
                                onClear={() => setGeneratedToken('')}
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default JwtDebugger;
