import React, { useState, useEffect } from 'react';
import { Analytics } from '@vercel/analytics/react';
import Header from './components/Header';
import TabBar from './components/TabBar';
import BookmarksView from './components/BookmarksView';
import ProjectsView from './components/ProjectsView';
import ToolboxView from './components/ToolboxView';
import SettingsModal from './components/SettingsModal';
import ProfileModal from './components/ProfileModal';
import BookmarkModal from './components/BookmarkModal';

function App() {
  const [currentProfileName, setCurrentProfileName] = useState(localStorage.getItem('hub_current_profile') || localStorage.getItem('hub_startup_profile') || 'Default');
  const [profiles, setProfiles] = useState([]);
  const [currentTab, setCurrentTab] = useState('toolbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(localStorage.getItem('hub_theme') === 'dark');
  const [accentColor, setAccentColor] = useState(localStorage.getItem('hub_accent_color') || 'indigo');

  useEffect(() => {
    if (searchActive) document.body.classList.add('search-active');
    else document.body.classList.remove('search-active');
  }, [searchActive]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && ['bookmarks', 'toolbox', 'projects'].includes(tab)) {
      setCurrentTab(tab);
    }
  }, []);

  // Additional Settings
  const [isCompact, setIsCompact] = useState(localStorage.getItem('hub_compact') === 'true');
  const [hideUrls, setHideUrls] = useState(localStorage.getItem('hub_hide_urls') === 'true');
  const [hideIcons, setHideIcons] = useState(localStorage.getItem('hub_hide_icons') === 'true');
  const [showStats, setShowStats] = useState(localStorage.getItem('hub_show_stats') !== 'false');
  const [autoFocusSearch, setAutoFocusSearch] = useState(localStorage.getItem('hub_auto_focus_search') === 'true');
  const [openInNewTab, setOpenInNewTab] = useState(localStorage.getItem('hub_open_newtab') !== 'false');
  const [openProjectsInternally, setOpenProjectsInternally] = useState(localStorage.getItem('hub_open_projects_internally') === 'true');

  // Visual Settings
  const [disableGlass, setDisableGlass] = useState(localStorage.getItem('hub_disable_glass') === 'true');
  const [enableAurora, setEnableAurora] = useState(localStorage.getItem('hub_enable_aurora') !== 'false');
  const [reducedMotion, setReducedMotion] = useState(localStorage.getItem('hub_reduced_motion') === 'true');
  const [confirmDelete, setConfirmDelete] = useState(localStorage.getItem('hub_confirm_delete') !== 'false');
  const [groupToolbox, setGroupToolbox] = useState(localStorage.getItem('hub_group_toolbox') !== 'false');

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isBookmarkOpen, setIsBookmarkOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    fetch('/api/profiles')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) setProfiles(data);
      })
      .catch(err => {
        console.error("Failed to fetch profiles:", err);
        setProfiles([]);
      });
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('hub_theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    if (disableGlass) document.body.classList.add('no-glass');
    else document.body.classList.remove('no-glass');
    localStorage.setItem('hub_disable_glass', disableGlass);
  }, [disableGlass]);

  useEffect(() => {
    if (enableAurora) document.body.classList.remove('no-aurora');
    else document.body.classList.add('no-aurora');
    localStorage.setItem('hub_enable_aurora', enableAurora);
  }, [enableAurora]);

  useEffect(() => {
    if (reducedMotion) document.body.classList.add('reduced-motion');
    else document.body.classList.remove('reduced-motion');
    localStorage.setItem('hub_reduced_motion', reducedMotion);
  }, [reducedMotion]);

  useEffect(() => { localStorage.setItem('hub_confirm_delete', confirmDelete); }, [confirmDelete]);
  useEffect(() => { localStorage.setItem('hub_group_toolbox', groupToolbox); }, [groupToolbox]);

  useEffect(() => {
    document.documentElement.setAttribute('data-color', accentColor);
    localStorage.setItem('hub_accent_color', accentColor);
  }, [accentColor]);

  useEffect(() => {
    localStorage.setItem('hub_current_profile', currentProfileName);
  }, [currentProfileName]);

  useEffect(() => {
    if (autoFocusSearch && !isSettingsOpen && !isProfileOpen) {
      const searchInput = document.getElementById('search');
      if (searchInput && window.innerWidth > 768) {
        searchInput.focus();
      }
    }
  }, [currentTab, autoFocusSearch, isSettingsOpen, isProfileOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA' && !isSettingsOpen && !isProfileOpen) {
        e.preventDefault();
        setSearchActive(true);
        setTimeout(() => {
          const input = document.getElementById('search');
          if (input) input.focus();
        }, 100);
      }
      if (e.key === 'Escape') {
        setIsSettingsOpen(false);
        setIsProfileOpen(false);
        setSearchActive(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSettingsOpen, isProfileOpen]);

  useEffect(() => { localStorage.setItem('hub_compact', isCompact); }, [isCompact]);
  useEffect(() => { localStorage.setItem('hub_hide_urls', hideUrls); }, [hideUrls]);
  useEffect(() => { localStorage.setItem('hub_hide_icons', hideIcons); }, [hideIcons]);
  useEffect(() => { localStorage.setItem('hub_show_stats', showStats); }, [showStats]);
  useEffect(() => { localStorage.setItem('hub_auto_focus_search', autoFocusSearch); }, [autoFocusSearch]);
  useEffect(() => { localStorage.setItem('hub_open_newtab', openInNewTab); }, [openInNewTab]);
  useEffect(() => { localStorage.setItem('hub_open_projects_internally', openProjectsInternally); }, [openProjectsInternally]);

  const currentProfile = Array.isArray(profiles) && profiles.length > 0
    ? (profiles.find(p => p.name.trim() === (currentProfileName?.trim() || 'Default')) ||
       profiles.find(p => p.name.trim() === 'Default') ||
       profiles[0])
    : null;

  const handleSearchToggle = () => setSearchActive(!searchActive);
  const handleSearchClear = () => {
    setSearchQuery('');
    setSearchActive(false);
  };

  const togglePin = (link) => {
    const newPinnedStatus = !link.is_pinned;
    fetch(`/api/links/${link.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_pinned: newPinnedStatus })
    })
    .then(res => {
      if (res.ok) {
        setRefreshTrigger(prev => prev + 1);
      }
    })
    .catch(err => console.error("Failed to toggle pin:", err));
  };

  const deleteLink = (id) => {
    if (!confirmDelete || window.confirm("Are you sure you want to delete this bookmark?")) {
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
          currentTab={currentTab}
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
          onAddClick={() => { setEditingLink(null); setIsBookmarkOpen(true); }}
          onBookmarksLongPress={() => setIsProfileOpen(true)}
          onSettingsClick={() => setIsSettingsOpen(true)}
        />

        <div id="content" className={`tools-container ${isCompact ? 'compact' : ''}`}>
          {currentTab === 'bookmarks' && currentProfile && (
            <BookmarksView
              profileId={currentProfile.id}
              searchQuery={searchQuery}
              onPin={togglePin}
              onDelete={deleteLink}
              onEdit={(link) => { setEditingLink(link); setIsBookmarkOpen(true); }}
              refreshTrigger={refreshTrigger}
              hideUrls={hideUrls}
              hideIcons={hideIcons}
              showStats={showStats}
              openInNewTab={openInNewTab}
            />
          )}
          {currentTab === 'projects' && (
            <ProjectsView
              searchQuery={searchQuery}
              openInternally={openProjectsInternally}
            />
          )}
          {currentTab === 'toolbox' && (
            <ToolboxView
              searchQuery={searchQuery}
              groupToolbox={groupToolbox}
              showStats={showStats}
            />
          )}
        </div>
      </main>

      {(isSettingsOpen || isProfileOpen || isBookmarkOpen) && (
        <div className="modal-overlay" style={{display: 'block'}} onClick={() => { setIsSettingsOpen(false); setIsProfileOpen(false); setIsBookmarkOpen(false); }}></div>
      )}

      {isSettingsOpen && (
        <SettingsModal
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          accentColor={accentColor}
          setAccentColor={setAccentColor}
          isCompact={isCompact}
          setIsCompact={setIsCompact}
          hideUrls={hideUrls}
          setHideUrls={setHideUrls}
          hideIcons={hideIcons}
          setHideIcons={setHideIcons}
          showStats={showStats}
          setShowStats={setShowStats}
          autoFocusSearch={autoFocusSearch}
          setAutoFocusSearch={setAutoFocusSearch}
          openInNewTab={openInNewTab}
          setOpenInNewTab={setOpenInNewTab}
          openProjectsInternally={openProjectsInternally}
          setOpenProjectsInternally={setOpenProjectsInternally}
          disableGlass={disableGlass}
          setDisableGlass={setDisableGlass}
          enableAurora={enableAurora}
          setEnableAurora={setEnableAurora}
          reducedMotion={reducedMotion}
          setReducedMotion={setReducedMotion}
          confirmDelete={confirmDelete}
          setConfirmDelete={setConfirmDelete}
          groupToolbox={groupToolbox}
          setGroupToolbox={setGroupToolbox}
          onClose={() => setIsSettingsOpen(false)}
          resetData={() => {
            if (window.confirm("Reset all dashboard data?")) {
              localStorage.clear();
              window.location.reload();
            }
          }}
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

      {isBookmarkOpen && (
        <BookmarkModal
          link={editingLink}
          profileId={currentProfile?.id}
          onClose={() => setIsBookmarkOpen(false)}
          onSave={() => setRefreshTrigger(prev => prev + 1)}
        />
      )}

      <Analytics />
    </div>
  );
}

export default App;
