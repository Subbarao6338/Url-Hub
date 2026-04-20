import React, { useState, useEffect } from 'react';
import { PDFDocument, rgb } from 'pdf-lib';

const PdfEdit = ({ onResultChange, toolId }) => {
  const [activeTab, setActiveTab] = useState('merge');
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (toolId) {
        if (toolId === 'pdf-split') setActiveTab('split');
        else if (toolId === 'pdf-delete') setActiveTab('delete');
        else if (toolId === 'pdf-rearrange') setActiveTab('rearrange');
        else if (toolId === 'pdf-rotate') setActiveTab('rotate');
        else if (toolId === 'pdf-sign') setActiveTab('sign');
        else if (toolId === 'pdf-watermark') setActiveTab('watermark');
        else if (toolId === 'pdf-numbers') setActiveTab('numbers');
        else if (toolId === 'pdf-bookmarks') setActiveTab('bookmarks');
        else if (toolId === 'pdf-crop') setActiveTab('crop');
        else setActiveTab(toolId);
    }
  }, [toolId]);

  const handleFileUpload = (e) => {
      setFiles(Array.from(e.target.files));
  };

  const mergePdfs = async () => {
      if (files.length < 2) return;
      const mergedPdf = await PDFDocument.create();
      for (const file of files) {
          const pdfBytes = await file.arrayBuffer();
          const pdf = await PDFDocument.load(pdfBytes);
          const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          copiedPages.forEach((page) => mergedPdf.addPage(page));
      }
      const mergedPdfBytes = await mergedPdf.save();
      onResultChange({ text: 'Merged PDFs', blob: new Blob([mergedPdfBytes], { type: 'application/pdf' }), filename: 'merged.pdf' });
  };

  const rotatePdf = async () => {
      if (files.length === 0) return;
      const pdfBytes = await files[0].arrayBuffer();
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const pages = pdfDoc.getPages();
      pages.forEach(page => page.setRotation(page.getRotation().angle + 90));
      const rotatedBytes = await pdfDoc.save();
      onResultChange({ text: 'Rotated PDF', blob: new Blob([rotatedBytes], { type: 'application/pdf' }), filename: 'rotated.pdf' });
  };

  return (
    <div className="tool-form">
      <div className="pill-group" style={{ marginBottom: '20px', overflowX: 'auto', whiteSpace: 'nowrap', display: 'flex', flexWrap: 'nowrap' }}>
        <button className={`pill ${activeTab === 'merge' ? 'active' : ''}`} onClick={() => setActiveTab('merge')}>Merge</button>
        <button className={`pill ${activeTab === 'rotate' ? 'active' : ''}`} onClick={() => setActiveTab('rotate')}>Rotate</button>
        <button className={`pill ${activeTab === 'delete' ? 'active' : ''}`} onClick={() => setActiveTab('delete')}>Delete Pages</button>
        <button className={`pill ${activeTab === 'rearrange' ? 'active' : ''}`} onClick={() => setActiveTab('rearrange')}>Rearrange</button>
      </div>

      <input type="file" multiple onChange={handleFileUpload} accept="application/pdf" className="pill" style={{ width: '100%', marginBottom: '20px' }} />

      {activeTab === 'merge' && <button className="btn-primary" onClick={mergePdfs} disabled={files.length < 2} style={{ width: '100%' }}>Merge {files.length} PDFs</button>}
      {activeTab === 'rotate' && <button className="btn-primary" onClick={rotatePdf} disabled={files.length === 0} style={{ width: '100%' }}>Rotate 90° Clockwise</button>}
      {/* Placeholder for complex UI tools in this category */}
      {(activeTab === 'delete' || activeTab === 'rearrange' || activeTab === 'split' || activeTab === 'sign' || activeTab === 'watermark' || activeTab === 'numbers' || activeTab === 'bookmarks' || activeTab === 'crop') && <div style={{ textAlign: 'center', opacity: 0.6 }}>Upload PDF and select options (Complex UI placeholder)</div>}
    </div>
  );
};

export default PdfEdit;
