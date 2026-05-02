import React, { useState, useEffect, useRef } from 'react';

const CreativeTools = ({ toolId, onResultChange }) => {
  const [activeTab, setActiveTab] = useState('canvas');

  useEffect(() => {
    if (toolId) {
      if (toolId === 'canvas-draw') setActiveTab('canvas');
      else if (toolId === 'palette-gen') setActiveTab('palette');
      else setActiveTab(toolId);
    }
  }, [toolId]);

  return (
    <div className="tool-form">
      {!toolId && (
        <div className="pill-group mb-20 scrollable-x">
          <button className={`pill ${activeTab === 'canvas' ? 'active' : ''}`} onClick={() => setActiveTab('canvas')}>Canvas Draw</button>
          <button className={`pill ${activeTab === 'palette' ? 'active' : ''}`} onClick={() => setActiveTab('palette')}>Palette Gen</button>
        </div>
      )}

      {activeTab === 'canvas' && <CanvasDraw onResultChange={onResultChange} />}
      {activeTab === 'palette' && <PaletteGenerator onResultChange={onResultChange} />}
    </div>
  );
};

const CanvasDraw = ({ onResultChange }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#2d6a4f');
    const [brushSize, setBrushSize] = useState(5);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = color;
        ctx.lineWidth = brushSize;
    }, [color, brushSize]);

    const startDrawing = (e) => {
        const { offsetX, offsetY } = getCoordinates(e);
        const ctx = canvasRef.current.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = getCoordinates(e);
        const ctx = canvasRef.current.getContext('2d');
        ctx.lineTo(offsetX, offsetY);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
        if (onResultChange) {
            canvasRef.current.toBlob(blob => {
                onResultChange({ blob, filename: 'drawing.png' });
            });
        }
    };

    const getCoordinates = (e) => {
        if (e.touches) {
            const rect = canvasRef.current.getBoundingClientRect();
            return {
                offsetX: e.touches[0].clientX - rect.left,
                offsetY: e.touches[0].clientY - rect.top
            };
        }
        return { offsetX: e.nativeEvent.offsetX, offsetY: e.nativeEvent.offsetY };
    };

    const clear = () => {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        if (onResultChange) onResultChange(null);
    };

    return (
        <div className="text-center">
            <div className="flex-between mb-15 flex-wrap gap-10">
                <div className="flex-center gap-10">
                    <input type="color" value={color} onChange={e => setColor(e.target.value)} className="pill" style={{ padding: '2px', width: '40px', height: '40px' }} />
                    <input type="range" min="1" max="50" value={brushSize} onChange={e => setBrushSize(e.target.value)} className="pill" />
                </div>
                <button className="pill" onClick={clear}>Clear Canvas</button>
            </div>
            <canvas
                ref={canvasRef}
                width={600}
                height={400}
                style={{
                    width: '100%',
                    height: 'auto',
                    background: 'white',
                    borderRadius: '24px',
                    border: '4px solid var(--border)',
                    cursor: 'crosshair',
                    touchAction: 'none'
                }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
            />
        </div>
    );
};

const PaletteGenerator = ({ onResultChange }) => {
    const [palette, setPalette] = useState([]);

    const generateRandom = () => {
        const newPalette = Array.from({ length: 5 }, () => {
            return '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
        });
        setPalette(newPalette);
    };

    useEffect(() => {
        generateRandom();
    }, []);

    useEffect(() => {
        if (onResultChange && palette.length > 0) {
            onResultChange({ text: palette.join('\n'), filename: 'palette.txt' });
        }
    }, [palette, onResultChange]);

    const copy = (hex) => {
        navigator.clipboard.writeText(hex);
        // Simple visual feedback could be added here
    };

    return (
        <div className="text-center">
            <div className="grid gap-15 mb-20" style={{ gridTemplateColumns: 'repeat(5, 1fr)', height: '200px' }}>
                {palette.map((color, i) => (
                    <div
                        key={i}
                        onClick={() => copy(color)}
                        style={{
                            background: color,
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'flex-end',
                            justifyContent: 'center',
                            padding: '10px',
                            cursor: 'pointer',
                            transition: 'transform 0.2s',
                            border: '1px solid var(--border)'
                        }}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                        <span style={{
                            background: 'rgba(255,255,255,0.8)',
                            padding: '2px 6px',
                            borderRadius: '8px',
                            fontSize: '0.7rem',
                            fontWeight: 'bold',
                            color: '#000'
                        }}>{color.toUpperCase()}</span>
                    </div>
                ))}
            </div>
            <button className="btn-primary w-full" onClick={generateRandom}>Generate New Palette</button>
        </div>
    );
};

export default CreativeTools;
