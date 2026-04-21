import React, { useState, useEffect, useRef } from 'react';

const UtilityTools = ({ onResultChange }) => {
  const [timerTime, setTimerTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const timerRef = useRef(null);

  const startTimer = () => {
    if (isTimerRunning) {
      clearInterval(timerRef.current);
    } else {
      timerRef.current = setInterval(() => {
        setTimerTime(t => t + 1);
      }, 1000);
    }
    setIsTimerRunning(!isTimerRunning);
  };

  const resetTimer = () => {
    clearInterval(timerRef.current);
    setTimerTime(0);
    setIsTimerRunning(false);
  };

  useEffect(() => {
    onResultChange({ text: `Timer: ${timerTime}s`, filename: 'timer.txt' });
    return () => clearInterval(timerRef.current);
  }, [timerTime, onResultChange]);

  const formatTime = (s) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="tool-form">
      <div className="tool-result" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>{formatTime(timerTime)}</div>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button className="btn-primary" onClick={startTimer}>{isTimerRunning ? 'Pause' : 'Start'}</button>
          <button className="pill" onClick={resetTimer}>Reset</button>
        </div>
      </div>
    </div>
  );
};

export default UtilityTools;
