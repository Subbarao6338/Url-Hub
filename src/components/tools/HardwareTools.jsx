import React, { useState, useEffect, useRef } from 'react';

const HardwareTools = ({ onResultChange, toolId }) => {
  const [activeTab, setActiveTab] = useState('flashlight');

  useEffect(() => {
    if (toolId === 'flashlight') setActiveTab('flashlight');
    else if (toolId === 'magnifier') setActiveTab('magnifier');
    else if (toolId === 'vibrometer') setActiveTab('vibrometer');
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
  const trackRef = useRef(null);

  const toggleFlash = async () => {
    try {
      if (!isOn) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities();
        if (capabilities.torch) {
          await track.applyConstraints({ advanced: [{ torch: true }] });
          trackRef.current = track;
          setIsOn(true);
        } else {
          alert("Torch not supported on this device.");
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
      alert("Permission denied or camera in use.");
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
      <div
        onClick={toggleFlash}
        style={{
          width: '120px',
          height: '120px',
          borderRadius: '60px',
          background: isOn ? 'var(--nature-gold)' : 'var(--nature-mist)',
          margin: '0 auto 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: isOn ? '0 0 40px var(--nature-gold)' : 'none',
          transition: 'all 0.3s ease'
        }}
      >
        <span className="material-icons" style={{ fontSize: '3rem', color: isOn ? 'white' : 'var(--nature-primary)' }}>
          {isOn ? 'flashlight_on' : 'flashlight_off'}
        </span>
      </div>

      <div className="form-group">
        <label>Strobe Mode (Hz): {strobe}</label>
        <input type="range" min="0" max="10" value={strobe} onChange={(e) => setStrobe(parseInt(e.target.value))} style={{ width: '100%' }} />
      </div>

      <div className="pill-group" style={{ justifyContent: 'center', marginTop: '1rem' }}>
        <button className="pill" onClick={() => { setStrobe(2); if(!isOn) toggleFlash(); }}>S.O.S</button>
        <button className="pill" onClick={() => { setStrobe(0); }}>Normal</button>
      </div>
    </div>
  );
};

const MagnifierTool = () => {
  const videoRef = useRef(null);
  const [zoom, setZoom] = useState(1);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    const startCam = async () => {
      try {
        const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', zoom: true } });
        setStream(s);
        if (videoRef.current) videoRef.current.srcObject = s;
      } catch (err) {
        console.error(err);
      }
    };
    startCam();
    return () => stream?.getTracks().forEach(t => t.stop());
  }, []);

  const handleZoom = (e) => {
    const z = parseFloat(e.target.value);
    setZoom(z);
    const track = stream?.getVideoTracks()[0];
    if (track) {
      track.applyConstraints({ advanced: [{ zoom: z }] });
    }
  };

  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '24px', background: 'black' }}>
      <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '300px', objectFit: 'cover' }} />
      <div style={{ position: 'absolute', bottom: '20px', left: '20px', right: '20px', background: 'rgba(0,0,0,0.5)', padding: '10px', borderRadius: '12px' }}>
        <input type="range" min="1" max="5" step="0.1" value={zoom} onChange={handleZoom} style={{ width: '100%' }} />
        <div style={{ color: 'white', textAlign: 'center', fontSize: '0.8rem', marginTop: '5px' }}>Zoom: {zoom}x</div>
      </div>
    </div>
  );
};

const VibrometerTool = () => {
  const [history, setHistory] = useState(new Array(30).fill(0));
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive) return;
    const handleMotion = (e) => {
      const total = Math.abs(e.acceleration?.x || 0) + Math.abs(e.acceleration?.y || 0) + Math.abs(e.acceleration?.z || 0);
      setHistory(prev => [...prev, total].slice(-30));
    };
    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [isActive]);

  const testVibration = () => {
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    } else {
      alert("Vibration not supported.");
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ height: '100px', display: 'flex', alignItems: 'flex-end', gap: '2px', padding: '10px', background: 'var(--nature-bg)', borderRadius: '12px', border: '1px solid var(--border)', marginBottom: '20px' }}>
        {history.map((h, i) => (
          <div key={i} style={{ flex: 1, height: `${Math.min(100, h * 10)}%`, background: 'var(--nature-primary)', borderRadius: '2px' }} />
        ))}
      </div>
      <button className="btn-primary" onClick={() => setIsActive(!isActive)}>
        {isActive ? 'Stop Monitoring' : 'Start Monitor'}
      </button>
      <button className="pill" onClick={testVibration} style={{ marginLeft: '10px' }}>
        Test Vibration
      </button>
    </div>
  );
};

const SoundMeterTool = ({ onResultChange }) => {
  const [dB, setDb] = useState(0);
  const [history, setHistory] = useState(new Array(50).fill(0));
  const audioCtxRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const startMeter = async () => {
      try {
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
      }
    };
    startMeter();
    return () => {
      audioCtxRef.current?.close();
      streamRef.current?.getTracks().forEach(t => t.stop());
    };
  }, []);

  useEffect(() => {
    onResultChange({ text: `Current Sound Level: ${dB} dB`, filename: 'sound_log.txt' });
  }, [dB, onResultChange]);

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '4rem', fontWeight: 'bold', color: 'var(--nature-primary)' }}>{dB} <span style={{ fontSize: '1rem' }}>dB</span></div>
      <div style={{ height: '60px', display: 'flex', alignItems: 'center', gap: '1px', marginBottom: '20px' }}>
        {history.map((h, i) => (
          <div key={i} style={{ flex: 1, height: `${h}%`, background: h > 70 ? 'var(--nature-gold)' : 'var(--nature-moss)', borderRadius: '1px' }} />
        ))}
      </div>
      <p style={{ opacity: 0.6, fontSize: '0.8rem' }}>Ambient sound level monitoring via microphone.</p>
    </div>
  );
};

export default HardwareTools;
