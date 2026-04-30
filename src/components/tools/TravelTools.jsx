import React, { useState, useEffect, useRef } from 'react';

const TravelTools = ({ onResultChange, toolId }) => {
  const [activeTab, setActiveTab] = useState('world-clock');

  useEffect(() => {
    if (toolId) {
      if (toolId === 'world-clock') setActiveTab('world-clock');
      else if (toolId === 'timezone-conv') setActiveTab('timezone');
      else if (toolId === 'packing-list') setActiveTab('packing');
      else setActiveTab('world-clock');
    }
  }, [toolId]);

  return (
    <div className="tool-form">
      {!toolId && (
        <div className="pill-group mb-20 scrollable-x">
          <button className={`pill ${activeTab === 'world-clock' ? 'active' : ''}`} onClick={() => setActiveTab('world-clock')}>World Clock</button>
          <button className={`pill ${activeTab === 'timezone' ? 'active' : ''}`} onClick={() => setActiveTab('timezone')}>Timezone Conv</button>
          <button className={`pill ${activeTab === 'packing' ? 'active' : ''}`} onClick={() => setActiveTab('packing')}>Packing List</button>
        </div>
      )}

      {activeTab === 'world-clock' && <WorldClockTool />}
      {activeTab === 'timezone' && <TimezoneConverter />}
      {activeTab === 'packing' && <PackingListTool onResultChange={onResultChange} />}
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
    { name: 'Sydney', zone: 'Australia/Sydney' },
    { name: 'Dubai', zone: 'Asia/Dubai' }
  ];

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="grid gap-12">
      {zones.map(z => (
        <div key={z.name} className="card p-15 flex-between no-animation">
          <div className="font-bold">{z.name}</div>
          <div className="font-mono" style={{ fontSize: '1.25rem', color: 'var(--primary)' }}>
            {time.toLocaleTimeString('en-US', { timeZone: z.zone, hour12: false })}
          </div>
        </div>
      ))}
    </div>
  );
};

const TimezoneConverter = () => {
  const [sourceTime, setSourceTime] = useState(new Date().toISOString().slice(0, 16));
  const [targetZone, setTargetZone] = useState('UTC');

  const commonZones = [
    'UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London',
    'Europe/Paris', 'Asia/Tokyo', 'Asia/Shanghai', 'Asia/Kolkata', 'Australia/Sydney', 'Asia/Dubai'
  ];

  const convert = () => {
    try {
      const date = new Date(sourceTime);
      return date.toLocaleString('en-US', {
        timeZone: targetZone,
        dateStyle: 'medium',
        timeStyle: 'short',
        hour12: false
      });
    } catch (e) { return 'Invalid Date'; }
  };

  return (
    <div className="grid gap-15">
      <div className="form-group">
        <label className="uppercase tracking-wider opacity-6" style={{fontSize: '0.8rem'}}>Source Local Time</label>
        <input type="datetime-local" className="pill w-full mt-5" value={sourceTime} onChange={e => setSourceTime(e.target.value)} />
      </div>
      <div className="form-group">
        <label className="uppercase tracking-wider opacity-6" style={{fontSize: '0.8rem'}}>Target Timezone</label>
        <select className="pill w-full mt-5" value={targetZone} onChange={e => setTargetZone(e.target.value)}>
          {commonZones.map(z => <option key={z} value={z}>{z}</option>)}
        </select>
      </div>
      <div className="tool-result text-center">
        <div className="opacity-6 mb-5 uppercase tracking-wider" style={{fontSize: '0.75rem'}}>Converted Time</div>
        <div className="font-bold" style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>{convert()}</div>
      </div>
    </div>
  );
};

const PackingListTool = ({ onResultChange }) => {
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('hub_travel_packing_list');
      return saved ? JSON.parse(saved) : [
        { id: 1, text: 'Passport & Visas', packed: false },
        { id: 2, text: 'Chargers & Adapters', packed: false },
        { id: 3, text: 'First Aid Kit', packed: false },
        { id: 4, text: 'Toiletries', packed: false }
      ];
    } catch (e) { return []; }
  });
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    localStorage.setItem('hub_travel_packing_list', JSON.stringify(items));
  }, [items]);

  const toggleItem = (id) => {
    setItems(items.map(item => item.id === id ? { ...item, packed: !item.packed } : item));
  };

  const addItem = (e) => {
    e.preventDefault();
    if (newItem.trim()) {
      setItems([...items, { id: Date.now(), text: newItem.trim(), packed: false }]);
      setNewItem('');
    }
  };

  const removeItem = (e, id) => {
    e.stopPropagation();
    setItems(items.filter(i => i.id !== id));
  };

  useEffect(() => {
    if (onResultChange) {
      onResultChange({
        text: "TRAVEL PACKING LIST\n===================\n" +
              items.map(i => `[${i.packed ? 'X' : ' '}] ${i.text}`).join('\n'),
        filename: 'packing_list.txt'
      });
    }
  }, [items, onResultChange]);

  return (
    <div className="grid gap-15">
      <form className="flex-gap" onSubmit={addItem}>
        <input type="text" className="pill flex-1" value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="Add travel item..." />
        <button type="submit" className="btn-primary" style={{padding: '0 24px'}}>Add</button>
      </form>
      <div className="grid gap-10">
        {items.map(item => (
          <div key={item.id} className="card p-15 flex-between no-animation" onClick={() => toggleItem(item.id)} style={{flexDirection: 'row', alignItems: 'center'}}>
            <div className="flex-center gap-10">
              <span className="material-icons" style={{ color: item.packed ? 'var(--primary)' : 'var(--text-muted)' }}>
                {item.packed ? 'check_circle' : 'radio_button_unchecked'}
              </span>
              <span style={{ textDecoration: item.packed ? 'line-through' : 'none', opacity: item.packed ? 0.5 : 1, fontWeight: 500 }}>
                {item.text}
              </span>
            </div>
            <button className="icon-btn" onClick={(e) => removeItem(e, item.id)} style={{width: '32px', height: '32px', border: 'none', background: 'transparent'}}>
              <span className="material-icons" style={{fontSize: '20px', color: 'var(--danger)'}}>delete_outline</span>
            </button>
          </div>
        ))}
      </div>
      {items.length === 0 && <div className="text-center opacity-5 p-20">No items in your packing list yet.</div>}
    </div>
  );
};

export default TravelTools;
