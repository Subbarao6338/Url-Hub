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

  const charCount = notes.length;
  const wordCount = notes.trim() ? notes.trim().split(/\s+/).length : 0;

  return (
    <div className="tool-form notes-container">
      <div className="flex-between mb-8">
        <label className="label-bold">Quick Notepad (Auto-saves)</label>
        <div className="stats-badge">
          <span>{wordCount} words</span>
          <span className="separator">|</span>
          <span>{charCount} chars</span>
        </div>
      </div>
      <textarea
        className="notes-textarea"
        placeholder="Type your notes here..."
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
    </div>
  );
};

export default Notes;
