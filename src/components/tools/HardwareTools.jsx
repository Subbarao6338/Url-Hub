import React, { useState, useEffect, useRef } from 'react';
import { STRINGS } from '../../strings';

const HardwareTools = ({ onResultChange, toolId }) => {
  const [activeTab, setActiveTab] = useState('flashlight');

  useEffect(() => {
    if (toolId === 'flashlight') setActiveTab('flashlight');
    else if (toolId === 'magnifier') setActiveTab('magnifier');
    else if (toolId === 'vibrometer') setActiveTab('vibrometer');
    else if (toolId === 'soundmeter') setActiveTab('soundmeter');
  }, [toolId]);

  return (
    <div className="tool-form">
      {!toolId && (
        <div className="main-category-nav" style={{ padding: '0 0 1.5rem 0' }}>
          <button className={`pill ${activeTab === 'flashlight' ? 'active' : ''}`} onClick={() => setActiveTab('flashlight')}>Flashlight</button>
          <button className={`pill ${activeTab === 'magnifier' ? 'active' : ''}`} onClick={() => setActiveTab('magnifier')}>Magnifier</button>
          <button className={`pill ${activeTab === 'vibrometer' ? 'active' : ''}`} onClick={() => setActiveTab('vibrometer')}>Vibrometer</button>
          <button className={`pill ${activeTab === 'soundmeter' ? 'active' : ''}`} onClick={() => setActiveTab('soundmeter')}>Sound Meter</button>
        </div>
      )}

      {activeTab === 'flashlight' && <FlashlightTool />}
      {activeTab === 'magnifier' && <MagnifierTool />}
      {activeTab === 'vibrometer' && <VibrometerTool />}
      {activeTab === 'soundmeter' && <SoundMeterTool onResultChange={onResultChange} />}
    </div>
  );
};

const FlashlightTool = () => {
  const [isOn, setIsOn] = useState(false);
  const [strobe, setStrobe] = useState(0);
  const [permissionError, setPermissionError] = useState(null);
  const trackRef = useRef(null);

  const toggleFlash = async () => {
    try {
      setPermissionError(null);
      if (!isOn) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities();
        if (capabilities.torch) {
          await track.applyConstraints({ advanced: [{ torch: true }] });
          trackRef.current = track;
          setIsOn(true);
        } else {
          setPermissionError("Torch not supported on this device.");
        }
      } else {
        if (trackRef.current) {
          await trackRef.current.applyConstraints({ advanced: [{ torch: false }] });
          trackRef.current.stop();
        }
        setIsOn(false);
      }
    } catch (err) {
      console.error(err);
      if (err.name === 'NotAllowedError') {
        setPermissionError("Permission denied. We need camera access to use the flashlight.");
      } else {
        setPermissionError("Could not access camera/flashlight.");
      }
    }
  };

  useEffect(() => {
    let interval;
    if (isOn && strobe > 0) {
      interval = setInterval(async () => {
        if (trackRef.current) {
          const settings = trackRef.current.getSettings();
          await trackRef.current.applyConstraints({ advanced: [{ torch: !settings.torch }] });
        }
      }, 1000 / strobe);
    }
    return () => clearInterval(interval);
  }, [isOn, strobe]);

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      {permissionError && (
        <div className="card" style={{ background: '#FFF1F0', borderColor: '#FFA39E', marginBottom: '1.5rem', padding: '1rem' }}>
          <p style={{ color: '#CF1322', fontSize: '0.85rem', margin: 0 }}>{permissionError}</p>
        </div>
      )}

      <div
        onClick={toggleFlash}
        style={{
          width: '140px',
          height: '140px',
          borderRadius: '50%',
          background: isOn ? 'var(--nature-gold)' : 'var(--nature-mist)',
          margin: '0 auto 30px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: isOn ? '0 0 50px rgba(244, 162, 97, 0.4)' : 'none',
          transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          border: '6px solid white'
        }}
      >
        <span className="material-icons" style={{ fontSize: '3.5rem', color: isOn ? 'white' : 'var(--nature-primary)' }}>
          {isOn ? 'lightbulb' : 'lightbulb_outline'}
        </span>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <div className="form-group" style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>Strobe Mode</span>
            <span style={{ color: 'var(--nature-primary)', fontWeight: 'bold' }}>{strobe} Hz</span>
          </label>
          <input type="range" min="0" max="10" value={strobe} onChange={(e) => setStrobe(parseInt(e.target.value))} />
        </div>

        <div className="pill-group" style={{ justifyContent: 'center' }}>
          <button className={`pill ${strobe === 2 ? 'active' : ''}`} onClick={() => { setStrobe(2); if(!isOn) toggleFlash(); }}>S.O.S</button>
          <button className={`pill ${strobe === 0 ? 'active' : ''}`} onClick={() => { setStrobe(0); }}>Normal</button>
        </div>
      </div>
    </div>
  );
};

const MagnifierTool = () => {
  const videoRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const startCam = async () => {
      try {
        setError(null);
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
      } catch (err) {
        console.error(err);
        if (err.name === 'NotAllowedError') {
          setError("We need camera access to provide the magnifying glass experience 🔍");
        } else {
          setError("Unable to start camera.");
        }
      }
    };
    startCam();
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, []);

  const handleZoom = (e) => {
    const z = parseFloat(e.target.value);
    setZoom(z);
    const track = stream?.getVideoTracks()[0];
    if (track) {
      try {
        const caps = track.getCapabilities();
        if (caps.zoom) {
           track.applyConstraints({ advanced: [{ zoom: z }] });
        }
      } catch (err) { console.error("Native zoom not supported"); }
    }
  };

  if (error) {
    return (
      <div className="empty-state">
        <span className="material-icons">no_photography</span>
        <p>{error}</p>
        <button className="btn-primary" onClick={() => window.location.reload()}>Try Again</button>
      </div>
    );
  }

  return (
    <div className="card" style={{ padding: '0', overflow: 'hidden', background: '#000' }}>
      <div style={{ position: 'relative', height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: `scale(${zoom})`,
            transition: 'transform 0.2s'
          }}
        />
        <div style={{
          position: 'absolute',
          inset: '0',
          border: '20px solid rgba(255,255,255,0.1)',
          pointerEvents: 'none',
          boxShadow: 'inset 0 0 100px rgba(0,0,0,0.5)'
        }} />
      </div>

      <div style={{ padding: '1.5rem', background: 'var(--nature-bg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
          <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Magnification Level</span>
          <span className="pill active">{zoom}x</span>
        </div>
        <input type="range" min="1" max="8" step="0.1" value={zoom} onChange={handleZoom} />
      </div>
    </div>
  );
};

const VibrometerTool = () => {
  const [history, setHistory] = useState(new Array(30).fill(0));
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isActive) return;

    const handleMotion = (e) => {
      const total = Math.abs(e.acceleration?.x || 0) + Math.abs(e.acceleration?.y || 0) + Math.abs(e.acceleration?.z || 0);
      setHistory(prev => [...prev, total].slice(-30));
    };

    if (typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission === 'function') {
      DeviceMotionEvent.requestPermission()
        .then(response => {
          if (response === 'granted') {
             window.addEventListener('devicemotion', handleMotion);
          } else {
             setError("Permission denied for motion sensors.");
             setIsActive(false);
          }
        })
        .catch(err => {
          console.error(err);
          setError("Error requesting motion sensors.");
          setIsActive(false);
        });
    } else {
      window.addEventListener('devicemotion', handleMotion);
    }

    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [isActive]);

  return (
    <div style={{ textAlign: 'center' }}>
      {error && <p style={{ color: '#CF1322', fontSize: '0.8rem', marginBottom: '1rem' }}>{error}</p>}

      <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem' }}>
        <div style={{ height: '120px', display: 'flex', alignItems: 'flex-end', gap: '3px', padding: '10px', background: 'rgba(45, 106, 79, 0.05)', borderRadius: '16px', border: '1px solid var(--border)' }}>
          {history.map((h, i) => (
            <div key={i} style={{
              flex: 1,
              height: `${Math.min(100, h * 15)}%`,
              background: 'var(--nature-primary)',
              borderRadius: '4px',
              transition: 'height 0.1s ease'
            }} />
          ))}
        </div>
        <p style={{ marginTop: '1rem', fontSize: '0.85rem', opacity: 0.6 }}>Earthquake and vibration monitor.</p>
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button className={isActive ? "pill active" : "btn-primary"} onClick={() => setIsActive(!isActive)}>
          {isActive ? 'Pause Monitor' : 'Start Monitor'}
        </button>
        <button className="pill" onClick={() => { if(navigator.vibrate) navigator.vibrate([50, 50, 50]); }}>
           <span className="material-icons" style={{ fontSize: '1.1rem' }}>vibration</span> Test Pulse
        </button>
      </div>
    </div>
  );
};

const SoundMeterTool = ({ onResultChange }) => {
  const [dB, setDb] = useState(0);
  const [history, setHistory] = useState(new Array(50).fill(0));
  const [error, setError] = useState(null);
  const audioCtxRef = useRef(null);
  const streamRef = useRef(null);

  const startMeter = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioCtx = new AudioContext();
      audioCtxRef.current = audioCtx;
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const update = () => {
        if (!audioCtxRef.current) return;
        analyser.getByteFrequencyData(dataArray);
        let sum = 0;
        for(let i=0; i<bufferLength; i++) sum += dataArray[i];
        const average = sum / bufferLength;
        const dbValue = Math.round(average);
        setDb(dbValue);
        setHistory(prev => [...prev, dbValue].slice(-50));
        requestAnimationFrame(update);
      };
      update();
    } catch (err) {
      console.error(err);
      if (err.name === 'NotAllowedError') {
        setError("Microphone access is required to measure sound levels 🌲");
      } else {
        setError("Could not access microphone.");
      }
    }
  };

  useEffect(() => {
    startMeter();
    return () => {
      audioCtxRef.current?.close();
      audioCtxRef.current = null;
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  useEffect(() => {
    onResultChange({ text: `Current Sound Level: ${dB} dB`, filename: 'sound_log.txt' });
  }, [dB, onResultChange]);

  return (
    <div style={{ textAlign: 'center' }}>
      {error ? (
         <div className="empty-state">
            <span className="material-icons">mic_off</span>
            <p>{error}</p>
            <button className="btn-primary" onClick={startMeter}>Allow Access</button>
         </div>
      ) : (
        <>
          <div className="card" style={{ padding: '2.5rem 1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '4.5rem', fontWeight: '800', color: 'var(--nature-primary)', fontFamily: 'Outfit' }}>
              {dB} <span style={{ fontSize: '1.5rem', opacity: 0.4 }}>dB</span>
            </div>
            <div style={{
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              marginTop: '1.5rem',
              padding: '10px',
              background: 'var(--nature-bg)',
              borderRadius: '16px'
            }}>
              {history.map((h, i) => (
                <div key={i} style={{
                  flex: 1,
                  height: `${Math.max(5, h)}%`,
                  background: h > 70 ? 'var(--nature-gold)' : 'var(--nature-moss)',
                  borderRadius: '10px',
                  opacity: 0.3 + (h / 100)
                }} />
              ))}
            </div>
          </div>
          <p style={{ opacity: 0.6, fontSize: '0.85rem' }}>Listening to the rustle of leaves… Ambient sound level monitor.</p>
        </>
      )}
    </div>
  );
};

export default HardwareTools;
