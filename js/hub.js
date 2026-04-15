// ============= CONFIG & STATE =============
const PROFILES = {
  'Default': { links: 'url_links.json', cat: 'url_cat.json', icon: 'home' },
  'Private': { links: 'necs_links.json', cat: 'necs_cat.json', icon: 'lock' },
  'Personal': { links: 'combined', icon: 'person' }
};

const getProfileKey = (key) => {
  const profile = localStorage.getItem('hub_current_profile') || localStorage.getItem('hub_startup_profile') || 'Default';
  if (key === 'current_profile' || key === 'startup_profile') return `hub_${key}`;
  return `hub_${profile}_${key}`;
};

const Storage = {
  get(key, defaultValue = null) {
    const val = localStorage.getItem(getProfileKey(key));
    if (val === null) return defaultValue;
    return val;
  },
  set(key, value) {
    localStorage.setItem(getProfileKey(key), value);
  },
  getJson(key, defaultValue = []) {
    const val = this.get(key);
    if (!val) return defaultValue;
    try { return JSON.parse(val); } catch (e) { return defaultValue; }
  },
  setJson(key, value) {
    this.set(key, JSON.stringify(value));
  }
};

const STATE = {
  currentProfile: localStorage.getItem('hub_current_profile') || localStorage.getItem('hub_startup_profile') || 'Default',
  links: [],
  pinnedIds: Storage.getJson('pinned_v1', []),
  activeCategory: 'All', // 'All' or specific category name
  searchQuery: '',
  isDarkMode: Storage.get('theme') === 'dark' || (Storage.get('theme') === null && window.matchMedia('(prefers-color-scheme: dark)').matches),
  isCompact: Storage.get('compact') === 'true',
  hideUrls: Storage.get('hide_urls') === 'true',
  hideIcons: Storage.get('hide_icons') === 'true',
  disableGlass: Storage.get('disable_glass') === 'true',
  showStats: Storage.get('show_stats') !== 'false',
  enableAurora: Storage.get('enable_aurora') !== 'false',
  accentColor: Storage.get('accent_color') || 'indigo',
  isDropdownOpen: false,
  isModalOpen: false,
  currentLink: null,
  primaryColor: '',
  encodedColor: ''
};

let CAT_ICONS = {};

const Utils = {
  getHostname(urlStr) {
    try {
      if (!urlStr.includes('://')) {
        urlStr = 'http://' + urlStr;
      }
      return new URL(urlStr).hostname;
    } catch (e) {
      console.warn("Invalid URL:", urlStr);
      return urlStr.replace(/^https?:\/\//, '').split('/')[0];
    }
  },

  // Copy to clipboard with visual feedback
  async copyToClipboard(text, btn) {
    try {
      await navigator.clipboard.writeText(text);
      const originalText = btn.innerHTML;
      btn.innerHTML = '✅';
      btn.classList.add('copy-success');
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.classList.remove('copy-success');
      }, 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  },

  // Copy all URLs of a tool to clipboard
  async copyAllUrls() {
    if (!STATE.currentLink) return;
    const urls = STATE.currentLink.urls || [STATE.currentLink.url];
    const text = urls.join('\n');
    const btn = document.getElementById('btn-copy-all');
    try {
      await navigator.clipboard.writeText(text);
      const originalText = btn.innerHTML;
      btn.innerHTML = '✅ Copied All';
      btn.classList.add('copy-success');
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.classList.remove('copy-success');
      }, 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
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
  },

  // Robust Icon Renderer for both Material Icons and Emojis
  renderIcon(icon, className = '') {
    if (!icon) return '';

    // If it starts with http, /, or looks like a data URL, it's an image
    if (icon.startsWith('http') || icon.startsWith('/') || icon.startsWith('data:')) {
      return `<img src="${icon}" class="${className}" loading="lazy" onerror="this.src='assets/favicon.svg'">`;
    }

    // Material icons are alphanumeric with underscores (e.g., 'home', '3d_rotation')
    // and do not contain periods (which URLs/files would have)
    const isMaterialIcon = /^[a-z0-9_]+$/.test(icon);
    if (isMaterialIcon) {
      return `<span class="material-icons ${className}">${icon}</span>`;
    }

    // Fallback: treat as emoji or plain text
    // Wrap it in a span with system font to prevent Material Icons from trying to render it as a ligature
    return `<span class="${className}" style="font-family: system-ui, -apple-system, sans-serif; font-style: normal;">${icon}</span>`;
  }
};

// ============= CORE LOGIC =============
const Core = {
  async init() {
    await this.loadCategories();
    await this.loadData();
    UI.init();
    PageTools.init();
  },

  async loadCategories() {
    try {
      const profileCfg = PROFILES[STATE.currentProfile];
      let categories = {};

      if (STATE.currentProfile === 'Personal') {
        const [cat1, cat2] = await Promise.all([
          fetch('data/' + PROFILES['Default'].cat).then(r => r.ok ? r.json() : {}).catch(() => ({})),
          fetch('data/' + PROFILES['Private'].cat).then(r => r.ok ? r.json() : {}).catch(() => ({}))
        ]);
        categories = { ...cat1, ...cat2 };
      } else {
        const res = await fetch('data/' + profileCfg.cat);
        if (res.ok) {
          categories = await res.json();
        }
      }
      CAT_ICONS = categories;
    } catch (e) {
      console.error("Failed to load categories", e);
      // Fallback or empty object
      CAT_ICONS = { "All": "home", "Pinned": "push_pin" };
    }
  },

  async loadData() {
    const saved = Storage.getJson('links_v1', null);
    if (saved !== null) {
      try {
        STATE.links = saved;
        // Ensure IDs exist and migrate category name
        let changed = false;
        STATE.links.forEach(l => {
          if (!l.id) {
            l.id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
            changed = true;
          }
          if (l.category === "Government Services") {
            l.category = "Govt.";
            changed = true;
          }
        });
        if (changed) this.saveData();

        // Self-healing: If dashboard is empty and not yet successfully initialized, try migration
        if (STATE.links.length === 0 && Storage.get('initialized') !== 'true') {
          await this.migrateFromJSON();
        }
      } catch (e) {
        console.error("Data load error", e);
        STATE.links = [];
        await this.migrateFromJSON();
      }
    } else {
      // First load / Migration
      await this.migrateFromJSON();
    }
  },

  saveData() {
    Storage.setJson('links_v1', STATE.links);
    UI.render();
    UI.renderBreadcrumb();
  },

  async migrateFromJSON() {
    try {
      let raw = [];
      const profileCfg = PROFILES[STATE.currentProfile];

      if (STATE.currentProfile === 'Personal') {
        const [data1, data2] = await Promise.all([
          fetch(`data/${PROFILES['Default'].links}`).then(r => r.ok ? r.json() : []).catch(() => []),
          fetch(`data/${PROFILES['Private'].links}`).then(r => r.ok ? r.json() : []).catch(() => [])
        ]);
        const combined = [...data1, ...data2];
        const seen = new Map();
        const deduplicated = [];

        combined.forEach(item => {
          const url = item.url || (item.urls && item.urls[0]);
          if (!url) return;

          const normalized = url.toLowerCase().replace(/\/+$/, '');
          if (seen.has(normalized)) {
            const existing = seen.get(normalized);
            const existingUrls = existing.urls || (existing.url ? [existing.url] : []);
            const newItemUrls = item.urls || (item.url ? [item.url] : []);

            const combinedUrls = [...existingUrls, ...newItemUrls];
            const uniqueUrls = [];
            const seenUrls = new Set();
            combinedUrls.forEach(u => {
              if (!u) return;
              const n = u.toLowerCase().replace(/\/+$/, '');
              if (!seenUrls.has(n)) {
                seenUrls.add(n);
                uniqueUrls.push(u);
              }
            });
            existing.urls = uniqueUrls;
            if (!existing.url && uniqueUrls.length > 0) existing.url = uniqueUrls[0];

            if (!existing.icon && item.icon) existing.icon = item.icon;
            if (!existing.optional_icon && item.optional_icon) existing.optional_icon = item.optional_icon;
          } else {
            const newItem = { ...item };
            seen.set(normalized, newItem);
            deduplicated.push(newItem);
          }
        });
        raw = deduplicated;
      } else {
        try {
          const res = await fetch(`data/${profileCfg.links}`);
          if (res.ok) raw = await res.json();
        } catch (fetchErr) {
          console.warn(`Could not fetch data/${profileCfg.links}`, fetchErr);
        }
      }

      if (!Array.isArray(raw) || raw.length === 0) {
        console.warn(`No links found for ${STATE.currentProfile} profile.`);
        // Ensure state is cleared but don't save empty state to storage to allow retry on next load
        STATE.links = [];
        UI.render();
        UI.renderBreadcrumb();
        return;
      }

      STATE.links = raw.map(item => {
        let category = item.category === "Government Services" ? "Govt." : (item.category || "Others");
        // Support both single url and multiple urls
        let urls = item.urls || [item.url];
        let primaryUrl = item.url || urls[0];
        return {
          id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
          title: item.title,
          url: primaryUrl, // Keep primary URL for backward compatibility
          urls: urls, // Store all URLs for fallback
          icon: item.icon || "",
          optional_icon: item.optional_icon || "",
          category: category
        };
      });
      this.saveData();
      Storage.set('initialized', 'true');
      if (STATE.currentProfile !== 'Personal') {
        alert(`${STATE.currentProfile} links successfully updated from server!`);
      }
    } catch (e) {
      console.error("Migration failed", e);
      alert("Critical error loading data: " + e.message);
    }
  },

  // CRUD
  addLink(link) {
    const id = (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
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
      STATE.pinnedIds = STATE.pinnedIds.filter(pid => pid !== id);
      Storage.setJson('pinned_v1', STATE.pinnedIds);
      this.saveData();
    }
  },

  getStats() {
    const stats = {};
    STATE.links.forEach(l => {
      stats[l.category] = (stats[l.category] || 0) + 1;
    });
    return stats;
  },

  switchProfile(profileName) {
    if (!PROFILES[profileName]) return;
    localStorage.setItem('hub_current_profile', profileName);
    location.reload();
  }
};

// ============= UI MANAGER =============
const UI = {
  _tooltipInitialized: false,
  _eventsInitialized: false,

  init() {
    this.renderBreadcrumb();
    this.render();
    this.updateLogo();

    if (this._eventsInitialized) return;
    this._eventsInitialized = true;

    // Event Listeners
    // Search Toggle
    const searchContainer = document.getElementById('search-container');
    const searchInput = document.getElementById('search');

    document.getElementById('search-toggle').addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = searchContainer.classList.toggle('active');
      document.body.classList.toggle('search-active', isActive);
      if (isActive) {
        searchInput.focus();
      }
    });

    // Close search on outside click
    document.addEventListener('click', (e) => {
      if (!searchContainer.contains(e.target) && searchContainer.classList.contains('active')) {
        // Only close if input is empty
        if (searchInput.value === '') {
          searchContainer.classList.remove('active');
          document.body.classList.remove('search-active');
        }
      }

      // Close dropdown if clicking outside
      if (!e.target.closest('.breadcrumb-nav')) {
        STATE.isDropdownOpen = false;
        this.renderBreadcrumb();
      }
    });

    document.getElementById('search').addEventListener('input', (e) => {
      STATE.searchQuery = e.target.value.toLowerCase();
      this.render();
    });

    document.getElementById('search-clear').addEventListener('click', () => {
      const searchInput = document.getElementById('search');
      const searchContainer = document.getElementById('search-container');
      searchInput.value = '';
      STATE.searchQuery = '';
      searchContainer.classList.remove('active');
      document.body.classList.remove('search-active');
      searchInput.blur();
      this.render();
    });


    // Close modal on outside click
    document.getElementById('modal-overlay').addEventListener('click', () => {
      this.closeModal();
    });

    // Global Keyboard Listeners
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModal();
        this.closeAboutModal();

        // Close search if active and empty
        const searchInput = document.getElementById('search');
        const searchContainer = document.getElementById('search-container');
        if (searchContainer.classList.contains('active')) {
          if (searchInput.value === '') {
            searchContainer.classList.remove('active');
            document.body.classList.remove('search-active');
            searchInput.blur();
          } else {
            searchInput.value = '';
            STATE.searchQuery = '';
            this.render();
          }
        }
      }

      // Search focus shortcut
      if (e.key === '/' && !STATE.isModalOpen && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
        e.preventDefault();
        const searchContainer = document.getElementById('search-container');
        const searchInput = document.getElementById('search');
        searchContainer.classList.add('active');
        document.body.classList.add('search-active');
        searchInput.focus();
      }
    });

    if (!this._tooltipInitialized) {
      this.setupTooltips();
      this._tooltipInitialized = true;
    }
    this.initBackToTop();
    this.setupLogoLongPress();
  },

  setupLogoLongPress() {
    const logoContainer = document.querySelector('.logo-container');
    if (!logoContainer) return;

    let pressTimer;
    let startX, startY;

    const startPress = (e) => {
      // Restrict to left click for mouse events
      if (e.type === 'mousedown' && e.button !== 0) return;

      // Only trigger if clicking on the logo or title
      if (!e.target.closest('.app-logo') && !e.target.closest('.page-title')) return;

      clearTimeout(pressTimer);

      if (e.type === 'touchstart') {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }

      pressTimer = setTimeout(() => {
        this.openProfileModal();
      }, 500);
    };

    const cancelPress = () => {
      clearTimeout(pressTimer);
    };

    const handleMove = (e) => {
      if (e.type === 'touchmove') {
        const moveX = e.touches[0].clientX;
        const moveY = e.touches[0].clientY;
        const dist = Math.sqrt(Math.pow(moveX - startX, 2) + Math.pow(moveY - startY, 2));
        if (dist > 10) cancelPress();
      } else {
        cancelPress();
      }
    };

    logoContainer.addEventListener('mousedown', startPress);
    logoContainer.addEventListener('mouseup', cancelPress);
    logoContainer.addEventListener('mouseleave', cancelPress);
    logoContainer.addEventListener('touchstart', startPress, { passive: true });
    logoContainer.addEventListener('touchend', cancelPress);
    logoContainer.addEventListener('touchmove', handleMove, { passive: true });
    logoContainer.addEventListener('touchcancel', cancelPress);

    // Prevent default context menu on logo/title to allow long press
    logoContainer.addEventListener('contextmenu', (e) => {
      if (e.target.closest('.app-logo') || e.target.closest('.page-title')) {
        e.preventDefault();
      }
    });
  },

  openProfileModal() {
    const modal = document.getElementById('modal-profile-selection');
    const container = document.getElementById('profile-list');
    if (!modal || !container) return;

    const startupProfile = localStorage.getItem('hub_startup_profile') || 'Default';

    container.innerHTML = Object.keys(PROFILES).map(name => {
      const cfg = PROFILES[name];
      const isStartup = name === startupProfile;
      return `
        <div class="profile-item-row">
          <button class="pill ${STATE.currentProfile === name ? 'active' : ''}" onclick="Core.switchProfile('${name}')" style="justify-content: flex-start; flex: 1;">
            <span class="material-icons">${cfg.icon}</span>
            <span>${name} Profile</span>
          </button>
          <button class="startup-toggle ${isStartup ? 'active' : ''}" onclick="PageTools.setStartupProfile('${name}')" title="${isStartup ? 'Default Startup Profile' : 'Set as Default Startup Profile'}">
            <span class="material-icons">${isStartup ? 'star' : 'star_border'}</span>
          </button>
        </div>
      `;
    }).join('');

    modal.style.display = 'block';
    document.getElementById('modal-overlay').style.display = 'block';
    STATE.isModalOpen = true;
  },

  updateLogo() {
    const logoContainer = document.querySelector('.logo-container');
    if (!logoContainer) return;

    const icon = PROFILES[STATE.currentProfile].icon;
    const logoEl = logoContainer.querySelector('.app-logo');

    // Replace SVG with Material Icon for Private/Personal or update Default
    if (STATE.currentProfile === 'Default') {
      // Keep original SVG but ensure it's visible
      if (logoEl && logoEl.tagName === 'SPAN') {
        logoContainer.innerHTML = `
          <svg class="app-logo" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="4"></circle>
            <line x1="4.93" y1="4.93" x2="9.17" y2="9.17"></line>
            <line x1="14.83" y1="14.83" x2="19.07" y2="19.07"></line>
            <line x1="14.83" y1="9.17" x2="19.07" y2="4.93"></line>
            <line x1="4.93" y1="19.07" x2="9.17" y2="14.83"></line>
          </svg>
          <h1 class="page-title">URL Hub</h1>
          <nav id="breadcrumb-nav" class="breadcrumb-nav"></nav>
        `;
        // Need to re-render breadcrumb as we replaced innerHTML
        this.renderBreadcrumb();
      }
    } else {
      logoContainer.innerHTML = `
        ${Utils.renderIcon(icon, 'app-logo')}
        <h1 class="page-title">URL Hub</h1>
        <nav id="breadcrumb-nav" class="breadcrumb-nav"></nav>
      `;
      // Apply style to the span logo
      const newLogo = logoContainer.querySelector('.app-logo');
      if (newLogo && newLogo.tagName === 'SPAN') {
        newLogo.style.fontSize = '40px';
        newLogo.style.color = 'var(--primary)';
        newLogo.style.filter = 'drop-shadow(0 0 8px var(--primary-glow))';
      }
      this.renderBreadcrumb();
    }
  },

  initBackToTop() {
    const btn = document.getElementById('back-to-top');
    const container = document.getElementById('content');

    container.addEventListener('scroll', () => {
      if (container.scrollTop > 300) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    });

    btn.addEventListener('click', () => {
      container.scrollTo({ top: 0, behavior: 'smooth' });
    });
  },

  setupTooltips() {
    const tooltip = document.createElement('div');
    tooltip.className = 'global-tooltip';
    document.body.appendChild(tooltip);
    let activeTarget = null;

    const restoreTitle = (el) => {
      if (el && el.hasAttribute('data-title')) {
        el.setAttribute('title', el.getAttribute('data-title'));
        el.removeAttribute('data-title');
      }
    };

    document.addEventListener('mouseover', (e) => {
      const target = e.target.closest('[title]');
      if (target && !target.classList.contains('fab-item')) {
        if (activeTarget && activeTarget !== target) {
          restoreTitle(activeTarget);
        }

        activeTarget = target;
        const text = target.getAttribute('title');
        target.setAttribute('data-title', text);
        target.removeAttribute('title');

        tooltip.textContent = text;
        tooltip.style.display = 'block';

        const rect = target.getBoundingClientRect();
        let top = rect.top - tooltip.offsetHeight - 8;
        let left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2);

        // Boundary checks
        if (top < 8) top = rect.bottom + 8;
        if (left < 8) left = 8;
        if (left + tooltip.offsetWidth > window.innerWidth - 8) left = window.innerWidth - tooltip.offsetWidth - 8;

        tooltip.style.top = top + 'px';
        tooltip.style.left = left + 'px';
      }
    });

    document.addEventListener('mouseout', (e) => {
      const target = e.target.closest('[data-title]');
      if (target && activeTarget === target) {
        restoreTitle(target);
        activeTarget = null;
        tooltip.style.display = 'none';
      }
    });

    window.addEventListener('scroll', () => {
      tooltip.style.display = 'none';
    }, true);
  },



  renderBreadcrumb() {
    const nav = document.getElementById('breadcrumb-nav');
    const mainNav = document.getElementById('main-category-nav');
    const stats = Core.getStats();

    const definedCats = Object.keys(CAT_ICONS).filter(c => c !== 'All' && c !== 'Pinned');
    const existingCats = Object.keys(stats);
    const allCats = [...new Set([...definedCats, ...existingCats])].sort((a, b) => a.localeCompare(b));

    const activeIcon = CAT_ICONS[STATE.activeCategory] || 'folder';
    let html = `
      <div style="position:relative">
         <span class="breadcrumb-active breadcrumb-item" onclick="UI.toggleDropdown(event)">
            ${Utils.renderIcon(activeIcon)} ${STATE.activeCategory} <span class="material-icons" style="font-size:1.2rem;opacity:0.6">expand_more</span>
         </span>

         <div class="category-dropdown ${STATE.isDropdownOpen ? 'active' : ''}">
             <div class="pill ${STATE.activeCategory === 'All' ? 'active' : ''}" onclick="UI.setCategory('All')" aria-label="Show All Tools">
                ${Utils.renderIcon('home')}
                <span>All Tools</span>
                ${STATE.showStats ? `<span class="count">${STATE.links.length}</span>` : ''}
             </div>
             <div class="pill ${STATE.activeCategory === 'Pinned' ? 'active' : ''}" onclick="UI.setCategory('Pinned')" aria-label="Show Pinned Tools">
                ${Utils.renderIcon('push_pin')}
                <span>Pinned</span>
                ${STATE.showStats ? `<span class="count">${STATE.pinnedIds.length}</span>` : ''}
             </div>
             ${allCats.map(cat => {
      const count = stats[cat] || 0;
      const icon = CAT_ICONS[cat] || 'folder';
      return `
                 <div class="pill ${STATE.activeCategory === cat ? 'active' : ''}" onclick="UI.setCategory('${cat}')" aria-label="Category: ${cat}">
                    ${Utils.renderIcon(icon)}
                    <span>${cat}</span>
                    ${STATE.showStats ? `<span class="count">${count}</span>` : ''}
                 </div>`;
    }).join('')}
         </div>
      </div>
    `;
    if (nav) nav.innerHTML = html;

    if (mainNav) {
      let mainHtml = `
        <div class="pill ${STATE.activeCategory === 'All' ? 'active' : ''}" onclick="UI.setCategory('All')" aria-label="Show All Tools">
          ${Utils.renderIcon('home')} <span>All</span>
        </div>
        <div class="pill ${STATE.activeCategory === 'Pinned' ? 'active' : ''}" onclick="UI.setCategory('Pinned')" aria-label="Show Pinned Tools">
          ${Utils.renderIcon('push_pin')} <span>Pinned</span>
        </div>
        ${allCats.map(cat => {
        const icon = CAT_ICONS[cat] || 'folder';
        return `
            <div class="pill ${STATE.activeCategory === cat ? 'active' : ''}" onclick="UI.setCategory('${cat}')" aria-label="Category: ${cat}">
              ${Utils.renderIcon(icon)} <span>${cat}</span>
            </div>
          `;
      }).join('')}
      `;
      mainNav.innerHTML = mainHtml;
    }
  },

  toggleDropdown(e) {
    e.stopPropagation();
    STATE.isDropdownOpen = !STATE.isDropdownOpen;
    this.renderBreadcrumb();
  },

  setCategory(cat) {
    STATE.activeCategory = cat;
    STATE.isDropdownOpen = false;
    this.renderBreadcrumb();
    this.render();

    // Scroll to top of content container
    const container = document.getElementById('content');
    if (container) container.scrollTop = 0;
  },

  highlightText(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  },

  render() {
    const container = document.getElementById('content');
    if (!container) return;

    // Ensure we have primary colors cached
    if (!STATE.primaryColor) {
      STATE.primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
      STATE.encodedColor = encodeURIComponent(STATE.primaryColor);
    }

    // Filter Logic
    let filtered = STATE.links.filter(l => {
      let matchesSearch = !STATE.searchQuery;
      let matchesCat = false;

      if (STATE.searchQuery) {
        if (STATE.searchQuery.startsWith('cat:')) {
          const targetCat = STATE.searchQuery.replace('cat:', '').trim().toLowerCase();
          matchesSearch = l.category.toLowerCase() === targetCat;
          matchesCat = true; // category match is implied by the search prefix
        } else {
          matchesSearch = l.title.toLowerCase().includes(STATE.searchQuery) ||
            l.category.toLowerCase().includes(STATE.searchQuery) ||
            (l.urls || [l.url]).some(u => u.toLowerCase().includes(STATE.searchQuery));
          matchesCat = true; // Global search overrides active category
        }
      } else {
        if (STATE.activeCategory === 'All') matchesCat = true;
        else if (STATE.activeCategory === 'Pinned') matchesCat = STATE.pinnedIds.includes(l.id);
        else matchesCat = l.category === STATE.activeCategory;
      }

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

    const fragment = document.createDocumentFragment();

    cats.forEach(cat => {
      const section = document.createElement('div');
      section.className = 'category-section';

      // Header
      const header = document.createElement('div');
      header.className = 'category-header';
      const catIcon = CAT_ICONS[cat] || 'folder';
      header.innerHTML = `
        <div class="category-title">
          ${Utils.renderIcon(catIcon)}
          ${cat}
          ${STATE.showStats ? `<span class="count">${grouped[cat].length}</span>` : ''}
        </div>
        <span class="material-icons expand-icon">expand_more</span>
      `;
      header.onclick = () => section.classList.toggle('collapsed');

      // Grid
      const grid = document.createElement('div');
      grid.className = 'category-grid';

      grouped[cat].forEach((link, index) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.style.setProperty('--delay', index);

        // Long Press Logic
        let pressTimer;
        const startPress = (e) => {
          // Only for multi-URL links
          const urls = link.urls || [link.url];
          if (urls.length <= 1) return;

          pressTimer = setTimeout(() => {
            // Flag the card to ignore the next click
            card.setAttribute('data-long-press', 'true');
            UI.openUrlSelectionModal(link);
          }, 500); // 500ms long press
        };

        const cancelPress = () => {
          clearTimeout(pressTimer);
        };

        // Touch events
        card.addEventListener('touchstart', startPress, { passive: true });
        card.addEventListener('touchend', cancelPress);
        card.addEventListener('touchmove', cancelPress);

        // Mouse events
        card.addEventListener('mousedown', (e) => {
          if (e.button === 0) startPress(e);
        });
        card.addEventListener('mouseup', cancelPress);
        card.addEventListener('mouseleave', cancelPress);

        // Custom click handler for fallback support
        card.onclick = (e) => {
          // Don't trigger if clicking action buttons
          if (e.target.closest('.card-actions')) return;

          // Ignore if long press triggered
          if (card.getAttribute('data-long-press') === 'true') {
            card.removeAttribute('data-long-press');
            return;
          }

          e.preventDefault();
          const urls = link.urls || [link.url];
          Utils.tryUrlWithFallback(urls, link.title);
        };
        card.style.cursor = 'pointer';

        // Icon Logic:
        // 1. User defined Icon (if emoji or URL)
        // 2. Google Favicon
        // 3. Category Fallback Emoji

        let imgHtml = '';
        if (!STATE.hideIcons) {
          // Check if user icon is an emoji (simple check: short and no 'http')
          const userIcon = link.icon || "";
          const isEmoji = userIcon && !userIcon.includes('/') && userIcon.length < 5;

          if (isEmoji) {
            // User provided an emoji
            imgHtml = `<div class="card-icon" style="display:grid;place-items:center;font-size:24px;background:var(--bg)">${userIcon}</div>`;
          } else {
            // URL (User provided or Auto Favicon)
            const hostname = Utils.getHostname(link.url);
            const src = userIcon || `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
            const fallback = CAT_ICONS[cat] || "link";
            const fallbackSvg = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='${STATE.encodedColor}'><text y='.9em' font-size='80' font-family='Material Icons'>${fallback}</text></svg>`;

            // Optional Icon Logic
            const optionalIcon = link.optional_icon ? `'${link.optional_icon}'` : 'null';

            imgHtml = `<img src="${src}" class="card-icon" loading="lazy" onerror="
                if (this.getAttribute('data-tried-optional') !== 'true' && ${optionalIcon}) {
                    this.setAttribute('data-tried-optional', 'true');
                    this.src = ${optionalIcon};
                } else if (this.getAttribute('data-tried-ddg') !== 'true') {
                    this.setAttribute('data-tried-ddg', 'true');
                    this.src = 'https://icons.duckduckgo.com/ip3/${hostname}.ico';
                } else {
                    this.src='${fallbackSvg}';
                    this.onerror=null;
                }
            ">`;
          }
        }

        // Check if multiple URLs exist
        const urls = link.urls || [link.url];
        const hasMultipleUrls = urls.length > 1;
        const fallbackBadge = hasMultipleUrls ? `<span class="fallback-badge" title="${urls.length} URLs available: ${urls.join(', ')}">${urls.length} URLs</span>` : '';

        const isPinned = STATE.pinnedIds.includes(link.id);
        const urlHtml = STATE.hideUrls ? '' : `<div class="card-url">${Utils.getHostname(link.url)}${fallbackBadge}</div>`;

        card.innerHTML = `
          <div class="card-header">
            ${imgHtml}
            <div class="card-title">${this.highlightText(link.title, STATE.searchQuery)}</div>
          </div>
          ${urlHtml}

          <div class="card-actions" onclick="event.stopPropagation()">
             <button class="pin-btn ${isPinned ? 'active' : ''}" onclick="UI.togglePin('${link.id}', event)" title="${isPinned ? 'Unpin' : 'Pin to Top'}">
               <span class="material-icons" style="font-size:1.2rem">${isPinned ? 'push_pin' : 'push_pin'}</span>
             </button>
             <button onclick="UI.shareLink('${link.id}')" title="Share Tool">
               <span class="material-icons" style="font-size:1.2rem">share</span>
             </button>
             <button onclick="Utils.copyToClipboard('${link.url}', this)" title="Copy URL">
               <span class="material-icons" style="font-size:1.2rem">content_copy</span>
             </button>
             <button onclick="UI.openEdit('${link.id}')" title="Edit">
               <span class="material-icons" style="font-size:1.2rem">edit</span>
             </button>
             <button class="btn-delete" onclick="Core.deleteLink('${link.id}')" title="Delete">
               <span class="material-icons" style="font-size:1.2rem">delete</span>
             </button>
          </div>
        `;
        grid.appendChild(card);
      });

      section.appendChild(header);
      section.appendChild(grid);
      fragment.appendChild(section);
    });

    container.innerHTML = '';
    container.appendChild(fragment);
  },

  // Modal Handling
  openModal(id, tabId = 'general') {
    const modal = document.getElementById(id);
    if (!modal) return;

    modal.style.display = 'block';
    document.getElementById('modal-overlay').style.display = 'block';
    STATE.isModalOpen = true;

    if (id === 'modal-settings') {
      PageTools.updateSettingsUI();
      this.switchTab(tabId);
    }

    // Populate Datalist for categories
    const dl = document.getElementById('category-list');
    if (dl) {
      dl.innerHTML = Object.keys(Core.getStats()).map(c => `<option value="${c}">`).join('');
    }
  },

  switchTab(tabId) {
    // Hide all tab panes
    document.querySelectorAll('.tab-pane').forEach(pane => {
      pane.style.display = 'none';
    });

    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });

    // Show selected tab pane
    const activePane = document.getElementById(`tab-${tabId}`);
    if (activePane) {
      activePane.style.display = 'block';
    }

    // Add active class to selected tab button
    const activeBtn = document.querySelector(`.tab-btn[onclick*="${tabId}"]`);
    if (activeBtn) {
      activeBtn.classList.add('active');
    }

    // Handle modal sizing
    const settingsModal = document.getElementById('modal-settings');
    if (settingsModal) {
      if (tabId === 'about') {
        settingsModal.classList.add('modal-large');
      } else {
        settingsModal.classList.remove('modal-large');
      }
    }

    // Special logic for About tab
    if (tabId === 'about') {
      this.loadAboutContent();
    }
  },

  async loadAboutContent() {
    const content = document.getElementById('about-content');
    if (!content || content.dataset.loaded === 'true') return;

    try {
      const response = await fetch('README.md');
      if (response.ok) {
        const markdown = await response.text();
        content.innerHTML = this.markdownToHTML(markdown);
        content.dataset.loaded = 'true';
      } else {
        content.innerHTML = '<p>Unable to load README content.</p>';
      }
    } catch (error) {
      console.error('Error loading README:', error);
      content.innerHTML = '<p>Error loading README content.</p>';
    }
  },

  openUrlSelectionModal(link) {
    const modal = document.getElementById('modal-url-selection');
    const list = document.getElementById('url-list');
    const overlay = document.getElementById('modal-overlay');
    const copyAllBtn = document.getElementById('btn-copy-all');

    STATE.currentLink = link;

    // Populate List
    const urls = link.urls || [link.url];
    if (urls.length > 1) {
      copyAllBtn.style.display = 'block';
    } else {
      copyAllBtn.style.display = 'none';
    }
    list.innerHTML = urls.map(url => `
      <a href="${url}" target="_blank" class="url-btn" onclick="UI.closeModal()">
        <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;margin-right:8px;">${url}</span>
        <span class="url-btn-icon">🔗</span>
      </a>
    `).join('');

    modal.style.display = 'block';
    overlay.style.display = 'block';
    STATE.isModalOpen = true;
  },

  closeModal() {
    document.querySelectorAll('.modal').forEach(m => m.style.display = 'none');
    document.getElementById('modal-overlay').style.display = 'none';
    STATE.isModalOpen = false;
    STATE.currentLink = null;
    const form = document.getElementById('tool-form');
    if (form) form.reset();
    const editId = document.getElementById('edit-id');
    if (editId) editId.value = '';
    const modalTitle = document.getElementById('modal-title');
    if (modalTitle) modalTitle.textContent = 'Add Tool';
    const tabLabel = document.getElementById('tab-add-label');
    if (tabLabel) tabLabel.textContent = 'Add Tool';

    // Clear alternative URLs
    const altContainer = document.getElementById('alternative-urls-container');
    if (altContainer) altContainer.innerHTML = '';
  },

  togglePin(id, e) {
    if (e) e.stopPropagation();
    const index = STATE.pinnedIds.indexOf(id);
    if (index > -1) {
      STATE.pinnedIds.splice(index, 1);
    } else {
      STATE.pinnedIds.push(id);
    }
    Storage.setJson('pinned_v1', STATE.pinnedIds);
    this.render();
    this.renderBreadcrumb();
  },

  async shareLink(id) {
    const link = STATE.links.find(l => l.id === id);
    if (!link) return;

    const shareData = {
      title: link.title,
      text: `Check out ${link.title} on URL Hub!`,
      url: link.url
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback to copy link
        await navigator.clipboard.writeText(`${link.title}: ${link.url}`);
        alert('Link details copied to clipboard!');
      }
    } catch (err) {
      console.error('Error sharing:', err);
    }
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
    const tabLabel = document.getElementById('tab-add-label');
    if (tabLabel) tabLabel.textContent = 'Edit Tool';
    this.openModal('modal-settings', 'add');
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

    const originalLink = id ? STATE.links.find(l => l.id === id) : null;

    const data = {
      title: document.getElementById('tool-title').value.trim(),
      url: primaryUrl,
      urls: urls, // Store all URLs
      icon: document.getElementById('tool-icon').value.trim(),
      category: document.getElementById('tool-category').value.trim() || 'Others',
      optional_icon: originalLink ? (originalLink.optional_icon || "") : ""
    };

    if (id) {
      Core.updateLink(id, data);
    } else {
      Core.addLink(data);
    }
    this.closeModal();
    this.renderBreadcrumb(); // Update counts
  },


  // Add URL field for alternative URLs
  addUrlField(value = '') {
    const container = document.getElementById('alternative-urls-container');
    const wrapper = document.createElement('div');
    wrapper.className = 'url-field-wrapper';
    wrapper.innerHTML = `
      <input type="url" class="alt-url-input" placeholder="https://alternative-url.com" value="${value}">
      <button type="button" class="btn-remove" onclick="this.parentElement.remove()">
        <span class="material-icons">close</span>
      </button>
    `;
    container.appendChild(wrapper);
  },

  // About Modal Functions
  async openAboutModal() {
    this.openModal('modal-settings', 'about');
  },

  closeAboutModal() {
    this.closeModal();
  },

  // Simple Markdown to HTML converter
  markdownToHTML(markdown) {
    const lines = markdown.split('\n');
    let html = '';
    let currentList = null;
    let inCodeBlock = false;
    let codeContent = '';
    let paragraphBuffer = [];

    const escapeHTML = (str) => {
      return str.replace(/[&<>"']/g, m => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
      })[m]);
    };

    const sanitizeUrl = (url) => {
      // Remove whitespace and handle potential entity bypasses
      const decoded = url.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/\s/g, '').toLowerCase();
      if (decoded.startsWith('javascript:') || decoded.startsWith('data:') || decoded.startsWith('vbscript:')) {
        return '#';
      }
      return url;
    };

    const parseInline = (text) => {
      let escaped = escapeHTML(text);

      // Support bold: **text**
      escaped = escaped.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

      // Support images: ![alt](url)
      escaped = escaped.replace(/!\[(.*?)\]\((.*?)\)/g, (match, alt, url) => {
        return `<img src="${sanitizeUrl(url)}" alt="${alt}">`;
      });

      // Support links: [text](url)
      escaped = escaped.replace(/\[(.*?)\]\((.*?)\)/g, (match, label, url) => {
        return `<a href="${sanitizeUrl(url)}" target="_blank" rel="noopener noreferrer">${label}</a>`;
      });

      // Support inline code: `code`
      escaped = escaped.replace(/`([^`]+)`/g, '<code>$1</code>');

      return escaped;
    };

    const flushParagraph = () => {
      if (paragraphBuffer.length > 0) {
        const content = parseInline(paragraphBuffer.join(' '));
        if (content.startsWith('<img')) {
          html += content + '\n';
        } else {
          html += `<p>${content}</p>\n`;
        }
        paragraphBuffer = [];
      }
    };

    const flushList = () => {
      if (currentList) {
        html += `</${currentList}>\n`;
        currentList = null;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // Code blocks
      if (trimmedLine.startsWith('```')) {
        flushParagraph();
        flushList();
        if (inCodeBlock) {
          html += `<pre><code>${escapeHTML(codeContent.trim())}</code></pre>\n`;
          codeContent = '';
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
        }
        continue;
      }

      if (inCodeBlock) {
        codeContent += line + '\n';
        continue;
      }

      // Headings
      const hMatch = trimmedLine.match(/^(#{1,3})\s+(.*)$/);
      if (hMatch) {
        flushParagraph();
        flushList();
        const level = hMatch[1].length;
        html += `<h${level}>${parseInline(hMatch[2])}</h${level}>\n`;
        continue;
      }

      // Lists
      const ulMatch = line.match(/^(\s*)[\-\*]\s+(.*)$/);
      const olMatch = line.match(/^(\s*)\d+\.\s+(.*)$/);
      if (ulMatch || olMatch) {
        flushParagraph();
        const listType = ulMatch ? 'ul' : 'ol';
        const content = ulMatch ? ulMatch[2] : olMatch[2];

        if (currentList && currentList !== listType) {
          flushList();
        }
        if (!currentList) {
          html += `<${listType}>\n`;
          currentList = listType;
        }
        html += `  <li>${parseInline(content)}</li>\n`;
        continue;
      }

      // Blank lines
      if (!trimmedLine) {
        flushParagraph();
        flushList();
        continue;
      }

      // Paragraph content
      flushList();
      paragraphBuffer.push(trimmedLine);
    }

    flushParagraph();
    flushList();
    if (inCodeBlock && codeContent) {
      html += `<pre><code>${escapeHTML(codeContent.trim())}</code></pre>\n`;
    }

    return html;
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
    const profile = STATE.currentProfile;
    const filename = PROFILES[profile].links;
    if (confirm(`This will reset your ${profile} dashboard to the default list from ${filename}. Any local changes will be lost. Continue?`)) {
      Storage.setJson('links_v1', null);
      Storage.set('initialized', 'false');
      location.reload();
    }
  }
};

const PageTools = {
  init() {
    this.applyTheme();
    this.applyColor();
    this.applyCompact();
    this.applyGlass();
    this.applyAurora();
  },

  toggleDarkMode() {
    STATE.isDarkMode = !STATE.isDarkMode;
    Storage.set('theme', STATE.isDarkMode ? 'dark' : 'light');
    this.applyTheme();
    this.updateSettingsUI();
  },

  setColor(color) {
    STATE.accentColor = color;
    Storage.set('accent_color', color);
    this.applyColor();
    this.updateSettingsUI();
  },

  applyTheme() {
    document.documentElement.setAttribute('data-theme', STATE.isDarkMode ? 'dark' : 'light');
  },

  applyColor() {
    document.documentElement.setAttribute('data-color', STATE.accentColor);
    // Update theme-color meta tag
    STATE.primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
    STATE.encodedColor = encodeURIComponent(STATE.primaryColor);
    if (STATE.primaryColor) {
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) metaTheme.setAttribute('content', STATE.primaryColor);
    }
  },

  toggleCompact() {
    STATE.isCompact = !STATE.isCompact;
    Storage.set('compact', STATE.isCompact);
    this.applyCompact();
    this.updateSettingsUI();
    UI.render();
  },

  applyCompact() {
    const container = document.getElementById('content');
    if (container) {
      if (STATE.isCompact) container.classList.add('compact');
      else container.classList.remove('compact');
    }
  },

  toggleHideUrls() {
    STATE.hideUrls = !STATE.hideUrls;
    Storage.set('hide_urls', STATE.hideUrls);
    this.updateSettingsUI();
    UI.render();
  },

  toggleHideIcons() {
    STATE.hideIcons = !STATE.hideIcons;
    Storage.set('hide_icons', STATE.hideIcons);
    this.updateSettingsUI();
    UI.render();
  },

  toggleGlass() {
    STATE.disableGlass = !STATE.disableGlass;
    Storage.set('disable_glass', STATE.disableGlass);
    this.applyGlass();
    this.updateSettingsUI();
  },

  applyGlass() {
    if (STATE.disableGlass) document.body.classList.add('no-glass');
    else document.body.classList.remove('no-glass');
  },

  toggleShowStats() {
    STATE.showStats = !STATE.showStats;
    Storage.set('show_stats', STATE.showStats);
    this.updateSettingsUI();
    UI.renderBreadcrumb();
    UI.render();
  },

  toggleAurora() {
    STATE.enableAurora = !STATE.enableAurora;
    Storage.set('enable_aurora', STATE.enableAurora);
    this.applyAurora();
    this.updateSettingsUI();
  },

  applyAurora() {
    if (STATE.enableAurora) document.body.classList.remove('no-aurora');
    else document.body.classList.add('no-aurora');
  },

  setStartupProfile(profileName) {
    localStorage.setItem('hub_startup_profile', profileName);
    UI.openProfileModal(); // Refresh the profile modal UI
  },

  updateSettingsUI() {
    const themeBtn = document.getElementById('settings-theme-btn');
    const themeIcon = document.getElementById('settings-theme-icon');
    const themeText = document.getElementById('settings-theme-text');

    if (themeBtn) {
      if (STATE.isDarkMode) {
        themeBtn.classList.add('active');
        themeIcon.textContent = 'light_mode';
        themeText.textContent = 'Light Mode';
      } else {
        themeBtn.classList.remove('active');
        themeIcon.textContent = 'dark_mode';
        themeText.textContent = 'Dark Mode';
      }
    }

    // Update other toggles
    const compactBtn = document.getElementById('settings-compact-btn');
    if (compactBtn) {
      if (STATE.isCompact) compactBtn.classList.add('active');
      else compactBtn.classList.remove('active');
    }

    const hideUrlsBtn = document.getElementById('settings-hide-urls-btn');
    if (hideUrlsBtn) {
      if (STATE.hideUrls) hideUrlsBtn.classList.add('active');
      else hideUrlsBtn.classList.remove('active');
    }

    const hideIconsBtn = document.getElementById('settings-hide-icons-btn');
    if (hideIconsBtn) {
      if (STATE.hideIcons) hideIconsBtn.classList.add('active');
      else hideIconsBtn.classList.remove('active');
    }

    const glassBtn = document.getElementById('settings-glass-btn');
    if (glassBtn) {
      // Toggle button text/state shows if glass is DISABLED
      if (STATE.disableGlass) glassBtn.classList.add('active');
      else glassBtn.classList.remove('active');
    }

    const statsBtn = document.getElementById('settings-stats-btn');
    if (statsBtn) {
      if (STATE.showStats) statsBtn.classList.add('active');
      else statsBtn.classList.remove('active');
    }

    const auroraBtn = document.getElementById('settings-aurora-btn');
    if (auroraBtn) {
      if (STATE.enableAurora) auroraBtn.classList.add('active');
      else auroraBtn.classList.remove('active');
    }

    // Update color pills
    document.querySelectorAll('.color-pill').forEach(pill => {
      if (pill.getAttribute('data-color') === STATE.accentColor) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

  }
};

// Initial Start
Core.init();
