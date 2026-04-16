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

const SettingsModal = ({
  appName, setAppName,
  startupTab, setStartupTab,
  showProjectsTab, setShowProjectsTab,
  enableHoverEffects, setEnableHoverEffects,
  isDarkMode, setIsDarkMode,
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
  onClose,
  resetData
}) => {
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
  const [activeTab, setActiveTab] = useState('general');

  const colors = [
    'indigo', 'blue', 'cyan', 'green', 'yellow', 'orange', 'red', 'pink', 'purple', 'violet', 'lime', 'sky', 'rose', 'slate', 'black'
  ];

  return (
    <div className="modal" style={{display: 'block'}}>
      <div className="modal-tabs">
        <button className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`} onClick={() => setActiveTab('general')}>
          <span className="material-icons">settings</span> Global
        </button>
        <button className={`tab-btn ${activeTab === 'bookmarks' ? 'active' : ''}`} onClick={() => setActiveTab('bookmarks')}>
          <span className="material-icons">bookmarks</span> Bookmarks
        </button>
        <button className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')}>
          <span className="material-icons">rocket_launch</span> Projects
        </button>
        <button className={`tab-btn ${activeTab === 'toolbox' ? 'active' : ''}`} onClick={() => setActiveTab('toolbox')}>
          <span className="material-icons">handyman</span> Toolbox
        </button>
        <button className={`tab-btn ${activeTab === 'about' ? 'active' : ''}`} onClick={() => setActiveTab('about')}>
          <span className="material-icons">info</span> About
        </button>
      </div>

      {activeTab === 'general' && (
        <div className="tab-pane">
          <h2 className="settings-header">Global Settings</h2>
          <div className="settings-section">
            <h3>Customization</h3>
            <div className="form-group" style={{marginBottom: '1rem'}}>
              <label>App Name</label>
              <input
                type="text"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                placeholder="N Box"
                style={{maxWidth: '300px'}}
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
          </div>
          <div className="settings-section">
            <h3>Appearance</h3>
            <p className="settings-desc">Customize the look and feel of your dashboard.</p>
            <div className="pill-group">
              <button
                className={`pill ${isDarkMode ? 'active' : ''}`}
                onClick={() => setIsDarkMode(!isDarkMode)}
              >
                <span className="material-icons">{isDarkMode ? 'light_mode' : 'dark_mode'}</span>
                <span>Theme: {isDarkMode ? 'Dark' : 'Light'}</span>
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
            <div className="pill-group" style={{marginTop: '15px'}}>
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
          <div className="settings-section">
            <h3>Navigation</h3>
            <p className="settings-desc">Configure how you interact with search and links.</p>
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
          <div className="settings-section">
            <h3>Data Management</h3>
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
              <button className="pill" style={{color: 'var(--accent)'}} onClick={() => {
                if (window.confirm("This will refresh the database with latest entries from source files. Existing links will NOT be deleted. Continue?")) {
                  fetch('/api/refresh-db', { method: 'POST' })
                    .then(res => res.ok ? alert("Database refreshed successfully") : alert("Failed to refresh database"))
                    .then(() => window.location.reload());
                }
              }}>
                <span className="material-icons">storage</span> Refresh Database
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'bookmarks' && (
        <div className="tab-pane">
          <h2 className="settings-header">Bookmarks Settings</h2>
          <div className="settings-section">
            <h3>Layout & Visibility</h3>
            <p className="settings-desc">Control how bookmarks are displayed in the grid.</p>
            <div className="pill-group">
              <button className={`pill ${isCompact ? 'active' : ''}`} onClick={() => setIsCompact(!isCompact)}>
                <span className="material-icons">view_module</span>
                <span>Compact Mode</span>
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
            </div>
          </div>
          <div className="settings-section">
            <h3>Management</h3>
            <div className="pill-group">
              <button className={`pill ${confirmDelete ? 'active' : ''}`} onClick={() => setConfirmDelete(!confirmDelete)}>
                <span className="material-icons">delete_sweep</span>
                <span>Confirm Deletion</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'projects' && (
        <div className="tab-pane">
          <h2 className="settings-header">Projects Settings</h2>
          <div className="settings-section">
            <h3>Behavior</h3>
            <div className="pill-group">
              <button className={`pill ${openProjectsInternally ? 'active' : ''}`} onClick={() => setOpenProjectsInternally(!openProjectsInternally)}>
                <span className="material-icons">tab</span>
                <span>Open Projects Internally</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'toolbox' && (
        <div className="tab-pane">
          <h2 className="settings-header">Toolbox Settings</h2>
          <div className="settings-section">
            <h3>Organization</h3>
            <div className="pill-group">
              <button className={`pill ${groupToolbox ? 'active' : ''}`} onClick={() => setGroupToolbox(!groupToolbox)}>
                <span className="material-icons">reorder</span>
                <span>Group Toolbox</span>
              </button>
              <button className={`pill ${showStats ? 'active' : ''}`} onClick={() => setShowStats(!showStats)}>
                <span className="material-icons">analytics</span>
                <span>Show Counts</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'about' && (
        <AboutTab onClose={onClose} />
      )}

      <div className="form-actions">
        <button type="button" onClick={onClose}>Close</button>
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
    <div className="tab-pane">
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
