import React, { useState, useEffect } from 'react';

const Notes = ({ onResultChange }) => {
  const [notes, setNotes] = useState(localStorage.getItem('hub_tool_notes') || '');

  useEffect(() => {
    localStorage.setItem('hub_tool_notes', notes);
    if (notes) {
      onResultChange({
        text: notes,
        filename: 'notes.txt'
      });
    } else {
      onResultChange(null);
    }
  }, [notes, onResultChange]);

  return (
    <div className="tool-form" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <label style={{ marginBottom: '8px', display: 'block', fontWeight: 500 }}>Quick Notepad (Auto-saves)</label>
      <textarea
        style={{
          flex: 1,
          minHeight: '300px',
          fontFamily: 'inherit',
          lineHeight: 1.6,
          padding: '1rem',
          borderRadius: '12px',
          background: 'rgba(var(--primary-rgb), 0.05)',
          border: '1px solid rgba(var(--primary-rgb), 0.1)'
        }}
        placeholder="Type your notes here..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
    </div>
  );
};

export default Notes;
