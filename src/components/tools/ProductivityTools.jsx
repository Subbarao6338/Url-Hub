import React, { useState, useEffect } from 'react';
import { storage } from '../../utils/storage';

const ProductivityTools = ({ toolId, onResultChange }) => {
  const [activeTab, setActiveTab] = useState('habit');

  useEffect(() => {
    if (toolId) {
      if (toolId === 'habit-tracker') setActiveTab('habit');
      else if (toolId === 'sticky-notes') setActiveTab('sticky');
      else setActiveTab(toolId);
    }
  }, [toolId]);

  return (
    <div className="tool-form">
      {!toolId && (
        <div className="pill-group mb-20 scrollable-x">
          <button className={`pill ${activeTab === 'habit' ? 'active' : ''}`} onClick={() => setActiveTab('habit')}>Habit Tracker</button>
          <button className={`pill ${activeTab === 'sticky' ? 'active' : ''}`} onClick={() => setActiveTab('sticky')}>Sticky Notes</button>
        </div>
      )}

      {activeTab === 'habit' && <HabitTracker onResultChange={onResultChange} />}
      {activeTab === 'sticky' && <StickyNotes onResultChange={onResultChange} />}
    </div>
  );
};

const HabitTracker = ({ onResultChange }) => {
    const [habits, setHabits] = useState(storage.getJSON('hub_productivity_habits', []));
    const [newHabit, setNewHabit] = useState('');

    useEffect(() => {
        storage.setJSON('hub_productivity_habits', habits);
        if (onResultChange) {
            onResultChange({
                text: "HABIT TRACKER\n" + habits.map(h => `${h.name}: [${h.done ? 'X' : ' '}]`).join('\n'),
                filename: 'habits.txt'
            });
        }
    }, [habits, onResultChange]);

    const addHabit = (e) => {
        e.preventDefault();
        if (newHabit.trim()) {
            setHabits([...habits, { id: Date.now(), name: newHabit.trim(), done: false }]);
            setNewHabit('');
        }
    };

    const toggleHabit = (id) => {
        setHabits(habits.map(h => h.id === id ? { ...h, done: !h.done } : h));
    };

    const deleteHabit = (e, id) => {
        e.stopPropagation();
        setHabits(habits.filter(h => h.id !== id));
    };

    return (
        <div className="grid gap-15">
            <form onSubmit={addHabit} className="flex-gap">
                <input type="text" value={newHabit} onChange={e => setNewHabit(e.target.value)} className="pill flex-1" placeholder="Add new habit..." />
                <button type="submit" className="btn-primary">Add</button>
            </form>
            <div className="grid gap-10">
                {habits.map(h => (
                    <div key={h.id} className="card p-15 flex-between" onClick={() => toggleHabit(h.id)}>
                        <div className="flex-center gap-10">
                            <span className="material-icons" style={{ color: h.done ? 'var(--primary)' : 'var(--text-muted)' }}>{h.done ? 'check_circle' : 'radio_button_unchecked'}</span>
                            <span style={{ fontWeight: 600 }}>{h.name}</span>
                        </div>
                        <button className="btn-remove" onClick={(e) => deleteHabit(e, h.id)}><span className="material-icons">delete</span></button>
                    </div>
                ))}
            </div>
            {habits.length === 0 && <div className="text-center p-20 opacity-5">No habits tracked yet.</div>}
        </div>
    );
};

const StickyNotes = ({ onResultChange }) => {
    const [notes, setNotes] = useState(storage.getJSON('hub_productivity_sticky', []));

    useEffect(() => {
        storage.setJSON('hub_productivity_sticky', notes);
        if (onResultChange) {
            onResultChange({ text: notes.join('\n---\n'), filename: 'sticky_notes.txt' });
        }
    }, [notes, onResultChange]);

    const addNote = () => setNotes(['', ...notes]);
    const updateNote = (i, val) => {
        const newNotes = [...notes];
        newNotes[i] = val;
        setNotes(newNotes);
    };
    const deleteNote = (i) => setNotes(notes.filter((_, idx) => idx !== i));

    return (
        <div className="grid gap-15">
            <button className="btn-primary w-full" onClick={addNote}><span className="material-icons mr-10">add</span> New Sticky Note</button>
            <div className="grid gap-15" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                {notes.map((note, i) => (
                    <div key={i} className="card p-10" style={{ background: 'var(--nature-sand)', color: 'var(--nature-earth)', minHeight: '150px', position: 'relative' }}>
                        <textarea
                            value={note}
                            onChange={e => updateNote(i, e.target.value)}
                            style={{ background: 'transparent', border: 'none', width: '100%', height: '100%', resize: 'none', color: 'inherit', fontWeight: 600 }}
                            placeholder="Type here..."
                        />
                        <button className="btn-remove" style={{ position: 'absolute', bottom: '5px', right: '5px' }} onClick={() => deleteNote(i)}>
                            <span className="material-icons" style={{ fontSize: '1.2rem' }}>delete</span>
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductivityTools;
