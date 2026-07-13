import React, { useEffect, useRef } from 'react';

const UrlToMarkdown = () => {
    const formRef = useRef(null);

    useEffect(() => {
        if (window.htmx && formRef.current) {
            window.htmx.process(formRef.current);
        }
    }, []);

    return (
        <div ref={formRef} className="card p-30 glass-card text-center grid gap-15">
            <h3>Web URL to Markdown</h3>
            <p className="smallest opacity-6">Convert any webpage or article into clean GitHub Flavored Markdown.</p>

            <form
                hx-post="/api/utils/url-to-markdown"
                hx-target="#markdown-result"
                hx-indicator="#loading-indicator"
                onSubmit={(e) => e.preventDefault()}
                style={{ width: '100%' }}
            >
                <input
                    type="url"
                    name="url"
                    className="pill w-full mb-15"
                    placeholder="https://example.com/blog-post"
                    required
                    style={{ textAlign: 'center' }}
                />
                <button type="submit" className="btn-primary w-full">
                    Convert to Markdown
                </button>
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
