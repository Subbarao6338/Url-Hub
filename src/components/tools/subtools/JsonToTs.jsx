import React, { useState } from 'react';
import ToolResult from '../ToolResult';

const JsonToTs = () => {
    const [input, setInput] = useState('');
    const [interfaceName, setInterfaceName] = useState('RootObject');
    const [result, setResult] = useState(null);

    const convert = () => {
        if (!input.trim()) return;
        try {
            const obj = JSON.parse(input);
            const interfaces = new Map();

            const deepMerge = (target, source) => {
                for (const key in source) {
                    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                        if (!target[key]) target[key] = {};
                        deepMerge(target[key], source[key]);
                    } else if (Array.isArray(source[key])) {
                        if (!target[key]) target[key] = [];
                        // For arrays, merge schemas of all objects inside to capture all possible fields
                        if (source[key].length > 0) {
                            source[key].forEach(item => {
                                if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
                                    if (target[key].length === 0) target[key].push({});
                                    deepMerge(target[key][0], item);
                                } else if (target[key].indexOf(item) === -1) {
                                    target[key].push(item);
                                }
                            });
                        }
                    } else {
                        target[key] = source[key];
                    }
                }
                return target;
            };

            const getTypeName = (val, key) => {
                if (val === null) return 'any';
                if (Array.isArray(val)) {
                    if (val.length === 0) return 'any[]';

                    const types = new Set();
                    const objects = [];
                    val.forEach(item => {
                        if (item === null) types.add('null');
                        else if (Array.isArray(item)) types.add('any[]');
                        else if (typeof item === 'object') objects.push(item);
                        else types.add(typeof item);
                    });

                    if (objects.length > 0) {
                        const merged = {};
                        objects.forEach(item => deepMerge(merged, item));
                        const subName = getUniqueInterfaceName(key);
                        generateInterface(merged, subName, objects);
                        types.add(subName);
                    }

                    const typeArray = Array.from(types);
                    if (typeArray.length === 1) return `${typeArray[0]}[]`;
                    return `(${typeArray.join(' | ')})[]`;
                }
                if (typeof val === 'object') {
                    const subName = getUniqueInterfaceName(key);
                    generateInterface(val, subName);
                    return subName;
                }
                return typeof val;
            };

            const getUniqueInterfaceName = (key) => {
                let name = key.charAt(0).toUpperCase() + key.slice(1);
                // Remove non-alphanumeric for interface name
                name = name.replace(/[^a-zA-Z0-9]/g, '');
                if (!name) name = 'Item';

                let uniqueName = name;
                let counter = 1;
                while (interfaces.has(uniqueName)) {
                    uniqueName = `${name}${counter}`;
                    counter++;
                }
                return uniqueName;
            };

            const generateInterface = (o, name, originalArray = null) => {
                if (interfaces.has(name)) return;
                // Add a placeholder to handle circular references if they were possible (though JSON isn't circular)
                interfaces.set(name, '');

                let str = `interface ${name} {\n`;
                const entries = Object.entries(o);

                if (entries.length === 0) {
                    str += '  [key: string]: any;\n';
                } else {
                    entries.forEach(([k, v]) => {
                        const type = getTypeName(v, k);
                        const isOptional = originalArray && originalArray.some(item => item && typeof item === 'object' && item[k] === undefined);
                        str += `  ${k}${isOptional ? '?' : ''}: ${type};\n`;
                    });
                }
                str += '}\n';
                interfaces.set(name, str);
            };

            if (Array.isArray(obj)) {
                if (obj.length > 0 && typeof obj[0] === 'object' && obj[0] !== null && !Array.isArray(obj[0])) {
                    const merged = {};
                    obj.forEach(item => {
                        if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
                            deepMerge(merged, item);
                        }
                    });
                    generateInterface(merged, interfaceName, obj);
                } else {
                    const type = obj.length > 0 ? (Array.isArray(obj[0]) ? 'any[]' : typeof obj[0]) : 'any';
                    setResult({ text: `type ${interfaceName} = ${type}[];`, filename: 'types.ts' });
                    return;
                }
            } else {
                generateInterface(obj, interfaceName);
            }

            let finalTs = '';
            // Sort by dependency (simple reverse map order often works for simple cases)
            Array.from(interfaces.values()).reverse().forEach(inter => {
                finalTs += inter + '\n';
            });

            setResult({ text: finalTs.trim(), filename: 'types.ts' });
        } catch (e) {
            setResult({ error: 'Invalid JSON: ' + e.message });
        }
    };

    return (
        <div className="grid gap-15">
            <div className="form-group">
                <label className="smallest opacity-6 uppercase ml-10">Interface Name</label>
                <input className="pill w-full mb-10" value={interfaceName} onChange={e=>setInterfaceName(e.target.value)} placeholder="RootObject" />
            </div>
            <textarea className="pill w-full font-mono text-sm" rows="10" style={{borderRadius: '16px', padding: '15px'}} placeholder="Paste JSON here..." value={input} onChange={e=>setInput(e.target.value)} />
            <div className="flex gap-10">
                <button className="btn-primary flex-1" onClick={convert}>
                    <span className="material-icons mr-10">code</span>
                    Generate TypeScript Interfaces
                </button>
                <button className="pill" onClick={() => { setInput(''); setInterfaceName('RootObject'); setResult(null); }}>Clear</button>
            </div>
            <ToolResult result={result} />
        </div>
    );
};

export default JsonToTs;
