import React, { useState, useEffect, useRef } from 'react';
import JsBarcode from 'jsbarcode';

const Generators = ({ onResultChange, toolId }) => {
  const [activeTab, setActiveTab] = useState('barcode');

  useEffect(() => {
    if (toolId) {
        if (toolId === 'barcode-gen') setActiveTab('barcode');
        else if (toolId === 'random-numbers') setActiveTab('random');
        else if (toolId === 'magic-8ball') setActiveTab('magic8');
        else setActiveTab(toolId);
    }
  }, [toolId]);

  return (
    <div className="tool-form">
      {!toolId && (
        <div className="pill-group mb-20 scrollable-x">
          <button className={`pill ${activeTab === 'barcode' ? 'active' : ''}`} onClick={() => setActiveTab('barcode')}>Barcode</button>
          <button className={`pill ${activeTab === 'random' ? 'active' : ''}`} onClick={() => setActiveTab('random')}>Random Numbers</button>
          <button className={`pill ${activeTab === 'magic8' ? 'active' : ''}`} onClick={() => setActiveTab('magic8')}>Magic 8-Ball</button>
        </div>
      )}

      {activeTab === 'barcode' && <BarcodeTool onResultChange={onResultChange} />}
      {activeTab === 'random' && <RandomNumbersTool />}
      {activeTab === 'magic8' && <Magic8BallTool />}
    </div>
  );
};

const BarcodeTool = ({ onResultChange }) => {
    const [input, setInput] = useState('12345678');
    const [format, setFormat] = useState('CODE128');
    const canvasRef = useRef(null);

    useEffect(() => {
        if (!canvasRef.current || !input) return;
        try {
            // Stricter validation for specific formats
            if (format === 'EAN13' && !/^\d{12,13}$/.test(input)) {
                console.warn("Invalid EAN13 input");
                return;
            }
            if (format === 'UPC' && !/^\d{11,12}$/.test(input)) {
                console.warn("Invalid UPC input");
                return;
            }

            JsBarcode(canvasRef.current, input, {
                format,
                valid: (valid) => {
                    if (valid) {
                        canvasRef.current.toBlob(blob => {
                            onResultChange({ text: input, blob, filename: 'barcode.png' });
                        });
                    }
                }
            });
        } catch (e) {
            console.error("Barcode generation failed:", e);
        }
    }, [input, format, onResultChange]);

    return (
        <div className="text-center">
            <input value={input} onChange={e => setInput(e.target.value)} placeholder="Text/Number" className="pill w-full mb-10" />
            <select value={format} onChange={e => setFormat(e.target.value)} className="pill w-full mb-10">
                <option value="CODE128">CODE128</option>
                <option value="EAN13">EAN13</option>
                <option value="UPC">UPC</option>
            </select>
            <div className="barcode-canvas-container">
                <canvas ref={canvasRef}></canvas>
            </div>
        </div>
    );
};

const RandomNumbersTool = () => {
    const [min, setMin] = useState(1);
    const [max, setMax] = useState(100);
    const [count, setCount] = useState(1);
    const [results, setResults] = useState([]);

    const generate = () => {
        const res = [];
        for (let i = 0; i < count; i++) {
            res.push(Math.floor(Math.random() * (max - min + 1)) + parseInt(min));
        }
        setResults(res);
    };

    return (
        <div className="text-center">
            <div className="flex-gap mb-10">
                <input type="number" value={min} onChange={e => setMin(e.target.value)} placeholder="Min" className="pill" style={{ flex: 1 }} />
                <input type="number" value={max} onChange={e => setMax(e.target.value)} placeholder="Max" className="pill" style={{ flex: 1 }} />
            </div>
            <input type="number" value={count} onChange={e => setCount(e.target.value)} placeholder="Count" className="pill w-full mb-10" />
            <button className="btn-primary w-full" onClick={generate}>Generate</button>
            <div className="mt-20" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{results.join(', ')}</div>
        </div>
    );
};

const Magic8BallTool = () => {
    const answers = ["It is certain", "It is decidedly so", "Without a doubt", "Yes definitely", "You may rely on it", "As I see it, yes", "Most likely", "Outlook good", "Yes", "Signs point to yes", "Reply hazy, try again", "Ask again later", "Better not tell you now", "Cannot predict now", "Concentrate and ask again", "Don't count on it", "My reply is no", "My sources say no", "Outlook not so good", "Very doubtful"];
    const [answer, setAnswer] = useState("Ask a question");
    const [shaking, setShaking] = useState(false);

    const ask = () => {
        setShaking(true);
        setTimeout(() => {
            setAnswer(answers[Math.floor(Math.random() * answers.length)]);
            setShaking(false);
        }, 1000);
    };

    return (
        <div className="text-center p-20">
            <div className={`magic-8-ball ${shaking ? 'shake' : ''}`} style={{
                animation: shaking ? 'shake 0.5s infinite' : 'none'
            }}>
                <div className="magic-8-window">
                    {answer}
                </div>
            </div>
            <button className="btn-primary" onClick={ask} disabled={shaking}>Ask the Ball</button>
            <style>{`@keyframes shake { 0% { transform: translate(1px, 1px) rotate(0deg); } 10% { transform: translate(-1px, -2px) rotate(-1deg); } 20% { transform: translate(-3px, 0px) rotate(1deg); } 30% { transform: translate(3px, 2px) rotate(0deg); } 40% { transform: translate(1px, -1px) rotate(1deg); } 50% { transform: translate(-1px, 2px) rotate(-1deg); } 60% { transform: translate(-3px, 1px) rotate(0deg); } 70% { transform: translate(3px, 1px) rotate(-1deg); } 80% { transform: translate(-1px, -1px) rotate(1deg); } 90% { transform: translate(1px, 2px) rotate(0deg); } 100% { transform: translate(1px, -2px) rotate(-1deg); } }`}</style>
        </div>
    );
};

export default Generators;
