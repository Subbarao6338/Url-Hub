import React, { useState, useEffect, useRef } from 'react';

const HardwareTools = ({ toolId }) => {
  const [activeTab, setActiveTab] = useState('soundmeter');

  useEffect(() => {
    if (toolId) {
      if (toolId === 'magnetic-tester') {
        setActiveTab('magnetic');
      } else if (toolId === 'soundmeter') {
        setActiveTab('soundmeter');
      } else {
        setActiveTab(toolId);
      }
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
          <button className={`pill ${activeTab === 'luxmeter' ? 'active' : ''}`} onClick={() => setActiveTab('luxmeter')}>Luxmeter</button>
          <button className={`pill ${activeTab === 'magnetic' ? 'active' : ''}`} onClick={() => setActiveTab('magnetic')}>Magnetic</button>
        </div>
      )}

      {activeTab === 'soundmeter' && <SoundMeter />}
      {activeTab === 'flashlight' && <Flashlight />}
      {activeTab === 'vibrometer' && <Vibrometer />}
      {activeTab === 'magnifier' && <Magnifier />}
      {activeTab === 'luxmeter' && <Luxmeter />}
      {activeTab === 'magnetic' && <Magnetic />}
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

    const [error, setError] = useState(null);

    const start = async () => {
        setError(null);
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
            setError("Microphone access denied. Please enable microphone permissions in your browser settings to use the Sound Meter.");
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
            {error && <div className="danger-box">{error}</div>}
            <div className="sensor-circle" style={{
                width: '180px',
                height: '180px',
                border: '8px solid var(--border)',
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
    const [error, setError] = useState(null);
    const trackRef = useRef(null);

    const toggle = async () => {
        setError(null);
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
                    setError("Torch not supported on this device's camera.");
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
            setError("Camera access denied. Flashlight requires camera permission to control the torch.");
        }
    };

    useEffect(() => () => {
        if (trackRef.current) trackRef.current.stop();
    }, []);

    return (
        <div className="text-center">
            {error && <div className="danger-box">{error}</div>}
            <div className={`sensor-circle ${on ? 'active' : ''}`} onClick={toggle} style={{
                width: '150px',
                height: '150px',
                cursor: 'pointer',
                background: on ? 'var(--nature-gold)' : 'var(--nature-mist)',
                boxShadow: on ? '0 0 40px var(--nature-gold)' : 'none'
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
            {error ? <p className="danger-box">{error}</p> : (
                <>
                    <div className="magnifier-preview">
                        <video ref={videoRef} autoPlay playsInline className="magnifier-video" style={{ transform: `scale(${zoom})` }} />
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

const Luxmeter = () => {
    const [light, setLight] = useState(0);
    const [active, setActive] = useState(false);
    const sensorRef = useRef(null);
    const [error, setError] = useState(null);

    const start = () => {
        if (!('AmbientLightSensor' in window)) {
            setError("Ambient Light Sensor not supported by your browser/device.");
            return;
        }
        try {
            sensorRef.current = new window.AmbientLightSensor();
            sensorRef.current.onreading = () => setLight(sensorRef.current.illuminance);
            sensorRef.current.onerror = (e) => setError(`Sensor error: ${e.error.message}`);
            sensorRef.current.start();
            setActive(true);
        } catch (e) {
            setError("Could not start sensor. Permission might be required.");
        }
    };

    const stop = () => {
        sensorRef.current?.stop();
        setActive(false);
    };

    useEffect(() => () => stop(), []);

    return (
        <div className="text-center p-20">
            {error && <div className="danger-box">{error}</div>}
            <div className="sensor-circle">
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary)' }}>{light.toFixed(0)}</div>
                <div style={{ fontSize: '1rem', opacity: 0.6 }}>lux</div>
            </div>
            <button className={`btn-primary w-full ${active ? 'danger' : ''}`} onClick={active ? stop : start}>
                {active ? 'Stop Sensor' : 'Start Sensor'}
            </button>
        </div>
    );
};

const Magnetic = () => {
    const [mag, setMag] = useState({ x: 0, y: 0, z: 0 });
    const [active, setActive] = useState(false);
    const sensorRef = useRef(null);
    const [error, setError] = useState(null);

    const start = () => {
        if (!('Magnetometer' in window)) {
            setError("Magnetometer not supported by your browser/device.");
            return;
        }
        try {
            sensorRef.current = new window.Magnetometer();
            sensorRef.current.onreading = () => setMag({ x: sensorRef.current.x, y: sensorRef.current.y, z: sensorRef.current.z });
            sensorRef.current.onerror = (e) => setError(`Sensor error: ${e.error.message}`);
            sensorRef.current.start();
            setActive(true);
        } catch (e) {
            setError("Could not start sensor. Permission might be required.");
        }
    };

    const stop = () => {
        sensorRef.current?.stop();
        setActive(false);
    };

    useEffect(() => () => stop(), []);

    const total = Math.sqrt(mag.x**2 + mag.y**2 + mag.z**2).toFixed(1);

    return (
        <div className="text-center p-20">
            {error && <div className="danger-box">{error}</div>}
            <div className="sensor-circle">
                <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary)' }}>{total}</div>
                <div style={{ fontSize: '1rem', opacity: 0.6 }}>µT</div>
            </div>
            <div className="grid grid-3 gap-10 mb-20">
                <div className="card p-10">X: {mag.x.toFixed(1)}</div>
                <div className="card p-10">Y: {mag.y.toFixed(1)}</div>
                <div className="card p-10">Z: {mag.z.toFixed(1)}</div>
            </div>
            <button className={`btn-primary w-full ${active ? 'danger' : ''}`} onClick={active ? stop : start}>
                {active ? 'Stop Sensor' : 'Start Sensor'}
            </button>
        </div>
    );
};

export default HardwareTools;
