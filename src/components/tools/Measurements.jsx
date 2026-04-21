import React, { useState, useEffect, useRef } from 'react';

const Measurements = ({ onResultChange, toolId }) => {
  const [activeTab, setActiveTab] = useState('ruler');

  useEffect(() => {
    if (toolId) {
        if (toolId === 'level-pendulum') setActiveTab('level');
        else if (toolId === 'magnetic-tester') setActiveTab('magnetic');
        else if (toolId === 'tabata-timer') setActiveTab('tabata');
        else if (toolId === 'reaction-time') setActiveTab('reaction');
        else setActiveTab(toolId);
    }
  }, [toolId]);

  const [orientation, setOrientation] = useState({ beta: 0, gamma: 0 });
  const [ambient, setAmbient] = useState({ light: 0, magnetic: { x: 0, y: 0, z: 0 } });
  const [noise, setNoise] = useState(0);
  const [permissionGranted, setPermissionGranted] = useState(false);

  const requestPermission = async () => {
    if (!window.confirm("Measurement tools need access to device sensors (orientation, light, microphone) to function. Proceed?")) {
      return;
    }
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const response = await DeviceOrientationEvent.requestPermission();
        if (response === 'granted') setPermissionGranted(true);
      } catch (err) { console.error(err); }
    } else {
      setPermissionGranted(true);
    }
  };

  useEffect(() => {
    if (!permissionGranted) return;
    const handleOrientation = (e) => {
      setOrientation({ beta: e.beta || 0, gamma: e.gamma || 0 });
    };
    window.addEventListener('deviceorientation', handleOrientation);

    let lightSensor, magSensor;
    try {
        if ('AmbientLightSensor' in window) {
            lightSensor = new window.AmbientLightSensor();
            lightSensor.onreading = () => setAmbient(prev => ({ ...prev, light: lightSensor.illuminance }));
            lightSensor.start();
        }
    } catch (e) { console.warn("AmbientLightSensor not available:", e); }

    try {
        if ('Magnetometer' in window) {
            magSensor = new window.Magnetometer();
            magSensor.onreading = () => setAmbient(prev => ({ ...prev, magnetic: { x: magSensor.x, y: magSensor.y, z: magSensor.z } }));
            magSensor.start();
        }
    } catch (e) { console.warn("Magnetometer not available:", e); }

    let audioContext, analyser, microphone, scriptProcessor, audioStream;
    if (activeTab === 'soundmeter') {
        navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
            audioStream = stream;
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            microphone = audioContext.createMediaStreamSource(stream);
            scriptProcessor = audioContext.createScriptProcessor(2048, 1, 1);
            analyser.smoothingTimeConstant = 0.8;
            analyser.fftSize = 1024;
            microphone.connect(analyser);
            analyser.connect(scriptProcessor);
            scriptProcessor.connect(audioContext.destination);
            scriptProcessor.onaudioprocess = () => {
                const array = new Uint8Array(analyser.frequencyBinCount);
                analyser.getByteFrequencyData(array);
                let values = 0;
                for (let i = 0; i < array.length; i++) values += array[i];
                const average = values / array.length;
                setNoise(Math.round(average));
            };
        }).catch(err => console.error(err));
    }

    return () => {
        window.removeEventListener('deviceorientation', handleOrientation);
        lightSensor?.stop();
        magSensor?.stop();
        if (audioContext) audioContext.close();
        if (audioStream) audioStream.getTracks().forEach(track => track.stop());
    };
  }, [permissionGranted, activeTab]);

  return (
    <div className="tool-form">
      {!toolId && (
        <div className="pill-group" style={{ marginBottom: '20px', overflowX: 'auto', whiteSpace: 'nowrap', display: 'flex', flexWrap: 'nowrap' }}>
          <button className={`pill ${activeTab === 'ruler' ? 'active' : ''}`} onClick={() => setActiveTab('ruler')}>Ruler</button>
          <button className={`pill ${activeTab === 'level' ? 'active' : ''}`} onClick={() => setActiveTab('level')}>Level</button>
          <button className={`pill ${activeTab === 'pendulum' ? 'active' : ''}`} onClick={() => setActiveTab('pendulum')}>Pendulum</button>
          <button className={`pill ${activeTab === 'protractor' ? 'active' : ''}`} onClick={() => setActiveTab('protractor')}>Protractor</button>
          <button className={`pill ${activeTab === 'luxmeter' ? 'active' : ''}`} onClick={() => setActiveTab('luxmeter')}>Luxmeter</button>
          <button className={`pill ${activeTab === 'soundmeter' ? 'active' : ''}`} onClick={() => setActiveTab('soundmeter')}>Soundmeter</button>
          <button className={`pill ${activeTab === 'magnetic' ? 'active' : ''}`} onClick={() => setActiveTab('magnetic')}>Magnetic</button>
          <button className={`pill ${activeTab === 'metronome' ? 'active' : ''}`} onClick={() => setActiveTab('metronome')}>Metronome</button>
          <button className={`pill ${activeTab === 'reaction' ? 'active' : ''}`} onClick={() => setActiveTab('reaction')}>Reaction</button>
          <button className={`pill ${activeTab === 'tabata' ? 'active' : ''}`} onClick={() => setActiveTab('tabata')}>Tabata</button>
        </div>
      )}

      {!permissionGranted && (['level', 'pendulum', 'protractor', 'luxmeter', 'magnetic'].includes(activeTab)) && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <button className="btn-primary" onClick={requestPermission}>Enable Sensors</button>
        </div>
      )}

      {activeTab === 'ruler' && <RulerTool />}
      {activeTab === 'level' && <LevelTool orientation={orientation} />}
      {activeTab === 'pendulum' && <PendulumTool orientation={orientation} />}
      {activeTab === 'protractor' && <ProtractorTool orientation={orientation} />}
      {activeTab === 'luxmeter' && <LuxmeterTool light={ambient.light} />}
      {activeTab === 'soundmeter' && <SoundmeterTool noise={noise} />}
      {activeTab === 'magnetic' && <MagneticTool mag={ambient.magnetic} />}
      {activeTab === 'metronome' && <MetronomeTool />}
      {activeTab === 'reaction' && <ReactionTimeTool />}
      {activeTab === 'tabata' && <TabataTimerTool />}
    </div>
  );
};

const RulerTool = () => {
  const [unit, setUnit] = useState('cm');
  const dpi = 96; // Standard DPI, though it varies by device
  const ppcm = dpi / 2.54;
  const ppin = dpi;

  return (
    <div style={{ position: 'relative', height: '200px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'center', padding: '10px' }}>
        <button className={`pill ${unit === 'cm' ? 'active' : ''}`} onClick={() => setUnit('cm')}>CM</button>
        <button className={`pill ${unit === 'in' ? 'active' : ''}`} onClick={() => setUnit('in')}>IN</button>
      </div>
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '100px', borderTop: '2px solid var(--primary)', display: 'flex', alignItems: 'flex-start' }}>
        {Array.from({ length: 50 }).map((_, i) => {
          const step = unit === 'cm' ? ppcm : ppin;
          const isMajor = i % (unit === 'cm' ? 10 : 8) === 0;
          const isHalf = i % (unit === 'cm' ? 5 : 4) === 0;
          return (
            <div key={i} style={{
              position: 'absolute',
              left: `${i * (step / (unit === 'cm' ? 10 : 8))}px`,
              width: '1px',
              height: isMajor ? '40px' : (isHalf ? '25px' : '15px'),
              background: 'var(--on-surface)',
              opacity: isMajor ? 1 : 0.5
            }}>
              {isMajor && <span style={{ position: 'absolute', top: '45px', left: '-5px', fontSize: '10px' }}>{i / (unit === 'cm' ? 10 : 8)}</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const LevelTool = ({ orientation }) => {
  const x = Math.max(-50, Math.min(50, orientation.gamma));
  const y = Math.max(-50, Math.min(50, orientation.beta));
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ width: '200px', height: '200px', margin: '0 auto', borderRadius: '50%', border: '2px solid var(--border)', position: 'relative', background: 'rgba(var(--primary-rgb), 0.05)' }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          width: '20px',
          height: '20px',
          background: 'var(--primary)',
          borderRadius: '50%',
          transform: `translate(calc(-50% + ${x * 1.5}px), calc(-50% + ${y * 1.5}px))`,
          transition: 'transform 0.1s ease-out'
        }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: '30px', height: '30px', border: '1px solid var(--primary)', borderRadius: '50%', transform: 'translate(-50%, -50%)', opacity: 0.3 }} />
      </div>
      <div style={{ marginTop: '10px' }}>
        X: {orientation.gamma.toFixed(1)}° Y: {orientation.beta.toFixed(1)}°
      </div>
    </div>
  );
};

const PendulumTool = ({ orientation }) => {
    const angle = orientation.gamma;
    return (
        <div style={{ textAlign: 'center', height: '250px', position: 'relative' }}>
             <div style={{
                position: 'absolute',
                top: '20px',
                left: '50%',
                width: '4px',
                height: '180px',
                background: 'var(--on-surface)',
                transformOrigin: 'top center',
                transform: `translateX(-50%) rotate(${angle}deg)`,
                transition: 'transform 0.1s ease-out'
             }}>
                 <div style={{ position: 'absolute', bottom: '-20px', left: '50%', width: '40px', height: '40px', background: 'var(--primary)', borderRadius: '50%', transform: 'translateX(-50%)' }} />
             </div>
             <div style={{ position: 'absolute', bottom: '0', width: '100%' }}>Angle: {angle.toFixed(1)}°</div>
        </div>
    );
};

const ProtractorTool = ({ orientation }) => {
    return (
        <div style={{ textAlign: 'center', position: 'relative', height: '250px' }}>
            <div style={{
                width: '300px',
                height: '150px',
                border: '2px solid var(--border)',
                borderBottom: 'none',
                borderRadius: '150px 150px 0 0',
                margin: '20px auto',
                position: 'relative',
                overflow: 'hidden',
                background: 'rgba(var(--primary-rgb), 0.05)'
            }}>
                {Array.from({ length: 19 }).map((_, i) => (
                    <div key={i} style={{
                        position: 'absolute',
                        bottom: 0,
                        left: '50%',
                        width: '1px',
                        height: i % 3 === 0 ? '20px' : '10px',
                        background: 'var(--on-surface)',
                        transformOrigin: 'bottom center',
                        transform: `rotate(${(i * 10) - 90}deg)`
                    }}>
                        {i % 3 === 0 && <span style={{ position: 'absolute', top: '25px', left: '-10px', fontSize: '10px', transform: `rotate(${90 - (i * 10)}deg)` }}>{i * 10}</span>}
                    </div>
                ))}
                <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    width: '2px',
                    height: '140px',
                    background: 'var(--primary)',
                    transformOrigin: 'bottom center',
                    transform: `translateX(-50%) rotate(${orientation.gamma}deg)`,
                    transition: 'transform 0.1s ease-out'
                }} />
            </div>
            <div>Angle: {(orientation.gamma + 90).toFixed(1)}°</div>
        </div>
    );
};

const LuxmeterTool = ({ light }) => (
    <div style={{ textAlign: 'center', padding: '20px' }}>
        <div style={{ fontSize: '3rem', color: 'var(--primary)' }}>{light.toFixed(1)} <span style={{ fontSize: '1rem' }}>lx</span></div>
        <p>Ambient Light Intensity</p>
    </div>
);

const SoundmeterTool = ({ noise }) => (
    <div style={{ textAlign: 'center', padding: '20px' }}>
        <div style={{ width: '100%', height: '20px', background: 'var(--border)', borderRadius: '10px', overflow: 'hidden', marginBottom: '10px' }}>
            <div style={{ width: `${Math.min(100, noise)}%`, height: '100%', background: 'var(--primary)', transition: 'width 0.1s ease' }} />
        </div>
        <div style={{ fontSize: '3rem', color: 'var(--primary)' }}>{noise} <span style={{ fontSize: '1rem' }}>dB (est)</span></div>
        <p>Noise Level</p>
    </div>
);

const MagneticTool = ({ mag }) => (
    <div style={{ textAlign: 'center', padding: '20px' }}>
        <div style={{ fontSize: '1.5rem', color: 'var(--primary)' }}>
            X: {mag.x.toFixed(2)} Y: {mag.y.toFixed(2)} Z: {mag.z.toFixed(2)}
        </div>
        <div style={{ fontSize: '2rem', marginTop: '10px' }}>
            Total: {Math.sqrt(mag.x**2 + mag.y**2 + mag.z**2).toFixed(2)} µT
        </div>
        <p>Magnetic Field Strength</p>
    </div>
);

const MetronomeTool = () => {
    const [bpm, setBpm] = useState(120);
    const [isPlaying, setIsPlaying] = useState(false);
    const intervalRef = useRef(null);
    const audioCtxRef = useRef(null);

    const playClick = () => {
        if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtxRef.current.createOscillator();
        const envelope = audioCtxRef.current.createGain();
        osc.frequency.value = 880;
        envelope.gain.value = 1;
        envelope.gain.exponentialRampToValueAtTime(0.001, audioCtxRef.current.currentTime + 0.1);
        osc.connect(envelope);
        envelope.connect(audioCtxRef.current.destination);
        osc.start();
        osc.stop(audioCtxRef.current.currentTime + 0.1);
    };

    useEffect(() => {
        if (isPlaying) {
            intervalRef.current = setInterval(playClick, (60 / bpm) * 1000);
        } else {
            clearInterval(intervalRef.current);
        }
        return () => clearInterval(intervalRef.current);
    }, [isPlaying, bpm]);

    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '20px' }}>{bpm} BPM</div>
            <input type="range" min="40" max="240" value={bpm} onChange={(e) => setBpm(e.target.value)} style={{ width: '100%', marginBottom: '20px' }} />
            <button className="btn-primary" onClick={() => setIsPlaying(!isPlaying)} style={{ width: '100%' }}>{isPlaying ? 'Stop' : 'Start'}</button>
        </div>
    );
};

const ReactionTimeTool = () => {
    const [state, setState] = useState('idle'); // idle, waiting, click, result
    const [time, setTime] = useState(null);
    const timerRef = useRef(null);
    const startTimeRef = useRef(null);

    const startTest = () => {
        setState('waiting');
        const delay = 2000 + Math.random() * 3000;
        timerRef.current = setTimeout(() => {
            setState('click');
            startTimeRef.current = Date.now();
        }, delay);
    };

    const handleClick = () => {
        if (state === 'waiting') {
            clearTimeout(timerRef.current);
            setState('idle');
            alert('Too early!');
        } else if (state === 'click') {
            const reactionTime = Date.now() - startTimeRef.current;
            setTime(reactionTime);
            setState('result');
        }
    };

    return (
        <div onClick={handleClick} style={{
            height: '250px',
            background: state === 'waiting' ? '#ef4444' : (state === 'click' ? '#10b981' : 'var(--surface)'),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '12px',
            cursor: 'pointer',
            transition: 'background 0.1s'
        }}>
            {state === 'idle' && <button className="btn-primary" onClick={(e) => { e.stopPropagation(); startTest(); }}>Start Test</button>}
            {state === 'waiting' && <h2 style={{ color: 'white' }}>Wait for Green...</h2>}
            {state === 'click' && <h2 style={{ color: 'white' }}>CLICK NOW!</h2>}
            {state === 'result' && (
                <div style={{ textAlign: 'center' }}>
                    <h2>{time} ms</h2>
                    <button className="pill" onClick={(e) => { e.stopPropagation(); startTest(); }}>Try Again</button>
                </div>
            )}
        </div>
    );
};

const TabataTimerTool = () => {
    const [cycles, setCycles] = useState(8);
    const [work, setWork] = useState(20);
    const [rest, setRest] = useState(10);
    const [timeLeft, setTimeLeft] = useState(work);
    const [currentCycle, setCurrentCycle] = useState(1);
    const [mode, setMode] = useState('Work'); // Work, Rest, Done
    const [isActive, setIsActive] = useState(false);
    const timerRef = useRef(null);

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
        } else if (isActive && timeLeft === 0) {
            if (mode === 'Work') {
                setMode('Rest');
                setTimeLeft(rest);
            } else {
                if (currentCycle < cycles) {
                    setMode('Work');
                    setCurrentCycle(c => c + 1);
                    setTimeLeft(work);
                } else {
                    setMode('Done');
                    setIsActive(false);
                }
            }
        }
        return () => clearInterval(timerRef.current);
    }, [isActive, timeLeft, mode, currentCycle, cycles, work, rest]);

    const reset = () => {
        setIsActive(false);
        setMode('Work');
        setCurrentCycle(1);
        setTimeLeft(work);
    };

    return (
        <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '1rem', opacity: 0.6 }}>Cycle {currentCycle}/{cycles}</div>
            <div style={{ fontSize: '4rem', fontWeight: 'bold', color: mode === 'Work' ? '#ef4444' : '#10b981' }}>{mode}</div>
            <div style={{ fontSize: '5rem', fontFamily: 'monospace' }}>{timeLeft}s</div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button className="btn-primary" style={{ flex: 1 }} onClick={() => setIsActive(!isActive)}>{isActive ? 'Pause' : 'Start'}</button>
                <button className="pill" style={{ flex: 1 }} onClick={reset}>Reset</button>
            </div>
            {!isActive && mode === 'Work' && currentCycle === 1 && (
                <div style={{ marginTop: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '5px' }}>
                    <div>
                        <label style={{ fontSize: '0.7rem' }}>Cycles</label>
                        <input type="number" value={cycles} onChange={e => setCycles(parseInt(e.target.value))} style={{ width: '100%' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.7rem' }}>Work (s)</label>
                        <input type="number" value={work} onChange={e => { setWork(parseInt(e.target.value)); setTimeLeft(parseInt(e.target.value)); }} style={{ width: '100%' }} />
                    </div>
                    <div>
                        <label style={{ fontSize: '0.7rem' }}>Rest (s)</label>
                        <input type="number" value={rest} onChange={e => setRest(parseInt(e.target.value))} style={{ width: '100%' }} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Measurements;
