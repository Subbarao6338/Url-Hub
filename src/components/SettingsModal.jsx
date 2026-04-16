import React, { useState } from 'react';

const SettingsModal = ({
  isDarkMode, setIsDarkMode,
  accentColor, setAccentColor,
  onClose,
  resetData
}) => {
  const [activeTab, setActiveTab] = useState('general');

  const colors = [
    'indigo', 'blue', 'cyan', 'green', 'yellow', 'orange', 'red', 'pink', 'purple', 'violet', 'lime', 'sky', 'rose', 'slate', 'black'
  ];

  return (
    <div className="modal" style={{display: 'block'}}>
      <div className="modal-tabs">
        <button className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>
          <span className="material-icons">settings</span> Global
        </button>
        <button className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`} onClick={() => setActiveTab('about')}>
          <span className="material-icons">info</span> About
        </button>
      </div>

      {activeTab === 'general' && (
        <div className="tab-pane">
          <h2 className="settings-header">Global Settings</h2>
          <div className="settings-section">
            <h3>Appearance</h3>
            <div className="pill-group">
              <button
                className={`pill ${isDarkMode ? 'active' : ''}`}
                onClick={() => setIsDarkMode(!isDarkMode)}
              >
                <span className="material-icons">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
                <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
              </button>
            </div>
            <div className="pill-group" style={{marginTop: '15px'}}>
              {colors.map(color => (
                <button
                  key={color}
                  className={`color-pill ${accentColor === color ? 'active' : ''}`}
                  style={{background: getHex(color)}}
                  onClick={() => setAccentColor(color)}
                  title={color}
                />
              ))}
            </div>
          </div>
          <div className="settings-section">
            <h3>Data</h3>
            <div className="pill-group">
              <button className="pill" style={{color: '#ef4444'}} onClick={resetData}>
                <span className="material-icons">refresh</span> Reset Bookmarks
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'about' && (
        <div className="tab-pane">
          <div className="about-content">
            <h1>N Box</h1>
            <p>A modern dashboard powered by React and FastAPI.</p>
          </div>
        </div>
      )}

      <div className="form-actions">
        <button type="button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

const getHex = (color) => {
    const map = {
        indigo: '#6366f1', blue: '#3b82f6', cyan: '#06b6d4', green: '#10b981',
        yellow: '#eab308', orange: '#f59e0b', red: '#ef4444', pink: '#ec4899',
        purple: '#8b5cf6', violet: '#7c3aed', lime: '#84cc16', sky: '#0ea5e9',
        rose: '#f43f5e', slate: '#475569', black: '#000000'
    };
    return map[color] || color;
}

export default SettingsModal;
