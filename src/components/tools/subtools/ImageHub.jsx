import React, { useState, useRef, useEffect } from 'react';
import ToolResult from '../ToolResult';

const ImageHub = () => {
    const [file, setFile] = useState(null);
    const [brightness, setBrightness] = useState(100);
    const [contrast, setContrast] = useState(100);
    const [saturation, setSaturation] = useState(100);
    const [grayscale, setGrayscale] = useState(0);
    const [sepia, setSepia] = useState(0);
    const [invert, setInvert] = useState(0);
    const [result, setResult] = useState(null);
    const canvasRef = useRef(null);
    const [originalImg, setOriginalImg] = useState(null);

    useEffect(() => {
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    setOriginalImg(img);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        } else {
            setOriginalImg(null);
            setResult(null);
        }
    }, [file]);

    useEffect(() => {
        if (originalImg) {
            applyFilters();
        }
    }, [originalImg, brightness, contrast, saturation, grayscale, sepia, invert]);

    const applyFilters = () => {
        if (!originalImg) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = originalImg.width;
        canvas.height = originalImg.height;

        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%) grayscale(${grayscale}%) sepia(${sepia}%) invert(${invert}%)`;
        ctx.drawImage(originalImg, 0, 0);

        const dataUrl = canvas.toDataURL('image/png');
        setResult({
            text: `Applied filters: B:${brightness}% C:${contrast}% S:${saturation}%`,
            url: dataUrl,
            filename: 'processed.png'
        });
    };

    const resetFilters = () => {
        setBrightness(100);
        setContrast(100);
        setSaturation(100);
        setGrayscale(0);
        setSepia(0);
        setInvert(0);
    };

    return (
        <div className="card p-30 glass-card text-center grid gap-15">
            <h3>Image Hub (Pro Filters)</h3>
            <div className="file-input-wrapper">
                <input type="file" id="img-file" accept="image/*" onChange={e => setFile(e.target.files[0])} />
                <label htmlFor="img-file" className="file-input-label">{file ? file.name : 'Select Image'}</label>
            </div>

            {file && (
                <div className="grid gap-10 text-left mt-10">
                    <div className="flex-between">
                        <label className="smallest opacity-6 uppercase">Brightness ({brightness}%)</label>
                        <input type="range" min="0" max="200" value={brightness} onChange={e => setBrightness(e.target.value)} />
                    </div>
                    <div className="flex-between">
                        <label className="smallest opacity-6 uppercase">Contrast ({contrast}%)</label>
                        <input type="range" min="0" max="200" value={contrast} onChange={e => setContrast(e.target.value)} />
                    </div>
                    <div className="flex-between">
                        <label className="smallest opacity-6 uppercase">Saturation ({saturation}%)</label>
                        <input type="range" min="0" max="200" value={saturation} onChange={e => setSaturation(e.target.value)} />
                    </div>
                    <div className="grid grid-3-cols gap-5 mt-10">
                        <button className={`pill smallest ${grayscale > 0 ? 'active' : ''}`} onClick={() => setGrayscale(grayscale > 0 ? 0 : 100)}>Gray</button>
                        <button className={`pill smallest ${sepia > 0 ? 'active' : ''}`} onClick={() => setSepia(sepia > 0 ? 0 : 100)}>Sepia</button>
                        <button className={`pill smallest ${invert > 0 ? 'active' : ''}`} onClick={() => setInvert(invert > 0 ? 0 : 100)}>Invert</button>
                    </div>
                    <button className="pill w-full mt-10" onClick={resetFilters}>
                        <span className="material-icons mr-5" style={{fontSize:'1rem'}}>restart_alt</span>
                        Reset Filters
                    </button>
                </div>
            )}

            <canvas ref={canvasRef} style={{ display: 'none' }} />
            <ToolResult result={result} />
        </div>
    );
};

export default ImageHub;
