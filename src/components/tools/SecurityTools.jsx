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
          <button className={`pill ${activeTab === 'rsa' ? 'active' : ''}`} onClick={() => setActiveTab('rsa')}>RSA Gen</button>
          <button className={`pill ${activeTab === 'hmac' ? 'active' : ''}`} onClick={() => setActiveTab('hmac')}>HMAC Calculator</button>
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

    const generateKeys = async () => {
        setLoading(true);
        try {
            const keyPair = await window.crypto.subtle.generateKey(
                {
                    name: "RSA-OAEP",
                    modulusLength: 2048,
                    publicExponent: new Uint8Array([1, 0, 1]),
                    hash: "SHA-256",
                },
                true,
                ["encrypt", "decrypt"]
            );

            const publicKey = await window.crypto.subtle.exportKey("spki", keyPair.publicKey);
            const privateKey = await window.crypto.subtle.exportKey("pkcs8", keyPair.privateKey);

            const b2s = (b) => window.btoa(String.fromCharCode(...new Uint8Array(b)));

            setKeys({
                public: `-----BEGIN PUBLIC KEY-----\n${b2s(publicKey)}\n-----END PUBLIC KEY-----`,
                private: `-----BEGIN PRIVATE KEY-----\n${b2s(privateKey)}\n-----END PRIVATE KEY-----`
            });
        } catch (e) { console.error(e); }
        setLoading(false);
    };

    const copy = (text) => {
        navigator.clipboard.writeText(text);
        alert("Copied!");
    };

    return (
        <div className="grid gap-15">
            <button className="btn-primary w-full" onClick={generateKeys} disabled={loading}>
                {loading ? 'Generating...' : 'Generate 2048-bit RSA Key Pair'}
            </button>
            {keys && (
                <>
                    <div className="form-group">
                        <label>Public Key</label>
                        <textarea className="pill w-full font-mono" rows="5" readOnly value={keys.public} />
                        <button className="btn-small mt-5" onClick={() => copy(keys.public)}>Copy Public</button>
                    </div>
                    <div className="form-group">
                        <label>Private Key</label>
                        <textarea className="pill w-full font-mono" rows="5" readOnly value={keys.private} />
                        <button className="btn-small mt-5" onClick={() => copy(keys.private)}>Copy Private</button>
                    </div>
                </>
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

    return (
        <div className="grid gap-15">
            <div className="form-group">
                <label>Algorithm</label>
                <select className="pill w-full" value={algo} onChange={e => setAlgo(e.target.value)}>
                    <option value="SHA-1">HMAC-SHA1</option>
                    <option value="SHA-256">HMAC-SHA256</option>
                    <option value="SHA-512">HMAC-SHA512</option>
                </select>
            </div>
            <div className="form-group">
                <label>Key</label>
                <input type="text" className="pill w-full" value={key} onChange={e => setKey(e.target.value)} placeholder="Secret Key" />
            </div>
            <div className="form-group">
                <label>Message</label>
                <textarea className="pill w-full" rows="3" value={message} onChange={e => setMessage(e.target.value)} placeholder="Message to sign" />
            </div>
            <button className="btn-primary" onClick={calculate}>Calculate HMAC</button>
            {result && (
                <div className="tool-result">
                    <label>Result (Hex)</label>
                    <div className="copy-box mt-5">
                        <code style={{ wordBreak: 'break-all' }}>{result}</code>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SecurityTools;
