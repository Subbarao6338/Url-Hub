import React, { useState, useEffect } from 'react';

const HardwareTools = ({ onResultChange }) => {
  const [flashlightOn, setFlashlightOn] = useState(false);
  const trackRef = React.useRef(null);

  const toggleFlashlight = async () => {
    if (!flashlightOn && !window.confirm("Flashlight tool needs camera access to control the torch. Proceed?")) {
      return;
    }
    try {
      if (!flashlightOn) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        });
        const track = stream.getVideoTracks()[0];
        const capabilities = track.getCapabilities();
        if (capabilities.torch) {
          await track.applyConstraints({
            advanced: [{ torch: true }]
          });
          trackRef.current = track;
          setFlashlightOn(true);
        } else {
          track.stop();
          alert("Flashlight (torch) not supported on this device.");
        }
      } else {
        if (trackRef.current) {
          await trackRef.current.applyConstraints({
            advanced: [{ torch: false }]
          });
          trackRef.current.stop();
          trackRef.current = null;
        }
        setFlashlightOn(false);
      }
    } catch (err) {
      console.error("Flashlight error:", err);
    }
  };

  useEffect(() => {
    onResultChange({ text: `Flashlight: ${flashlightOn ? 'ON' : 'OFF'}`, filename: 'hardware_status.txt' });
    return () => {
      if (trackRef.current) {
        trackRef.current.stop();
      }
    };
  }, [flashlightOn, onResultChange]);

  return (
    <div className="tool-form">
      <div className="tool-result" style={{ textAlign: 'center', padding: '2rem' }}>
        <span className="material-icons" style={{ fontSize: '4rem', color: flashlightOn ? 'var(--accent-yellow)' : 'var(--text-muted)', marginBottom: '1rem' }}>
          {flashlightOn ? 'flashlight_on' : 'flashlight_off'}
        </span>
        <h3>Flashlight</h3>
        <button className={`btn-primary ${flashlightOn ? 'active' : ''}`} onClick={toggleFlashlight} style={{ marginTop: '20px' }}>
          {flashlightOn ? 'Turn OFF' : 'Turn ON'}
        </button>
      </div>
    </div>
  );
};

export default HardwareTools;
