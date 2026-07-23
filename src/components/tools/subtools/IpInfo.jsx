import React, { useEffect, useRef, useState } from 'react';

const IpInfo = () => {
    const formRef = useRef(null);
    const [ip, setIp] = useState('');

    useEffect(() => {
        const element = formRef.current;
        if (window.htmx && element) {
            window.htmx.process(element);

            const handleError = (evt) => {
                const resultDiv = document.getElementById('ip-result');
                if (resultDiv) {
                    const statusText = evt.detail.xhr?.statusText || "Connection Refused";
                    const status = evt.detail.xhr?.status || "Network Error";
                    resultDiv.innerHTML = `
                        <div class="result-container animate-fadeIn mt-20 text-left">
                            <div class="card p-20 glass-card flex gap-15 align-center" style="border: 1px solid var(--error); background: rgba(220, 53, 69, 0.1); flex-direction: row; align-items: center;">
                                <span class="material-icons text-danger" style="font-size: 2rem;">error_outline</span>
                                <div>
                                    <h5 class="text-danger" style="margin: 0; font-weight: bold;">IP Lookup Failed (${status})</h5>
                                    <p class="small" style="margin: 5px 0 0 0; color: var(--text-primary);">Failed to fetch IP information: ${statusText}. Please verify backend service connectivity and your IP format.</p>
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
        setIp('');
        const resultDiv = document.getElementById('ip-result');
        if (resultDiv) resultDiv.innerHTML = '';
    };

    return (
        <div ref={formRef} className="card p-30 glass-card text-center grid gap-15 animate-fadeIn">
            <h3>IP Information</h3>
            <p className="smallest opacity-6 mb-10">Get detailed location, ISP, ASN, and postal information for any public IP address or your own.</p>

            <form
                hx-get="/api/network/ip-info"
                hx-target="#ip-result"
                hx-indicator="#ip-loading"
                onSubmit={(e) => e.preventDefault()}
                style={{ width: '100%' }}
                className="grid gap-15"
            >
                <div className="form-group text-left">
                    <label className="smallest opacity-6 uppercase ml-10">IP Address (Leave blank for yours)</label>
                    <input
                        type="text"
                        name="ip"
                        className="pill w-full text-center font-mono"
                        placeholder="8.8.8.8"
                        value={ip}
                        onChange={e => setIp(e.target.value)}
                    />
                </div>
                <div className="flex gap-10">
                    <button type="submit" className="btn-primary flex-1">
                        Get IP Info
                    </button>
                    {ip && (
                        <button type="button" className="pill" onClick={handleClear} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                            Clear
                        </button>
                    )}
                </div>
            </form>

            <div id="ip-loading" className="htmx-indicator mt-15 text-center smallest opacity-6 font-bold flex-center gap-10" style={{ justifyContent: 'center' }}>
                <span className="rotating material-icons" style={{ fontSize: '1.2rem' }}>sync</span>
                <span>Fetching IP Information...</span>
            </div>

            <div id="ip-result" style={{ width: '100%' }}></div>
        </div>
    );
};

export default IpInfo;
