import React, { useState, useEffect } from 'react';

const ImageTools = ({ onResultChange }) => {
  const [image, setImage] = useState(null);
  const [metadata, setMetadata] = useState(null);

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target.result);
        setMetadata({
          name: file.name,
          size: (file.size / 1024).toFixed(2) + ' KB',
          type: file.type,
          lastModified: new Date(file.lastModified).toLocaleString()
        });
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (metadata) onResultChange({ text: JSON.stringify(metadata, null, 2), filename: 'image_meta.json' });
  }, [metadata]);

  return (
    <div className="tool-form">
      <div className="form-group">
        <label>Upload Image for Analysis</label>
        <input type="file" accept="image/*" onChange={handleUpload} className="form-control" />
      </div>

      {image && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <img src={image} style={{ width: '100%', maxHeight: '300px', objectFit: 'contain', background: '#eee' }} alt="Preview" />
          </div>

          <div className="card" style={{ padding: '15px' }}>
            <h4 style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="material-icons">info</span> Image Metadata
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {metadata && Object.entries(metadata).map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ opacity: 0.6, textTransform: 'capitalize' }}>{k}</span>
                  <span style={{ fontWeight: '600' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!image && (
        <div className="empty-state" style={{ padding: '3rem 0' }}>
          <span className="material-icons" style={{ fontSize: '3rem' }}>photo_library</span>
          <p>Select an image to view EXIF and media details.</p>
        </div>
      )}
    </div>
  );
};

export default ImageTools;
