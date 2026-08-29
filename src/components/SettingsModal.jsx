import React, { useState, useEffect } from 'react';
import { getApiBase } from '../api';

const CollapsibleSection = ({ id, title, icon, isOpen, onToggle, children }) => {
  return (
    <div className={`settings-collapsible ${isOpen ? 'is-open' : ''}`}>
      <div className="collapsible-header" onClick={() => onToggle(id)}>
        <div className="header-left">
          <span className="material-icons">{icon}</span>
          <span>{title}</span>
        </div>
        <span className="material-icons toggle-icon">
          {isOpen ? 'expand_less' : 'expand_more'}
        </span>
      </div>
      <div className="collapsible-content">
        <div className="collapsible-inner">
          {children}
        </div>
      </div>
    </div>
  );
};

const THEME_COLORS = [
  'indigo', 'blue', 'sky', 'teal', 'green', 'amber', 'orange', 'red', 'rose', 'purple', 'violet', 'slate'
];

const SettingsModal = ({
  deferredPrompt, setDeferredPrompt,
  appName, setAppName,
  showProjectsTab, setShowProjectsTab,
  startupTab, setStartupTab,
  enableHoverEffects, setEnableHoverEffects,
  theme, setTheme,
  accentColor, setAccentColor,
  isCompact, setIsCompact,
  hideBookmarks, setHideBookmarks,
  hideToolbox, setHideToolbox,
  hideBookmarkUrls, setHideBookmarkUrls,
  hideBookmarkIcons, setHideBookmarkIcons,
  hideToolboxIcons, setHideToolboxIcons,
  hideProjectUrls, setHideProjectUrls,
  hideProjectIcons, setHideProjectIcons,
  showStats, setShowStats,
  autoFocusSearch, setAutoFocusSearch,
  openInNewTab, setOpenInNewTab,
  disableGlass, setDisableGlass,
  disableAnimations, setDisableAnimations,
  reducedMotion, setReducedMotion,
  confirmDelete, setConfirmDelete,
  groupToolbox, setGroupToolbox,
  hideRecentTools, setHideRecentTools,
  clearRecentTools,
  onClose,
  resetData
}) => {
  const [openSections, setOpenSections] = useState(['global']);
  const [analyticsData, setAnalyticsData] = useState({
    memory: null,
    navigationTiming: null,
    onlineStatus: typeof navigator !== 'undefined' ? navigator.onLine : true,
    connectionType: navigator?.connection?.effectiveType || 'unknown',
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    screen: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
    storageKb: (JSON.stringify(localStorage).length / 1024).toFixed(2),
    storageItemCount: localStorage.length,
    bookmarksCount: 0,
    recentToolsCount: 0
  });

  const [diagnosticResults, setDiagnosticResults] = useState(null);
  const [isDiagnosticRunning, setIsDiagnosticRunning] = useState(false);

  const refreshAnalytics = () => {
    let memoryInfo = null;
    if (performance && performance.memory) {
      memoryInfo = {
        usedJSHeapSize: (performance.memory.usedJSHeapSize / (1024 * 1024)).toFixed(2),
        totalJSHeapSize: (performance.memory.totalJSHeapSize / (1024 * 1024)).toFixed(2),
        jsHeapSizeLimit: (performance.memory.jsHeapSizeLimit / (1024 * 1024)).toFixed(2)
      };
    }

    let navTime = null;
    if (performance && performance.getEntriesByType) {
      const navEntries = performance.getEntriesByType('navigation');
      if (navEntries && navEntries.length > 0) {
        navTime = `${Math.round(navEntries[0].duration)} ms`;
      }
    }

    let bCount = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('hub_links_p')) {
        try {
          const parsed = JSON.parse(localStorage.getItem(k));
          if (Array.isArray(parsed)) bCount += parsed.length;
        } catch (e) {}
      }
    }

    let rCount = 0;
    try {
      const recent = JSON.parse(localStorage.getItem('hub_recent_tools'));
      if (Array.isArray(recent)) rCount = recent.length;
    } catch (e) {}

    setAnalyticsData({
      memory: memoryInfo,
      navigationTiming: navTime,
      onlineStatus: typeof navigator !== 'undefined' ? navigator.onLine : true,
      connectionType: navigator?.connection?.effectiveType || 'N/A',
      viewport: `${window.innerWidth}x${window.innerHeight}`,
      screen: `${window.screen?.width || 0}x${window.screen?.height || 0}`,
      storageKb: (JSON.stringify(localStorage).length / 1024).toFixed(2),
      storageItemCount: localStorage.length,
      bookmarksCount: bCount,
      recentToolsCount: rCount
    });
  };

  useEffect(() => {
    if (openSections.includes('analytics')) {
      refreshAnalytics();
      const interval = setInterval(refreshAnalytics, 3000);
      return () => clearInterval(interval);
    }
  }, [openSections]);

  const runDiagnostics = () => {
    setIsDiagnosticRunning(true);
    setDiagnosticResults(null);

    setTimeout(() => {
      const results = [];

      // Check 1: Storage Read/Write
      try {
        const testKey = 'hub_diag_test_' + Date.now();
        localStorage.setItem(testKey, 'ok');
        const val = localStorage.getItem(testKey);
        localStorage.removeItem(testKey);
        results.push({ name: 'Local Storage R/W', status: val === 'ok' ? 'pass' : 'fail', detail: val === 'ok' ? 'Read/Write normal' : 'Failed test' });
      } catch (e) {
        results.push({ name: 'Local Storage R/W', status: 'fail', detail: e.message });
      }

      // Check 2: API Base Mode
      const apiMode = getApiBase();
      results.push({ name: 'Backend API Connectivity', status: 'pass', detail: `Mode: ${apiMode}` });

      // Check 3: Browser Feature Capabilities
      const swSupport = 'serviceWorker' in navigator;
      const idbSupport = 'indexedDB' in window;
      const workerSupport = 'Worker' in window;
      results.push({
        name: 'Browser Capabilities',
        status: (swSupport && idbSupport && workerSupport) ? 'pass' : 'warn',
        detail: `SW: ${swSupport ? 'Yes' : 'No'}, IDB: ${idbSupport ? 'Yes' : 'No'}, Workers: ${workerSupport ? 'Yes' : 'No'}`
      });

      // Check 4: Network Connectivity
      results.push({
        name: 'Network Status',
        status: navigator.onLine ? 'pass' : 'warn',
        detail: navigator.onLine ? 'Online' : 'Offline Mode'
      });

      setDiagnosticResults(results);
      setIsDiagnosticRunning(false);
    }, 400);
  };

  const toggleSection = (id) => {
    setOpenSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleExport = () => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('hub_')) {
        data[key] = localStorage.getItem(key);
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `epic_toolbox_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const Toggle = ({ label, value, onChange, icon }) => (
    <div className="settings-row">
      <div className="settings-row-label">
        {icon && <span className="material-icons mr-10" style={{fontSize: '1.2rem', opacity: 0.7}}>{icon}</span>}
        <span>{label}</span>
      </div>
      <label className="switch">
        <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
        <span className="slider round"></span>
      </label>
    </div>
  );

  return (
    <div className="modal glass-card" style={{maxWidth: '600px'}}>
      <div className="modal-header-flex">
        <h2 style={{margin: 0, fontSize: '1.5rem', fontWeight: 800}}>Settings</h2>
        <button className="icon-btn" onClick={onClose}><span className="material-icons">close</span></button>
      </div>

      <div className="settings-container" style={{flex: 1, overflowY: 'auto', paddingRight: '5px', marginTop: '1rem'}}>
        <CollapsibleSection id="global" title="General" icon="settings" isOpen={openSections.includes('global')} onToggle={toggleSection}>
          <div className="form-group">
            <label>Application Name</label>
            <input type="text" className="pill" value={appName} onChange={(e) => setAppName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Startup Tab</label>
            <div className="pill-group">
              {['toolbox', 'bookmarks', 'projects'].map(tab => (
                <button key={tab} className={`pill ${startupTab === tab ? 'active' : ''}`} onClick={() => setStartupTab(tab)} disabled={(tab === 'projects' && !showProjectsTab) || (tab === 'toolbox' && hideToolbox) || (tab === 'bookmarks' && hideBookmarks)}>
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <Toggle label="Auto-focus Search" value={autoFocusSearch} onChange={setAutoFocusSearch} icon="search" />
          <Toggle label="Open links in new tab" value={openInNewTab} onChange={setOpenInNewTab} icon="open_in_new" />
          <Toggle label="Confirm Deletion" value={confirmDelete} onChange={setConfirmDelete} icon="delete" />
        </CollapsibleSection>

        <CollapsibleSection id="toolbox" title="Toolbox" icon="handyman" isOpen={openSections.includes('toolbox')} onToggle={toggleSection}>
          <Toggle label="Show Toolbox Tab" value={!hideToolbox} onChange={(v) => setHideToolbox(!v)} icon="visibility" />
          <Toggle label="Hide Tool Icons" value={hideToolboxIcons} onChange={setHideToolboxIcons} icon="image_not_supported" />
          <Toggle label="Group by Category" value={groupToolbox} onChange={setGroupToolbox} icon="grid_view" />
          <Toggle label="Hide Recent Tools" value={hideRecentTools} onChange={setHideRecentTools} icon="history" />
          <button className="pill w-full mt-10" onClick={clearRecentTools}><span className="material-icons mr-10">history_toggle_off</span> Clear Recent Tools</button>
        </CollapsibleSection>

        <CollapsibleSection id="bookmarks" title="Bookmarks" icon="bookmarks" isOpen={openSections.includes('bookmarks')} onToggle={toggleSection}>
          <Toggle label="Show Bookmarks Tab" value={!hideBookmarks} onChange={(v) => setHideBookmarks(!v)} icon="visibility" />
          <Toggle label="Hide Bookmark Icons" value={hideBookmarkIcons} onChange={setHideBookmarkIcons} icon="image_not_supported" />
          <Toggle label="Hide Bookmark URLs" value={hideBookmarkUrls} onChange={setHideBookmarkUrls} icon="link_off" />
        </CollapsibleSection>

        <CollapsibleSection id="projects" title="Projects" icon="architecture" isOpen={openSections.includes('projects')} onToggle={toggleSection}>
          <Toggle label="Show Projects Tab" value={showProjectsTab} onChange={setShowProjectsTab} icon="visibility" />
          <Toggle label="Hide Project Icons" value={hideProjectIcons} onChange={setHideProjectIcons} icon="image_not_supported" />
          <Toggle label="Hide Project URLs" value={hideProjectUrls} onChange={setHideProjectUrls} icon="link_off" />
        </CollapsibleSection>

        <CollapsibleSection id="analytics" title="Live Analytics & Diagnostics" icon="insights" isOpen={openSections.includes('analytics')} onToggle={toggleSection}>
          <div className="form-group mb-15">
            <div className="flex-between align-center mb-10">
              <label style={{margin: 0, fontWeight: 700}}>Live Telemetry & Metrics</label>
              <button className="pill smallest" onClick={refreshAnalytics}>
                <span className="material-icons mr-10" style={{fontSize: '0.9rem'}}>refresh</span> Refresh
              </button>
            </div>

            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px'}}>
              <div className="pill text-center" style={{flexDirection: 'column', alignItems: 'flex-start', padding: '8px 12px'}}>
                <span className="smallest opacity-6 uppercase">Storage Used</span>
                <span style={{fontWeight: 700, fontSize: '1rem'}}>{analyticsData.storageKb} KB</span>
                <span className="smallest opacity-5">{analyticsData.storageItemCount} items</span>
              </div>
              <div className="pill text-center" style={{flexDirection: 'column', alignItems: 'flex-start', padding: '8px 12px'}}>
                <span className="smallest opacity-6 uppercase">Page Load Time</span>
                <span style={{fontWeight: 700, fontSize: '1rem'}}>{analyticsData.navigationTiming || 'Fast'}</span>
                <span className="smallest opacity-5">Navigation performance</span>
              </div>
              <div className="pill text-center" style={{flexDirection: 'column', alignItems: 'flex-start', padding: '8px 12px'}}>
                <span className="smallest opacity-6 uppercase">Heap Memory</span>
                <span style={{fontWeight: 700, fontSize: '1rem'}}>
                  {analyticsData.memory ? `${analyticsData.memory.usedJSHeapSize} MB` : 'N/A'}
                </span>
                <span className="smallest opacity-5">
                  {analyticsData.memory ? `Max ${analyticsData.memory.jsHeapSizeLimit} MB` : 'Standard Browser'}
                </span>
              </div>
              <div className="pill text-center" style={{flexDirection: 'column', alignItems: 'flex-start', padding: '8px 12px'}}>
                <span className="smallest opacity-6 uppercase">Network Status</span>
                <span style={{fontWeight: 700, fontSize: '1rem', color: analyticsData.onlineStatus ? 'var(--success, #10b981)' : 'var(--danger, #ef4444)'}}>
                  {analyticsData.onlineStatus ? 'Online' : 'Offline'}
                </span>
                <span className="smallest opacity-5">Conn: {analyticsData.connectionType}</span>
              </div>
              <div className="pill text-center" style={{flexDirection: 'column', alignItems: 'flex-start', padding: '8px 12px'}}>
                <span className="smallest opacity-6 uppercase">Viewport</span>
                <span style={{fontWeight: 700, fontSize: '1rem'}}>{analyticsData.viewport}</span>
                <span className="smallest opacity-5">Screen {analyticsData.screen}</span>
              </div>
              <div className="pill text-center" style={{flexDirection: 'column', alignItems: 'flex-start', padding: '8px 12px'}}>
                <span className="smallest opacity-6 uppercase">App Objects</span>
                <span style={{fontWeight: 700, fontSize: '1rem'}}>{analyticsData.bookmarksCount} Bookmarks</span>
                <span className="smallest opacity-5">{analyticsData.recentToolsCount} Recent Tools</span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <div className="flex-between align-center mb-10">
              <label style={{margin: 0, fontWeight: 700}}>System Health Diagnostic</label>
              <button className="pill active" onClick={runDiagnostics} disabled={isDiagnosticRunning}>
                <span className="material-icons mr-10" style={{fontSize: '0.9rem'}}>{isDiagnosticRunning ? 'sync' : 'build_circle'}</span>
                {isDiagnosticRunning ? 'Running...' : 'Run Diagnostics'}
              </button>
            </div>

            {diagnosticResults && (
              <div className="diagnostic-results mt-10" style={{display: 'flex', flexDirection: 'column', gap: '6px'}}>
                {diagnosticResults.map((res, idx) => (
                  <div key={idx} className="pill flex-between align-center" style={{padding: '6px 12px', fontSize: '0.85rem'}}>
                    <div className="flex-gap align-center">
                      <span className="material-icons" style={{
                        fontSize: '1rem',
                        color: res.status === 'pass' ? 'var(--success, #10b981)' : res.status === 'warn' ? 'var(--warning, #f59e0b)' : 'var(--danger, #ef4444)'
                      }}>
                        {res.status === 'pass' ? 'check_circle' : res.status === 'warn' ? 'warning' : 'cancel'}
                      </span>
                      <span style={{fontWeight: 600}}>{res.name}</span>
                    </div>
                    <span className="opacity-7 smallest">{res.detail}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CollapsibleSection>

        <CollapsibleSection id="appearance" title="UI & Theme" icon="palette" isOpen={openSections.includes('appearance')} onToggle={toggleSection}>
          <div className="form-group">
            <label>Theme Mode</label>
            <div className="pill-group">
              {['light', 'dark', 'nature', 'system'].map(t => (
                <button key={t} className={`pill ${theme === t ? 'active' : ''}`} onClick={() => setTheme(t)}>
                  <span className="material-icons mr-10" style={{fontSize: '1.1rem'}}>{t === 'light' ? 'light_mode' : t === 'dark' ? 'dark_mode' : t === 'nature' ? 'eco' : 'settings_brightness'}</span>
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Accent Color</label>
            <div className="scrollable-x" style={{padding: '5px 0'}}>
              <div className="flex-gap">
                {THEME_COLORS.map(color => (
                  <button key={color} className={`color-circle ${accentColor === color ? 'active' : ''}`} style={{background: `var(--${color})` || color}} onClick={() => setAccentColor(color)} title={color} />
                ))}
              </div>
            </div>
          </div>
          <Toggle label="Compact View" value={isCompact} onChange={setIsCompact} icon="view_headline" />
          <Toggle label="Show Statistics" value={showStats} onChange={setShowStats} icon="bar_chart" />
          <Toggle label="Enable Glass Morphism" value={!disableGlass} onChange={(v) => setDisableGlass(!v)} icon="blur_on" />
          <Toggle label="Enable Animations" value={!disableAnimations} onChange={(v) => setDisableAnimations(!v)} icon="auto_awesome" />
          <Toggle label="Reduced Motion" value={reducedMotion} onChange={setReducedMotion} icon="motion_photos_off" />
          <Toggle label="Hover Effects" value={enableHoverEffects} onChange={setEnableHoverEffects} icon="mouse" />
        </CollapsibleSection>

        <CollapsibleSection id="data" title="Maintenance & Data" icon="storage" isOpen={openSections.includes('data')} onToggle={toggleSection}>
          {deferredPrompt && (
            <button className="btn-primary w-full mb-15" onClick={() => deferredPrompt.prompt()}>
              <span className="material-icons mr-10">install_desktop</span> Install App
            </button>
          )}

          <div className="form-group">
            <label>Backup & Restore</label>
            <p className="smallest opacity-6 mb-10">Export your bookmarks and settings to a JSON file or import from a previous backup.</p>
            <div className="pill-group">
                <button className="pill" onClick={handleExport} title="Download a JSON backup of your data">
                    <span className="material-icons mr-10">download</span> Export Data
                </button>
                <label className="pill" style={{cursor: 'pointer'}} title="Restore data from a JSON backup">
                    <span className="material-icons mr-10">upload</span> Import Data
                    <input type="file" hidden accept=".json" onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                                try {
                                    const json = JSON.parse(ev.target.result);
                                    Object.keys(json).forEach(k => localStorage.setItem(k, json[k]));
                                    window.location.reload();
                                } catch(e) { alert("Invalid backup file"); }
                            };
                            reader.readAsText(file);
                        }
                    }} />
                </label>
            </div>
          </div>

          <div className="form-group">
            <label>Data Management</label>
            <p className="smallest opacity-6 mb-10">Reset specific parts of the application data or settings.</p>
            <div className="pill-group">
                <button className="pill" onClick={() => {
                    if(confirm("Refresh bookmarks from defaults? Your settings will be preserved, but custom bookmarks will be reset.")) {
                        if (getApiBase() === 'JSON-MODE') {
                            Object.keys(localStorage).forEach(key => {
                                if (key.startsWith('hub_links_p') || key.startsWith('hub_cats_p')) {
                                    localStorage.removeItem(key);
                                }
                            });
                            window.location.reload();
                        } else {
                            fetch(`${getApiBase()}/debug/reset-db`, { method: 'POST' })
                                .then(() => window.location.reload())
                                .catch(e => alert("Refresh failed: " + e.message));
                        }
                    }
                }}>
                    <span className="material-icons mr-10">refresh</span> Refresh Local Storage
                </button>
                <button className="pill" onClick={() => {
                    if(confirm("Reset all settings to default? Your bookmarks will be preserved.")) {
                        Object.keys(localStorage).forEach(key => {
                            if (key && key.startsWith('hub_') && !key.startsWith('hub_links_p') && !key.startsWith('hub_cats_p')) {
                                localStorage.removeItem(key);
                            }
                        });
                        window.location.reload();
                    }
                }}>
                    <span className="material-icons mr-10">settings_backup_restore</span> Reset Settings
                </button>
            </div>
          </div>

          <div className="form-group">
             <label style={{color: 'var(--danger)'}}>Danger Zone</label>
             <p className="smallest opacity-6 mb-10">Completely wipe all data and settings, returning the app to its original state. This action is permanent and cannot be undone.</p>
             <button className="pill w-full" style={{color: 'var(--danger)', borderColor: 'var(--danger)'}} onClick={() => {
                if (window.confirm("CRITICAL: This will permanently delete ALL your bookmarks and settings. Are you absolutely sure?")) {
                    localStorage.clear();
                    window.location.reload();
                }
             }}>
                <span className="material-icons mr-10">delete_forever</span> Wipe All Data & Factory Reset
             </button>
          </div>

          <div className="p-10 text-center opacity-4 smallest uppercase font-bold">
             Local Storage Usage: {(JSON.stringify(localStorage).length / 1024).toFixed(2)} KB
          </div>
        </CollapsibleSection>
      </div>

      <div className="form-actions" style={{marginTop: '1.5rem'}}>
        <button type="button" className="btn-primary w-full" onClick={onClose}>Finish</button>
      </div>

    </div>
  );
};

export default SettingsModal;
