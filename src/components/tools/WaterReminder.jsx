import React, { useState, useEffect } from 'react';
import { storage } from '../../utils/storage';

const WaterReminder = () => {
  const [goal, setGoal] = useState(storage.get('hub_water_goal', 2000));
  const [current, setCurrent] = useState(0);
  const [lastLog, setLastLog] = useState(null);

  useEffect(() => {
    const today = new Date().toDateString();
    const saved = storage.getJSON('hub_water_data', {});
    if (saved.date === today) {
      setCurrent(saved.amount || 0);
      setLastLog(saved.lastLog || null);
    } else {
      setCurrent(0);
      setLastLog(null);
    }
  }, []);

  useEffect(() => {
    const today = new Date().toDateString();
    storage.setJSON('hub_water_data', { date: today, amount: current, lastLog });
  }, [current, lastLog]);

  useEffect(() => {
    storage.set('hub_water_goal', goal);
  }, [goal]);

  const addWater = (amount) => {
    setCurrent(prev => Math.min(prev + amount, 10000));
    setLastLog(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  };

  const reset = () => {
    if (window.confirm("Reset today's progress?")) {
      setCurrent(0);
      setLastLog(null);
    }
  };

  const percentage = Math.min(Math.round((current / goal) * 100), 100);

  return (
    <div className="tool-form text-center">
      <div className="water-reminder-stats">
        <div className="card">
          <div className="opacity-6 mb-10">DAILY GOAL</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
            <input
              type="number"
              value={goal}
              onChange={e => setGoal(parseInt(e.target.value) || 0)}
              style={{ width: '80px', textAlign: 'center', border: 'none', background: 'none', fontSize: 'inherit', fontWeight: 'inherit', color: 'inherit' }}
            />
            <span style={{ fontSize: '1rem', fontWeight: 400 }}>ml</span>
          </div>
        </div>
        <div className="card">
          <div className="opacity-6 mb-10">CURRENT</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{current}<span style={{ fontSize: '1rem', fontWeight: 400 }}>ml</span></div>
        </div>
      </div>

      <div className="water-progress-container">
        <div className="water-progress-bar" style={{ width: `${percentage}%` }} />
      </div>
      <div className="mb-20" style={{ fontWeight: 600, color: 'var(--primary)' }}>{percentage}% of daily goal</div>

      <div className="pill-group" style={{ justifyContent: 'center' }}>
        <button className="pill" onClick={() => addWater(250)}>
          <span className="material-icons">local_drink</span> +250ml
        </button>
        <button className="pill" onClick={() => addWater(500)}>
          <span className="material-icons">local_drink</span> +500ml
        </button>
        <button className="pill" onClick={reset}>
          <span className="material-icons">restart_alt</span> Reset
        </button>
      </div>

      {lastLog && (
        <p className="mt-20 opacity-6" style={{ fontSize: '0.9rem' }}>
          Last hydration: {lastLog}
        </p>
      )}
    </div>
  );
};

export default WaterReminder;
