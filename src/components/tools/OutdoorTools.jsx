import React, { useState, useEffect, useRef } from 'react';

const OutdoorTools = ({ toolId }) => {
  const [activeTab, setActiveTab] = useState('sos');
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [location, setLocation] = useState(null);
  const [heading, setHeading] = useState(0);

  useEffect(() => {
    if (toolId) {
        if (toolId === 'gps-info') setActiveTab('gps');
        else if (toolId === 'freq-gen') setActiveTab('frequency');
        else setActiveTab(toolId);
    }
  }, [toolId]);

  const requestPermission = async () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
            setLocation(pos.coords);
            setPermissionGranted(true);
        });
    }
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
        const res = await DeviceOrientationEvent.requestPermission();
        if (res === 'granted') setPermissionGranted(true);
    } else {
        setPermissionGranted(true);
    }
  };

  useEffect(() => {
      if (!permissionGranted) return;
      const handleOrientation = (e) => {
          if (e.webkitCompassHeading) setHeading(e.webkitCompassHeading);
          else if (e.alpha) setHeading(360 - e.alpha);
      };
      window.addEventListener('deviceorientation', handleOrientation);
      return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, [permissionGranted]);

  return (
    <div className="tool-form">
      {!toolId && (
        <div className="pill-group" style={{ marginBottom: '20px', overflowX: 'auto', whiteSpace: 'nowrap', display: 'flex', flexWrap: 'nowrap' }}>
          <button className={`pill ${activeTab === 'sos' ? 'active' : ''}`} onClick={() => setActiveTab('sos')}>SOS</button>
          <button className={`pill ${activeTab === 'compass' ? 'active' : ''}`} onClick={() => setActiveTab('compass')}>Compass</button>
          <button className={`pill ${activeTab === 'gps' ? 'active' : ''}`} onClick={() => setActiveTab('gps')}>GPS</button>
          <button className={`pill ${activeTab === 'frequency' ? 'active' : ''}`} onClick={() => setActiveTab('frequency')}>Frequency</button>
          <button className={`pill ${activeTab === 'magnifier' ? 'active' : ''}`} onClick={() => setActiveTab('magnifier')}>Magnifier</button>
          <button className={`pill ${activeTab === 'mirror' ? 'active' : ''}`} onClick={() => setActiveTab('mirror')}>Mirror</button>
        </div>
      )}

      {!permissionGranted && (activeTab === 'compass' || activeTab === 'gps') && (
          <button className="btn-primary" onClick={requestPermission} style={{ width: '100%' }}>Enable Sensors/GPS</button>
      )}

      {activeTab === 'sos' && <SosTool />}
      {activeTab === 'compass' && <CompassTool heading={heading} />}
      {activeTab === 'gps' && <GpsTool location={location} />}
      {activeTab === 'frequency' && <FrequencyTool />}
      {activeTab === 'magnifier' && <MagnifierTool />}
      {activeTab === 'mirror' && <MirrorTool />}
    </div>
  );
};

const SosTool = () => {
    const [active, setActive] = useState(false);
    const timeoutRef = useRef(null);

    const toggleSos = () => {
        if (active) {
            clearTimeout(timeoutRef.current);
            document.body.style.background = '';
            setActive(false);
        } else {
            setActive(true);
            let step = 0;
            const pattern = [200, 200, 200, 200, 200, 600, 600, 200, 600, 200, 600, 600, 200, 200, 200, 200, 200, 1000]; // Morse SOS
            const run = () => {
                document.body.style.background = step % 2 === 0 ? 'white' : 'black';
                const delay = pattern[step % pattern.length];
                step++;
                timeoutRef.current = setTimeout(run, delay);
            };
            run();
        }
    };

    useEffect(() => () => {
        clearTimeout(timeoutRef.current);
        document.body.style.background = '';
    }, []);

    return (
        <div style={{ textAlign: 'center' }}>
            <button className="btn-primary" onClick={toggleSos} style={{ width: '100%', height: '100px', fontSize: '2rem', background: active ? '#ef4444' : 'var(--primary)' }}>{active ? 'STOP SOS' : 'START SOS'}</button>
            <p style={{ marginTop: '20px' }}>Flashes screen in SOS Morse code</p>
        </div>
    );
};

const CompassTool = ({ heading }) => (
    <div style={{ textAlign: 'center', position: 'relative', height: '250px' }}>
        <div style={{
            width: '200px',
            height: '200px',
            border: '4px solid var(--primary)',
            borderRadius: '50%',
            margin: '0 auto',
            position: 'relative',
            transform: `rotate(${-heading}deg)`,
            transition: 'transform 0.1s ease-out'
        }}>
            <div style={{ position: 'absolute', top: '10px', left: '50%', transform: 'translateX(-50%)', fontWeight: 'bold', color: '#ef4444' }}>N</div>
            <div style={{ position: 'absolute', bottom: '10px', left: '50%', transform: 'translateX(-50%)' }}>S</div>
            <div style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }}>W</div>
            <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)' }}>E</div>
            <div style={{ position: 'absolute', top: '50%', left: '50%', width: '4px', height: '80px', background: 'var(--primary)', transformOrigin: 'bottom center', transform: 'translate(-50%, -100%)' }} />
        </div>
        <div style={{ marginTop: '20px', fontSize: '1.5rem' }}>{Math.round(heading)}°</div>
    </div>
);

const GpsTool = ({ location }) => (
    <div style={{ textAlign: 'center' }}>
        {location ? (
            <div className="tool-result">
                <div>Lat: {location.latitude.toFixed(6)}</div>
                <div>Lon: {location.longitude.toFixed(6)}</div>
                <div>Alt: {location.altitude?.toFixed(1) || 'N/A'} m</div>
                <div style={{ marginTop: '10px', fontSize: '0.8rem', opacity: 0.6 }}>Accuracy: {location.accuracy.toFixed(1)}m</div>
            </div>
        ) : <p>Waiting for GPS...</p>}
    </div>
);

const FrequencyTool = () => {
    const [freq, setFreq] = useState(440);
    const [active, setActive] = useState(false);
    const oscRef = useRef(null);
    const audioCtxRef = useRef(null);

    const toggle = () => {
        if (active) {
            oscRef.current.stop();
            setActive(false);
        } else {
            if (!audioCtxRef.current) audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
            oscRef.current = audioCtxRef.current.createOscillator();
            oscRef.current.frequency.value = freq;
            oscRef.current.connect(audioCtxRef.current.destination);
            oscRef.current.start();
            setActive(true);
        }
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '20px' }}>{freq} Hz</div>
            <input type="range" min="100" max="5000" value={freq} onChange={e => {
                setFreq(e.target.value);
                if (oscRef.current) oscRef.current.frequency.value = e.target.value;
            }} style={{ width: '100%', marginBottom: '20px' }} />
            <button className="btn-primary" onClick={toggle} style={{ width: '100%' }}>{active ? 'Stop' : 'Start'}</button>
        </div>
    );
};

const MagnifierTool = () => {
    const videoRef = useRef(null);
    const [zoom, setZoom] = useState(1);
    useEffect(() => {
        let videoStream;
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } }).then(stream => {
            videoStream = stream;
            if (videoRef.current) videoRef.current.srcObject = stream;
        }).catch(err => console.error(err));
        return () => {
            if (videoStream) videoStream.getTracks().forEach(track => track.stop());
        };
    }, []);
    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{ width: '100%', height: '300px', borderRadius: '16px', overflow: 'hidden', position: 'relative', background: '#000' }}>
                <video ref={videoRef} autoPlay playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transform: `scale(${zoom})`, transition: 'transform 0.1s ease-out' }} />
            </div>
            <div style={{ marginTop: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px' }}>Zoom: {zoom}x</label>
                <input type="range" min="1" max="5" step="0.1" value={zoom} onChange={e => setZoom(parseFloat(e.target.value))} style={{ width: '100%' }} />
            </div>
        </div>
    );
};

const MirrorTool = () => {
    const videoRef = useRef(null);
    useEffect(() => {
        let videoStream;
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } }).then(stream => {
            videoStream = stream;
            if (videoRef.current) videoRef.current.srcObject = stream;
        }).catch(err => console.error(err));
        return () => {
            if (videoStream) videoStream.getTracks().forEach(track => track.stop());
        };
    }, []);
    return (
        <div style={{ textAlign: 'center' }}>
            <video ref={videoRef} autoPlay playsInline style={{ width: '100%', borderRadius: '16px', transform: 'scaleX(-1)' }} />
        </div>
    );
};

export default OutdoorTools;
