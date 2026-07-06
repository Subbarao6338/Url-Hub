import React, { useState, useEffect, useCallback } from 'react';
import ToolResult from '../ToolResult';

const PasswordTool = () => {
    const [password, setPassword] = useState('');
    const [length, setLength] = useState(16);
    const [options, setOptions] = useState({
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true
    });
    const [strength, setStrength] = useState({ score: 0, label: 'Very Weak', color: '#ff4d4d' });
    const [result, setResult] = useState(null);

    const generatePassword = useCallback(() => {
        const charSets = {
            uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            lowercase: 'abcdefghijklmnopqrstuvwxyz',
            numbers: '0123456789',
            symbols: '!@#$%^&*()_+~`|}{[]:;?><,./-='
        };

        let charset = '';
        Object.keys(options).forEach(key => {
            if (options[key]) charset += charSets[key];
        });

        if (!charset) {
            setPassword('');
            return;
        }

        let generated = '';
        const array = new Uint32Array(length);
        window.crypto.getRandomValues(array);

        for (let i = 0; i < length; i++) {
            generated += charset.charAt(array[i] % charset.length);
        }

        setPassword(generated);
    }, [length, options]);

    useEffect(() => {
        generatePassword();
    }, [generatePassword]);

    useEffect(() => {
        let score = 0;
        if (password.length > 8) score++;
        if (password.length > 12) score++;
        if (/[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^A-Za-z0-9]/.test(password)) score++;

        const levels = [
            { label: 'Very Weak', color: '#ff4d4d' },
            { label: 'Weak', color: '#ffa64d' },
            { label: 'Medium', color: '#ffff4d' },
            { label: 'Strong', color: '#a6ff4d' },
            { label: 'Very Strong', color: '#4dff4d' }
        ];

        const index = Math.min(score, levels.length - 1);
        setStrength({ score, ...levels[index] });
    }, [password]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(password);
        setResult({ text: 'Password copied to clipboard!', success: true });
        setTimeout(() => setResult(null), 2000);
    };

    return (
        <div className="card p-30 glass-card grid gap-20">
            <div className="flex-between">
                <h3 className="m-0">Secure Password Generator</h3>
                <div className="pill" style={{ backgroundColor: strength.color + '33', color: strength.color, borderColor: strength.color }}>
                    {strength.label}
                </div>
            </div>

            <div className="relative">
                <input
                    type="text"
                    readOnly
                    value={password}
                    className="pill w-full font-mono text-lg text-center"
                    style={{ padding: '15px 50px', letterSpacing: '2px' }}
                />
                <button
                    className="absolute right-10 top-50-translate-y material-icons cursor-pointer"
                    style={{ background: 'none', border: 'none', color: 'var(--primary)' }}
                    onClick={copyToClipboard}
                >
                    content_copy
                </button>
            </div>

            <div className="grid gap-15">
                <div className="form-group">
                    <div className="flex-between mb-5">
                        <label>Password Length: {length}</label>
                    </div>
                    <input
                        type="range"
                        min="8"
                        max="64"
                        value={length}
                        onChange={(e) => setLength(parseInt(e.target.value))}
                        className="w-full"
                    />
                </div>

                <div className="grid grid-cols-2 gap-10">
                    {Object.keys(options).map(key => (
                        <label key={key} className="flex items-center gap-10 cursor-pointer p-10 pill border hover-bg">
                            <input
                                type="checkbox"
                                checked={options[key]}
                                onChange={() => setOptions(prev => ({ ...prev, [key]: !prev[key] }))}
                            />
                            <span className="capitalize">{key}</span>
                        </label>
                    ))}
                </div>

                <button className="btn-primary w-full" onClick={generatePassword}>
                    <span className="material-icons mr-10">refresh</span>
                    Generate New Password
                </button>
            </div>

            <ToolResult result={result} />
        </div>
    );
};

export default PasswordTool;
