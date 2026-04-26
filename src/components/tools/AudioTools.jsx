import React, { useState, useEffect, useRef } from 'react';

const AudioTools = ({ toolId }) => {
  const [activeTab, setActiveTab] = useState('frequency');

  useEffect(() => {
    if (toolId) {
      if (toolId === 'frequency-gen') setActiveTab('frequency');
      else if (toolId === 'tuner') setActiveTab('tuner');
    }
  }, [toolId]);

  return (
    <div className="tool-form">
      {!toolId && (
        <div className="pill-group mb-20 scrollable-x">
          <button className={`pill ${activeTab === 'frequency' ? 'active' : ''}`} onClick={() => setActiveTab('frequency')}>Frequency Gen</button>
          <button className={`pill ${activeTab === 'tuner' ? 'active' : ''}`} onClick={() => setActiveTab('tuner')}>Instrument Tuner</button>
        </div>
      )}

      {activeTab === 'frequency' && <FrequencyGenerator />}
      {activeTab === 'tuner' && <InstrumentTuner />}
    </div>
  );
};

const FrequencyGenerator = () => {
    const [freq, setFreq] = useState(440);
    const [type, setType] = useState('sine');
    const [playing, setPlaying] = useState(false);
    const audioCtxRef = useRef(null);
    const oscRef = useRef(null);
    const gainRef = useRef(null);

    const toggle = () => {
        if (playing) {
            oscRef.current.stop();
            setPlaying(false);
        } else {
            if (!audioCtxRef.current) {
                audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
            oscRef.current = audioCtxRef.current.createOscillator();
            gainRef.current = audioCtxRef.current.createGain();

            oscRef.current.type = type;
            oscRef.current.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);

            oscRef.current.connect(gainRef.current);
            gainRef.current.connect(audioCtxRef.current.destination);

            oscRef.current.start();
            setPlaying(true);
        }
    };

    useEffect(() => {
        if (playing && oscRef.current) {
            oscRef.current.frequency.setTargetAtTime(freq, audioCtxRef.current.currentTime, 0.05);
        }
    }, [freq, playing]);

    useEffect(() => {
        if (playing && oscRef.current) {
            oscRef.current.type = type;
        }
    }, [type, playing]);

    useEffect(() => () => {
        if (oscRef.current) oscRef.current.stop();
    }, []);

    return (
        <div className="text-center">
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '20px' }}>{freq} Hz</div>
            <input type="range" min="20" max="2000" value={freq} onChange={(e) => setFreq(parseInt(e.target.value))} className="w-full mb-20" />

            <div className="pill-group mb-20 flex-center">
                {['sine', 'square', 'sawtooth', 'triangle'].map(t => (
                    <button key={t} className={`pill ${type === t ? 'active' : ''}`} onClick={() => setType(t)} style={{ textTransform: 'capitalize' }}>{t}</button>
                ))}
            </div>

            <button className={`btn-primary w-full ${playing ? 'danger' : ''}`} onClick={toggle}>
                {playing ? 'Stop' : 'Start'}
            </button>
        </div>
    );
};

const InstrumentTuner = () => {
    const [note, setNote] = useState('-');
    const [frequency, setFrequency] = useState(0);
    const [cents, setCents] = useState(0);
    const [active, setActive] = useState(false);
    const audioCtxRef = useRef(null);
    const analyserRef = useRef(null);
    const streamRef = useRef(null);
    const rafRef = useRef(null);

    const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];

    const getNote = (freq) => {
        const h = 12 * Math.log2(freq / 440) + 69;
        const i = Math.round(h);
        const note = notes[i % 12];
        const cents = Math.floor((h - i) * 100);
        return { note, cents };
    };

    const start = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioCtxRef.current.createMediaStreamSource(stream);
            analyserRef.current = audioCtxRef.current.createAnalyser();
            analyserRef.current.fftSize = 2048;
            source.connect(analyserRef.current);

            setActive(true);
            const bufferLength = analyserRef.current.frequencyBinCount;
            const dataArray = new Float32Array(bufferLength);

            const update = () => {
                analyserRef.current.getFloatTimeDomainData(dataArray);
                const freq = autoCorrelate(dataArray, audioCtxRef.current.sampleRate);
                if (freq !== -1) {
                    setFrequency(freq.toFixed(1));
                    const { note, cents } = getNote(freq);
                    setNote(note);
                    setCents(cents);
                }
                rafRef.current = requestAnimationFrame(update);
            };
            update();
        } catch (err) { console.error(err); }
    };

    const stop = () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        if (audioCtxRef.current) audioCtxRef.current.close();
        setActive(false);
    };

    // Standard autocorrelation algorithm for pitch detection
    const autoCorrelate = (buffer, sampleRate) => {
        let SIZE = buffer.length;
        let rms = 0;
        for (let i = 0; i < SIZE; i++) rms += buffer[i] * buffer[i];
        rms = Math.sqrt(rms / SIZE);
        if (rms < 0.01) return -1;

        let r1 = 0, r2 = SIZE - 1, threshold = 0.2;
        for (let i = 0; i < SIZE / 2; i++) if (Math.abs(buffer[i]) < threshold) { r1 = i; break; }
        for (let i = 1; i < SIZE / 2; i++) if (Math.abs(buffer[SIZE - i]) < threshold) { r2 = SIZE - i; break; }

        buffer = buffer.slice(r1, r2);
        SIZE = buffer.length;

        const c = new Array(SIZE).fill(0);
        for (let i = 0; i < SIZE; i++)
            for (let j = 0; j < SIZE - i; j++)
                c[i] = c[i] + buffer[j] * buffer[j + i];

        let d = 0;
        while (c[d] > c[d + 1]) d++;
        let maxval = -1, maxpos = -1;
        for (let i = d; i < SIZE; i++) {
            if (c[i] > maxval) {
                maxval = c[i];
                maxpos = i;
            }
        }
        let T0 = maxpos;
        return sampleRate / T0;
    };

    useEffect(() => () => stop(), []);

    return (
        <div className="text-center">
            <div className="sensor-circle" style={{ margin: '20px auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ fontSize: '4rem', fontWeight: 'bold' }}>{note}</div>
                <div style={{ fontSize: '1rem', opacity: 0.6 }}>{frequency} Hz</div>
            </div>
            <div className="w-full bg-border" style={{ height: '10px', borderRadius: '5px', overflow: 'hidden', position: 'relative' }}>
                <div style={{
                    position: 'absolute',
                    left: `${50 + (cents / 2)}%`,
                    width: '4px',
                    height: '100%',
                    background: 'var(--primary)',
                    transition: 'left 0.1s ease'
                }} />
                <div style={{ position: 'absolute', left: '50%', width: '1px', height: '100%', background: 'var(--on-surface)', opacity: 0.3 }} />
            </div>
            <div className="flex-between mt-10 opacity-6" style={{ fontSize: '0.8rem' }}>
                <span>Low</span>
                <span>In Tune</span>
                <span>High</span>
            </div>
            <button className={`btn-primary w-full mt-20 ${active ? 'danger' : ''}`} onClick={active ? stop : start}>
                {active ? 'Stop Tuner' : 'Start Tuner'}
            </button>
        </div>
    );
};

export default AudioTools;
