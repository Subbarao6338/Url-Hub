import React, { useState, useEffect, useRef } from 'react';

const ImageTools = ({ onResultChange, toolId }) => {
  const [activeTab, setActiveTab] = useState('format');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const imgRef = useRef(null);

  useEffect(() => {
    if (toolId) {
        if (toolId === 'img-format') setActiveTab('format');
        else if (toolId === 'img-resize') setActiveTab('resize');
        else if (toolId === 'img-blur') setActiveTab('blur');
        else if (toolId === 'img-meta') setActiveTab('metadata');
        else if (toolId === 'img-bw') setActiveTab('bw');
        else setActiveTab(toolId);
    }
  }, [toolId]);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onload = (ev) => setPreview(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="tool-form">
      <div className="pill-group" style={{ marginBottom: '20px', overflowX: 'auto', whiteSpace: 'nowrap', display: 'flex', flexWrap: 'nowrap' }}>
        <button className={`pill ${activeTab === 'format' ? 'active' : ''}`} onClick={() => setActiveTab('format')}>Convert</button>
        <button className={`pill ${activeTab === 'resize' ? 'active' : ''}`} onClick={() => setActiveTab('resize')}>Resize</button>
        <button className={`pill ${activeTab === 'blur' ? 'active' : ''}`} onClick={() => setActiveTab('blur')}>Privacy Blur</button>
        <button className={`pill ${activeTab === 'metadata' ? 'active' : ''}`} onClick={() => setActiveTab('metadata')}>Clean Meta</button>
        <button className={`pill ${activeTab === 'bw' ? 'active' : ''}`} onClick={() => setActiveTab('bw')}>B&W Filter</button>
      </div>

      <input type="file" onChange={handleUpload} accept="image/*" className="pill" style={{ width: '100%', marginBottom: '20px' }} />
      {preview && (
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <img ref={imgRef} src={preview} alt="Preview" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '12px' }} />
          </div>
      )}

      {image && activeTab === 'format' && <FormatConverter imgRef={imgRef} image={image} onResultChange={onResultChange} />}
      {image && activeTab === 'resize' && <ResizeImage imgRef={imgRef} image={image} onResultChange={onResultChange} />}
      {image && activeTab === 'blur' && <PrivacyBlur imgRef={imgRef} image={image} onResultChange={onResultChange} />}
      {image && activeTab === 'metadata' && <MetadataCleaner imgRef={imgRef} image={image} onResultChange={onResultChange} />}
      {image && activeTab === 'bw' && <BlackWhiteFilter imgRef={imgRef} image={image} onResultChange={onResultChange} />}
    </div>
  );
};

const FormatConverter = ({ imgRef, image, onResultChange }) => {
    const [target, setTarget] = useState('image/png');
    const convert = () => {
        const canvas = document.createElement('canvas');
        const img = imgRef.current;
        if (!img) return;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(blob => {
            onResultChange({ text: `Converted to ${target}`, blob, filename: `converted.${target.split('/')[1]}` });
        }, target);
    };
    return (
        <div style={{ textAlign: 'center' }}>
            <select value={target} onChange={e => setTarget(e.target.value)} className="pill" style={{ marginBottom: '10px' }}>
                <option value="image/png">PNG</option>
                <option value="image/jpeg">JPG</option>
                <option value="image/webp">WEBP</option>
            </select>
            <button className="btn-primary" onClick={convert}>Convert</button>
        </div>
    );
};

const ResizeImage = ({ imgRef, image, onResultChange }) => {
    const [width, setWidth] = useState(800);
    const [height, setHeight] = useState(600);
    const resize = () => {
        const canvas = document.createElement('canvas');
        const img = imgRef.current;
        if (!img) return;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(blob => {
            onResultChange({ text: `Resized to ${width}x${height}`, blob, filename: 'resized.png' });
        });
    };
    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <input type="number" value={width} onChange={e => setWidth(e.target.value)} placeholder="W" className="pill" style={{ flex: 1 }} />
                <input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="H" className="pill" style={{ flex: 1 }} />
            </div>
            <button className="btn-primary" onClick={resize}>Resize</button>
        </div>
    );
};

const PrivacyBlur = ({ imgRef, image, onResultChange }) => {
    const blur = () => {
        const canvas = document.createElement('canvas');
        const img = imgRef.current;
        if (!img) return;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.filter = 'blur(10px)';
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(blob => {
            onResultChange({ text: 'Applied Privacy Blur', blob, filename: 'blurred.png' });
        });
    };
    return <button className="btn-primary" onClick={blur} style={{ width: '100%' }}>Apply Privacy Blur</button>;
};

const MetadataCleaner = ({ imgRef, image, onResultChange }) => {
    const clean = () => {
        // Drawing to canvas naturally strips most EXIF
        const canvas = document.createElement('canvas');
        const img = imgRef.current;
        if (!img) return;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(blob => {
            onResultChange({ text: 'Stripped EXIF Metadata', blob, filename: 'clean.png' });
        });
    };
    return <button className="btn-primary" onClick={clean} style={{ width: '100%' }}>Clean Metadata</button>;
};

const BlackWhiteFilter = ({ imgRef, image, onResultChange }) => {
    const apply = () => {
        const canvas = document.createElement('canvas');
        const img = imgRef.current;
        if (!img) return;
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext('2d');
        ctx.filter = 'grayscale(100%)';
        ctx.drawImage(img, 0, 0);
        canvas.toBlob(blob => {
            onResultChange({ text: 'Applied B&W Filter', blob, filename: 'bw.png' });
        });
    };
    return <button className="btn-primary" onClick={apply} style={{ width: '100%' }}>Apply B&W Filter</button>;
};

export default ImageTools;
