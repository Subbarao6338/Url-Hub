import React, { useState } from 'react';
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
  const [pbUrl, setPbUrl] = React.useState(localStorage.getItem('hub_pb_url') || 'http://127.0.0.1:8090');
  const [pbStatus, setPbStatus] = React.useState('Disconnected');
  const [pbLoading, setPbLoading] = React.useState(false);
  const [pbMsg, setPbMsg] = React.useState('');
  const [pbMsgColor, setPbMsgColor] = React.useState('var(--text-primary)');

  React.useEffect(() => {
    if (window.PocketBase) {
      const pb = new window.PocketBase(pbUrl);
      if (pb.authStore && pb.authStore.isValid) {
        setPbStatus('Connected');
        localStorage.setItem('hub_pb_connected', 'true');
      } else if (localStorage.getItem('hub_pb_connected') === 'true') {
        fetch(`${pbUrl}/api/health`)
          .then(res => {
            if (res.ok) setPbStatus('Connected');
            else {
              setPbStatus('Disconnected');
              localStorage.removeItem('hub_pb_connected');
            }
          })
          .catch(() => {
            setPbStatus('Disconnected');
            localStorage.removeItem('hub_pb_connected');
          });
      }
    }
  }, [pbUrl]);

  const handlePbConnect = async () => {
    if (!window.PocketBase) {
      setPbStatus('Error');
      setPbMsg('PocketBase SDK not loaded');
      setPbMsgColor('var(--danger)');
      return;
    }
    setPbLoading(true);
    setPbStatus('Connecting');
    setPbMsg('');

    try {
      const pb = new window.PocketBase(pbUrl);
      const res = await fetch(`${pbUrl}/api/health`);
      if (res.ok) {
        setPbStatus('Connected');
        localStorage.setItem('hub_pb_url', pbUrl);
        localStorage.setItem('hub_pb_connected', 'true');
        setPbMsg('Connected successfully in anonymous mode.');
        setPbMsgColor('var(--success)');
      } else {
        throw new Error('Unreachable health endpoint');
      }
    } catch (e) {
      setPbStatus('Error');
      setPbMsg('Connection failed: ' + e.message);
      setPbMsgColor('var(--danger)');
    } finally {
      setPbLoading(false);
    }
  };

  const handlePbBackup = async () => {
    if (!window.PocketBase) return;
    setPbLoading(true);
    setPbMsg('Backing up local state...');
    setPbMsgColor('var(--text-primary)');

    try {
      const pb = new window.PocketBase(pbUrl);
      let bookmarksCount = 0;

      for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('hub_links_p')) {
              const val = localStorage.getItem(key);
              if (val) {
                  const list = JSON.parse(val);
                  if (Array.isArray(list)) {
                      for (const bm of list) {
                          try {
                              await pb.collection('bookmarks').create({
                                  title: bm.title || 'Untitled',
                                  url: bm.url || '',
                                  category: bm.category || '',
                                  is_pinned: bm.is_pinned || false,
                                  profile_id: String(bm.profile_id || '1'),
                                  original_id: bm.id || ''
                              });
                              bookmarksCount++;
                          } catch (err) {}
                      }
                  }
              }
          }
      }

      setPbMsg(`Backup complete! Uploaded ${bookmarksCount} bookmarks.`);
      setPbMsgColor('var(--success)');
    } catch (e) {
      setPbMsg('Backup failed: ' + e.message);
      setPbMsgColor('var(--danger)');
    } finally {
      setPbLoading(false);
    }
  };

  const handlePbRestore = async () => {
    if (!window.PocketBase) return;
    setPbLoading(true);
    setPbMsg('Restoring bookmarks from cloud...');
    setPbMsgColor('var(--text-primary)');

    try {
      const pb = new window.PocketBase(pbUrl);
      const remoteBookmarks = await pb.collection('bookmarks').getFullList();
      if (remoteBookmarks && remoteBookmarks.length > 0) {
          const grouped = {};
          remoteBookmarks.forEach(rb => {
              const pid = rb.profile_id || '1';
              if (!grouped[pid]) grouped[pid] = [];
              grouped[pid].push({
                  id: rb.original_id || rb.id,
                  title: rb.title,
                  url: rb.url,
                  category: rb.category,
                  is_pinned: rb.is_pinned,
                  profile_id: pid
              });
          });

          Object.keys(grouped).forEach(pid => {
              localStorage.setItem(`hub_links_p${pid}`, JSON.stringify(grouped[pid]));
          });

          setPbMsg(`Restore finished! Loaded ${remoteBookmarks.length} bookmarks.`);
          setPbMsgColor('var(--success)');
          setTimeout(() => window.location.reload(), 1500);
      } else {
        setPbMsg('No remote bookmarks found to restore.');
        setPbMsgColor('var(--amber)');
      }
    } catch (e) {
      setPbMsg('Restore failed: ' + e.message);
      setPbMsgColor('var(--danger)');
    } finally {
      setPbLoading(false);
    }
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

        <CollapsibleSection id="pocketbase" title="PocketBase Cloud Sync" icon="sync_alt" isOpen={openSections.includes('pocketbase')} onToggle={toggleSection}>
          <div className="form-group">
            <label>PocketBase URL</label>
            <input
              type="text"
              className="pill"
              value={pbUrl}
              onChange={(e) => {
                setPbUrl(e.target.value);
                localStorage.setItem('hub_pb_url', e.target.value);
              }}
              placeholder="http://127.0.0.1:8090"
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
            <div className="flex-between">
              <span className="small">Cloud Connection Status:</span>
              <strong style={{ color: pbStatus === 'Connected' ? 'var(--success)' : 'var(--text-primary)', opacity: pbStatus === 'Connected' ? 1 : 0.6 }}>{pbStatus}</strong>
            </div>

            <button
              type="button"
              className="pill btn-primary w-full mt-5"
              onClick={handlePbConnect}
              disabled={pbLoading}
            >
              {pbLoading ? 'Connecting...' : 'Connect & Authenticate'}
            </button>

            {pbStatus === 'Connected' && (
              <div className="grid grid-cols-2 gap-10 mt-5">
                <button
                  type="button"
                  className="pill"
                  onClick={handlePbBackup}
                  disabled={pbLoading}
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
                >
                  Backup to PB
                </button>
                <button
                  type="button"
                  className="pill"
                  onClick={handlePbRestore}
                  disabled={pbLoading}
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', fontSize: '0.85rem' }}
                >
                  Restore from PB
                </button>
              </div>
            )}

            {pbMsg && (
              <div className="smallest mt-5 opacity-8" style={{ color: pbMsgColor, fontStyle: 'italic' }}>
                {pbMsg}
              </div>
            )}
          </div>
        </CollapsibleSection>

        <CollapsibleSection id="appearance" title="UI & Theme" icon="palette" isOpen={openSections.includes('appearance')} onToggle={toggleSection}>
          <div className="form-group">
            <label>Theme Mode</label>
            <div className="pill-group">
              {['light', 'dark', 'system'].map(t => (
                <button key={t} className={`pill ${theme === t ? 'active' : ''}`} onClick={() => setTheme(t)}>
                  <span className="material-icons mr-10" style={{fontSize: '1.1rem'}}>{t === 'light' ? 'light_mode' : t === 'dark' ? 'dark_mode' : 'settings_brightness'}</span>
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
