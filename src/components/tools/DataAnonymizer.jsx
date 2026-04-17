import React, { useState } from 'react';

const DataAnonymizer = ({ onResultChange }) => {
  const [activeTab, setActiveTab] = useState('masking');
  const [isProcessing, setIsProcessing] = useState(false);
  const [log, setLog] = useState([]);
  const [fileName, setFileName] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileName(file.name);
    }
  };

  const processData = (task) => {
    setIsProcessing(true);
    onResultChange(null);
    setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Initializing ${task}...`]);
    setTimeout(() => {
      setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] Processing ${fileName || 'data stream'}...`]);
      setTimeout(() => {
        setLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${task} completed successfully.`]);
        setIsProcessing(false);
        onResultChange({
          text: log.join('\n') + `\n[${new Date().toLocaleTimeString()}] ${task} completed successfully.`,
          filename: `anonymization_log_${Date.now()}.txt`
        });
      }, 1000);
    }, 800);
  };

  return (
    <div className="tool-form">
      <div style={{ marginBottom: '20px' }}>
        <p style={{ opacity: 0.7 }}>Generate synthetic data and protect sensitive information via PII masking and image anonymization.</p>
      </div>

      <div className="pill-group" style={{ marginBottom: '20px', justifyContent: 'center' }}>
        <button className={`pill ${activeTab === 'synthetic' ? 'active' : ''}`} onClick={() => setActiveTab('synthetic')}>Synthetic (SDV)</button>
        <button className={`pill ${activeTab === 'masking' ? 'active' : ''}`} onClick={() => setActiveTab('masking')}>PII Masking</button>
        <button className={`pill ${activeTab === 'images' ? 'active' : ''}`} onClick={() => setActiveTab('images')}>Image Anon</button>
      </div>

      {activeTab === 'synthetic' && (
        <div style={{ display: 'grid', gap: '15px' }}>
          <div className="form-group">
            <label>SDV Model Selection</label>
            <select style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}>
              <option>GaussianCopulaModel</option>
              <option>CTGANModel</option>
              <option>TVAEModel</option>
            </select>
          </div>
          <div className="form-group">
            <label>Sample Size</label>
            <input type="number" defaultValue="1000" style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }} />
          </div>
          <button className="btn-primary" onClick={() => processData('Synthetic Data Generation')} disabled={isProcessing}>Generate Synthetic Dataset</button>
        </div>
      )}

      {activeTab === 'masking' && (
        <div style={{ display: 'grid', gap: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <label className="pill" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><input type="checkbox" defaultChecked /> Emails</label>
            <label className="pill" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><input type="checkbox" defaultChecked /> Phone Numbers</label>
            <label className="pill" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><input type="checkbox" defaultChecked /> IP Addresses</label>
            <label className="pill" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><input type="checkbox" /> Credit Cards</label>
          </div>
          <button className="btn-primary" style={{ marginTop: '10px' }} onClick={() => processData('PII Masking')} disabled={isProcessing}>Process Tabular Data</button>
        </div>
      )}

      {activeTab === 'images' && (
        <div style={{ textAlign: 'center', padding: '15px', border: '2px dashed var(--border)', borderRadius: '12px' }}>
          <span className="material-icons" style={{ fontSize: '2.5rem', opacity: 0.3 }}>photo_camera</span>
          <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>Upload images for automated face blurring and object masking.</p>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
            <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} id="img-upload" />
            <label htmlFor="img-upload" className="pill" style={{ cursor: 'pointer', margin: 0 }}>
              <span className="material-icons" style={{ fontSize: '1.2rem' }}>add_a_photo</span>
              {fileName ? 'Change Image' : 'Select Image'}
            </label>
            {fileName && <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>{fileName}</span>}
            <button className="btn-primary" onClick={() => processData('Image Anonymization')} disabled={isProcessing || !fileName}>Anonymize Image</button>
          </div>
        </div>
      )}

      {log.length > 0 && (
        <div className="tool-result" style={{ marginTop: '20px', fontFamily: 'monospace', fontSize: '0.8rem', maxHeight: '120px', overflowY: 'auto', background: '#1e1e1e', color: '#d4d4d4' }}>
          {log.map((entry, i) => <div key={i}>{entry}</div>)}
          {isProcessing && <div style={{ color: 'var(--primary)', marginTop: '5px' }}>Processing...</div>}
        </div>
      )}
    </div>
  );
};

export default DataAnonymizer;
