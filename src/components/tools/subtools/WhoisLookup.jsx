import React, { useEffect, useRef, useState } from 'react';

const WhoisLookup = () => {
    const formRef = useRef(null);
    const [domain, setDomain] = useState('');

    useEffect(() => {
        if (window.htmx && formRef.current) {
            window.htmx.process(formRef.current);
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
