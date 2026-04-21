import React, { useState, useEffect } from 'react';
import { App as CapApp } from '@capacitor/app';
import { Analytics } from '@vercel/analytics/react';
import Header from './components/Header';
import TabBar from './components/TabBar';
import BookmarksView from './components/BookmarksView';
import ToolboxView from './components/ToolboxView';
import ProjectsView from './components/ProjectsView';
import SearchOverlay from './components/SearchOverlay';
import SettingsModal from './components/SettingsModal';
import ProfileModal from './components/ProfileModal';
import BookmarkModal from './components/BookmarkModal';
import API_BASE from './api';

const OfflineIndicator = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div className="offline-indicator" style={{ background: 'var(--nature-moss)', color: 'white', padding: '8px', fontSize: '0.9rem' }}>
      <span className="material-icons" style={{ fontSize: '1.1rem' }}>forest</span>
      <span>You're in the wilderness — no signal, but Nature Toolbox works fine 🌿</span>
    </div>
  );
};

function App() {
  const [appName, setAppName] = useState(localStorage.getItem('hub_app_name') || 'Nature toolbox');
  const [enableProfiles, setEnableProfiles] = useState(localStorage.getItem('hub_enable_profiles') === 'true');
  const [currentProfileName, setCurrentProfileName] = useState(localStorage.getItem('hub_current_profile') || localStorage.getItem('hub_startup_profile') || 'Default');
  const [profiles, setProfiles] = useState([]);
  const [currentTab, setCurrentTab] = useState(localStorage.getItem('hub_startup_tab') || 'toolbox');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem('hub_theme') || 'light');
  const [accentColor, setAccentColor] = useState(localStorage.getItem('hub_accent_color') || 'indigo');
  const [hideBookmarks, setHideBookmarks] = useState(localStorage.getItem('hub_hide_bookmarks') !== null ? localStorage.getItem('hub_hide_bookmarks') === 'true' : true);
  const [showProjectsTab, setShowProjectsTab] = useState(localStorage.getItem('hub_show_projects_tab') === 'true');

  const setTab = (tab, skipHistory = false) => {
    setCurrentTab(tab);
    if (!skipHistory) {
      window.history.pushState({ tab }, '', `?tab=${tab}`);
    }
  };

  useEffect(() => {
    const handlePopState = (event) => {
      if (event.state && event.state.tab) {
        setCurrentTab(event.state.tab);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    if (searchActive) {
      document.body.classList.add('search-active');
      setTimeout(() => {
        // Try desktop input first
        let input = document.getElementById('search');
        // If not desktop or not visible, try mobile input
        if (!input || window.getComputedStyle(input.parentElement).display === 'none') {
          input = document.getElementById('search-mobile');
        }
        if (input) input.focus();
      }, 100);
    } else {
      document.body.classList.remove('search-active');
    }
  }, [searchActive]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    if (tab && ['bookmarks', 'toolbox', 'projects'].includes(tab)) {
      setCurrentTab(tab);
    }
  }, []);

  const [showBackToTop, setShowBackToTop] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      const container = document.querySelector('.tools-container');
      if (container) {
        setShowBackToTop(container.scrollTop > 300);
      }
    };
    const container = document.querySelector('.tools-container');
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    return () => container?.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    const container = document.querySelector('.tools-container');
    if (container) {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Additional Settings
  const [isCompact, setIsCompact] = useState(localStorage.getItem('hub_compact') === 'true');
  const [dashboardLayout, setDashboardLayout] = useState(localStorage.getItem('hub_dashboard_layout') || 'grid'); // 'grid' | 'list'
  const [iconSize, setIconSize] = useState(localStorage.getItem('hub_icon_size') || 'medium'); // 'small' | 'medium' | 'large'
  const [hiddenTools, setHiddenTools] = useState(JSON.parse(localStorage.getItem('hub_hidden_tools') || '[]'));
  const [toolOrder, setToolOrder] = useState(JSON.parse(localStorage.getItem('hub_tool_order') || '[]'));

  const [hideUrls, setHideUrls] = useState(localStorage.getItem('hub_hide_urls') === 'true');
  const [hideIcons, setHideIcons] = useState(localStorage.getItem('hub_hide_icons') === 'true');
  const [showStats, setShowStats] = useState(localStorage.getItem('hub_show_stats') !== 'false');
  const [autoFocusSearch, setAutoFocusSearch] = useState(localStorage.getItem('hub_auto_focus_search') === 'true');
  const [openInNewTab, setOpenInNewTab] = useState(localStorage.getItem('hub_open_newtab') !== 'false');
  const [startupTab, setStartupTab] = useState(localStorage.getItem('hub_startup_tab') || 'toolbox');
  const [hideRecentTools, setHideRecentTools] = useState(localStorage.getItem('hub_hide_recent_tools') === 'true');
  const [recentTools, setRecentTools] = useState(JSON.parse(localStorage.getItem('hub_recent_tools') || '[]'));

  const clearRecentTools = () => {
    setRecentTools([]);
    localStorage.removeItem('hub_recent_tools');
  };

  // Visual Settings
  const [disableGlass, setDisableGlass] = useState(localStorage.getItem('hub_disable_glass') === 'true');
  const [enableAurora, setEnableAurora] = useState(localStorage.getItem('hub_enable_aurora') !== 'false');
  const [reducedMotion, setReducedMotion] = useState(localStorage.getItem('hub_reduced_motion') === 'true');
  const [confirmDelete, setConfirmDelete] = useState(localStorage.getItem('hub_confirm_delete') !== 'false');
  const [groupToolbox, setGroupToolbox] = useState(localStorage.getItem('hub_group_toolbox') !== 'false');
  const [enableHoverEffects, setEnableHoverEffects] = useState(localStorage.getItem('hub_enable_hover_effects') !== 'false');

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isBookmarkOpen, setIsBookmarkOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch(`${API_BASE}/profiles`);
      const data = res.ok ? await res.json() : [];
      if (Array.isArray(data)) setProfiles(data);
      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error("Refresh failed:", err);
    } finally {
      setTimeout(() => setIsRefreshing(false), 500);
    }
  };

  const touchStart = React.useRef(0);
  const touchEnd = React.useRef(0);

  const handleTouchStart = (e) => {
    const container = document.querySelector('.tools-container');
    if (container && container.scrollTop === 0) {
      touchStart.current = e.targetTouches[0].clientY;
    } else {
      touchStart.current = 0;
    }
  };

  const handleTouchMove = (e) => {
    if (touchStart.current === 0) return;
    touchEnd.current = e.targetTouches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (touchStart.current === 0) return;
    const distance = touchEnd.current - touchStart.current;
    if (distance > 100) {
      refreshData();
    }
    touchStart.current = 0;
    touchEnd.current = 0;
  };

  useEffect(() => {
    fetch(`${API_BASE}/profiles`)
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
    const applyTheme = (t) => {
      let activeTheme = t;
      if (t === 'system') {
        activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      document.documentElement.setAttribute('data-theme', activeTheme);

      // Handle Material You dynamic color extraction if supported
      if (t === 'system' && 'window' in globalThis && 'matchMedia' in window) {
         // Placeholder for real dynamic color extraction logic
         // For now, we rely on the defined MD3 CSS variables
      }
    };

    applyTheme(theme);
    localStorage.setItem('hub_theme', theme);

    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system');
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

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

  useEffect(() => {
    if (enableHoverEffects) document.body.classList.remove('no-hover-effects');
    else document.body.classList.add('no-hover-effects');
    localStorage.setItem('hub_enable_hover_effects', enableHoverEffects);
  }, [enableHoverEffects]);

  useEffect(() => { localStorage.setItem('hub_confirm_delete', confirmDelete); }, [confirmDelete]);
  useEffect(() => { localStorage.setItem('hub_group_toolbox', groupToolbox); }, [groupToolbox]);
  useEffect(() => { localStorage.setItem('hub_app_name', appName); }, [appName]);
  useEffect(() => { localStorage.setItem('hub_startup_tab', startupTab); }, [startupTab]);
  useEffect(() => { localStorage.setItem('hub_show_projects_tab', showProjectsTab); }, [showProjectsTab]);
  useEffect(() => { localStorage.setItem('hub_hide_recent_tools', hideRecentTools); }, [hideRecentTools]);
  useEffect(() => { localStorage.setItem('hub_enable_profiles', enableProfiles); }, [enableProfiles]);

  useEffect(() => {
    document.documentElement.setAttribute('data-color', accentColor);
    localStorage.setItem('hub_accent_color', accentColor);
  }, [accentColor]);

  useEffect(() => {
    localStorage.setItem('hub_current_profile', currentProfileName);
  }, [currentProfileName]);

  useEffect(() => {
    localStorage.setItem('hub_hide_bookmarks', hideBookmarks);
    if (hideBookmarks && currentTab === 'bookmarks') {
      setTab('toolbox');
    }
  }, [hideBookmarks]);

  useEffect(() => {
    if (autoFocusSearch && !isSettingsOpen && !isProfileOpen) {
      const searchInput = document.getElementById('search');
      if (searchInput && window.innerWidth > 768) {
        searchInput.focus();
      }
    }
  }, [currentTab, autoFocusSearch, isSettingsOpen, isProfileOpen]);

  useEffect(() => {
    const backButtonListener = CapApp.addListener('backButton', ({ canGoBack }) => {
      if (isSettingsOpen) {
        setIsSettingsOpen(false);
      } else if (isProfileOpen) {
        setIsProfileOpen(false);
      } else if (isBookmarkOpen) {
        setIsBookmarkOpen(false);
      } else if (searchActive) {
        setSearchActive(false);
      } else if (currentTab === 'toolbox') {
        // If in a tool, history will handle it via popstate,
        // but we need to ensure we don't exit the app if we are just closing a tool.
        // Actually, if we use history.back() it might trigger popstate.
        // If we can't go back in history, we might want to exit or do nothing.
      }
    });

    return () => {
      backButtonListener.then(l => l.remove());
    };
  }, [isSettingsOpen, isProfileOpen, isBookmarkOpen, searchActive, currentTab]);

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

      // Tab Switching Shortcuts (Alt + 1/2/3/4)
      if (e.altKey) {
        if (e.key === '1') { e.preventDefault(); setCurrentTab('toolbox'); }
        if (e.key === '2') { e.preventDefault(); setCurrentTab('bookmarks'); }
        if (e.key === '3') { e.preventDefault(); if (showProjectsTab) setCurrentTab('projects'); }
        if (e.key === '4') { e.preventDefault(); setIsSettingsOpen(true); }
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
  useEffect(() => { localStorage.setItem('hub_dashboard_layout', dashboardLayout); }, [dashboardLayout]);
  useEffect(() => { localStorage.setItem('hub_icon_size', iconSize); }, [iconSize]);
  useEffect(() => { localStorage.setItem('hub_hidden_tools', JSON.stringify(hiddenTools)); }, [hiddenTools]);
  useEffect(() => { localStorage.setItem('hub_tool_order', JSON.stringify(toolOrder)); }, [toolOrder]);

  useEffect(() => { localStorage.setItem('hub_hide_urls', hideUrls); }, [hideUrls]);
  useEffect(() => { localStorage.setItem('hub_hide_icons', hideIcons); }, [hideIcons]);
  useEffect(() => { localStorage.setItem('hub_show_stats', showStats); }, [showStats]);
  useEffect(() => { localStorage.setItem('hub_auto_focus_search', autoFocusSearch); }, [autoFocusSearch]);
  useEffect(() => { localStorage.setItem('hub_open_newtab', openInNewTab); }, [openInNewTab]);

  const currentProfile = Array.isArray(profiles) && profiles.length > 0
    ? (profiles.find(p => p.name.trim() === (enableProfiles ? (currentProfileName?.trim() || 'Default') : 'Default')) ||
       profiles.find(p => p.name.trim() === 'Default') ||
       profiles[0])
    : { id: 1, name: 'Default', icon: 'home' }; // Fallback for initial load

  const handleSearchToggle = () => setSearchActive(!searchActive);
  const handleSearchClear = () => {
    setSearchQuery('');
    setSearchActive(false);
  };

  const togglePin = (link) => {
    const newPinnedStatus = !link.is_pinned;
    fetch(`${API_BASE}/links/${link.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_pinned: newPinnedStatus })
    })
    .then(async res => {
      if (res.ok) {
        if ('caches' in window) {
          try {
            const cache = await caches.open('url-hub-v9');
            const keys = await cache.keys();
            for (const request of keys) {
              if (request.url.includes('/api/')) {
                await cache.delete(request);
              }
            }
          } catch (err) {
            console.error("Failed to clear cache:", err);
          }
        }
        setRefreshTrigger(prev => prev + 1);
      }
    })
    .catch(err => console.error("Failed to toggle pin:", err));
  };

  const deleteLink = (id) => {
    if (!confirmDelete || window.confirm("Are you sure you want to delete this bookmark?")) {
      fetch(`${API_BASE}/links/${id}`, { method: 'DELETE' })
        .then(async (res) => {
          if (res.ok) {
            if ('caches' in window) {
              try {
                const cache = await caches.open('url-hub-v9');
                const keys = await cache.keys();
                for (const request of keys) {
                  if (request.url.includes('/api/')) {
                    await cache.delete(request);
                  }
                }
              } catch (err) {
                console.error("Failed to clear cache:", err);
              }
            }
            setRefreshTrigger(prev => prev + 1);
          }
        });
    }
  };

  return (
    <div className="app-layout">
      <main className="main-content">
        <OfflineIndicator />
        <Header
          appName={appName}
          currentProfile={enableProfiles ? currentProfileName : 'Default'}
          profiles={profiles}
          currentTab={currentTab}
          setView={(view) => setTab(view)}
          onSettingsClick={() => setIsSettingsOpen(true)}
          onSearchToggle={handleSearchToggle}
          searchActive={searchActive}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSearchClear={handleSearchClear}
        >
          <SearchOverlay
            active={searchActive}
            query={searchQuery}
            onChange={setSearchQuery}
            onClear={handleSearchClear}
            onToggle={handleSearchToggle}
            currentTab={currentTab}
          />
        </Header>

        <TabBar
          currentTab={currentTab}
          setTab={setTab}
          onAddClick={() => { setEditingLink(null); setIsBookmarkOpen(true); }}
          onBookmarksLongPress={() => { if (enableProfiles) setIsProfileOpen(true); }}
          onSettingsClick={() => setIsSettingsOpen(true)}
          onSearchClick={handleSearchToggle}
          searchActive={searchActive}
          enableProfiles={enableProfiles}
          hideBookmarks={hideBookmarks}
          showProjectsTab={showProjectsTab}
        />

        <div
          id="content"
          className={`tools-container ${isCompact ? 'compact' : ''} ${isRefreshing ? 'refreshing' : ''}`}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {isRefreshing && (
            <div className="refresh-indicator">
              <span className="material-icons rotating">refresh</span>
              <span>Refreshing...</span>
            </div>
          )}
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
          {currentTab === 'toolbox' && (
            <ToolboxView
              searchQuery={searchQuery}
              groupToolbox={groupToolbox}
              showStats={showStats}
              recentTools={recentTools}
              setRecentTools={setRecentTools}
              hideRecentTools={hideRecentTools}
              dashboardLayout={dashboardLayout}
              iconSize={iconSize}
              hiddenTools={hiddenTools}
              toolOrder={toolOrder}
              setToolOrder={setToolOrder}
            />
          )}
          {currentTab === 'projects' && showProjectsTab && (
            <ProjectsView
              searchQuery={searchQuery}
              openInNewTab={openInNewTab}
            />
          )}
        </div>

        <button
          id="back-to-top"
          className={showBackToTop ? 'visible' : ''}
          onClick={scrollToTop}
          title="Back to Top"
        >
          <span className="material-icons">arrow_upward</span>
        </button>
      </main>

      {(isSettingsOpen || isProfileOpen || isBookmarkOpen) && (
        <div className="modal-overlay" style={{display: 'block'}} onClick={() => { setIsSettingsOpen(false); setIsProfileOpen(false); setIsBookmarkOpen(false); }}></div>
      )}

      {isSettingsOpen && (
        <SettingsModal
          appName={appName}
          setAppName={setAppName}
          enableProfiles={enableProfiles}
          setEnableProfiles={setEnableProfiles}
          hideBookmarks={hideBookmarks}
          setHideBookmarks={setHideBookmarks}
          showProjectsTab={showProjectsTab}
          setShowProjectsTab={setShowProjectsTab}
          startupTab={startupTab}
          setStartupTab={setStartupTab}
          enableHoverEffects={enableHoverEffects}
          setEnableHoverEffects={setEnableHoverEffects}
          theme={theme}
          setTheme={setTheme}
          accentColor={accentColor}
          setAccentColor={setAccentColor}
          isCompact={isCompact}
          setIsCompact={setIsCompact}
          dashboardLayout={dashboardLayout}
          setDashboardLayout={setDashboardLayout}
          iconSize={iconSize}
          setIconSize={setIconSize}
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
          hideRecentTools={hideRecentTools}
          setHideRecentTools={setHideRecentTools}
          clearRecentTools={clearRecentTools}
          onAddBookmark={() => { setEditingLink(null); setIsBookmarkOpen(true); }}
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
          profiles={profiles}
          enableProfiles={enableProfiles}
          onClose={() => setIsBookmarkOpen(false)}
          onSave={(savedLink) => {
            setRefreshTrigger(prev => prev + 1);
            setTab('bookmarks');
            setSearchQuery('');
            if (savedLink && savedLink.profile_id) {
              const targetProfile = profiles.find(p => p.id === savedLink.profile_id);
              if (targetProfile && targetProfile.name !== currentProfileName) {
                setCurrentProfileName(targetProfile.name);
              }
            }
          }}
        />
      )}

      <Analytics />
    </div>
  );
}

export default App;
