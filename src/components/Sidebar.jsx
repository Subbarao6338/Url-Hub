import React, { useState, useEffect } from 'react';

const Sidebar = ({
  appName,
  currentTab,
  setTab,
  onSettingsClick,
  hideBookmarks,
  hideToolbox,
  showProjectsTab,
  onAddClick,
  searchQuery,
  setSearchQuery,
  setSearchActive,
  theme,
  setTheme,
  currentProfileName
}) => {
  const [searchPlaceholder, setSearchPlaceholder] = useState('Search...');
  const tips = [
    "Search... [/]",
    "Try 'cat:dev' for hubs",
    "Try 'cat:social' for links",
    "Press Alt+1 for Toolbox"
  ];

  useEffect(() => {
    let i = 0;
    const it = setInterval(() => {
      setSearchPlaceholder(tips[i % tips.length]);
      i++;
    }, 4000);
    return () => clearInterval(it);
  }, []);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val) {
      setSearchActive(true);
    } else {
      setSearchActive(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      window.dispatchEvent(new CustomEvent('hub-search-submit', { detail: { query: searchQuery.trim() } }));
    }
  };

  const toggleTheme = () => {
    const themes = ['light', 'dark', 'nature'];
    const currentIdx = themes.indexOf(theme);
    const nextTheme = themes[(currentIdx + 1) % themes.length];
    setTheme(nextTheme);
  };

  return (
    <aside className="app-sidebar glass-card">
      <div className="sidebar-brand">
        <div className="logo-icon-wrapper">
          <img src="/assets/favicon.svg" className="app-logo-img" alt="Logo" style={{ width: '28px', height: '28px' }} />
        </div>
        <h1 className="sidebar-title">{appName || 'Epic Toolbox'}</h1>
      </div>

      <div className="sidebar-search">
        <div className="search-input-wrapper">
          <span className="material-icons-outlined search-icon">search</span>
          <input
            type="search"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setSearchActive(true)}
          />
          {searchQuery && (
            <button
              className="search-clear-btn"
              onClick={() => {
                setSearchQuery('');
                setSearchActive(false);
              }}
              title="Clear search"
            >
              <span className="material-icons">close</span>
            </button>
          )}
        </div>
      </div>

      <nav className="sidebar-nav">
        {!hideToolbox && (
          <button
            className={`sidebar-nav-item ${currentTab === 'toolbox' ? 'active' : ''}`}
            onClick={() => setTab('toolbox')}
            title="Toolbox"
          >
            <span className="material-icons-outlined">handyman</span>
            <span className="nav-label">Toolbox</span>
          </button>
        )}

        {!hideBookmarks && (
          <button
            className={`sidebar-nav-item ${currentTab === 'bookmarks' ? 'active' : ''}`}
            onClick={() => setTab('bookmarks')}
            title="Bookmarks"
          >
            <span className="material-icons-outlined">bookmarks</span>
            <span className="nav-label">Bookmarks</span>
          </button>
        )}

        {showProjectsTab && (
          <button
            className={`sidebar-nav-item ${currentTab === 'projects' ? 'active' : ''}`}
            onClick={() => setTab('projects')}
            title="Projects"
          >
            <span className="material-icons-outlined">architecture</span>
            <span className="nav-label">Projects</span>
          </button>
        )}

        <button
          className="sidebar-nav-item"
          onClick={onSettingsClick}
          title="Settings"
        >
          <span className="material-icons-outlined">settings</span>
          <span className="nav-label">Settings</span>
        </button>
      </nav>

      {currentTab === 'bookmarks' && (
        <div className="sidebar-actions-panel">
          <button className="btn-primary w-full sidebar-action-btn" onClick={onAddClick}>
            <span className="material-icons">add_link</span>
            <span>New Bookmark</span>
          </button>
        </div>
      )}

      <div className="sidebar-footer">
        <div className="sidebar-profile-card">
          <span className="material-icons profile-avatar-icon">account_circle</span>
          <div className="profile-details">
            <span className="profile-label">Profile</span>
            <span className="profile-name">{currentProfileName || 'Default'}</span>
          </div>
          <button className="theme-toggle-btn" onClick={toggleTheme} title={`Switch theme (current: ${theme})`}>
            <span className="material-icons-outlined">
              {theme === 'light' ? 'light_mode' : theme === 'dark' ? 'dark_mode' : 'eco'}
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
