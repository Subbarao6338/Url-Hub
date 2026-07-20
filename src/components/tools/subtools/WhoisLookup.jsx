import React, { useEffect, useRef, useState } from 'react';

const WhoisLookup = () => {
    const formRef = useRef(null);
    const [domain, setDomain] = useState('');

    useEffect(() => {
        const element = formRef.current;
        if (window.htmx && element) {
            window.htmx.process(element);

            const handleError = (evt) => {
                const resultDiv = document.getElementById('whois-result');
                if (resultDiv) {
                    const statusText = evt.detail.xhr?.statusText || "Connection Refused";
                    const status = evt.detail.xhr?.status || "Network Error";
                    resultDiv.innerHTML = `
                        <div class="result-container animate-fadeIn mt-20 text-left">
                            <div class="card p-20 glass-card flex gap-15 align-center" style="border: 1px solid var(--error); background: rgba(220, 53, 69, 0.1); flex-direction: row; align-items: center;">
                                <span class="material-icons text-danger" style="font-size: 2rem;">error_outline</span>
                                <div>
                                    <h5 class="text-danger" style="margin: 0; font-weight: bold;">WHOIS Lookup Failed (${status})</h5>
                                    <p class="small" style="margin: 5px 0 0 0; color: var(--text-primary);">Failed to fetch WHOIS records: ${statusText}. Please verify backend service connectivity.</p>
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
        setDomain('');
        const resultDiv = document.getElementById('whois-result');
        if (resultDiv) resultDiv.innerHTML = '';
    };

    return (
        <div ref={formRef} className="card p-30 glass-card text-center grid gap-15 animate-fadeIn">
            <h3>WHOIS Record</h3>
            <p className="smallest opacity-6 mb-10">Look up official domain registration, ownership, registrar, and key dates details.</p>

            <form
                hx-get="/api/network/whois"
                hx-target="#whois-result"
                hx-indicator="#whois-loading"
                onSubmit={(e) => e.preventDefault()}
                style={{ width: '100%' }}
                className="grid gap-15"
            >
                <div className="form-group text-left">
                    <label className="smallest opacity-6 uppercase ml-10">Domain Name</label>
                    <input
                        type="text"
                        name="domain"
                        className="pill w-full text-center"
                        placeholder="example.com"
                        value={domain}
                        onChange={e => setDomain(e.target.value)}
                        required
                    />
                </div>
                <div className="flex gap-10">
                    <button type="submit" className="btn-primary flex-1">
                        Get WHOIS Data
                    </button>
                    {domain && (
                        <button type="button" className="pill" onClick={handleClear} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                            Clear
                        </button>
                    )}
                </div>
            </form>

            <div id="whois-loading" className="htmx-indicator mt-15 text-center smallest opacity-6 font-bold flex-center gap-10" style={{ justifyContent: 'center' }}>
                <span className="rotating material-icons" style={{ fontSize: '1.2rem' }}>sync</span>
                <span>Fetching WHOIS Records...</span>
            </div>

            <div id="whois-result" style={{ width: '100%' }}></div>
        </div>
    );
};

export default WhoisLookup;
