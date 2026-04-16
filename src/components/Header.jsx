import React from 'react';

const Header = ({ appName, currentProfile, profiles, currentTab, setView, onSettingsClick, onSearchToggle, searchActive, searchQuery, onSearchChange, onSearchClear }) => {
  const profile = profiles.find(p => p.name === currentProfile) || { icon: 'inbox' };

  return (
    <header className="top-bar">
      <div
        className="logo-container"
        onClick={() => setView('bookmarks')}
      >
        <span className="material-icons app-logo">
          {currentProfile === 'Default' ? 'inbox' : (profile.icon || 'person')}
        </span>
        <h1 className="page-title">{appName || 'N Box'}</h1>
      </div>
      <div className="top-actions">
        <div className={`search-container ${searchActive ? 'active' : ''}`}>
          <button id="search-toggle" className="icon-btn" title="Search" onClick={onSearchToggle}>
            <span className="material-icons">search</span>
          </button>
          <input
            type="search"
            id="search"
            placeholder={`Search ${currentTab.charAt(0).toUpperCase() + currentTab.slice(1)}... [/]`}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <button id="search-clear" className="search-clear-btn" title="Clear Search" onClick={onSearchClear}>
            <span className="material-icons">close</span>
          </button>
        </div>
        <button id="settings-toggle" className="icon-btn" title="Settings" onClick={onSettingsClick}>
          <span className="material-icons">settings</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
