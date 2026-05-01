import React from 'react';

const Header = ({ appName, currentProfile, profiles, setView, onSettingsClick, hideBookmarks, children }) => {
  const profile = profiles.find(p => p.name === currentProfile) || { icon: 'inbox' };

  return (
    <header className="top-bar">
      <div
        className="logo-container"
        onClick={() => setView(hideBookmarks ? 'toolbox' : 'bookmarks')}
      >
        <span className="material-icons app-logo">
          {currentProfile === 'Default' ? 'inbox' : (profile.icon || 'person')}
        </span>
        <h1 className="page-title">{appName || 'Nature toolbox'}</h1>
      </div>
      <div className="top-actions">
        {children}
        <button id="settings-toggle" className="icon-btn desktop-only" title="Settings" onClick={onSettingsClick}>
          <span className="material-icons">settings</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
