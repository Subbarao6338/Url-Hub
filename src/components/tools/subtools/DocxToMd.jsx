import React, { useState } from 'react';
import mammoth from 'mammoth';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';
import ToolResult from '../ToolResult';

const DocxToMd = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const convert = async () => {
        if (!file) return;
        setLoading(true);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const { value: html } = await mammoth.convertToHtml({ arrayBuffer });

            const turndownService = new TurndownService({
                headingStyle: 'atx',
                codeBlockStyle: 'fenced'
            });
            turndownService.use(gfm);

            const markdown = turndownService.turndown(html);

            setResult({
                text: markdown,
                filename: file.name.replace(/\.docx?$/i, '.md')
            });
        } catch (e) {
            setResult({ error: 'Conversion failed: ' + e.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card p-30 glass-card text-center grid gap-15">
            <h3>Word to Markdown (.docx → .md)</h3>
            <p className="smallest opacity-6">Convert Word documents to GitHub Flavored Markdown locally.</p>
            <div className="file-input-wrapper">
                <input type="file" id="docx-file" accept=".docx" onChange={e => setFile(e.target.files[0])} />
                <label htmlFor="docx-file" className="file-input-label">{file ? file.name : 'Select .docx File'}</label>
            </div>
            <button className="btn-primary w-full" onClick={convert} disabled={loading || !file}>
                <span className="material-icons mr-10">{loading ? 'sync' : 'transform'}</span>
                {loading ? 'Converting...' : 'Convert to Markdown'}
            </button>
            <ToolResult result={result} />
        </div>
    );
};

export default DocxToMd;
