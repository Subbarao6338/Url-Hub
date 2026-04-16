import React, { useState, useEffect, useRef } from 'react';

const Stopwatch = () => {
  const [time, setTime] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isActive) {
      const startTime = Date.now() - time;
      intervalRef.current = setInterval(() => {
        setTime(Date.now() - startTime);
      }, 50);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [isActive]);

  const toggleStopwatch = () => {
    setIsActive(!isActive);
  };

  const resetStopwatch = () => {
    setIsActive(false);
    setTime(0);
  };

  const formatTime = (time) => {
    const ms = Math.floor((time % 1000) / 10);
    const s = Math.floor((time / 1000) % 60);
    const m = Math.floor((time / 60000) % 60);
    const h = Math.floor(time / 3600000);
    return {
      h: h.toString().padStart(2, '0'),
      m: m.toString().padStart(2, '0'),
      s: s.toString().padStart(2, '0'),
      ms: ms.toString().padStart(2, '0')
    };
  };

  const { h, m, s, ms } = formatTime(time);

  return (
    <div className="tool-form" style={{ textAlign: 'center', padding: '20px' }}>
      <div style={{ fontSize: '4rem', fontFamily: 'monospace', marginBottom: '2rem', color: 'var(--primary)' }}>
        {h}:{m}:{s}<span style={{ fontSize: '2rem', opacity: 0.5 }}>.{ms}</span>
      </div>
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
        <button
          className={`btn-primary ${isActive ? 'active' : ''}`}
          style={{ minWidth: '120px' }}
          onClick={toggleStopwatch}
        >
          {isActive ? 'Pause' : (time > 0 ? 'Resume' : 'Start')}
        </button>
        <button
          className="pill"
          style={{ minWidth: '120px', border: '1px solid rgba(var(--primary-rgb), 0.2)' }}
          onClick={resetStopwatch}
        >
          Reset
        </button>
      </div>
    </div>
  );
};

export default Stopwatch;
