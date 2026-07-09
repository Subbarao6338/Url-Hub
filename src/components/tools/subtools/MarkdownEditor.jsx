import React, { useState, useRef } from 'react';
import { marked } from 'marked';

const MarkdownEditor = () => {
    const [md, setMd] = useState('# Hello Markdown\n\nEdit me to see live preview.');
    const textareaRef = useRef(null);

    const insertText = (before, after = '') => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selectedText = text.substring(start, end);
        const newText = text.substring(0, start) + before + selectedText + after + text.substring(end);

        setMd(newText);

        // Restore focus and selection
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + before.length, end + before.length);
        }, 0);
    };

    return (
        <div className="grid gap-15">
            <div className="flex-gap p-10 bg-surface border rounded-lg glass-card scrollable-x">
                <button className="pill smallest" onClick={() => insertText('**', '**')} title="Bold">
                    <span className="material-icons" style={{fontSize:'1.1rem'}}>format_bold</span>
                </button>
                <button className="pill smallest" onClick={() => insertText('_', '_')} title="Italic">
                    <span className="material-icons" style={{fontSize:'1.1rem'}}>format_italic</span>
                </button>
                <button className="pill smallest" onClick={() => insertText('# ')} title="Heading">
                    <span className="material-icons" style={{fontSize:'1.1rem'}}>title</span>
                </button>
                <button className="pill smallest" onClick={() => insertText('[', '](url)')} title="Link">
                    <span className="material-icons" style={{fontSize:'1.1rem'}}>link</span>
                </button>
                <button className="pill smallest" onClick={() => insertText('> ')} title="Quote">
                    <span className="material-icons" style={{fontSize:'1.1rem'}}>format_quote</span>
                </button>
                <button className="pill smallest" onClick={() => insertText('`', '`')} title="Code">
                    <span className="material-icons" style={{fontSize:'1.1rem'}}>code</span>
                </button>
                <button className="pill smallest" onClick={() => insertText('- ')} title="List">
                    <span className="material-icons" style={{fontSize:'1.1rem'}}>format_list_bulleted</span>
                </button>
            </div>
            <div className="grid grid-2-cols gap-15" style={{ minHeight: '400px' }}>
                <textarea
                    ref={textareaRef}
                    className="card p-20 glass-card font-mono text-sm"
                    value={md}
                    onChange={e => setMd(e.target.value)}
                    placeholder="Write markdown..."
                    style={{lineHeight: '1.6'}}
                />
                <div className="card p-20 glass-card overflow-auto text-left markdown-preview" dangerouslySetInnerHTML={{ __html: marked.parse(md) }} />
            </div>
        </div>
    );
};

export default MarkdownEditor;
