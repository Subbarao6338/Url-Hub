import React, { useState, useEffect, useRef } from 'react';

const HardwareTools = ({ toolId }) => {
  const [activeTab, setActiveTab] = useState('soundmeter');

  useEffect(() => {
    if (toolId) {
      setActiveTab(toolId);
    }
  }, [toolId]);

  return (
    <div className="tool-form">
      {!toolId && (
        <div className="pill-group mb-20 scrollable-x">
          <button className={`pill ${activeTab === 'soundmeter' ? 'active' : ''}`} onClick={() => setActiveTab('soundmeter')}>Sound Meter</button>
          <button className={`pill ${activeTab === 'flashlight' ? 'active' : ''}`} onClick={() => setActiveTab('flashlight')}>Flashlight</button>
          <button className={`pill ${activeTab === 'vibrometer' ? 'active' : ''}`} onClick={() => setActiveTab('vibrometer')}>Vibrometer</button>
          <button className={`pill ${activeTab === 'magnifier' ? 'active' : ''}`} onClick={() => setActiveTab('magnifier')}>Magnifier</button>
        </div>
      )}

      {activeTab === 'soundmeter' && <SoundMeter />}
      {activeTab === 'flashlight' && <Flashlight />}
      {activeTab === 'vibrometer' && <Vibrometer />}
      {activeTab === 'magnifier' && <Magnifier />}
    </div>
  );
};

const SoundMeter = () => {
    const [decibels, setDecibels] = useState(0);
    const [maxDecibels, setMaxDecibels] = useState(0);
    const [active, setActive] = useState(false);
    const audioCtxRef = useRef(null);
    const analyserRef = useRef(null);
    const streamRef = useRef(null);
    const rafRef = useRef(null);

    const start = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;
            audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioCtxRef.current.createMediaStreamSource(stream);
            analyserRef.current = audioCtxRef.current.createAnalyser();
            analyserRef.current.fftSize = 256;
            source.connect(analyserRef.current);

            setActive(true);
            const bufferLength = analyserRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const update = () => {
                analyserRef.current.getByteFrequencyData(dataArray);
                let sum = 0;
                for(let i = 0; i < bufferLength; i++) {
                    sum += dataArray[i];
                }
                const average = sum / bufferLength;
                const db = Math.round(average);
                setDecibels(db);
                setMaxDecibels(m => Math.max(m, db));
                rafRef.current = requestAnimationFrame(update);
            };
            update();
        } catch (err) {
            console.error("Mic access denied", err);
            alert("Microphone access is required for Sound Meter");
        }
    };

    const stop = () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
        if (audioCtxRef.current) audioCtxRef.current.close();
        setActive(false);
        setDecibels(0);
    };

    useEffect(() => () => stop(), []);

    return (
        <div className="text-center">
            <div className="sensor-circle" style={{
                margin: '20px auto',
                width: '180px',
                height: '180px',
                borderRadius: '50%',
                border: '8px solid var(--bg-secondary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: `conic-gradient(var(--primary) ${decibels * 3.6}deg, transparent 0deg)`
            }}>
                <div style={{ fontSize: '3rem', fontWeight: 'bold' }}>{decibels}</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.6 }}>dB</div>
            </div>
            <p>Max: {maxDecibels} dB</p>
            <button className={`btn-primary w-full ${active ? 'danger' : ''}`} onClick={active ? stop : start}>
                {active ? 'Stop Meter' : 'Start Meter'}
            </button>
        </div>
    );
};

const Flashlight = () => {
    const [on, setOn] = useState(false);
    const trackRef = useRef(null);

    const toggle = async () => {
        try {
            if (!on) {
                const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
                const track = stream.getVideoTracks()[0];
                const capabilities = track.getCapabilities();
                if (capabilities.torch) {
                    await track.applyConstraints({ advanced: [{ torch: true }] });
                    trackRef.current = track;
                    setOn(true);
                } else {
                    alert("Torch not supported on this device");
                    track.stop();
                }
            } else {
                if (trackRef.current) {
                    await trackRef.current.applyConstraints({ advanced: [{ torch: false }] });
                    trackRef.current.stop();
                }
                setOn(false);
            }
        } catch (err) {
            console.error(err);
            alert("Camera access denied or torch not available");
        }
    };

    useEffect(() => () => {
        if (trackRef.current) trackRef.current.stop();
    }, []);

    return (
        <div className="text-center">
            <div className={`sensor-circle ${on ? 'active' : ''}`} onClick={toggle} style={{
                margin: '20px auto',
                width: '150px',
                height: '150px',
                cursor: 'pointer',
                background: on ? 'var(--sunlight)' : 'var(--bg-secondary)',
                boxShadow: on ? '0 0 40px var(--sunlight)' : 'none'
            }}>
                <span className="material-icons" style={{ fontSize: '5rem', color: on ? 'white' : 'var(--text-muted)' }}>
                    {on ? 'flashlight_on' : 'flashlight_off'}
                </span>
            </div>
            <p className="mt-20">{on ? 'Flashlight is ON' : 'Tap to turn on'}</p>
        </div>
    );
};

const Vibrometer = () => {
    const [vibrating, setVibrating] = useState(false);
    const intervalRef = useRef(null);

    const startVibration = () => {
        if (!("vibrate" in navigator)) {
            alert("Vibration not supported on this device");
            return;
        }
        setVibrating(true);
        navigator.vibrate([200, 100, 200]);
        intervalRef.current = setInterval(() => {
            navigator.vibrate([200, 100, 200]);
        }, 500);
    };

    const stopVibration = () => {
        setVibrating(false);
        clearInterval(intervalRef.current);
        navigator.vibrate(0);
    };

    useEffect(() => () => stopVibration(), []);

    return (
        <div className="text-center">
            <div className={`sensor-circle ${vibrating ? 'vibrating' : ''}`} style={{ margin: '40px auto' }}>
                <span className="material-icons" style={{ fontSize: '4rem' }}>vibration</span>
            </div>
            <button className={`btn-primary w-full ${vibrating ? 'danger' : ''}`} onClick={vibrating ? stopVibration : startVibration}>
                {vibrating ? 'Stop Vibration' : 'Start Continuous Vibration'}
            </button>
            <div className="pill-group mt-20">
                <button className="pill" onClick={() => navigator.vibrate(50)}>Short Pulse</button>
                <button className="pill" onClick={() => navigator.vibrate([100, 50, 100])}>Double Pulse</button>
            </div>
        </div>
    );
};

const Magnifier = () => {
    const videoRef = useRef(null);
    const [zoom, setZoom] = useState(1);
    const [error, setError] = useState(null);

    useEffect(() => {
        let stream;
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            .then(s => {
                stream = s;
                if (videoRef.current) videoRef.current.srcObject = s;
            })
            .catch(err => {
                console.error(err);
                setError("Camera access denied");
            });
        return () => {
            if (stream) stream.getTracks().forEach(t => t.stop());
        };
    }, []);

    return (
        <div className="text-center">
            {error ? <p className="danger">{error}</p> : (
                <>
                    <div style={{ width: '100%', height: '300px', borderRadius: '24px', overflow: 'hidden', position: 'relative', background: '#000' }}>
                        <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})` }} />
                    </div>
                    <div className="mt-20">
                        <label className="flex-between">
                            <span>Zoom</span>
                            <span>{zoom}x</span>
                        </label>
                        <input type="range" min="1" max="10" step="0.1" value={zoom} onChange={e => setZoom(e.target.value)} className="w-full mt-10" />
                    </div>
                </>
            )}
        </div>
    );
};

export default HardwareTools;
