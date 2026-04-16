import React, { useState, useEffect } from 'react';

const MarkdownPreview = () => {
  const [input, setInput] = useState('# Markdown Title\n\n**Bold** and *italic* text.');
  const [html, setHtml] = useState('');

  useEffect(() => {
    setHtml(input.replace(/^# (.*$)/gim, '<h1>$1</h1>')
                 .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                 .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
                 .replace(/\*(.*)\*/gim, '<i>$1</i>'));
  }, [input]);

  return (
    <div className="tool-form" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <textarea placeholder="# Markdown Title\n\n**Bold** and *italic* text." style={{ width: '100%', height: '200px', fontFamily: 'monospace', marginBottom: '20px' }} value={input} onChange={e => setInput(e.target.value)} />
      <div className="tool-result" style={{ flex: 1, overflowY: 'auto', background: 'white', minHeight: '200px' }} dangerouslySetInnerHTML={{ __html: html || '<i style="opacity:0.5">Preview will appear here...</i>' }} />
    </div>
  );
};

export default MarkdownPreview;
