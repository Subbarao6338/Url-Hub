import React, { useState, useRef } from 'react';

const TabBar = ({ currentTab, setTab, onAddClick, onBookmarksLongPress, onSettingsClick, showProjectsTab }) => {
  const [pressTimer, setPressTimer] = useState(null);
  const isLongPress = useRef(false);

  const startPress = () => {
    isLongPress.current = false;
    const timer = setTimeout(() => {
      isLongPress.current = true;
      if (onBookmarksLongPress) onBookmarksLongPress();
    }, 500);
    setPressTimer(timer);
  };

  const cancelPress = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
  };

  const handleBookmarksClick = () => {
    if (isLongPress.current) {
      isLongPress.current = false;
      return;
    }
    setTab('bookmarks');
  };

  return (
    <nav className="tab-bar">
      <div className="tab-group" id="group-toolbox">
        <div
          id="tab-toolbox"
          className={`tab-item ${currentTab === 'toolbox' ? 'active' : ''}`}
          onClick={() => setTab('toolbox')}
          title="Toolbox"
        >
          <span className="material-icons">handyman</span>
          <span className="tab-name">Toolbox</span>
        </div>
      </div>
      <div className="tab-group" id="group-bookmarks">
        <div
          id="tab-bookmarks"
          className={`tab-item ${currentTab === 'bookmarks' ? 'active' : ''}`}
          onClick={handleBookmarksClick}
          onMouseDown={startPress}
          onMouseUp={cancelPress}
          onMouseLeave={cancelPress}
          onTouchStart={startPress}
          onTouchEnd={cancelPress}
          onContextMenu={(e) => e.preventDefault()}
          title="Bookmarks"
        >
          <span className="material-icons">bookmarks</span>
          <span className="tab-name">Bookmarks</span>
        </div>
        <button className="icon-btn" onClick={onAddClick} title="Add Bookmark">
          <span className="material-icons">add</span>
        </button>
      </div>
      {showProjectsTab && (
        <div className="tab-group" id="group-projects">
          <div
            id="tab-projects"
            className={`tab-item ${currentTab === 'projects' ? 'active' : ''}`}
            onClick={() => setTab('projects')}
            title="Projects"
          >
            <span className="material-icons">rocket_launch</span>
            <span className="tab-name">Projects</span>
          </div>
        </div>
      )}
      <div className="tab-group mobile-only" id="group-settings">
        <div
          className="tab-item"
          onClick={onSettingsClick}
          title="Settings"
        >
          <span className="material-icons">settings</span>
          <span className="tab-name">Settings</span>
        </div>
      </div>
    </nav>
  );
};

export default TabBar;
