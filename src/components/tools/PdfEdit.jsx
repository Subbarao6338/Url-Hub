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

  const [pagesToRemove, setPagesToRemove] = useState('');
  const [pageOrder, setPageOrder] = useState('');

  const mergePdfs = async () => {
      if (files.length < 2) return;
      try {
        const mergedPdf = await PDFDocument.create();
        for (const file of files) {
            const pdfBytes = await file.arrayBuffer();
            const pdf = await PDFDocument.load(pdfBytes);
            const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            copiedPages.forEach((page) => mergedPdf.addPage(page));
        }
        const mergedPdfBytes = await mergedPdf.save();
        onResultChange({ text: 'Merged PDFs', blob: new Blob([mergedPdfBytes], { type: 'application/pdf' }), filename: 'merged.pdf' });
      } catch (e) { alert("Error merging PDFs: " + e.message); }
  };

  const rotatePdf = async () => {
      if (files.length === 0) return;
      try {
        const pdfBytes = await files[0].arrayBuffer();
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const pages = pdfDoc.getPages();
        pages.forEach(page => {
            const currentRotation = page.getRotation().angle;
            page.setRotation({ angle: (currentRotation + 90) % 360 });
        });
        const rotatedBytes = await pdfDoc.save();
        onResultChange({ text: 'Rotated PDF', blob: new Blob([rotatedBytes], { type: 'application/pdf' }), filename: 'rotated.pdf' });
      } catch (e) { alert("Error rotating PDF: " + e.message); }
  };

  const deletePages = async () => {
      if (files.length === 0 || !pagesToRemove) return;
      try {
        const pdfBytes = await files[0].arrayBuffer();
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const indices = pagesToRemove.split(',').map(s => parseInt(s.trim()) - 1).filter(n => !isNaN(n));
        // Sort indices in descending order to avoid shift issues
        indices.sort((a, b) => b - a);
        indices.forEach(idx => {
            if (idx >= 0 && idx < pdfDoc.getPageCount()) {
                pdfDoc.removePage(idx);
            }
        });
        const modifiedBytes = await pdfDoc.save();
        onResultChange({ text: 'Deleted Pages', blob: new Blob([modifiedBytes], { type: 'application/pdf' }), filename: 'modified.pdf' });
      } catch (e) { alert("Error deleting pages: " + e.message); }
  };

  const rearrangePages = async () => {
      if (files.length === 0 || !pageOrder) return;
      try {
        const pdfBytes = await files[0].arrayBuffer();
        const pdfDoc = await PDFDocument.load(pdfBytes);
        const newDoc = await PDFDocument.create();
        const indices = pageOrder.split(',').map(s => parseInt(s.trim()) - 1).filter(n => !isNaN(n));

        const copiedPages = await newDoc.copyPages(pdfDoc, indices);
        copiedPages.forEach(page => newDoc.addPage(page));

        const rearrangedBytes = await newDoc.save();
        onResultChange({ text: 'Rearranged Pages', blob: new Blob([rearrangedBytes], { type: 'application/pdf' }), filename: 'rearranged.pdf' });
      } catch (e) { alert("Error rearranging pages: " + e.message); }
  };

  return (
    <div className="tool-form">
      <div className="pill-group" style={{ marginBottom: '20px', overflowX: 'auto', whiteSpace: 'nowrap', display: 'flex', flexWrap: 'nowrap' }}>
        <button className={`pill ${activeTab === 'merge' ? 'active' : ''}`} onClick={() => setActiveTab('merge')}>Merge</button>
        <button className={`pill ${activeTab === 'rotate' ? 'active' : ''}`} onClick={() => setActiveTab('rotate')}>Rotate</button>
        <button className={`pill ${activeTab === 'delete' ? 'active' : ''}`} onClick={() => setActiveTab('delete')}>Delete Pages</button>
        <button className={`pill ${activeTab === 'rearrange' ? 'active' : ''}`} onClick={() => setActiveTab('rearrange')}>Rearrange</button>
      </div>

      <div className="form-group">
        <label>Upload PDF(s)</label>
        <input type="file" multiple onChange={handleFileUpload} accept="application/pdf" className="pill" style={{ width: '100%' }} />
        {files.length > 0 && <div style={{ fontSize: '0.8rem', opacity: 0.6, marginTop: '5px' }}>{files.length} file(s) selected</div>}
      </div>

      {activeTab === 'merge' && (
          <div style={{ marginTop: '20px' }}>
              <p style={{ fontSize: '0.9rem', marginBottom: '10px', opacity: 0.7 }}>Combines multiple PDF files into one in the order they were selected.</p>
              <button className="btn-primary" onClick={mergePdfs} disabled={files.length < 2} style={{ width: '100%' }}>Merge {files.length} PDFs</button>
          </div>
      )}

      {activeTab === 'rotate' && (
          <div style={{ marginTop: '20px' }}>
              <p style={{ fontSize: '0.9rem', marginBottom: '10px', opacity: 0.7 }}>Rotates all pages in the first PDF file by 90 degrees clockwise.</p>
              <button className="btn-primary" onClick={rotatePdf} disabled={files.length === 0} style={{ width: '100%' }}>Rotate 90° Clockwise</button>
          </div>
      )}

      {activeTab === 'delete' && (
          <div style={{ marginTop: '20px' }}>
              <div className="form-group">
                  <label>Pages to Remove (e.g. 1, 3, 5)</label>
                  <input type="text" value={pagesToRemove} onChange={e => setPagesToRemove(e.target.value)} placeholder="1, 3, 5" className="pill" style={{ width: '100%' }} />
              </div>
              <button className="btn-primary" onClick={deletePages} disabled={files.length === 0 || !pagesToRemove} style={{ width: '100%' }}>Remove Pages</button>
          </div>
      )}

      {activeTab === 'rearrange' && (
          <div style={{ marginTop: '20px' }}>
              <div className="form-group">
                  <label>New Page Order (e.g. 3, 1, 2)</label>
                  <input type="text" value={pageOrder} onChange={e => setPageOrder(e.target.value)} placeholder="3, 1, 2" className="pill" style={{ width: '100%' }} />
              </div>
              <button className="btn-primary" onClick={rearrangePages} disabled={files.length === 0 || !pageOrder} style={{ width: '100%' }}>Rearrange Pages</button>
          </div>
      )}

      {(activeTab === 'split' || activeTab === 'sign' || activeTab === 'watermark' || activeTab === 'numbers' || activeTab === 'bookmarks' || activeTab === 'crop') && <div style={{ textAlign: 'center', opacity: 0.6, marginTop: '20px' }}>This advanced PDF feature is coming soon.</div>}
    </div>
  );
};

export default PdfEdit;
