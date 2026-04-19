import React, { useState, useRef } from 'react';

const ImageOptimizer = ({ onResultChange }) => {
  const [image, setImage] = useState(null);
  const [quality, setQuality] = useState(0.8);
  const [maxWidth, setMaxWidth] = useState(1200);
  const [optimizedImage, setOptimizedImage] = useState(null);
  const canvasRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          setImage({
            src: event.target.result,
            width: img.width,
            height: img.height,
            name: file.name,
            type: file.type
          });
          optimize(img, file.name);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const optimize = (img, filename) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let width = img.width;
    let height = img.height;

    if (width > maxWidth) {
      height = Math.round((height * maxWidth) / width);
      width = maxWidth;
    }

    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, width, height);

    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      setOptimizedImage({
        src: url,
        size: blob.size,
        width,
        height
      });
      onResultChange({
        text: `Optimized Image: ${width}x${height}, ${(blob.size / 1024).toFixed(2)} KB`,
        blob: blob,
        filename: `optimized_${filename}`
      });
    }, 'image/jpeg', quality);
  };

  return (
    <div className="tool-form">
      <div className="form-group">
        <label>Upload Image</label>
        <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: 'none' }} id="img-upload" />
        <label htmlFor="img-upload" className="pill" style={{ cursor: 'pointer', width: '100%', justifyContent: 'center' }}>
          <span className="material-icons">upload_file</span>
          {image ? 'Change Image' : 'Select Image'}
        </label>
      </div>

      {image && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="form-group">
              <label>Quality ({Math.round(quality * 100)}%)</label>
              <input type="range" min="0.1" max="1" step="0.1" value={quality} onChange={(e) => setQuality(parseFloat(e.target.value))} style={{ width: '100%' }} />
            </div>
            <div className="form-group">
              <label>Max Width ({maxWidth}px)</label>
              <input type="number" value={maxWidth} onChange={(e) => setMaxWidth(parseInt(e.target.value) || 0)} style={{ width: '100%' }} />
            </div>
          </div>

          <div style={{ textAlign: 'center' }}>
            <button className="btn-primary" onClick={() => {
              const img = new Image();
              img.onload = () => optimize(img, image.name);
              img.src = image.src;
            }}>Re-Optimize</button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
            <div className="tool-result">
              <div style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '5px' }}>ORIGINAL</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{image.width} × {image.height}</div>
            </div>
            <div className="tool-result">
              <div style={{ fontSize: '0.75rem', opacity: 0.6, marginBottom: '5px' }}>OPTIMIZED</div>
              {optimizedImage && (
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  {optimizedImage.width} × {optimizedImage.height} ({(optimizedImage.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>
          </div>

          {optimizedImage && (
            <div style={{ marginTop: '20px', textAlign: 'center', background: 'var(--surface)', padding: '10px', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <img src={optimizedImage.src} alt="Optimized Preview" style={{ maxWidth: '100%', maxHeight: '300px', borderRadius: '8px' }} />
            </div>
          )}
        </>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default ImageOptimizer;
