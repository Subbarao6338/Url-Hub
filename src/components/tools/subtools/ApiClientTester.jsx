import React, { useState } from 'react';

const ApiClientTester = () => {
    const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/posts/1');
    const [method, setMethod] = useState('GET');
    const [headers, setHeaders] = useState([
        { key: 'Content-Type', value: 'application/json' }
    ]);
    const [body, setBody] = useState('{\n  "title": "foo",\n  "body": "bar",\n  "userId": 1\n}');
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState(null);
    const [activeTab, setActiveTab] = useState('response'); // response, headers, request

    const addHeader = () => {
        setHeaders([...headers, { key: '', value: '' }]);
    };

    const removeHeader = (index) => {
        setHeaders(headers.filter((_, i) => i !== index));
    };

    const handleHeaderChange = (index, field, value) => {
        const updated = [...headers];
        updated[index][field] = value;
        setHeaders(updated);
    };

    const sendRequest = async () => {
        setLoading(true);
        setResponse(null);
        const startTime = performance.now();

        try {
            const requestHeaders = {};
            headers.forEach(h => {
                if (h.key.trim()) {
                    requestHeaders[h.key.trim()] = h.value;
                }
            });

            const config = {
                method,
                headers: requestHeaders
            };

            if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && body.trim()) {
                config.body = body;
            }

            const res = await fetch(url, config);
            const endTime = performance.now();
            const timeElapsed = (endTime - startTime).toFixed(0);

            const responseHeaders = {};
            res.headers.forEach((value, key) => {
                responseHeaders[key] = value;
            });

            let responseData;
            const contentType = res.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                responseData = await res.json();
            } else {
                responseData = await res.text();
            }

            setResponse({
                status: res.status,
                statusText: res.statusText || 'OK',
                ok: res.ok,
                time: timeElapsed,
                headers: responseHeaders,
                data: responseData
            });
        } catch (error) {
            const endTime = performance.now();
            setResponse({
                status: 0,
                statusText: 'Network Error / Failed to fetch',
                ok: false,
                time: (endTime - startTime).toFixed(0),
                headers: {},
                data: error.message || 'The request could not be completed.'
            });
        } finally {
            setLoading(false);
        }
    };

    const clearAll = () => {
        setUrl('');
        setResponse(null);
        setBody('');
        setHeaders([]);
    };

    const copyResponse = () => {
        if (response && response.data) {
            const textToCopy = typeof response.data === 'object'
                ? JSON.stringify(response.data, null, 2)
                : response.data;
            navigator.clipboard.writeText(textToCopy);
            alert('Response data copied to clipboard!');
        }
    };

    return (
        <div className="card p-30 glass-card text-left grid gap-20 animate-fadeIn">
            <div className="flex-between">
                <div>
                    <h3 className="mb-5">REST API Client & Tester</h3>
                    <p className="smallest opacity-6">Perform real HTTP requests, configure custom headers, body payloads, and inspect live responses.</p>
                </div>
                <button className="pill" onClick={clearAll}>
                    <span className="material-icons smallest">clear_all</span> Clear
                </button>
            </div>

            <div className="grid gap-15">
                {/* Method & URL Input */}
                <div className="flex gap-10">
                    <select
                        className="pill select-field font-bold"
                        style={{ width: '120px', padding: '10px 15px' }}
                        value={method}
                        onChange={(e) => setMethod(e.target.value)}
                    >
                        <option value="GET">GET</option>
                        <option value="POST">POST</option>
                        <option value="PUT">PUT</option>
                        <option value="PATCH">PATCH</option>
                        <option value="DELETE">DELETE</option>
                    </select>
                    <input
                        type="url"
                        className="pill flex-1"
                        placeholder="https://api.example.com/v1/resource"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                    />
                    <button
                        className="btn-primary"
                        onClick={sendRequest}
                        disabled={loading || !url}
                        style={{ padding: '10px 25px' }}
                    >
                        {loading ? 'Sending...' : 'Send'}
                    </button>
                </div>

                {/* Sub-tabs for Headers/Body config */}
                <div className="tab-container flex gap-15 border-bottom pb-10 mt-10">
                    <button
                        className={`tab-btn smallest font-bold ${activeTab === 'request' ? 'active text-primary border-bottom-2' : 'opacity-6'}`}
                        onClick={() => setActiveTab('request')}
                    >
                        Request Configuration
                    </button>
                    <button
                        className={`tab-btn smallest font-bold ${activeTab === 'response' ? 'active text-primary border-bottom-2' : 'opacity-6'}`}
                        onClick={() => setActiveTab('response')}
                    >
                        Response Data {response && `(${response.status})`}
                    </button>
                </div>

                {activeTab === 'request' && (
                    <div className="grid gap-15 animate-fadeIn">
                        {/* Headers Section */}
                        <div>
                            <div className="flex-between mb-10">
                                <span className="small font-bold opacity-7">Request Headers</span>
                                <button className="pill smallest" onClick={addHeader}>
                                    <span className="material-icons smallest">add</span> Add Header
                                </button>
                            </div>
                            <div className="grid gap-10">
                                {headers.length === 0 ? (
                                    <div className="smallest opacity-5 p-10 text-center border-dashed">No custom headers defined</div>
                                ) : (
                                    headers.map((header, index) => (
                                        <div key={index} className="flex gap-10 align-center">
                                            <input
                                                className="pill flex-1 font-mono small"
                                                placeholder="Key (e.g. Authorization)"
                                                value={header.key}
                                                onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                                            />
                                            <input
                                                className="pill flex-1 font-mono small"
                                                placeholder="Value"
                                                value={header.value}
                                                onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                                            />
                                            <button className="pill" style={{ padding: '8px' }} onClick={() => removeHeader(index)}>
                                                <span className="material-icons smallest text-error">delete</span>
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Request Body */}
                        {['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && (
                            <div>
                                <div className="small font-bold opacity-7 mb-5">Request Body (JSON, Text, etc.)</div>
                                <textarea
                                    className="pill w-full font-mono text-xs p-15"
                                    style={{ borderRadius: '12px' }}
                                    rows="6"
                                    placeholder='{\n  "key": "value"\n}'
                                    value={body}
                                    onChange={(e) => setBody(e.target.value)}
                                />
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'response' && (
                    <div className="animate-fadeIn">
                        {!response && !loading && (
                            <div className="text-center p-30 opacity-6 border-dashed" style={{ borderRadius: '16px' }}>
                                <span className="material-icons text-3xl mb-10">send</span>
                                <div>Click "Send" to trigger the request and view the response.</div>
                            </div>
                        )}

                        {loading && (
                            <div className="text-center p-40 card">
                                <div className="rotating material-icons text-3xl text-primary mb-10">refresh</div>
                                <div className="small font-bold">Sending request to {url}...</div>
                            </div>
                        )}

                        {response && (
                            <div className="grid gap-15">
                                {/* Status and details */}
                                <div className="flex gap-15 align-center bg-card p-15" style={{ borderRadius: '12px' }}>
                                    <div>
                                        <span className="smallest opacity-6 block">STATUS</span>
                                        <span className={`font-bold font-mono ${response.ok ? 'text-success' : 'text-error'}`}>
                                            {response.status} {response.statusText}
                                        </span>
                                    </div>
                                    <div className="border-left pl-15">
                                        <span className="smallest opacity-6 block">TIME</span>
                                        <span className="font-bold font-mono">{response.time} ms</span>
                                    </div>
                                </div>

                                {/* Response headers accordion or listing */}
                                {Object.keys(response.headers).length > 0 && (
                                    <details className="card" style={{ border: 'none', background: 'rgba(0,0,0,0.05)' }}>
                                        <summary className="small font-bold p-10 cursor-pointer select-none">
                                            Response Headers ({Object.keys(response.headers).length})
                                        </summary>
                                        <div className="p-10 font-mono smallest grid gap-5">
                                            {Object.entries(response.headers).map(([k, v]) => (
                                                <div key={k} className="flex gap-10">
                                                    <span className="font-bold opacity-6">{k}:</span>
                                                    <span>{v}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </details>
                                )}

                                {/* Response Body view */}
                                <div>
                                    <div className="flex-between mb-5">
                                        <span className="small font-bold opacity-7">Response Body</span>
                                        <button className="pill smallest" onClick={copyResponse}>
                                            <span className="material-icons smallest">content_copy</span> Copy Response
                                        </button>
                                    </div>
                                    <pre className="font-mono text-xs bg-dark p-15 scrollable-x" style={{ borderRadius: '12px', color: '#fff', maxHeight: '350px' }}>
                                        {typeof response.data === 'object'
                                            ? JSON.stringify(response.data, null, 2)
                                            : response.data}
                                    </pre>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApiClientTester;
