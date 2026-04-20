import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const PdfConvert = ({ onResultChange, toolId }) => {
  const [activeTab, setActiveTab] = useState('img-to-pdf');
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (toolId) {
        if (toolId === 'pdf-to-img') setActiveTab('pdf-to-img');
        else if (toolId === 'img-to-pdf') setActiveTab('img-to-pdf');
        else if (toolId === 'pdf-to-zip') setActiveTab('pdf-to-zip');
        else if (toolId === 'pdf-extract') setActiveTab('pdf-extract');
        else if (toolId === 'pdf-to-text') setActiveTab('pdf-to-text');
        else if (toolId === 'word-to-pdf') setActiveTab('word-to-pdf');
        else if (toolId === 'excel-to-pdf') setActiveTab('excel-to-pdf');
        else if (toolId === 'ppt-to-pdf') setActiveTab('ppt-to-pdf');
        else if (toolId === 'pdf-to-word') setActiveTab('pdf-to-word');
        else if (toolId === 'pdf-scan') setActiveTab('pdf-scan');
        else setActiveTab(toolId);
    }
  }, [toolId]);

  const handleFileUpload = (e) => setFiles(Array.from(e.target.files));

  const imgToPdf = async () => {
      if (files.length === 0) return;
      const doc = new jsPDF();
      for (let i = 0; i < files.length; i++) {
          if (i > 0) doc.addPage();
          const imgData = await new Promise((resolve) => {
              const reader = new FileReader();
              reader.onload = (e) => resolve(e.target.result);
              reader.readAsDataURL(files[i]);
          });
          doc.addImage(imgData, 'PNG', 10, 10, 190, 150);
      }
      const pdfBlob = doc.output('blob');
      onResultChange({ text: 'Images to PDF', blob: pdfBlob, filename: 'converted.pdf' });
  };

  return (
    <div className="tool-form">
      <div className="pill-group" style={{ marginBottom: '20px', overflowX: 'auto', whiteSpace: 'nowrap', display: 'flex', flexWrap: 'nowrap' }}>
        <button className={`pill ${activeTab === 'img-to-pdf' ? 'active' : ''}`} onClick={() => setActiveTab('img-to-pdf')}>Img to PDF</button>
        <button className={`pill ${activeTab === 'pdf-to-img' ? 'active' : ''}`} onClick={() => setActiveTab('pdf-to-img')}>PDF to Img</button>
        <button className={`pill ${activeTab === 'word-to-pdf' ? 'active' : ''}`} onClick={() => setActiveTab('word-to-pdf')}>Word to PDF</button>
      </div>

      <input type="file" multiple onChange={handleFileUpload} className="pill" style={{ width: '100%', marginBottom: '20px' }} />

      {activeTab === 'img-to-pdf' && <button className="btn-primary" onClick={imgToPdf} disabled={files.length === 0} style={{ width: '100%' }}>Convert {files.length} Images to PDF</button>}
      {(activeTab !== 'img-to-pdf') && <div style={{ textAlign: 'center', opacity: 0.6 }}>Conversion logic placeholder (Requires server-side or complex WASM libs)</div>}
    </div>
  );
};

export default PdfConvert;
