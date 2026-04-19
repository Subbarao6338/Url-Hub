import React, { useState, useEffect } from 'react';

const AspectRatioCalc = ({ onResultChange }) => {
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [newWidth, setNewWidth] = useState(1280);
  const [newHeight, setNewHeight] = useState(720);

  const gcd = (a, b) => {
    return b === 0 ? a : gcd(b, a % b);
  };

  const calculateRatio = () => {
    const common = gcd(width, height);
    return `${width / common}:${height / common}`;
  };

  useEffect(() => {
    const ratio = calculateRatio();
    onResultChange({
      text: `Original: ${width}x${height} (${ratio})\nNew: ${newWidth}x${newHeight}`,
      filename: 'aspect_ratio.txt'
    });
  }, [width, height, newWidth, newHeight]);

  const handleNewWidthChange = (val) => {
    setNewWidth(val);
    if (width > 0) {
        setNewHeight(Math.round((val * height) / width));
    }
  };

  const handleNewHeightChange = (val) => {
    setNewHeight(val);
    if (height > 0) {
        setNewWidth(Math.round((val * width) / height));
    }
  };

  return (
    <div className="tool-form">
      <div className="settings-section">
        <h3>Original Dimensions</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Width</label>
            <input type="number" value={width} onChange={(e) => setWidth(parseInt(e.target.value) || 0)} />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Height</label>
            <input type="number" value={height} onChange={(e) => setHeight(parseInt(e.target.value) || 0)} />
          </div>
        </div>
        <div style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--primary)', marginTop: '10px' }}>
          Aspect Ratio: {calculateRatio()}
        </div>
      </div>

      <div className="settings-section">
        <h3>Scaled Dimensions</h3>
        <div style={{ display: 'flex', gap: '10px' }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label>New Width</label>
            <input type="number" value={newWidth} onChange={(e) => handleNewWidthChange(parseInt(e.target.value) || 0)} />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>New Height</label>
            <input type="number" value={newHeight} onChange={(e) => handleNewHeightChange(parseInt(e.target.value) || 0)} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AspectRatioCalc;
