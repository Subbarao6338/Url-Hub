import React, { useState, useEffect, useRef } from 'react';

const PomodoroTimer = ({ onResultChange }) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);

  useEffect(() => {
    onResultChange({
      text: `Pomodoro Status: ${modes[mode].label} - ${formatTime(timeLeft)}`,
      filename: 'pomodoro_status.txt'
    });
  }, [timeLeft, mode, onResultChange]);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState('work'); // 'work', 'shortBreak', 'longBreak'
  const timerRef = useRef(null);

  const modes = {
    work: { label: 'Work', time: 25 * 60, icon: 'work' },
    shortBreak: { label: 'Short Break', time: 5 * 60, icon: 'coffee' },
    longBreak: { label: 'Long Break', time: 15 * 60, icon: 'self_improvement' }
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      clearInterval(timerRef.current);
      playAlarm();
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(modes[mode].time);
  };

  const changeMode = (newMode) => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(modes[newMode].time);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const playAlarm = () => {
    const context = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = context.createOscillator();
    const gainNode = context.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(context.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(440, context.currentTime);
    gainNode.gain.setValueAtTime(0.1, context.currentTime);

    oscillator.start();
    oscillator.stop(context.currentTime + 1);
  };

  return (
    <div className="tool-form" style={{ textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
      <div className="pill-group" style={{ justifyContent: 'center', marginBottom: '2rem' }}>
        {Object.entries(modes).map(([key, config]) => (
          <button
            key={key}
            className={`pill ${mode === key ? 'active' : ''}`}
            onClick={() => changeMode(key)}
          >
            <span className="material-icons">{config.icon}</span>
            <span>{config.label}</span>
          </button>
        ))}
      </div>

      <div style={{ fontSize: '5rem', fontWeight: '800', margin: '2rem 0', color: 'var(--primary)' }}>
        {formatTime(timeLeft)}
      </div>

      <div className="pill-group" style={{ justifyContent: 'center' }}>
        <button className="pill active" onClick={toggleTimer} style={{ padding: '1rem 2rem', fontSize: '1.2rem' }}>
          <span className="material-icons">{isActive ? 'pause' : 'play_arrow'}</span>
          <span>{isActive ? 'Pause' : 'Start'}</span>
        </button>
        <button className="pill" onClick={resetTimer} style={{ padding: '1rem 2rem', fontSize: '1.2rem' }}>
          <span className="material-icons">refresh</span>
          <span>Reset</span>
        </button>
      </div>

      <p style={{ marginTop: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        A simple Pomodoro timer to help you stay focused.
      </p>
    </div>
  );
};

export default PomodoroTimer;
