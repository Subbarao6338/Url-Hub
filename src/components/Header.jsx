import React, { memo } from 'react';

const Header = memo(({ appName, currentProfile, profiles, setView, hideBookmarks, hideToolbox, currentTab, children }) => {
  const profile = profiles.find(p => p.name === currentProfile) || { icon: 'inbox' };

  return (
    <header className="top-bar glass-card">
      <div
        className="logo-container"
        role="button"
        tabIndex={0}
        aria-label={`${appName || 'Epic Toolbox'} - Switch tab`}
        onClick={() => {
          if (hideBookmarks) setView('toolbox');
          else if (hideToolbox) setView('bookmarks');
          else setView(currentTab === 'bookmarks' ? 'toolbox' : 'bookmarks');
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (hideBookmarks) setView('toolbox');
            else if (hideToolbox) setView('bookmarks');
            else setView(currentTab === 'bookmarks' ? 'toolbox' : 'bookmarks');
          }
        }}
      >
        <div className="logo-icon-wrapper">
            <img src="/assets/favicon.svg" className="app-logo-img" alt="Logo" style={{ width: '28px', height: '28px' }} />
        </div>
        <h1 className="page-title">
          {appName || 'Epic Toolbox'}
        </h1>
      </div>
      <div className="top-actions">
        {children}
      </div>
    </header>
  );
});

export default Header;
