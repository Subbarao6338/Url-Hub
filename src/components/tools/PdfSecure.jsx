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

  const grayscalePdf = async () => {
      if (!file) return;
      onResultChange({ text: 'Grayscale Filter Applied (Stub)', blob: file, filename: 'grayscale.pdf' });
  };

  return (
    <div className="tool-form">
      <div className="pill-group" style={{ marginBottom: '20px', overflowX: 'auto', whiteSpace: 'nowrap', display: 'flex', flexWrap: 'nowrap' }}>
        <button className={`pill ${activeTab === 'lock' ? 'active' : ''}`} onClick={() => setActiveTab('lock')}>Lock</button>
        <button className={`pill ${activeTab === 'grayscale' ? 'active' : ''}`} onClick={() => setActiveTab('grayscale')}>Grayscale</button>
        <button className={`pill ${activeTab === 'metadata' ? 'active' : ''}`} onClick={() => setActiveTab('metadata')}>Metadata</button>
      </div>

      <input type="file" onChange={handleFileUpload} accept="application/pdf" className="pill" style={{ width: '100%', marginBottom: '20px' }} />

      {activeTab === 'lock' && (
          <div style={{ display: 'grid', gap: '10px' }}>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="pill" />
              <button className="btn-primary" onClick={lockPdf} disabled={!file || !password}>Lock PDF</button>
          </div>
      )}
      {activeTab === 'grayscale' && <button className="btn-primary" onClick={grayscalePdf} disabled={!file} style={{ width: '100%' }}>Convert to Grayscale</button>}
      {(activeTab === 'compress' || activeTab === 'repair' || activeTab === 'compare' || activeTab === 'flatten' || activeTab === 'unlock') && <div style={{ textAlign: 'center', opacity: 0.6 }}>Placeholder (Complex logic required)</div>}
    </div>
  );
};

export default PdfSecure;
