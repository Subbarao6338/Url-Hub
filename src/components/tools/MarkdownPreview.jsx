import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

const MarkdownPreview = ({ onResultChange }) => {
  const [input, setInput] = useState('# Markdown Title\n\n**Bold** and *italic* text.\n\n- List item 1\n- List item 2\n\n```javascript\nconsole.log("Hello World");\n```');
  const [html, setHtml] = useState('');

  useEffect(() => {
    try {
      const parsedHtml = marked.parse(input);
      const sanitizedHtml = DOMPurify.sanitize(parsedHtml);
      setHtml(sanitizedHtml);
      onResultChange({
        text: input,
        blob: new Blob([sanitizedHtml], { type: 'text/html' }),
        filename: 'preview.html'
      });
    } catch (error) {
      console.error("Markdown parsing error:", error);
    }
  }, [input, onResultChange]);

  return (
    <div className="tool-form" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <label style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)' }}>MARKDOWN INPUT</label>
      <textarea
        placeholder="# Markdown Title\n\n**Bold** and *italic* text."
        style={{
          width: '100%',
          height: '200px',
          fontFamily: 'monospace',
          marginBottom: '20px',
          padding: '12px',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          background: 'var(--surface)',
          color: 'var(--on-surface)'
        }}
        value={input}
        onChange={e => setInput(e.target.value)}
      />

      <label style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-muted)' }}>PREVIEW</label>
      <div
        className="tool-result markdown-body"
        style={{
          flex: 1,
          overflowY: 'auto',
          background: 'var(--surface-solid)',
          minHeight: '200px',
          padding: '20px',
          borderRadius: '12px',
          border: '1px solid var(--border)',
          color: 'var(--on-surface)'
        }}
        dangerouslySetInnerHTML={{ __html: html || '<i style="opacity:0.5">Preview will appear here...</i>' }}
      />
    </div>
  );
};

export default MarkdownPreview;
