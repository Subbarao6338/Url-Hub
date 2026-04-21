import React, { useState, useEffect } from 'react';

const UtilityTools = ({ onResultChange, toolId }) => {
  const [activeTab, setActiveTab] = useState('timer');

  return (
    <div className="tool-form">
      <div className="main-category-nav" style={{ padding: '0 0 1.5rem 0' }}>
        <button className={`pill ${activeTab === 'timer' ? 'active' : ''}`} onClick={() => setActiveTab('timer')}>Timer</button>
        <button className={`pill ${activeTab === 'worldclock' ? 'active' : ''}`} onClick={() => setActiveTab('worldclock')}>World Clock</button>
        <button className={`pill ${activeTab === 'alarm' ? 'active' : ''}`} onClick={() => setActiveTab('alarm')}>Alarm</button>
      </div>

      {activeTab === 'timer' && <TimerTool />}
      {activeTab === 'worldclock' && <WorldClockTool />}
      {activeTab === 'alarm' && <AlarmTool />}
    </div>
  );
};

const TimerTool = () => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval = null;
    if (isActive && seconds > 0) {
      interval = setInterval(() => setSeconds(s => s - 1), 1000);
    } else if (seconds === 0) {
      setIsActive(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);

  const formatTime = (s) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '5rem', fontFamily: 'monospace', color: 'var(--nature-primary)' }}>{formatTime(seconds)}</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
        {[1, 5, 10].map(m => (
          <button key={m} className="pill" onClick={() => setSeconds(m * 60)}>+{m}m</button>
        ))}
      </div>
      <button className="btn-primary" style={{ width: '100%' }} onClick={() => setIsActive(!isActive)}>
        {isActive ? 'Pause' : 'Start Timer'}
      </button>
    </div>
  );
};

const WorldClockTool = () => {
  const [time, setTime] = useState(new Date());
  const zones = [
    { name: 'Local', zone: undefined },
    { name: 'London', zone: 'Europe/London' },
    { name: 'New York', zone: 'America/New_York' },
    { name: 'Tokyo', zone: 'Asia/Tokyo' },
    { name: 'Sydney', zone: 'Australia/Sydney' }
  ];

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {zones.map(z => (
        <div key={z.name} className="card" style={{ padding: '15px', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: '600' }}>{z.name}</div>
          <div style={{ fontSize: '1.2rem', fontFamily: 'monospace', color: 'var(--nature-primary)' }}>
            {time.toLocaleTimeString('en-US', { timeZone: z.zone, hour12: false })}
          </div>
        </div>
      ))}
    </div>
  );
};

const AlarmTool = () => {
  const [alarms, setAlarms] = useState([]);
  const [newAlarm, setNewAlarm] = useState("08:00");

  const addAlarm = () => {
    setAlarms([...alarms, { time: newAlarm, active: true }]);
  };

  return (
    <div>
      <div className="form-group" style={{ display: 'flex', gap: '10px' }}>
        <input type="time" className="form-control" value={newAlarm} onChange={e => setNewAlarm(e.target.value)} />
        <button className="btn-primary" onClick={addAlarm}>Set Alarm</button>
      </div>
      <div style={{ marginTop: '20px' }}>
        {alarms.map((a, i) => (
          <div key={i} className="card" style={{ padding: '15px', flexDirection: 'row', justifyContent: 'space-between', marginBottom: '10px' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{a.time}</div>
            <div className="material-icons" style={{ color: a.active ? 'var(--nature-moss)' : 'var(--border)' }}>notifications_active</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UtilityTools;
