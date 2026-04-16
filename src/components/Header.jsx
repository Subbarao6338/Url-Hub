import React from 'react';

const Header = ({ currentProfile, profiles, setView, onSettingsClick, onSearchToggle, searchActive, searchQuery, onSearchChange, onSearchClear, onLogoLongPress }) => {
  const profile = profiles.find(p => p.name === currentProfile) || { icon: 'inbox' };

  const [longPressTimer, setLongPressTimer] = React.useState(null);

  const startLongPress = () => {
    const timer = setTimeout(() => {
      onLogoLongPress();
    }, 500);
    setLongPressTimer(timer);
  };

  const cancelLongPress = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  return (
    <header className="top-bar">
      <div
        className="logo-container"
        onClick={() => setView('bookmarks')}
        onMouseDown={startLongPress}
        onMouseUp={cancelLongPress}
        onMouseLeave={cancelLongPress}
        onTouchStart={startLongPress}
        onTouchEnd={cancelLongPress}
        onContextMenu={(e) => e.preventDefault()}
      >
        <span className="material-icons app-logo">
          {currentProfile === 'Default' ? 'inbox' : profile.icon}
        </span>
        <h1 className="page-title">N Box</h1>
      </div>
      <div className="top-actions">
        <div className={`search-container ${searchActive ? 'active' : ''}`}>
          <button id="search-toggle" className="icon-btn" title="Search" onClick={onSearchToggle}>
            <span className="material-icons">search</span>
          </button>
          <input
            type="search"
            id="search"
            placeholder="Search Bookmarks or Toolbox... [/]"
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
