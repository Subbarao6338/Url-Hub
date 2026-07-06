import React, { useState } from 'react';
import ToolResult from '../ToolResult';

const CodeMinifier = () => {
    const [input, setInput] = useState('');
    const [mode, setMode] = useState('js');
    const [result, setResult] = useState(null);

    const minify = () => {
        if (!input.trim()) return;
        try {
            let minified = input;

            if (mode === 'js') {
                minified = minified
                    .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1') // remove comments
                    .replace(/\s+/g, ' ') // collapse whitespace
                    .replace(/ ?([=+\-*/%&|^!<>?:;{},()[\]]) ?/g, '$1') // remove spaces around operators
                    .replace(/;}/g, '}') // remove trailing semicolons in blocks
                    .trim();
            } else if (mode === 'css') {
                minified = minified
                    .replace(/\/\*[\s\S]*?\*\//g, '') // remove comments
                    .replace(/\s+/g, ' ') // collapse whitespace
                    .replace(/ ?([:;{},]) ?/g, '$1') // remove spaces around punctuations
                    .replace(/: /g, ':')
                    .replace(/;}/g, '}') // remove last semicolon
                    .replace(/#([0-9a-f])\1([0-9a-f])\2([0-9a-f])\3/gi, '#$1$2$3') // hex compression
                    .replace(/0px/g, '0') // optimize 0px to 0
                    .replace(/0\./g, '.') // optimize 0.5 to .5
                    .trim();
            } else if (mode === 'html') {
                minified = minified
                    .replace(/<!--[\s\S]*?-->/g, '') // remove comments
                    .replace(/>\s+</g, '><') // remove space between tags
                    .replace(/\s{2,}/g, ' ') // collapse multiple spaces
                    .trim();
            }

            setResult({
                text: minified,
                filename: `minified.${mode}`,
                stats: `Reduced from ${input.length} to ${minified.length} bytes (${Math.round((1 - minified.length/input.length)*100)}% saving)`
            });
        } catch (e) {
            setResult({ error: e.message });
        }
    };

    return (
        <div className="grid gap-15">
            <div className="pill-group">
                <button className={`pill ${mode === 'js' ? 'active' : ''}`} onClick={() => setMode('js')}>JS</button>
                <button className={`pill ${mode === 'css' ? 'active' : ''}`} onClick={() => setMode('css')}>CSS</button>
                <button className={`pill ${mode === 'html' ? 'active' : ''}`} onClick={() => setMode('html')}>HTML</button>
            </div>
            <textarea className="pill w-full font-mono text-xs" rows="12" style={{borderRadius: '16px', padding: '15px'}} placeholder={`Paste ${mode.toUpperCase()} code here...`} value={input} onChange={e=>setInput(e.target.value)} />
            <div className="flex gap-10">
                <button className="btn-primary flex-1" onClick={minify}>
                    <span className="material-icons mr-10">compress</span>
                    Minify {mode.toUpperCase()}
                </button>
                <button className="pill" onClick={() => { setInput(''); setResult(null); }}>Clear</button>
            </div>
            <ToolResult result={result} />
        </div>
    );
};

export default CodeMinifier;
