import React, { useState, useEffect } from 'react';

const GlassGenerator = ({ onResultChange }) => {
  const [blur, setBlur] = useState(12);
  const [transparency, setTransparency] = useState(0.2);
  const [color, setColor] = useState('#ffffff');
  const [outline, setOutline] = useState(0.1);

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 255, g: 255, b: 255 };
  };

  const rgb = hexToRgb(color);
  const glassStyle = {
    background: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${transparency})`,
    backdropFilter: `blur(${blur}px)`,
    WebkitBackdropFilter: `blur(${blur}px)`,
    borderRadius: '20px',
    border: `1px solid rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${outline})`,
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)'
  };

  const cssCode = `background: rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${transparency});
backdrop-filter: blur(${blur}px);
-webkit-backdrop-filter: blur(${blur}px);
border-radius: 20px;
border: 1px solid rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${outline});
box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);`;

  useEffect(() => {
    onResultChange({
      text: cssCode,
      filename: 'glass_style.css'
    });
  }, [cssCode, onResultChange]);

  return (
    <div className="tool-form">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '2rem' }}>
        <div className="form-group">
          <label>Blur: {blur}px</label>
          <input type="range" min="0" max="25" step="1" value={blur} onChange={e => setBlur(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Transparency: {transparency}</label>
          <input type="range" min="0" max="1" step="0.01" value={transparency} onChange={e => setTransparency(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Outline Opacity: {outline}</label>
          <input type="range" min="0" max="1" step="0.01" value={outline} onChange={e => setOutline(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Color</label>
          <input type="color" value={color} onChange={e => setColor(e.target.value)} style={{ height: '40px', padding: '2px' }} />
        </div>
      </div>

      <div style={{
        padding: '3rem',
        borderRadius: '28px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '2rem'
      }}>
        <div style={{
          ...glassStyle,
          width: '200px',
          height: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          textAlign: 'center',
          padding: '1rem'
        }}>
          Preview Box
        </div>
      </div>

      <div className="tool-result">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
          <span style={{ fontWeight: 600 }}>CSS Code</span>
          <button className="icon-btn" onClick={() => navigator.clipboard.writeText(cssCode)} style={{ width: '28px', height: '28px' }}>
            <span className="material-icons" style={{ fontSize: '1rem' }}>content_copy</span>
          </button>
        </div>
        <pre style={{ margin: 0, fontSize: '0.85rem', color: 'var(--primary)', whiteSpace: 'pre-wrap' }}>
          {cssCode}
        </pre>
      </div>
    </div>
  );
};

export default GlassGenerator;
