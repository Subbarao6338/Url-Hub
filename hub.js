// ============= CONFIG & STATE =============
const STORAGE_KEY = "url_hub_links_v1";
const STATE = {
  links: [],
  activeCategory: 'All', // 'All' or specific category name
  searchQuery: '',
  isDarkMode: localStorage.getItem('hub_theme') === 'dark',
  sidebarCollapsed: localStorage.getItem('hub_sidebar_collapsed') === 'true'
};

const CAT_ICONS = {
  "Apps & Stores": "📱",
  "Privacy & Security": "🛡️",
  "AI": "🤖",
  "Utilities": "🛠️",
  "Productivity": "⚡",
  "Media": "🎬",
  "Shopping": "🛍️",
  "Others": "📦",
  "Games": "🎮",
  "Social": "💬",
  "Anime": "🎌",
  "Streaming": "📺",
  "Hosting": "🌐",
  "Banking / Finance": "🏦",
  "Email": "📧",
  "Storage": "☁️",
  "Google": "🌐",
  "Personal": "👤",
  "Linux": "🐧",
  "Search": "🔍",
  "Jobs": "💼",
  "News": "📰",
  "Windows": "🪟",
  "Sports": "⚽",
  "All": "🏠"
};

const Utils = {
  getHostname(urlStr) {
    try {
      return new URL(urlStr).hostname;
    } catch (e) {
      console.warn("Invalid URL:", urlStr);
      return urlStr.replace(/^https?:\/\//, '').split('/')[0];
    }
  },

  // Try opening URL with fallback support
  tryUrlWithFallback(urls, linkTitle) {
    if (!urls || urls.length === 0) return;

    // Try primary URL first
    const primaryUrl = urls[0];
    const win = window.open(primaryUrl, '_blank', 'noopener,noreferrer');

    // If there are fallback URLs and window didn't open, try fallbacks
    if (urls.length > 1 && (!win || win.closed || typeof win.closed === 'undefined')) {
      // Try next URL
      let tried = 1;
      const tryNext = () => {
        if (tried < urls.length) {
          const fallbackUrl = urls[tried];
          console.log(`Trying fallback URL ${tried} for ${linkTitle}: ${fallbackUrl}`);
          const fallbackWin = window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
          tried++;

          // If this also fails and we have more URLs, continue
          if ((!fallbackWin || fallbackWin.closed || typeof fallbackWin.closed === 'undefined') && tried < urls.length) {
            setTimeout(tryNext, 500);
          }
        }
      };

      // Give a small delay before trying fallback
      setTimeout(tryNext, 300);
    }
  }
};

// ============= CORE LOGIC =============
const Core = {
  init() {
    this.loadData().then(() => {
      UI.init();
      PageTools.init();
    });
  },

  async loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        STATE.links = JSON.parse(saved);
        // Ensure IDs exist
        let changed = false;
        STATE.links.forEach(l => {
          if (!l.id) { l.id = Date.now() + Math.random().toString(36).substr(2, 9); changed = true; }
        });
        if (changed) this.saveData();
      } catch (e) {
        console.error("Data load error", e);
        STATE.links = [];
      }
    } else {
      // First load / Migration
      await this.migrateFromJSON();
    }
  },

  saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(STATE.links));
    UI.render();
  },

  async migrateFromJSON() {
    try {
      // Try fetching the external file first
      let raw = [];
      try {
        const res = await fetch(`links.json?t=${new Date().getTime()}`);
        if (res.ok) raw = await res.json();
      } catch (fetchErr) {
        console.warn("Could not fetch links.json", fetchErr);
        // alert("Failed to fetch links.json: " + fetchErr.message); 
      }

      try {
        if (!raw || raw.length === 0) {
          // Fallback to embedded
          const dataEl = document.getElementById("data");
          if (dataEl && dataEl.textContent.trim()) {
            raw = JSON.parse(dataEl.textContent);
          }
        }
      } catch (e) {
        alert("Error parsing fallback data: " + e.message);
      }

      if (!Array.isArray(raw) || raw.length === 0) {
        alert("No links found in links.json or it is invalid JSON.");
        return;
      }

      STATE.links = raw.map(item => {
        let category = item.category || "Others";
        // Support both single url and multiple urls
        let urls = item.urls || [item.url];
        return {
          id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
          title: item.title,
          url: item.url, // Keep primary URL for backward compatibility
          urls: urls, // Store all URLs for fallback
          icon: item.icon || "",
          category: category
        };
      });
      this.saveData();
      alert("Links successfully updated from server!");
    } catch (e) {
      console.error("Migration failed", e);
      alert("Critical error loading data: " + e.message);
    }
  },

  // CRUD
  addLink(link) {
    // Generate a more robust unique ID
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    STATE.links.unshift({ ...link, id });
    this.saveData();
  },

  updateLink(id, updates) {
    const idx = STATE.links.findIndex(l => l.id === id);
    if (idx !== -1) {
      STATE.links[idx] = { ...STATE.links[idx], ...updates };
      this.saveData();
    }
  },

  deleteLink(id) {
    if (confirm("Are you sure you want to delete this tool?")) {
      STATE.links = STATE.links.filter(l => l.id !== id);
      this.saveData();
    }
  },

  getStats() {
    const stats = {};
    STATE.links.forEach(l => {
      stats[l.category] = (stats[l.category] || 0) + 1;
    });
    return stats;
  }
};

// ============= UI MANAGER =============
const UI = {
  init() {
    this.renderSidebar();
    this.render();

    // Apply initial sidebar state
    if (STATE.sidebarCollapsed && window.innerWidth > 768) {
      document.querySelector('.sidebar').classList.add('collapsed');
      document.querySelector('.main-content').classList.add('collapsed');
    }

    // Event Listeners
    document.getElementById('search').addEventListener('input', (e) => {
      STATE.searchQuery = e.target.value.toLowerCase();
      this.render();
    });

    // Sidebar Toggles (Desktop & Mobile)
    document.querySelectorAll('.sidebar-toggle-desktop, .sidebar-toggle-mobile').forEach(btn => {
      btn.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          document.querySelector('.sidebar').classList.toggle('open');
        } else {
          STATE.sidebarCollapsed = !STATE.sidebarCollapsed;
          localStorage.setItem('hub_sidebar_collapsed', STATE.sidebarCollapsed);
          document.querySelector('.sidebar').classList.toggle('collapsed');
          document.querySelector('.main-content').classList.toggle('collapsed');
        }
      });
    });

    // Close modal or FAB on outside click
    document.getElementById('modal-overlay').addEventListener('click', () => {
      this.closeModal();
      this.closeFab();
    });

    // Close FAB on body click (if not clicking FAB)
    document.addEventListener('click', (e) => {
      const fabContainer = document.getElementById('fab-container');
      if (fabContainer && !fabContainer.contains(e.target)) {
        this.closeFab();
      }
    });

    this.setupTooltips();
  },

  setupTooltips() {
    let tooltip = document.querySelector('.global-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.className = 'global-tooltip';
      document.body.appendChild(tooltip);
    }

    const showTooltip = (e) => {
      const sidebar = document.querySelector('.sidebar');
      if (!sidebar.classList.contains('collapsed') || window.innerWidth <= 768) return;

      const label = e.currentTarget.getAttribute('data-label');
      if (!label) return;

      tooltip.textContent = label;
      const rect = e.currentTarget.getBoundingClientRect();

      tooltip.style.top = `${rect.top + (rect.height / 2) - (tooltip.offsetHeight / 2)}px`;
      tooltip.style.left = `${rect.right + 14}px`;

      // Force layout for transition
      tooltip.offsetHeight;
      tooltip.classList.add('active');
    };

    const hideTooltip = () => {
      tooltip.classList.remove('active');
    };

    // Re-attach to all elements with data-label in sidebar
    const targets = document.querySelectorAll('.sidebar [data-label]');
    targets.forEach(target => {
      target.removeEventListener('mouseenter', showTooltip);
      target.removeEventListener('mouseleave', hideTooltip);
      target.addEventListener('mouseenter', showTooltip);
      target.addEventListener('mouseleave', hideTooltip);
    });
  },

  renderSidebar() {
    const nav = document.getElementById('category-filter');
    const stats = Core.getStats();

    // Get all unique categories (defined icons + existing in data)
    const definedCats = Object.keys(CAT_ICONS).filter(c => c !== 'All');
    const existingCats = Object.keys(stats);
    const allCats = [...new Set([...definedCats, ...existingCats])].sort((a, b) => a.localeCompare(b));

    let html = `<button class="category-btn ${STATE.activeCategory === 'All' ? 'active' : ''}" onclick="UI.setCategory('All')" title="All Tools" data-label="All Tools">
      <span class="icon">${CAT_ICONS["All"] || "🏠"}</span>
      <span class="text">All Tools</span>
      <span class="category-count">${STATE.links.length}</span>
    </button>`;

    allCats.forEach(cat => {
      const count = stats[cat] || 0;
      html += `<button class="category-btn ${STATE.activeCategory === cat ? 'active' : ''}" onclick="UI.setCategory('${cat}')" title="${cat}" data-label="${cat}">
        <span class="icon">${CAT_ICONS[cat] || "📦"}</span>
        <span class="text">${cat}</span>
        <span class="category-count">${count}</span>
      </button>`;
    });

    nav.innerHTML = html;
    this.setupTooltips(); // Refresh tooltips for new buttons
  },

  setCategory(cat) {
    STATE.activeCategory = cat;
    this.renderSidebar();
    this.render();
    // On mobile, close sidebar after selection
    if (window.innerWidth <= 768) {
      document.querySelector('.sidebar').classList.remove('open');
    }
  },

  render() {
    const container = document.getElementById('content');
    container.innerHTML = '';

    // Filter Logic
    let filtered = STATE.links.filter(l => {
      const matchesSearch = !STATE.searchQuery ||
        l.title.toLowerCase().includes(STATE.searchQuery) ||
        l.url.toLowerCase().includes(STATE.searchQuery);

      const matchesCat = STATE.activeCategory === 'All' || l.category === STATE.activeCategory;

      return matchesSearch && matchesCat;
    });

    // Group by Category
    const grouped = {};
    filtered.sort((a, b) => a.title.toLowerCase().localeCompare(b.title.toLowerCase())).forEach(l => {
      (grouped[l.category] ||= []).push(l);
    });

    const cats = Object.keys(grouped).sort((a, b) => a.localeCompare(b)); // Alphabetical sections

    if (cats.length === 0) {
      container.innerHTML = `<div style="text-align:center; color:#888; margin-top:3rem;">No tools found</div>`;
      return;
    }

    // Category Emoji Map for Fallback
    // Used global CAT_ICONS instead

    cats.forEach(cat => {
      const section = document.createElement('div');
      section.className = 'category-section';

      // Header
      const header = document.createElement('div');
      header.className = 'category-header';
      header.innerHTML = `<div class="category-title">${cat} <span style="font-size:0.8em;opacity:0.5;font-weight:400;margin-left:8px">${grouped[cat].length}</span></div>`;
      header.onclick = () => section.classList.toggle('collapsed');

      // Grid
      const grid = document.createElement('div');
      grid.className = 'category-grid';

      grouped[cat].forEach((link, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.setProperty('--delay', index);

        // Custom click handler for fallback support
        card.onclick = (e) => {
          // Don't trigger if clicking action buttons
          if (e.target.closest('.card-actions')) return;
          e.preventDefault();
          const urls = link.urls || [link.url];
          Utils.tryUrlWithFallback(urls, link.title);
        };
        card.style.cursor = 'pointer';

        // Icon Logic:
        // 1. User defined Icon (if emoji or URL)
        // 2. Google Favicon
        // 3. Category Fallback Emoji

        // Check if user icon is an emoji (simple check: short and no 'http')
        const userIcon = link.icon || "";
        const isEmoji = userIcon && !userIcon.includes('/') && userIcon.length < 5;

        let imgHtml = '';
        if (isEmoji) {
          // User provided an emoji
          imgHtml = `<div class="card-icon" style="display:grid;place-items:center;font-size:24px;background:var(--bg)">${userIcon}</div>`;
        } else {
          // URL (User provided or Auto Favicon)
          const src = userIcon || `https://www.google.com/s2/favicons?domain=${Utils.getHostname(link.url)}&sz=64`;
          const fallback = CAT_ICONS[cat] || "🔗";
          const fallbackSvg = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='80'>${fallback}</text></svg>`;

          imgHtml = `<img src="${src}" class="card-icon" loading="lazy" onerror="this.src='${fallbackSvg}'; this.onerror=null;">`;
        }

        // Check if multiple URLs exist
        const urls = link.urls || [link.url];
        const hasMultipleUrls = urls.length > 1;
        const fallbackBadge = hasMultipleUrls ? `<span class="fallback-badge" title="${urls.length} URLs available: ${urls.join(', ')}">${urls.length} URLs</span>` : '';

        card.innerHTML = `
          <div class="card-header">
            ${imgHtml}
            <div class="card-title">${link.title}</div>
          </div>
          <div class="card-url">${Utils.getHostname(link.url)}${fallbackBadge}</div>
          
          <div class="card-actions" onclick="event.stopPropagation()">
             <button onclick="UI.openEdit('${link.id}')" title="Edit">✏️</button>
             <button class="btn-delete" onclick="Core.deleteLink('${link.id}')" title="Delete">🗑️</button>
          </div>
        `;
        grid.appendChild(card);
      });

      section.appendChild(header);
      section.appendChild(grid);
      container.appendChild(section);
    });
  },

  // Modal Handling
  openModal(id) {
    this.closeFab();
    document.getElementById(id).style.display = 'block';
    document.getElementById('modal-overlay').style.display = 'block';
    // Populate Datalist for categories
    const dl = document.getElementById('category-list');
    dl.innerHTML = Object.keys(Core.getStats()).map(c => `<option value="${c}">`).join('');
  },

  closeModal() {
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
    document.getElementById('modal-overlay').style.display = 'none';
    document.getElementById('tool-form').reset();
    document.getElementById('edit-id').value = '';
    document.getElementById('modal-title').textContent = 'Add Tool';
    // Clear alternative URLs
    document.getElementById('alternative-urls-container').innerHTML = '';
  },

  openEdit(id) {
    const link = STATE.links.find(l => l.id === id);
    if (!link) return;

    document.getElementById('edit-id').value = link.id;
    document.getElementById('tool-title').value = link.title;
    document.getElementById('tool-url').value = link.url;
    document.getElementById('tool-icon').value = link.icon || '';
    document.getElementById('tool-category').value = link.category;

    // Load alternative URLs
    const container = document.getElementById('alternative-urls-container');
    container.innerHTML = '';
    const urls = link.urls || [link.url];
    // Skip first URL (primary) and add the rest as alternatives
    for (let i = 1; i < urls.length; i++) {
      this.addUrlField(urls[i]);
    }

    document.getElementById('modal-title').textContent = 'Edit Tool';
    this.openModal('modal-add');
  },

  handleFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;

    // Collect all URLs (primary + alternatives)
    const primaryUrl = document.getElementById('tool-url').value.trim();
    const altUrlInputs = document.querySelectorAll('.alt-url-input');
    const urls = [primaryUrl];
    altUrlInputs.forEach(input => {
      const val = input.value.trim();
      if (val && val !== primaryUrl) urls.push(val);
    });

    const data = {
      title: document.getElementById('tool-title').value.trim(),
      url: primaryUrl,
      urls: urls, // Store all URLs
      icon: document.getElementById('tool-icon').value.trim(),
      category: document.getElementById('tool-category').value.trim() || 'Others'
    };

    if (id) {
      Core.updateLink(id, data);
    } else {
      Core.addLink(data);
    }
    this.closeModal();
    this.renderSidebar(); // Update counts
  },

  // FAB Speed Dial
  toggleFab() {
    const container = document.getElementById('fab-container');
    const fab = container.querySelector('.fab');
    container.classList.toggle('active');
    fab.classList.toggle('active');
  },

  closeFab() {
    const container = document.getElementById('fab-container');
    const fab = container.querySelector('.fab');
    container.classList.remove('active');
    fab.classList.remove('active');
  },

  // Add URL field for alternative URLs
  addUrlField(value = '') {
    const container = document.getElementById('alternative-urls-container');
    const wrapper = document.createElement('div');
    wrapper.className = 'url-field-wrapper';
    wrapper.innerHTML = `
      <input type="url" class="alt-url-input" placeholder="https://alternative-url.com" value="${value}">
      <button type="button" class="btn-remove" onclick="this.parentElement.remove()">✕</button>
    `;
    container.appendChild(wrapper);
  }
};

// ============= TOOLS & UTILITIES =============
// Merged from 'Page tools.js' & generic utils
const Tools = {
  exportData() {
    const blob = new Blob([JSON.stringify(STATE.links, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `hub_backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  },

  importData(input) {
    const file = input.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = e => {
      try {
        const json = JSON.parse(e.target.result);
        if (Array.isArray(json)) {
          if (confirm(`Replace current list with ${json.length} items?`)) {
            STATE.links = json;
            // Ensure IDs
            STATE.links.forEach(l => !l.id && (l.id = Date.now() + Math.random().toString(36)));
            Core.saveData();
            Core.init(); // Refresh all
          }
        }
      } catch (err) { alert("Invalid JSON"); }
    };
    reader.readAsText(file);
    input.value = ''; // reset
  },

  resetData() {
    if (confirm("This will reset your dashboard to the default list from links.json. Any local changes will be lost. Continue?")) {
      localStorage.removeItem(STORAGE_KEY);
      location.reload();
    }
  }
};

const PageTools = {
  init() {
    this.applyTheme();
  },

  toggleDarkMode() {
    STATE.isDarkMode = !STATE.isDarkMode;
    localStorage.setItem('hub_theme', STATE.isDarkMode ? 'dark' : 'light');
    this.applyTheme();
  },

  applyTheme() {
    document.documentElement.setAttribute('data-theme', STATE.isDarkMode ? 'dark' : 'light');
    const themeBtn = document.getElementById('theme-toggle');
    if (themeBtn) {
      themeBtn.innerHTML = STATE.isDarkMode ? '☀️' : '🌙';
      themeBtn.title = STATE.isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    }
  },

  cleanPage() {
    // "Zap Ads" logic from original tools
    const selectors = ['iframe', '[class*="ad"]', '[id*="ad"]', '[class*="popup"]', '[class*="overlay"]'];
    let count = 0;
    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        if (el.id !== 'site-viewer') { el.remove(); count++; }
      });
    });
    alert(`Cleaned ${count} elements.`);
  },

  openSite(url) {
    const viewer = document.getElementById('site-viewer');
    const frame = document.getElementById('content-frame');
    if (viewer && frame) {
      frame.src = url;
      viewer.style.display = 'block';
    }
  },

  closeSite() {
    const viewer = document.getElementById('site-viewer');
    const frame = document.getElementById('content-frame');
    if (viewer && frame) {
      viewer.style.display = 'none';
      frame.src = '';
    }
  }
};

// Initial Start
Core.init();

