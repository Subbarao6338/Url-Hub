import React, { useState, useEffect } from 'react';

const markdownToHTML = (markdown) => {
  if (!markdown) return '';
  const lines = markdown.split('\n');
  let html = '';
  let inCodeBlock = false;
  let codeContent = '';
  let inList = false;

  const parseInline = (text) => {
    return text
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/__(.*?)__/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/_(.*?)_/g, '<em>$1</em>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/!\[(.*?)\]\((.*?)\)/g, "<img alt='$1' src='$2' />")
      .replace(/\[(.*?)\]\((.*?)\)/g, "<a href='$2' target='_blank' rel='noopener noreferrer'>$1</a>");
  };

  for (let line of lines) {
    const trimmedLine = line.trim();

    if (trimmedLine.startsWith('```')) {
      if (inCodeBlock) {
        html += `<pre><code>${codeContent}</code></pre>`;
        codeContent = '';
        inCodeBlock = false;
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeContent += line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') + '\n';
      continue;
    }

    if (trimmedLine.startsWith('# ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h1>${parseInline(trimmedLine.substring(2))}</h1>`;
    } else if (trimmedLine.startsWith('## ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h2>${parseInline(trimmedLine.substring(3))}</h2>`;
    } else if (trimmedLine.startsWith('### ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h3>${parseInline(trimmedLine.substring(4))}</h3>`;
    } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      if (!inList) { html += '<ul>'; inList = true; }
      html += `<li>${parseInline(trimmedLine.substring(2))}</li>`;
    } else if (trimmedLine === '') {
      if (inList) { html += '</ul>'; inList = false; }
      html += '<div class="md-spacer"></div>';
    } else {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<p>${parseInline(line)}</p>`;
    }
  }
  if (inList) html += '</ul>';
  return html;
};

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

const SettingsModal = ({
  appName, setAppName,
  enableProfiles, setEnableProfiles,
  startupTab, setStartupTab,
  showProjectsTab, setShowProjectsTab,
  enableHoverEffects, setEnableHoverEffects,
  theme, setTheme,
  accentColor, setAccentColor,
  isCompact, setIsCompact,
  hideUrls, setHideUrls,
  hideIcons, setHideIcons,
  showStats, setShowStats,
  autoFocusSearch, setAutoFocusSearch,
  openInNewTab, setOpenInNewTab,
  openProjectsInternally, setOpenProjectsInternally,
  disableGlass, setDisableGlass,
  enableAurora, setEnableAurora,
  reducedMotion, setReducedMotion,
  confirmDelete, setConfirmDelete,
  groupToolbox, setGroupToolbox,
  hideRecentTools, setHideRecentTools,
  clearRecentTools,
  onAddBookmark,
  onClose,
  resetData
}) => {
  const [openSections, setOpenSections] = useState([]);

  const toggleSection = (id) => {
    setOpenSections(prev =>
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleExport = () => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('hub_')) {
        data[key] = localStorage.getItem(key);
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `hub_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target.result);
        if (window.confirm("Importing will overwrite existing settings. Continue?")) {
          Object.keys(json).forEach(key => {
            if (key.startsWith('hub_')) {
              localStorage.setItem(key, json[key]);
            }
          });
          window.location.reload();
        }
      } catch (err) {
        alert("Invalid backup file.");
      }
    };
    reader.readAsText(file);
  };

  const colors = [
    'indigo', 'blue', 'cyan', 'green', 'yellow', 'orange', 'red', 'pink', 'purple', 'violet', 'lime', 'sky', 'rose', 'slate', 'black'
  ];

  return (
    <div className="modal" style={{display: 'block', padding: '1.5rem'}}>
      <h2 style={{marginTop: 0, marginBottom: '1.5rem', fontSize: '1.5rem'}}>Settings</h2>

      <div className="settings-container">
        <CollapsibleSection
          id="global"
          title="Global"
          icon="settings"
          isOpen={openSections.includes('global')}
          onToggle={toggleSection}
        >
          <div className="form-group">
            <label>App Name</label>
            <input
              type="text"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="N Box"
            />
          </div>
          <div className="form-group">
            <label>Startup Tab</label>
            <div className="pill-group">
              {['toolbox', 'bookmarks', 'projects'].map(tab => (
                <button
                  key={tab}
                  className={`pill ${startupTab === tab ? 'active' : ''}`}
                  onClick={() => setStartupTab(tab)}
                >
                  <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Navigation</label>
            <div className="pill-group">
              <button className={`pill ${autoFocusSearch ? 'active' : ''}`} onClick={() => setAutoFocusSearch(!autoFocusSearch)}>
                <span className="material-icons">center_focus_strong</span>
                <span>Auto-focus Search</span>
              </button>
              <button className={`pill ${openInNewTab ? 'active' : ''}`} onClick={() => setOpenInNewTab(!openInNewTab)}>
                <span className="material-icons">open_in_new</span>
                <span>Open in New Tab</span>
              </button>
              <button className={`pill ${showProjectsTab ? 'active' : ''}`} onClick={() => setShowProjectsTab(!showProjectsTab)}>
                <span className="material-icons">{showProjectsTab ? 'visibility' : 'visibility_off'}</span>
                <span>Show Projects</span>
              </button>
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          id="themes"
          title="Themes & Appearance"
          icon="palette"
          isOpen={openSections.includes('themes')}
          onToggle={toggleSection}
        >
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <label style={{ margin: 0 }}>Color Theme</label>
              <button
                className="pill"
                style={{ padding: '4px 12px', fontSize: '0.75rem' }}
                onClick={() => {
                  const themes = [
                    'light', 'dark', 'nature', 'forest', 'ocean', 'earth', 'mountain', 'desert', 'sunset', 'winter',
                    'autumn', 'lavender', 'spring', 'galaxy', 'blackhole', 'midnight', 'aurora', 'blossom', 'canyon', 'glacier'
                  ];
                  const randomTheme = themes[Math.floor(Math.random() * themes.length)];
                  setTheme(randomTheme);
                  const randomColor = ['indigo', 'blue', 'cyan', 'green', 'yellow', 'orange', 'red', 'pink', 'purple', 'violet', 'lime', 'sky', 'rose', 'slate', 'black'][Math.floor(Math.random() * 15)];
                  setAccentColor(randomColor);
                }}
              >
                <span className="material-icons" style={{ fontSize: '1rem' }}>shuffle</span> Random
              </button>
            </div>
            <div className="pill-group">
              {[
                'light', 'dark', 'nature', 'forest', 'ocean', 'earth', 'mountain', 'desert', 'sunset', 'winter',
                'autumn', 'lavender', 'spring', 'galaxy', 'blackhole', 'midnight', 'aurora', 'blossom', 'canyon', 'glacier'
              ].map(t => {
                const icons = {
                  light: 'light_mode', dark: 'dark_mode', nature: 'eco', forest: 'forest',
                  ocean: 'water', earth: 'landscape', mountain: 'terrain', desert: 'wb_sunny',
                  sunset: 'wb_twilight', winter: 'ac_unit', autumn: 'park', lavender: 'spa',
                  spring: 'local_florist', galaxy: 'auto_awesome', blackhole: 'cyclone',
                  midnight: 'nights_stay', aurora: 'waves', blossom: 'filter_vintage',
                  canyon: 'terrain', glacier: 'ac_unit'
                };
                return (
                  <button
                    key={t}
                    className={`pill ${theme === t ? 'active' : ''}`}
                    onClick={() => setTheme(t)}
                  >
                    <span className="material-icons">{icons[t] || 'palette'}</span>
                    <span>{t.charAt(0).toUpperCase() + t.slice(1)}</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="form-group">
            <label>Accent Color</label>
            <div className="pill-group">
              {colors.map(color => (
                <button
                  key={color}
                  className={`color-pill ${accentColor === color ? 'active' : ''}`}
                  style={{background: getHex(color)}}
                  onClick={() => setAccentColor(color)}
                  title={color}
                />
              ))}
            </div>
          </div>
          <div className="form-group">
            <label>Visual Effects</label>
            <div className="pill-group">
              <button className={`pill ${isCompact ? 'active' : ''}`} onClick={() => setIsCompact(!isCompact)}>
                <span className="material-icons">view_module</span>
                <span>Compact Mode</span>
              </button>
              <button className={`pill ${disableGlass ? 'active' : ''}`} onClick={() => setDisableGlass(!disableGlass)}>
                <span className="material-icons">{disableGlass ? 'blur_on' : 'blur_off'}</span>
                <span>{disableGlass ? 'Enable' : 'Disable'} Glass</span>
              </button>
              <button className={`pill ${enableAurora ? 'active' : ''}`} onClick={() => setEnableAurora(!enableAurora)}>
                <span className="material-icons">auto_awesome</span>
                <span>Aurora BG</span>
              </button>
              <button className={`pill ${reducedMotion ? 'active' : ''}`} onClick={() => setReducedMotion(!reducedMotion)}>
                <span className="material-icons">motion_photos_off</span>
                <span>Reduced Motion</span>
              </button>
              <button className={`pill ${enableHoverEffects ? 'active' : ''}`} onClick={() => setEnableHoverEffects(!enableHoverEffects)}>
                <span className="material-icons">auto_fix_high</span>
                <span>Hover Effects</span>
              </button>
            </div>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          id="bookmarks"
          title="Bookmarks"
          icon="bookmarks"
          isOpen={openSections.includes('bookmarks')}
          onToggle={toggleSection}
        >
          <div className="form-group">
            <label>Manage Bookmarks</label>
            <button className="pill" style={{background: 'var(--primary)', color: 'white', border: 'none'}} onClick={() => { onAddBookmark(); onClose(); }}>
              <span className="material-icons">add_link</span>
              <span>Add New Bookmark</span>
            </button>
          </div>
          <div className="pill-group">
            <button className={`pill ${enableProfiles ? 'active' : ''}`} onClick={() => setEnableProfiles(!enableProfiles)}>
              <span className="material-icons">{enableProfiles ? 'account_circle' : 'no_accounts'}</span>
              <span>Enable Profiles</span>
            </button>
            <button className={`pill ${hideUrls ? 'active' : ''}`} onClick={() => setHideUrls(!hideUrls)}>
              <span className="material-icons">link_off</span>
              <span>Hide URLs</span>
            </button>
            <button className={`pill ${hideIcons ? 'active' : ''}`} onClick={() => setHideIcons(!hideIcons)}>
              <span className="material-icons">hide_image</span>
              <span>Hide Icons</span>
            </button>
            <button className={`pill ${showStats ? 'active' : ''}`} onClick={() => setShowStats(!showStats)}>
              <span className="material-icons">analytics</span>
              <span>Show Stats</span>
            </button>
            <button className={`pill ${confirmDelete ? 'active' : ''}`} onClick={() => setConfirmDelete(!confirmDelete)}>
              <span className="material-icons">delete_sweep</span>
              <span>Confirm Deletion</span>
            </button>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          id="projects"
          title="Projects"
          icon="rocket_launch"
          isOpen={openSections.includes('projects')}
          onToggle={toggleSection}
        >
          <div className="pill-group">
            <button className={`pill ${openProjectsInternally ? 'active' : ''}`} onClick={() => setOpenProjectsInternally(!openProjectsInternally)}>
              <span className="material-icons">tab</span>
              <span>Open Projects Internally</span>
            </button>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          id="toolbox"
          title="Toolbox"
          icon="handyman"
          isOpen={openSections.includes('toolbox')}
          onToggle={toggleSection}
        >
          <div className="pill-group">
            <button className={`pill ${groupToolbox ? 'active' : ''}`} onClick={() => setGroupToolbox(!groupToolbox)}>
              <span className="material-icons">reorder</span>
              <span>Group Toolbox</span>
            </button>
            <button className={`pill ${hideRecentTools ? 'active' : ''}`} onClick={() => setHideRecentTools(!hideRecentTools)}>
              <span className="material-icons">{hideRecentTools ? 'visibility_off' : 'visibility'}</span>
              <span>Hide Recents</span>
            </button>
            <button className="pill" onClick={() => { if(window.confirm("Clear recent tools history?")) clearRecentTools(); }}>
              <span className="material-icons">history</span>
              <span>Clear Recents</span>
            </button>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          id="data"
          title="Data Management"
          icon="storage"
          isOpen={openSections.includes('data')}
          onToggle={toggleSection}
        >
          <div className="pill-group">
            <button className="pill" onClick={handleExport}>
              <span className="material-icons">download</span> Export Backup
            </button>
            <label className="pill" style={{ cursor: 'pointer' }}>
              <span className="material-icons">upload</span> Import Backup
              <input type="file" accept="application/json" onChange={handleImport} style={{ display: 'none' }} />
            </label>
            <button className="pill" style={{color: '#ef4444'}} onClick={resetData}>
              <span className="material-icons">refresh</span> Reset Local Data
            </button>
            <button className="pill" style={{color: 'var(--primary)'}} onClick={() => {
              if (window.confirm("This will refresh the database with latest entries from source files. Existing links will NOT be deleted. Continue?")) {
                fetch('/api/refresh-db', { method: 'POST' })
                  .then(res => res.ok ? alert("Database refreshed successfully") : alert("Failed to refresh database"))
                  .then(() => window.location.reload());
              }
            }}>
              <span className="material-icons">sync</span> Refresh Database
            </button>
          </div>
        </CollapsibleSection>

        <CollapsibleSection
          id="about"
          title="About"
          icon="info"
          isOpen={openSections.includes('about')}
          onToggle={toggleSection}
        >
          <AboutTab onClose={onClose} />
        </CollapsibleSection>
      </div>

      <div className="form-actions" style={{marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)'}}>
        <button type="button" className="btn-primary" onClick={onClose} style={{width: '100%', padding: '12px'}}>Close</button>
      </div>
    </div>
  );
};

const AboutTab = () => {
  const [content, setContent] = useState('Loading...');
  useEffect(() => {
    fetch('/README.md')
      .then(res => res.text())
      .then(text => setContent(markdownToHTML(text)))
      .catch(() => setContent('Failed to load README.md'));
  }, []);

  return (
    <div className="about-content-wrapper">
      <div className="about-content" dangerouslySetInnerHTML={{ __html: content }} />
      <div style={{ marginTop: '2rem', textAlign: 'center', opacity: 0.5, fontSize: '0.8rem' }}>
        <p>N Box &bull; Version 1.2.0</p>
        <p>&copy; {new Date().getFullYear()} N Box Team</p>
      </div>
    </div>
  );
};

const getHex = (color) => {
    const map = {
        indigo: '#6366f1', blue: '#3b82f6', cyan: '#06b6d4', green: '#10b981',
        yellow: '#eab308', orange: '#f59e0b', red: '#ef4444', pink: '#ec4899',
        purple: '#8b5cf6', violet: '#7c3aed', lime: '#84cc16', sky: '#0ea5e9',
        rose: '#f43f5e', slate: '#475569', black: '#000000'
    };
    return map[color] || color;
}

export default SettingsModal;
