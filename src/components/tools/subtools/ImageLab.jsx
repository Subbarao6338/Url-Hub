import React, { useState, useRef } from 'react';
import ToolResult from '../ToolResult';

const ImageLab = () => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [brightness, setBrightness] = useState(100);

    const runTransform = (type) => {
        if (!file) return setResult({ error: 'Select image.' });
        setLoading(true);
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = img.width; canvas.height = img.height;

                let filter = '';
                if (type === 'grayscale') filter = 'grayscale(100%)';
                else if (type === 'sepia') filter = 'sepia(100%)';
                else if (type === 'brightness') filter = `brightness(${brightness}%)`;
                else if (type === 'invert') filter = 'invert(100%)';

                if (type === 'rotate') {
                    canvas.width = img.height; canvas.height = img.width;
                    ctx.translate(canvas.width / 2, canvas.height / 2); ctx.rotate(90 * Math.PI / 180);
                    ctx.drawImage(img, -img.width / 2, -img.height / 2);
                } else if (type === 'flip') {
                    ctx.scale(-1, 1); ctx.drawImage(img, -img.width, 0);
                } else if (type === 'anonymize') {
                    ctx.drawImage(img, 0, 0); ctx.filter = 'blur(15px)';
                    const bx = canvas.width * 0.1, by = canvas.height * 0.1, bw = canvas.width * 0.8, bh = canvas.height * 0.8;
                    ctx.drawImage(img, bx, by, bw, bh, bx, by, bw, bh); ctx.filter = 'none';
                } else {
                    if (filter) ctx.filter = filter;
                    ctx.drawImage(img, 0, 0);
                }

                const url = canvas.toDataURL('image/png');
                setResult({ text: `Applied ${type} transformation`, url, filename: `transformed_${type}.png` });
                setLoading(false);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="card p-30 glass-card grid gap-15">
            <h3>Image Privacy & Edit Lab</h3>
            <div className="file-input-wrapper">
                <input type="file" id="img-in" onChange={e=>setFile(e.target.files[0])} accept="image/*" />
                <label htmlFor="img-in" className="file-input-label">{file?file.name:'Choose Image'}</label>
            </div>

            <button className="btn-primary w-full" onClick={()=>runTransform('anonymize')} disabled={loading}>Anonymize (Blur Center)</button>

            <div className="grid grid-3 gap-10">
                <button className="pill" onClick={()=>runTransform('rotate')} disabled={loading}>Rotate</button>
                <button className="pill" onClick={()=>runTransform('flip')} disabled={loading}>Flip</button>
                <button className="pill" onClick={()=>runTransform('grayscale')} disabled={loading}>Gray</button>
                <button className="pill" onClick={()=>runTransform('sepia')} disabled={loading}>Sepia</button>
                <button className="pill" onClick={()=>runTransform('invert')} disabled={loading}>Invert</button>
                <button className="pill" onClick={()=>runTransform('brightness')} disabled={loading}>Apply Brightness</button>
            </div>

            <div className="form-group">
                <label className="smallest opacity-6 uppercase ml-10">Brightness ({brightness}%)</label>
                <input type="range" min="0" max="200" value={brightness} onChange={e=>setBrightness(e.target.value)} className="w-full" />
            </div>

            <ToolResult result={result} />
        </div>
    );
};

export default ImageLab;
