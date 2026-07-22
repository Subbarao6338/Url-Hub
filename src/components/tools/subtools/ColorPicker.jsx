import React, { useState } from 'react';
import ToolResult from '../ToolResult';

const ColorPicker = () => {
    const [color, setColor] = useState('#4a7c59');

    const hexToRgb = (hex) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgb(${r}, ${g}, ${b})`;
    };

    const handleReset = () => {
        setColor('#4a7c59');
    };

    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text);
        alert(`Copied ${label} value to clipboard: ${text}`);
    };

    return (
        <div className="grid gap-20 text-center">
            <div className="flex-center">
                <input type="color" className="cursor-pointer" style={{width: '150px', height: '150px', border: 'none', background: 'none'}} value={color} onChange={e=>setColor(e.target.value)} />
            </div>
            <div className="grid grid-2-cols gap-10">
                <div className="card p-15 bg-surface rounded-xl cursor-pointer" onClick={() => copyToClipboard(color.toUpperCase(), 'HEX')} title="Click to Copy HEX">
                    <div className="smallest opacity-6 uppercase flex-center gap-5">
                        HEX <span className="material-icons" style={{fontSize: '0.9rem'}}>content_copy</span>
                    </div>
                    <div className="font-mono font-bold">{color.toUpperCase()}</div>
                </div>
                <div className="card p-15 bg-surface rounded-xl cursor-pointer" onClick={() => copyToClipboard(hexToRgb(color), 'RGB')} title="Click to Copy RGB">
                    <div className="smallest opacity-6 uppercase flex-center gap-5">
                        RGB <span className="material-icons" style={{fontSize: '0.9rem'}}>content_copy</span>
                    </div>
                    <div className="font-mono font-bold">{hexToRgb(color)}</div>
                </div>
            </div>
            {color !== '#4a7c59' && (
                <div className="flex-center">
                    <button className="pill" onClick={handleReset} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                        Reset Color
                    </button>
                </div>
            )}
            <ToolResult result={{ text: `HEX: ${color.toUpperCase()}\nRGB: ${hexToRgb(color)}` }} title="Color Values" />
        </div>
    );
};

export default ColorPicker;
