import React, { useState } from 'react';

const ColorPicker = () => {
  const [color, setColor] = useState('#6366f1');

  const updateColor = (hex) => {
    setColor(hex);
  };

  const getRgb = (hex) => {
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    return `rgb(${r}, ${g}, ${b})`;
  };

  return (
    <div className="tool-form" style={{ textAlign: 'center' }}>
      <div style={{ width: '150px', height: '150px', borderRadius: '50%', margin: '0 auto 2rem', background: color, border: '8px solid white', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}></div>
      <input
        type="color"
        value={color}
        onInput={(e) => updateColor(e.target.value)}
        style={{ width: '100%', height: '50px', borderRadius: '12px', cursor: 'pointer', border: 'none', background: 'transparent' }}
      />
      <div style={{ display: 'flex', gap: '10px', marginTop: '2rem' }}>
        <div className="tool-result" style={{ flex: 1, fontFamily: 'monospace', fontSize: '1.2rem' }}>{color.toUpperCase()}</div>
        <div className="tool-result" style={{ flex: 1, fontFamily: 'monospace', fontSize: '1rem' }}>{getRgb(color)}</div>
      </div>
    </div>
  );
};

export default ColorPicker;
