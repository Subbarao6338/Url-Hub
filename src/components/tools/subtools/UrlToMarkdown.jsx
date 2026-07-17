import React, { useEffect, useRef, useState } from 'react';

const UrlToMarkdown = () => {
    const formRef = useRef(null);
    const [urlVal, setUrlVal] = useState('');

    useEffect(() => {
        const element = formRef.current;
        if (window.htmx && element) {
            window.htmx.process(element);

            const handleError = (evt) => {
                const resultDiv = document.getElementById('markdown-result');
                if (resultDiv) {
                    const statusText = evt.detail.xhr?.statusText || "Connection Refused";
                    const status = evt.detail.xhr?.status || "Network Error";
                    resultDiv.innerHTML = `
                        <div class="result-container animate-fadeIn mt-20 text-left">
                            <div class="card p-20 glass-card flex gap-15 align-center" style="border: 1px solid var(--error); background: rgba(220, 53, 69, 0.1); flex-direction: row; align-items: center;">
                                <span class="material-icons text-danger" style="font-size: 2rem;">error_outline</span>
                                <div>
                                    <h5 class="text-danger" style="margin: 0; font-weight: bold;">Conversion Failed (${status})</h5>
                                    <p class="small" style="margin: 5px 0 0 0; color: var(--text-primary);">Failed to convert page to Markdown: ${statusText}. Please verify the URL and your connection.</p>
                                </div>
                            </div>
                        </div>
                    `;
                }
            };

            element.addEventListener('htmx:responseError', handleError);
            element.addEventListener('htmx:sendError', handleError);

            return () => {
                element.removeEventListener('htmx:responseError', handleError);
                element.removeEventListener('htmx:sendError', handleError);
            };
        }
    }, []);

    const handleClear = () => {
        setUrlVal('');
        const resultDiv = document.getElementById('markdown-result');
        if (resultDiv) resultDiv.innerHTML = '';
    };

    return (
        <div ref={formRef} className="card p-30 glass-card text-center grid gap-15 animate-fadeIn">
            <h3 className="m-0 flex-center gap-10">
                <span className="material-icons" style={{ color: 'var(--brand-accent)' }}>summarize</span>
                Web URL to Markdown
            </h3>
            <p className="smallest opacity-6 mb-10">Convert any webpage, article, or online documentation into clean GitHub Flavored Markdown.</p>

            <form
                hx-post="/api/utils/url-to-markdown"
                hx-target="#markdown-result"
                hx-indicator="#loading-indicator"
                onSubmit={(e) => e.preventDefault()}
                style={{ width: '100%' }}
                className="grid gap-15"
            >
                <div className="form-group text-left">
                    <label className="smallest opacity-6 uppercase ml-10">Webpage URL</label>
                    <input
                        type="url"
                        name="url"
                        className="pill w-full text-center font-mono"
                        placeholder="https://example.com/blog-post"
                        required
                        value={urlVal}
                        onChange={e => setUrlVal(e.target.value)}
                    />
                </div>
                <div className="flex gap-10">
                    <button type="submit" className="btn-primary flex-1">
                        Convert to Markdown
                    </button>
                    {urlVal && (
                        <button type="button" className="pill" onClick={handleClear} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                            Clear
                        </button>
                    )}
                </div>
            </form>

            <div id="loading-indicator" className="htmx-indicator mt-15 text-center smallest opacity-6 font-bold flex-center gap-10" style={{ justifyContent: 'center' }}>
                <span className="rotating material-icons" style={{ fontSize: '1.2rem' }}>sync</span>
                <span>Fetching and Converting Page...</span>
            </div>

            <div id="markdown-result" style={{ width: '100%' }}></div>
        </div>
    );
};

export default UrlToMarkdown;
