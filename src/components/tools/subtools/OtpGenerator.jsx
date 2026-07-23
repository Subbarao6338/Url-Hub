import React, { useState } from 'react';
import ToolResult from '../ToolResult';

const OtpGenerator = () => {
    const [mode, setMode] = useState('password'); // 'password' or 'numeric-otp'
    const [length, setLength] = useState(16);
    const [otpLength, setOtpLength] = useState(6);
    const [options, setOptions] = useState({
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true
    });
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const generateLocalPassword = () => {
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

    const generateServerOtp = async () => {
        setLoading(true);
        setResult(null);
        try {
            const res = await fetch(`/api/utils/generate-otp?length=${otpLength}`);
            if (!res.ok) {
                throw new Error(`Server returned status ${res.status}`);
            }
            const data = await res.json();
            if (data && data.otp) {
                setResult({
                    text: data.otp,
                    filename: 'numeric_otp.txt',
                    copyText: data.otp
                });
            } else {
                throw new Error('Failed to generate OTP from backend.');
            }
        } catch (e) {
            setResult({ error: `Server-driven generation failed: ${e.message}. Falling back to local numeric generation.` });
            // Fallback
            let secret = '';
            const array = new Uint32Array(otpLength);
            window.crypto.getRandomValues(array);
            for (let i = 0; i < otpLength; i++) {
                secret += String(array[i] % 10);
            }
            setTimeout(() => {
                setResult({
                    text: secret,
                    filename: 'numeric_otp.txt',
                    copyText: secret
                });
            }, 300);
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setResult(null);
    };

    return (
        <div className="card p-30 glass-card text-center grid gap-20 animate-fadeIn">
            <h3 className="text-center">Secret & Password Generator</h3>
            <p className="smallest opacity-6 text-center mb-10">
                Generate highly secure custom passwords locally, or use our server-driven API to generate secure numeric OTPs.
            </p>

            <div className="pill-group" style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                <button
                    className={`pill ${mode === 'password' ? 'active' : ''}`}
                    onClick={() => { setMode('password'); setResult(null); }}
                    style={{ flex: 1 }}
                >
                    Secure Password
                </button>
                <button
                    className={`pill ${mode === 'numeric-otp' ? 'active' : ''}`}
                    onClick={() => { setMode('numeric-otp'); setResult(null); }}
                    style={{ flex: 1 }}
                >
                    Numeric OTP
                </button>
            </div>

            {mode === 'password' ? (
                <div className="grid gap-15 animate-fadeIn">
                    <div className="flex-center gap-15 mb-10">
                        <label className="smallest opacity-6 uppercase">Length: {length}</label>
                        <input
                            type="range"
                            min="4"
                            max="64"
                            value={length}
                            onChange={e => {
                                setLength(parseInt(e.target.value));
                                setResult(null);
                            }}
                            className="flex-1"
                        />
                    </div>

                    <div className="grid grid-2-cols gap-10">
                        {Object.keys(options).map(key => (
                            <label key={key} className="flex gap-10 items-center cursor-pointer pill p-10 bg-surface border hover-scale transition-all">
                                <input
                                    type="checkbox"
                                    checked={options[key]}
                                    onChange={e => {
                                        setOptions({ ...options, [key]: e.target.checked });
                                        setResult(null);
                                    }}
                                    style={{ width: '18px', height: '18px' }}
                                />
                                <span className="capitalize small">{key}</span>
                            </label>
                        ))}
                    </div>

                    <div className="flex gap-10 mt-10">
                        <button className="btn-primary flex-1" onClick={generateLocalPassword}>
                            <span className="material-icons mr-10 font-bold" style={{ fontSize: '1.2rem' }}>security</span>
                            Generate Password
                        </button>
                        {result && (
                            <button className="pill" onClick={handleClear} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="grid gap-15 animate-fadeIn">
                    <div className="flex-center gap-15 mb-10">
                        <label className="smallest opacity-6 uppercase">OTP Digits: {otpLength}</label>
                        <input
                            type="range"
                            min="4"
                            max="12"
                            value={otpLength}
                            onChange={e => {
                                setOtpLength(parseInt(e.target.value));
                                setResult(null);
                            }}
                            className="flex-1"
                        />
                    </div>

                    <div className="flex gap-10 mt-10">
                        <button className="btn-primary flex-1" onClick={generateServerOtp} disabled={loading}>
                            <span className="material-icons mr-10 font-bold" style={{ fontSize: '1.2rem' }}>vpn_key</span>
                            {loading ? 'Generating...' : 'Generate Numeric OTP'}
                        </button>
                        {(result || loading) && (
                            <button className="pill" onClick={handleClear} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            )}

            <ToolResult result={result} />
        </div>
    );
};

export default OtpGenerator;
