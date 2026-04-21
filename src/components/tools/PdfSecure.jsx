import React, { useState, useEffect } from 'react';
import { PDFDocument } from 'pdf-lib';

const PdfSecure = ({ onResultChange, toolId }) => {
  const [activeTab, setActiveTab] = useState('lock');
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (toolId) {
        if (toolId === 'pdf-compress') setActiveTab('compress');
        else if (toolId === 'pdf-grayscale') setActiveTab('grayscale');
        else if (toolId === 'pdf-repair') setActiveTab('repair');
        else if (toolId === 'pdf-compare') setActiveTab('compare');
        else if (toolId === 'pdf-flatten') setActiveTab('flatten');
        else if (toolId === 'pdf-lock') setActiveTab('lock');
        else if (toolId === 'pdf-unlock') setActiveTab('unlock');
        else if (toolId === 'pdf-meta') setActiveTab('metadata');
        else setActiveTab(toolId);
    }
  }, [toolId]);

  const handleFileUpload = (e) => setFile(e.target.files[0]);

  const lockPdf = async () => {
      if (!file || !password) return;
      const pdfBytes = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const encryptedBytes = await pdfDoc.save({ userPassword: password, ownerPassword: password });
      onResultChange({ text: 'Locked PDF', blob: new Blob([encryptedBytes], { type: 'application/pdf' }), filename: 'locked.pdf' });
  };

  const [metadata, setMetadata] = useState({ title: '', author: '', subject: '', keywords: '' });

  const updateMetadata = async () => {
      if (!file) return;
      try {
        const pdfBytes = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(pdfBytes);
        pdfDoc.setTitle(metadata.title);
        pdfDoc.setAuthor(metadata.author);
        pdfDoc.setSubject(metadata.subject);
        pdfDoc.setKeywords(metadata.keywords.split(',').map(s => s.trim()));
        const modifiedBytes = await pdfDoc.save();
        onResultChange({ text: 'Updated Metadata', blob: new Blob([modifiedBytes], { type: 'application/pdf' }), filename: 'updated_meta.pdf' });
      } catch (e) { alert("Error updating metadata: " + e.message); }
  };

  return (
    <div className="tool-form">
      <div className="pill-group" style={{ marginBottom: '20px', overflowX: 'auto', whiteSpace: 'nowrap', display: 'flex', flexWrap: 'nowrap' }}>
        <button className={`pill ${activeTab === 'lock' ? 'active' : ''}`} onClick={() => setActiveTab('lock')}>Lock</button>
        <button className={`pill ${activeTab === 'metadata' ? 'active' : ''}`} onClick={() => setActiveTab('metadata')}>Metadata</button>
      </div>

      <div className="form-group">
        <label>Upload PDF</label>
        <input type="file" onChange={handleFileUpload} accept="application/pdf" className="pill" style={{ width: '100%' }} />
      </div>

      {activeTab === 'lock' && (
          <div style={{ display: 'grid', gap: '10px', marginTop: '20px' }}>
              <p style={{ fontSize: '0.9rem', opacity: 0.7 }}>Encrypts the PDF and requires a password to open it.</p>
              <div className="form-group">
                <label>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password..." className="pill" style={{ width: '100%' }} />
              </div>
              <button className="btn-primary" onClick={lockPdf} disabled={!file || !password}>Lock PDF</button>
          </div>
      )}

      {activeTab === 'metadata' && (
          <div style={{ display: 'grid', gap: '10px', marginTop: '20px' }}>
              <div className="form-group">
                  <label>Title</label>
                  <input type="text" value={metadata.title} onChange={e => setMetadata({...metadata, title: e.target.value})} className="pill" style={{ width: '100%' }} />
              </div>
              <div className="form-group">
                  <label>Author</label>
                  <input type="text" value={metadata.author} onChange={e => setMetadata({...metadata, author: e.target.value})} className="pill" style={{ width: '100%' }} />
              </div>
              <div className="form-group">
                  <label>Subject</label>
                  <input type="text" value={metadata.subject} onChange={e => setMetadata({...metadata, subject: e.target.value})} className="pill" style={{ width: '100%' }} />
              </div>
              <div className="form-group">
                  <label>Keywords (comma separated)</label>
                  <input type="text" value={metadata.keywords} onChange={e => setMetadata({...metadata, keywords: e.target.value})} className="pill" style={{ width: '100%' }} />
              </div>
              <button className="btn-primary" onClick={updateMetadata} disabled={!file}>Update Metadata</button>
          </div>
      )}

    </div>
  );
};

export default PdfSecure;
