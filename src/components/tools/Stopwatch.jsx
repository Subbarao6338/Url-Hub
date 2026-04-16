import React, { useState, useEffect, useRef } from 'react';

const Stopwatch = ({ onResultChange }) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    const { h, m, s, ms } = formatTime(time);
    let lapText = laps.map((lap, i) => {
      const lt = formatTime(lap.time);
      return `Lap ${laps.length - i}: ${lt.h}:${lt.m}:${lt.s}.${lt.ms}`;
    }).join('\n');

    onResultChange({
      text: `Current Time: ${h}:${m}:${s}.${ms}\n\nLaps:\n${lapText}`,
      filename: 'stopwatch_result.txt'
    });
  }, [time, laps, onResultChange]);
  const [isActive, setIsActive] = useState(false);
  const [laps, setLaps] = useState([]);
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
    setLaps([]);
  };

  const addLap = () => {
    setLaps([{ id: Date.now(), time }, ...laps]);
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
        {isActive && (
          <button className="pill" style={{ minWidth: '100px' }} onClick={addLap}>
            Lap
          </button>
        )}
        <button
          className="pill"
          style={{ minWidth: '120px', border: '1px solid rgba(var(--primary-rgb), 0.2)' }}
          onClick={resetStopwatch}
        >
          Reset
        </button>
      </div>

      {laps.length > 0 && (
        <div style={{ marginTop: '2rem', maxWidth: '300px', margin: '2rem auto 0' }}>
          <h3>Laps</h3>
          <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: '12px', marginTop: '10px' }}>
            {laps.map((lap, index) => {
              const { h, m, s, ms } = formatTime(lap.time);
              return (
                <div key={lap.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 15px', borderBottom: index < laps.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <span style={{ opacity: 0.5 }}>#{laps.length - index}</span>
                  <span style={{ fontFamily: 'monospace' }}>{h}:{m}:{s}.{ms}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Stopwatch;
