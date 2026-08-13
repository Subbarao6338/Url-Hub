import React, { useState, useMemo } from 'react';
import * as Diff from 'diff';
import ToolResult from '../ToolResult';

const PRESETS = [
    {
        label: 'Select Sample Preset',
        oldText: '',
        newText: ''
    },
    {
        label: 'JavaScript / React Component',
        oldText: `import React from 'react';\n\nconst Welcome = ({ name }) => {\n  console.log('Welcome rendered');\n  return (\n    <div className="welcome-container">\n      <h1>Hello, {name}!</h1>\n      <p>Welcome to our platform.</p>\n    </div>\n  );\n};\n\nexport default Welcome;`,
        newText: `import React, { useEffect } from 'react';\n\nconst Welcome = ({ name, role = 'User' }) => {\n  useEffect(() => {\n    console.log('Welcome mounted for', name);\n  }, [name]);\n\n  return (\n    <div className="welcome-container card shadow-sm">\n      <h1>Welcome, {name}!</h1>\n      <span className="badge">{role}</span>\n      <p>Enjoy your newly upgraded dashboard.</p>\n    </div>\n  );\n};\n\nexport default Welcome;`
    },
    {
        label: 'JSON Configuration',
        oldText: `{\n  "name": "epic-toolbox",\n  "version": "1.0.0",\n  "private": true,\n  "dependencies": {\n    "react": "^18.2.0",\n    "react-dom": "^18.2.0"\n  }\n}`,
        newText: `{\n  "name": "epic-toolbox",\n  "version": "1.1.0",\n  "private": true,\n  "dependencies": {\n    "react": "^18.3.1",\n    "react-dom": "^18.3.1",\n    "diff": "^9.0.0"\n  },\n  "devDependencies": {\n    "vitest": "^4.1.10"\n  }\n}`
    }
];

const DiffViewer = () => {
    const [oldText, setOldText] = useState('');
    const [newText, setNewText] = useState('');
    const [viewMode, setViewMode] = useState('side-by-side'); // 'side-by-side' or 'inline'
    const [result, setResult] = useState(null);

    const handlePresetChange = (e) => {
        const val = e.target.value;
        const preset = PRESETS.find(p => p.label === val);
        if (preset) {
            setOldText(preset.oldText);
            setNewText(preset.newText);
            setResult(null);
        }
    };

    const handleClear = () => {
        setOldText('');
        setNewText('');
        setResult(null);
    };

    const getWordLevelDiffs = (oldStr, newStr) => {
        return Diff.diffWordsWithSpace(oldStr, newStr);
    };

    const renderWordLevelDiff = (oldStr, newStr, type) => {
        if (!oldStr || !newStr) return <span>{type === 'removed' ? oldStr : newStr}</span>;
        const wordDiffs = getWordLevelDiffs(oldStr, newStr);
        return wordDiffs.map((part, index) => {
            if (type === 'removed' && part.removed) {
                return <mark key={index} className="diff-highlight-removed">{part.value}</mark>;
            }
            if (type === 'added' && part.added) {
                return <mark key={index} className="diff-highlight-added">{part.value}</mark>;
            }
            if (!part.added && !part.removed) {
                return <span key={index}>{part.value}</span>;
            }
            return null;
        });
    };

    const stats = useMemo(() => {
        if (!oldText && !newText) return null;
        const changes = Diff.diffLines(oldText, newText);
        let addedCount = 0;
        let removedCount = 0;
        changes.forEach(c => {
            const lines = c.value.split(/\r?\n/).filter(line => line !== '');
            if (c.added) addedCount += lines.length;
            if (c.removed) removedCount += lines.length;
        });
        return { addedCount, removedCount };
    }, [oldText, newText]);

    const alignedSideBySide = useMemo(() => {
        if (!oldText && !newText) return [];
        const changes = Diff.diffLines(oldText, newText);
        const aligned = [];
        let leftLineNum = 1;
        let rightLineNum = 1;

        let i = 0;
        while (i < changes.length) {
            const change = changes[i];
            const lines = change.value.split(/\r?\n/);
            if (lines.length > 1 && lines[lines.length - 1] === '') {
                lines.pop();
            }

            if (!change.added && !change.removed) {
                for (const line of lines) {
                    aligned.push({
                        left: { content: line, num: leftLineNum++, type: 'normal' },
                        right: { content: line, num: rightLineNum++, type: 'normal' }
                    });
                }
                i++;
            } else {
                const removedLines = [];
                const addedLines = [];

                while (i < changes.length && (changes[i].added || changes[i].removed)) {
                    const blockLines = changes[i].value.split(/\r?\n/);
                    if (blockLines.length > 1 && blockLines[blockLines.length - 1] === '') {
                        blockLines.pop();
                    }
                    if (changes[i].removed) {
                        removedLines.push(...blockLines);
                    } else {
                        addedLines.push(...blockLines);
                    }
                    i++;
                }

                const maxLen = Math.max(removedLines.length, addedLines.length);
                for (let j = 0; j < maxLen; j++) {
                    const rem = j < removedLines.length ? removedLines[j] : null;
                    const add = j < addedLines.length ? addedLines[j] : null;

                    aligned.push({
                        left: rem !== null ? { content: rem, num: leftLineNum++, type: 'removed', counterpart: add } : { content: '', num: '', type: 'empty' },
                        right: add !== null ? { content: add, num: rightLineNum++, type: 'added', counterpart: rem } : { content: '', num: '', type: 'empty' }
                    });
                }
            }
        }
        return aligned;
    }, [oldText, newText]);

    const alignedInline = useMemo(() => {
        if (!oldText && !newText) return [];
        const changes = Diff.diffLines(oldText, newText);
        const inlineLines = [];
        let leftLineNum = 1;
        let rightLineNum = 1;

        let i = 0;
        while (i < changes.length) {
            const change = changes[i];
            const lines = change.value.split(/\r?\n/);
            if (lines.length > 1 && lines[lines.length - 1] === '') {
                lines.pop();
            }

            if (!change.added && !change.removed) {
                for (const line of lines) {
                    inlineLines.push({
                        content: line,
                        leftNum: leftLineNum++,
                        rightNum: rightLineNum++,
                        type: 'normal'
                    });
                }
                i++;
            } else if (change.removed) {
                const nextChange = changes[i + 1];
                if (nextChange && nextChange.added) {
                    const nextLines = nextChange.value.split(/\r?\n/);
                    if (nextLines.length > 1 && nextLines[nextLines.length - 1] === '') {
                        nextLines.pop();
                    }

                    const maxLen = Math.max(lines.length, nextLines.length);
                    for (let j = 0; j < maxLen; j++) {
                        const rem = j < lines.length ? lines[j] : null;
                        const add = j < nextLines.length ? nextLines[j] : null;

                        if (rem !== null) {
                            inlineLines.push({
                                content: rem,
                                leftNum: leftLineNum++,
                                rightNum: '',
                                type: 'removed',
                                counterpart: add
                            });
                        }
                        if (add !== null) {
                            inlineLines.push({
                                content: add,
                                leftNum: '',
                                rightNum: rightLineNum++,
                                type: 'added',
                                counterpart: rem
                            });
                        }
                    }
                    i += 2;
                } else {
                    for (const line of lines) {
                        inlineLines.push({
                            content: line,
                            leftNum: leftLineNum++,
                            rightNum: '',
                            type: 'removed'
                        });
                    }
                    i++;
                }
            } else {
                for (const line of lines) {
                    inlineLines.push({
                        content: line,
                        leftNum: '',
                        rightNum: rightLineNum++,
                        type: 'added'
                    });
                }
                i++;
            }
        }
        return inlineLines;
    }, [oldText, newText]);

    const compare = () => {
        const diff = Diff.createTwoFilesPatch('Original', 'Modified', oldText, newText);
        setResult({ text: diff, filename: 'diff.patch' });
    };

    return (
        <div className="card p-30 glass-card grid gap-20 animate-fadeIn">
            <h3 className="text-center m-0 flex-center gap-10">
                <span className="material-icons" style={{ color: 'var(--brand-accent)' }}>difference</span>
                Enterprise Diff Viewer
            </h3>
            <p className="smallest opacity-6 text-center m-0">
                Compare text, source code, or JSON with character and word-level visual delta highlights.
            </p>

            <div className="form-group text-left">
                <label className="smallest opacity-6 uppercase ml-10 font-bold">Preset Samples</label>
                <select className="pill w-full mt-5" onChange={handlePresetChange}>
                    {PRESETS.map(p => (
                        <option key={p.label} value={p.label}>{p.label}</option>
                    ))}
                </select>
            </div>

            <div className="grid grid-2-cols gap-15">
                <div className="form-group text-left">
                    <label className="smallest opacity-6 uppercase ml-10 font-bold">Original Text</label>
                    <textarea
                        className="pill w-full font-mono mt-5 text-sm"
                        rows="8"
                        placeholder="Paste original text here..."
                        value={oldText}
                        onChange={e => setOldText(e.target.value)}
                        style={{ padding: '15px', borderRadius: '16px' }}
                    />
                </div>
                <div className="form-group text-left">
                    <label className="smallest opacity-6 uppercase ml-10 font-bold">Modified Text</label>
                    <textarea
                        className="pill w-full font-mono mt-5 text-sm"
                        rows="8"
                        placeholder="Paste modified text here..."
                        value={newText}
                        onChange={e => setNewText(e.target.value)}
                        style={{ padding: '15px', borderRadius: '16px' }}
                    />
                </div>
            </div>

            <div className="flex-between flex-wrap gap-10">
                <div className="flex gap-5">
                    <button
                        type="button"
                        className={`pill small ${viewMode === 'side-by-side' ? 'active' : ''}`}
                        onClick={() => setViewMode('side-by-side')}
                    >
                        Side-by-Side
                    </button>
                    <button
                        type="button"
                        className={`pill small ${viewMode === 'inline' ? 'active' : ''}`}
                        onClick={() => setViewMode('inline')}
                    >
                        Inline View
                    </button>
                </div>

                <div className="flex gap-5">
                    <button className="btn-primary" onClick={compare}>
                        <span className="material-icons mr-10" style={{ fontSize: '1rem' }}>download</span>
                        Export Patch
                    </button>
                    {(oldText || newText) && (
                        <button className="pill" onClick={handleClear} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                            Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Diff Stats Banner */}
            {stats && (
                <div className="diff-stats-banner">
                    <div className="stat-item text-danger">
                        <span className="material-icons small">remove_circle</span>
                        <strong>{stats.removedCount}</strong> deletions
                    </div>
                    <div className="stat-item text-success">
                        <span className="material-icons small">add_circle</span>
                        <strong>{stats.addedCount}</strong> insertions
                    </div>
                </div>
            )}

            {/* Visual View Area */}
            {(oldText || newText) && (
                <div className="diff-visual-viewer">
                    {viewMode === 'side-by-side' ? (
                        <div className="side-by-side-pane">
                            <div className="pane-half original-pane">
                                <div className="pane-header">Original</div>
                                <div className="pane-lines font-mono text-xs">
                                    {alignedSideBySide.map((row, idx) => (
                                        <div key={idx} className={`diff-line-row diff-${row.left.type}`}>
                                            <span className="line-num">{row.left.num}</span>
                                            <span className="line-indicator">{row.left.type === 'removed' ? '-' : ''}</span>
                                            <span className="line-content">
                                                {row.left.type === 'removed' && row.left.counterpart
                                                    ? renderWordLevelDiff(row.left.content, row.left.counterpart, 'removed')
                                                    : row.left.content
                                                }
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="pane-half modified-pane">
                                <div className="pane-header">Modified</div>
                                <div className="pane-lines font-mono text-xs">
                                    {alignedSideBySide.map((row, idx) => (
                                        <div key={idx} className={`diff-line-row diff-${row.right.type}`}>
                                            <span className="line-num">{row.right.num}</span>
                                            <span className="line-indicator">{row.right.type === 'added' ? '+' : ''}</span>
                                            <span className="line-content">
                                                {row.right.type === 'added' && row.right.counterpart
                                                    ? renderWordLevelDiff(row.right.counterpart, row.right.content, 'added')
                                                    : row.right.content
                                                }
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="inline-pane font-mono text-xs">
                            {alignedInline.map((row, idx) => (
                                <div key={idx} className={`diff-line-row diff-${row.type}`}>
                                    <span className="line-num inline-left-num">{row.leftNum}</span>
                                    <span className="line-num inline-right-num">{row.rightNum}</span>
                                    <span className="line-indicator">
                                        {row.type === 'added' ? '+' : row.type === 'removed' ? '-' : ''}
                                    </span>
                                    <span className="line-content">
                                        {row.type === 'removed' && row.counterpart
                                            ? renderWordLevelDiff(row.content, row.counterpart, 'removed')
                                            : row.type === 'added' && row.counterpart
                                            ? renderWordLevelDiff(row.counterpart, row.content, 'added')
                                            : row.content
                                        }
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {result && <ToolResult result={result} onClear={() => setResult(null)} />}

            <style>{`
                .diff-stats-banner {
                    display: flex;
                    gap: 20px;
                    justify-content: center;
                    padding: 10px;
                    border-radius: 12px;
                    background: var(--bg-surface);
                    border: 1px solid var(--border-color);
                }
                .stat-item {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.85rem;
                }
                .diff-visual-viewer {
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    overflow: hidden;
                    background: var(--bg-surface);
                }
                .side-by-side-pane {
                    display: flex;
                }
                .pane-half {
                    width: 50%;
                    display: flex;
                    flex-direction: column;
                }
                .pane-half:first-of-type {
                    border-right: 1px solid var(--border-color);
                }
                .pane-header {
                    background: var(--bg);
                    padding: 8px 12px;
                    font-weight: bold;
                    font-size: 0.8rem;
                    border-bottom: 1px solid var(--border-color);
                    text-align: left;
                    opacity: 0.7;
                }
                .pane-lines, .inline-pane {
                    display: flex;
                    flex-direction: column;
                    text-align: left;
                    overflow-x: auto;
                }
                .diff-line-row {
                    display: flex;
                    align-items: stretch;
                    line-height: 1.5;
                    min-height: 20px;
                }
                .line-num {
                    width: 45px;
                    min-width: 45px;
                    text-align: right;
                    padding-right: 10px;
                    background: rgba(0,0,0,0.03);
                    user-select: none;
                    color: var(--text-primary);
                    opacity: 0.4;
                    font-size: 0.75rem;
                    border-right: 1px solid var(--border-color);
                    display: flex;
                    align-items: center;
                    justify-content: flex-end;
                }
                .inline-left-num, .inline-right-num {
                    width: 35px;
                    min-width: 35px;
                }
                .line-indicator {
                    width: 20px;
                    min-width: 20px;
                    text-align: center;
                    user-select: none;
                    opacity: 0.6;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .line-content {
                    padding-left: 8px;
                    white-space: pre;
                    display: flex;
                    align-items: center;
                    flex-wrap: wrap;
                }
                /* Diff Row Types */
                .diff-removed {
                    background-color: rgba(239, 83, 80, 0.1) !important;
                }
                .diff-removed .line-num {
                    background-color: rgba(239, 83, 80, 0.15);
                    border-right-color: rgba(239, 83, 80, 0.2);
                    opacity: 0.6;
                }
                .diff-added {
                    background-color: rgba(102, 187, 106, 0.1) !important;
                }
                .diff-added .line-num {
                    background-color: rgba(102, 187, 106, 0.15);
                    border-right-color: rgba(102, 187, 106, 0.2);
                    opacity: 0.6;
                }
                .diff-empty {
                    background-color: rgba(0, 0, 0, 0.02);
                }
                .diff-empty .line-num {
                    background-color: rgba(0, 0, 0, 0.04);
                }
                /* Fine-grained Highlights */
                .diff-highlight-removed {
                    background-color: rgba(239, 83, 80, 0.35);
                    border-radius: 2px;
                    padding: 1px 2px;
                    text-decoration: line-through;
                    color: inherit;
                }
                .diff-highlight-added {
                    background-color: rgba(102, 187, 106, 0.35);
                    border-radius: 2px;
                    padding: 1px 2px;
                    font-weight: bold;
                    color: inherit;
                }
            `}</style>
        </div>
    );
};

export default DiffViewer;