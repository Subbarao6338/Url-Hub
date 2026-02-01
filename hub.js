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
  "All": "🏠"
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
        const res = await fetch('links.json');
        if (res.ok) raw = await res.json();
      } catch (fetchErr) {
        console.warn("Could not fetch links.json (likely file:// protocol restriction). Falling back to embedded.", fetchErr);
        // Fallback to embedded script tag content if present
        const dataEl = document.getElementById("data");
        if (dataEl && dataEl.textContent.trim()) {
          raw = JSON.parse(dataEl.textContent);
        }
      }

      if (!Array.isArray(raw) || raw.length === 0) return;

      STATE.links = raw.map(item => {
        let category = item.category || "Others";
        return {
          id: Date.now() + Math.random().toString(36).substr(2, 9),
          title: item.title,
          url: item.url,
          category: category
        };
      });
      this.saveData();
    } catch (e) {
      console.error("Migration failed", e);
    }
  },

  // CRUD
  addLink(link) {
    STATE.links.unshift({ ...link, id: Date.now().toString(36) });
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

    // Close modal on outside click
    document.getElementById('modal-overlay').addEventListener('click', this.closeModal);
  },

  renderSidebar() {
    const nav = document.getElementById('category-filter');
    const stats = Core.getStats();

    // Get all unique categories (defined icons + existing in data)
    const definedCats = Object.keys(CAT_ICONS).filter(c => c !== 'All');
    const existingCats = Object.keys(stats);
    const allCats = [...new Set([...definedCats, ...existingCats])].sort((a, b) => a.localeCompare(b));

    let html = `<button class="category-btn ${STATE.activeCategory === 'All' ? 'active' : ''}" onclick="UI.setCategory('All')" title="All Tools">
      <span class="icon">${CAT_ICONS["All"] || "🏠"}</span>
      <span class="text">All Tools</span>
      <span class="category-count">${STATE.links.length}</span>
    </button>`;

    allCats.forEach(cat => {
      const count = stats[cat] || 0;
      html += `<button class="category-btn ${STATE.activeCategory === cat ? 'active' : ''}" onclick="UI.setCategory('${cat}')" title="${cat}">
        <span class="icon">${CAT_ICONS[cat] || "📦"}</span>
        <span class="text">${cat}</span>
        <span class="category-count">${count}</span>
      </button>`;
    });

    nav.innerHTML = html;
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
    filtered.forEach(l => {
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

      grouped[cat].forEach(link => {
        const card = document.createElement('a');
        card.className = 'card';
        card.href = link.url;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';

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
          const src = userIcon || `https://www.google.com/s2/favicons?domain=${new URL(link.url).hostname}&sz=64`;
          const fallback = CAT_ICONS[cat] || "🔗";
          const fallbackSvg = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='80'>${fallback}</text></svg>`;

          imgHtml = `<img src="${src}" class="card-icon" loading="lazy" onerror="this.src='${fallbackSvg}'; this.onerror=null;">`;
        }

        card.innerHTML = `
          <div class="card-header">
            ${imgHtml}
            <div class="card-title">${link.title}</div>
          </div>
          <div class="card-url">${new URL(link.url).hostname}</div>
          
          <div class="card-actions" onclick="event.preventDefault()">
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
  },

  openEdit(id) {
    const link = STATE.links.find(l => l.id === id);
    if (!link) return;

    document.getElementById('edit-id').value = link.id;
    document.getElementById('tool-title').value = link.title;
    document.getElementById('tool-url').value = link.url;
    document.getElementById('tool-category').value = link.category;

    document.getElementById('modal-title').textContent = 'Edit Tool';
    this.openModal('modal-add');
  },

  handleFormSubmit(e) {
    e.preventDefault();
    const id = document.getElementById('edit-id').value;
    const data = {
      title: document.getElementById('tool-title').value.trim(),
      url: document.getElementById('tool-url').value.trim(),
      category: document.getElementById('tool-category').value.trim() || 'Others'
    };

    if (id) {
      Core.updateLink(id, data);
    } else {
      Core.addLink(data);
    }
    this.closeModal();
    this.renderSidebar(); // Update counts
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
  }
};

// Initial Start
Core.init();
