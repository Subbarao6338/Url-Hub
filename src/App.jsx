import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import Header from './components/Header';
import TabBar from './components/TabBar';
import BookmarksView from './components/BookmarksView';
import ProjectsView from './components/ProjectsView';
import ToolboxView from './components/ToolboxView';
import SettingsModal from './components/SettingsModal';
import ProfileModal from './components/ProfileModal';

function App() {
  const [currentProfileName, setCurrentProfileName] = useState(localStorage.getItem('hub_current_profile') || 'Default');
  const [profiles, setProfiles] = useState([]);
  const [currentTab, setCurrentTab] = useState('bookmarks');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('hub_theme') === 'dark');
  const [accentColor, setAccentColor] = useState(localStorage.getItem('hub_accent_color') || 'indigo');
  const [pinnedIds, setPinnedIds] = useState(JSON.parse(localStorage.getItem('hub_pinned_v1') || '[]'));

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetch('/api/profiles')
      .then(res => res.json())
      .then(setProfiles)
      .catch(err => console.error("Failed to fetch profiles:", err));
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('hub_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    document.documentElement.setAttribute('data-color', accentColor);
    localStorage.setItem('hub_accent_color', accentColor);
  }, [accentColor]);

  useEffect(() => {
    localStorage.setItem('hub_pinned_v1', JSON.stringify(pinnedIds));
  }, [pinnedIds]);

  useEffect(() => {
    localStorage.setItem('hub_current_profile', currentProfileName);
  }, [currentProfileName]);

  const currentProfile = profiles.find(p => p.name === currentProfileName) || profiles[0];

  const handleSearchToggle = () => setSearchActive(!searchActive);
  const handleSearchClear = () => {
    setSearchQuery('');
    setSearchActive(false);
  };

  const togglePin = (id) => {
    if (pinnedIds.includes(id)) {
      setPinnedIds(pinnedIds.filter(pid => pid !== id));
    } else {
      setPinnedIds([...pinnedIds, id]);
    }
  };

  const deleteLink = (id) => {
    if (window.confirm("Are you sure you want to delete this bookmark?")) {
      fetch(`/api/links/${id}`, { method: 'DELETE' })
        .then(() => {
          setRefreshTrigger(prev => prev + 1);
        });
    }
  };

  return (
    <div className="app-layout">
      <main className="main-content">
        <Header
          currentProfile={currentProfileName}
          profiles={profiles}
          setView={(view) => setCurrentTab(view)}
          onSettingsClick={() => setIsSettingsOpen(true)}
          onSearchToggle={handleSearchToggle}
          searchActive={searchActive}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchClear={handleSearchClear}
        />

        <TabBar
          currentTab={currentTab}
          setTab={setCurrentTab}
          onAddClick={() => setIsSettingsOpen(true)}
        />

        <div id="content" className="tools-container">
          {currentTab === 'bookmarks' && currentProfile && (
            <BookmarksView
              profileId={currentProfile.id}
              searchQuery={searchQuery}
              pinnedIds={pinnedIds}
              onPin={togglePin}
              onDelete={deleteLink}
              onEdit={(link) => console.log('Edit', link)}
              refreshTrigger={refreshTrigger}
            />
          )}
          {currentTab === 'projects' && (
            <ProjectsView searchQuery={searchQuery} />
          )}
          {currentTab === 'toolbox' && (
            <ToolboxView searchQuery={searchQuery} />
          )}
        </div>
      </main>

      {(isSettingsOpen || isProfileOpen) && (
        <div className="modal-overlay" style={{display: 'block'}} onClick={() => { setIsSettingsOpen(false); setIsProfileOpen(false); }}></div>
      )}

      {isSettingsOpen && (
        <SettingsModal
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          accentColor={accentColor}
          setAccentColor={setAccentColor}
          onClose={() => setIsSettingsOpen(false)}
          resetData={() => console.log('Reset data')}
        />
      )}

      {isProfileOpen && (
        <ProfileModal
          profiles={profiles}
          currentProfile={currentProfileName}
          onSelect={(name) => { setCurrentProfileName(name); setIsProfileOpen(false); }}
          onCancel={() => setIsProfileOpen(false)}
        />
      )}

      <button
        className="pill"
        style={{position: 'fixed', bottom: '20px', left: '20px', zIndex: 1000}}
        onClick={() => setIsProfileOpen(true)}
      >
        <span className="material-icons">person</span> Switch Profile
      </button>
      
      <Analytics />
    </div>
  );
}

export default App;
