import React, { useState } from 'react';
import { createWorker } from 'tesseract.js';
import ToolResult from '../ToolResult';

const OcrTool = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState(null);
    const [language, setLanguage] = useState('eng');

    const runOcr = async () => {
        if (!file) return;
        setLoading(true);
        setProgress(0);
        try {
            const worker = await createWorker(language, 1, {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        setProgress(Math.round(m.progress * 100));
                    }
                }
            });
            const { data: { text } } = await worker.recognize(file);
            await worker.terminate();

            setResult({
                text: text,
                filename: 'extracted_text.txt'
            });
        } catch (e) {
            setResult({ error: 'OCR failed: ' + e.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card p-30 glass-card text-center grid gap-15">
            <h3>Image OCR (Optical Character Recognition)</h3>
            <p className="smallest opacity-6">Extract text from images locally using Tesseract.js.</p>

            <div className="grid grid-2-cols gap-10">
                <div className="file-input-wrapper">
                    <input type="file" id="ocr-file" accept="image/*" onChange={e => setFile(e.target.files[0])} />
                    <label htmlFor="ocr-file" className="file-input-label">{file ? file.name : 'Select Image'}</label>
                </div>
                <select className="pill w-full" value={language} onChange={e => setLanguage(e.target.value)}>
                    <option value="eng">English</option>
                    <option value="tel">Telugu</option>
                    <option value="hin">Hindi</option>
                    <option value="spa">Spanish</option>
                    <option value="fra">French</option>
                </select>
            </div>

            <button className="btn-primary w-full" onClick={runOcr} disabled={loading || !file}>
                <span className="material-icons mr-10">{loading ? 'sync' : 'document_scanner'}</span>
                {loading ? `Processing (${progress}%)...` : 'Extract Text'}
            </button>

            <ToolResult result={result} />
        </div>
    );
};

export default OcrTool;
