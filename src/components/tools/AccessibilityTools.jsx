import React, { useState, useEffect } from 'react';

const AccessibilityTools = ({ toolId }) => {
  const [activeTab, setActiveTab] = useState('contrast');

  useEffect(() => {
    if (toolId) {
      if (toolId === 'contrast-checker') setActiveTab('contrast');
      else if (toolId === 'screen-reader') setActiveTab('reader');
      else setActiveTab(toolId);
    }
  }, [toolId]);

  return (
    <div className="tool-form">
      {!toolId && (
        <div className="pill-group mb-20 scrollable-x">
          <button className={`pill ${activeTab === 'contrast' ? 'active' : ''}`} onClick={() => setActiveTab('contrast')}>Contrast Checker</button>
          <button className={`pill ${activeTab === 'reader' ? 'active' : ''}`} onClick={() => setActiveTab('reader')}>Screen Reader Sim</button>
        </div>
      )}

      {activeTab === 'contrast' && <ContrastChecker />}
      {activeTab === 'reader' && <ScreenReaderSim />}
    </div>
  );
};

const ContrastChecker = () => {
    const [foreground, setForeground] = useState('#2d6a4f');
    const [background, setBackground] = useState('#fdfbf7');

    const hexToRgb = (hex) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return [r, g, b];
    };

    const getLuminance = (r, g, b) => {
        const a = [r, g, b].map(v => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
    };

    const contrast = (rgb1, rgb2) => {
        const l1 = getLuminance(...rgb1) + 0.05;
        const l2 = getLuminance(...rgb2) + 0.05;
        return l1 > l2 ? l1 / l2 : l2 / l1;
    };

    const ratio = contrast(hexToRgb(foreground), hexToRgb(background));

    return (
        <div className="text-center">
            <div className="grid gap-15 mb-20">
                <div className="form-group">
                    <label>Foreground Color</label>
                    <div className="flex-gap">
                        <input type="color" value={foreground} onChange={e => setForeground(e.target.value)} className="pill" style={{ width: '50px' }} />
                        <input type="text" value={foreground} onChange={e => setForeground(e.target.value)} className="pill flex-1" />
                    </div>
                </div>
                <div className="form-group">
                    <label>Background Color</label>
                    <div className="flex-gap">
                        <input type="color" value={background} onChange={e => setBackground(e.target.value)} className="pill" style={{ width: '50px' }} />
                        <input type="text" value={background} onChange={e => setBackground(e.target.value)} className="pill flex-1" />
                    </div>
                </div>
            </div>

            <div className="card p-20 mb-20" style={{ background, color: foreground, border: '2px solid var(--border)' }}>
                <h3 className="m-0">Sample Text</h3>
                <p>The quick brown fox jumps over the lazy dog.</p>
            </div>

            <div className="tool-result">
                <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--primary)' }}>{ratio.toFixed(2)}:1</div>
                <div className="grid gap-10 mt-15">
                    <div className="flex-between"><span>WCAG AA (Small Text, 4.5:1)</span> <b style={{ color: ratio >= 4.5 ? '#10b981' : '#ef4444' }}>{ratio >= 4.5 ? 'PASS' : 'FAIL'}</b></div>
                    <div className="flex-between"><span>WCAG AAA (Small Text, 7:1)</span> <b style={{ color: ratio >= 7 ? '#10b981' : '#ef4444' }}>{ratio >= 7 ? 'PASS' : 'FAIL'}</b></div>
                    <div className="flex-between"><span>WCAG AA (Large Text, 3:1)</span> <b style={{ color: ratio >= 3 ? '#10b981' : '#ef4444' }}>{ratio >= 3 ? 'PASS' : 'FAIL'}</b></div>
                </div>
            </div>
        </div>
    );
};

const ScreenReaderSim = () => {
    const [text, setText] = useState('This is a screen reader simulator. Type something here and click play to hear how it would sound to a user with visual impairments.');
    const [speaking, setSpeaking] = useState(false);

    const speak = () => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const msg = new SpeechSynthesisUtterance(text);
        msg.onstart = () => setSpeaking(true);
        msg.onend = () => setSpeaking(false);
        window.speechSynthesis.speak(msg);
    };

    return (
        <div className="text-center">
            <textarea
                className="pill w-full mb-15"
                rows="6"
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Enter text to read..."
            />
            <button className={`btn-primary w-full ${speaking ? 'danger' : ''}`} onClick={speaking ? () => window.speechSynthesis.cancel() : speak}>
                <span className="material-icons mr-10">{speaking ? 'stop' : 'volume_up'}</span>
                {speaking ? 'Stop Reading' : 'Play Screen Reader'}
            </button>
            <div className="tool-result mt-20 opacity-7 text-left" style={{ fontSize: '0.85rem' }}>
                <p><strong>Note:</strong> This uses the browser's built-in Text-to-Speech API. Actual screen readers (like NVDA, JAWS, or VoiceOver) may have slightly different pronunciations and navigation cues.</p>
            </div>
        </div>
    );
};

export default AccessibilityTools;
