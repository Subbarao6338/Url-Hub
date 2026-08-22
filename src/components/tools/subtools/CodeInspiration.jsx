import React, { useState } from 'react';
import ToolResult from '../ToolResult';
import { copyToClipboard } from '../../../utils/helpers';

const CodeInspiration = () => {
    const [category, setCategory] = useState('All');
    const [copiedName, setCopiedName] = useState(null);

    const snippets = [
        {
            name: 'Debounce Function',
            cat: 'Utils',
            code: "const debounce = (fn, ms) => {\n  let timeoutId;\n  return (...args) => {\n    clearTimeout(timeoutId);\n    timeoutId = setTimeout(() => fn.apply(this, args), ms);\n  };\n};"
        },
        {
            name: 'Fetch with Timeout',
            cat: 'Web',
            code: "const fetchWithTimeout = async (url, options, timeout = 5000) => {\n  const controller = new AbortController();\n  const id = setTimeout(() => controller.abort(), timeout);\n  const response = await fetch(url, {\n    ...options,\n    signal: controller.signal\n  });\n  clearTimeout(id);\n  return response;\n};"
        },
        {
            name: 'Deep Clone (Simple)',
            cat: 'Utils',
            code: "const deepClone = obj => JSON.parse(JSON.stringify(obj));"
        },
        {
            name: 'Custom Hook: useLocalStorage',
            cat: 'React',
            code: "function useLocalStorage(key, initialValue) {\n  const [storedValue, setStoredValue] = useState(() => {\n    try {\n      const item = window.localStorage.getItem(key);\n      return item ? JSON.parse(item) : initialValue;\n    } catch (error) {\n      return initialValue;\n    }\n  });\n\n  const setValue = value => {\n    try {\n      const valueToStore = value instanceof Function ? value(storedValue) : value;\n      setStoredValue(valueToStore);\n      window.localStorage.setItem(key, JSON.stringify(valueToStore));\n    } catch (error) {\n      console.log(error);\n    }\n  };\n\n  return [storedValue, setValue];\n}"
        },
        {
            name: 'Glassmorphism CSS',
            cat: 'CSS',
            code: ".glass {\n  background: rgba(255, 255, 255, 0.2);\n  border-radius: 16px;\n  box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);\n  backdrop-filter: blur(5px);\n  -webkit-backdrop-filter: blur(5px);\n  border: 1px solid rgba(255, 255, 255, 0.3);\n}"
        },
        {
            name: 'Array Group By',
            cat: 'Utils',
            code: "const groupBy = (arr, key) => {\n  return arr.reduce((acc, item) => {\n    (acc[item[key]] = acc[item[key]] || []).push(item);\n    return acc;\n  }, {});\n};"
        }
    ];

    const handleCopy = (snippet) => {
        copyToClipboard(snippet.code, () => {
            setCopiedName(snippet.name);
            setTimeout(() => setCopiedName(null), 2500);
        });
    };

    const filtered = category === 'All' ? snippets : snippets.filter(s => s.cat === category);
    const categories = ['All', ...new Set(snippets.map(s => s.cat))];

    return (
        <div className="grid gap-15">
            <div className="pill-group scrollable-x">
                {categories.map(c => (
                    <button key={c} className={`pill ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>
                        {c}
                    </button>
                ))}
            </div>
            <div className="grid gap-15">
                {filtered.map(s => (
                    <div key={s.name} className="card p-20 glass-card">
                        <div className="flex-between mb-15">
                            <div>
                                <h4 style={{margin: 0}}>{s.name}</h4>
                                <span className="badge smallest mt-5" style={{opacity: 0.7}}>{s.cat}</span>
                            </div>
                            <button className="pill" style={{fontSize: '0.7rem'}} onClick={() => handleCopy(s)}>
                                <span className="material-icons v-middle mr-5" style={{fontSize: '1rem'}}>
                                    {copiedName === s.name ? 'check' : 'content_copy'}
                                </span>
                                {copiedName === s.name ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                        <pre className="smallest font-mono opacity-8 p-15 bg-surface rounded-lg border" style={{maxHeight: '200px', overflow: 'auto'}}>{s.code}</pre>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CodeInspiration;
