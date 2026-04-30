import React, { useState, useEffect } from 'react';

const SecurityTools = ({ toolId }) => {
  const [activeTab, setActiveTab] = useState('rsa');

  useEffect(() => {
    if (toolId) {
      if (toolId === 'rsa-gen') setActiveTab('rsa');
      else if (toolId === 'hmac-calc') setActiveTab('hmac');
    }
  }, [toolId]);

  return (
    <div className="tool-form">
      {!toolId && (
        <div className="pill-group mb-20 scrollable-x">
          <button className={`pill ${activeTab === 'rsa' ? 'active' : ''}`} onClick={() => setActiveTab('rsa')}>RSA Key Gen</button>
          <button className={`pill ${activeTab === 'hmac' ? 'active' : ''}`} onClick={() => setActiveTab('hmac')}>HMAC Signer</button>
        </div>
      )}

      {activeTab === 'rsa' && <RsaGenerator />}
      {activeTab === 'hmac' && <HmacCalculator />}
    </div>
  );
};

const RsaGenerator = () => {
    const [keys, setKeys] = useState(null);
    const [loading, setLoading] = useState(false);
    const [bitSize, setBitSize] = useState(2048);

    const generateKeys = async () => {
        setLoading(true);
        try {
            const keyPair = await window.crypto.subtle.generateKey(
                {
                    name: "RSA-OAEP",
                    modulusLength: bitSize,
                    publicExponent: new Uint8Array([1, 0, 1]),
                    hash: "SHA-256",
                },
                true,
                ["encrypt", "decrypt"]
            );

            const publicKey = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
            const privateKey = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

            const b2s = (b) => window.btoa(String.fromCharCode(...new Uint8Array(b)));
            const formatKey = (str, label) => `-----BEGIN ${label}-----\n${str.match(/.{1,64}/g).join('\n')}\n-----END ${label}-----`;

            setKeys({
                public: formatKey(b2s(publicKey), "PUBLIC KEY"),
                private: formatKey(b2s(privateKey), "PRIVATE KEY")
            });
        } catch (e) {
            console.error(e);
            alert("Generation failed. Check browser compatibility.");
        }
        setLoading(false);
    };

    const copy = (text) => {
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
    };

    return (
        <div className="grid gap-15">
            <div className="flex-gap">
                <select className="pill flex-1" value={bitSize} onChange={e => setBitSize(parseInt(e.target.value))}>
                    <option value="1024">1024-bit (Fast)</option>
                    <option value="2048">2048-bit (Standard)</option>
                    <option value="4096">4096-bit (Secure)</option>
                </select>
                <button className="btn-primary" onClick={generateKeys} disabled={loading} style={{flex: 2}}>
                    {loading ? 'Generating...' : 'Generate Key Pair'}
                </button>
            </div>

            {keys && (
                <div className="grid gap-15 mt-10">
                    <div className="form-group">
                        <div className="flex-between mb-5">
                            <label className="uppercase tracking-wider opacity-6" style={{fontSize: '0.75rem'}}>Public Key (SPKI)</label>
                            <button className="btn-small pill" style={{padding: '2px 10px', fontSize: '0.7rem'}} onClick={() => copy(keys.public)}>Copy</button>
                        </div>
                        <textarea className="pill w-full font-mono" rows="6" readOnly value={keys.public} style={{fontSize: '0.75rem', lineHeight: '1.2'}} />
                    </div>
                    <div className="form-group">
                        <div className="flex-between mb-5">
                            <label className="uppercase tracking-wider opacity-6" style={{fontSize: '0.75rem'}}>Private Key (PKCS#8)</label>
                            <button className="btn-small pill" style={{padding: '2px 10px', fontSize: '0.7rem'}} onClick={() => copy(keys.private)}>Copy</button>
                        </div>
                        <textarea className="pill w-full font-mono" rows="10" readOnly value={keys.private} style={{fontSize: '0.75rem', lineHeight: '1.2'}} />
                    </div>
                </div>
            )}
            {!keys && !loading && (
                <div className="tool-result text-center opacity-6">
                    Key generation is performed entirely in your browser.<br/>Nothing is ever sent to a server.
                </div>
            )}
        </div>
    );
};

const HmacCalculator = () => {
    const [message, setMessage] = useState('');
    const [key, setKey] = useState('');
    const [algo, setAlgo] = useState('SHA-256');
    const [result, setResult] = useState('');

    const calculate = async () => {
        if (!message || !key) return;
        try {
            const encoder = new TextEncoder();
            const cryptoKey = await window.crypto.subtle.importKey(
                "raw",
                encoder.encode(key),
                { name: "HMAC", hash: algo },
                false,
                ["sign"]
            );
            const signature = await window.crypto.subtle.sign(
                "HMAC",
                cryptoKey,
                encoder.encode(message)
            );
            const hashArray = Array.from(new Uint8Array(signature));
            const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            setResult(hashHex);
        } catch (e) { console.error(e); }
    };

    useEffect(() => { calculate(); }, [message, key, algo]);

    return (
        <div className="grid gap-15">
            <div className="form-group">
                <label className="uppercase tracking-wider opacity-6" style={{fontSize: '0.8rem'}}>Algorithm</label>
                <select className="pill w-full mt-5" value={algo} onChange={e => setAlgo(e.target.value)}>
                    <option value="SHA-1">HMAC-SHA1</option>
                    <option value="SHA-256">HMAC-SHA256</option>
                    <option value="SHA-384">HMAC-SHA384</option>
                    <option value="SHA-512">HMAC-SHA512</option>
                </select>
            </div>
            <div className="form-group">
                <label className="uppercase tracking-wider opacity-6" style={{fontSize: '0.8rem'}}>Secret Key</label>
                <input type="text" className="pill w-full mt-5 font-mono" value={key} onChange={e => setKey(e.target.value)} placeholder="Enter secret key..." />
            </div>
            <div className="form-group">
                <label className="uppercase tracking-wider opacity-6" style={{fontSize: '0.8rem'}}>Message</label>
                <textarea className="pill w-full mt-5" rows="4" value={message} onChange={e => setMessage(e.target.value)} placeholder="Message to sign..." />
            </div>

            {result && (
                <div className="tool-result">
                    <label className="uppercase tracking-wider opacity-6" style={{fontSize: '0.75rem'}}>HMAC Signature (Hex)</label>
                    <div className="mt-10 p-15 bg-nature-mist font-mono" style={{ borderRadius: '12px', border: '1px solid var(--border)', wordBreak: 'break-all', fontSize: '0.9rem' }}>
                        {result}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SecurityTools;
