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
  currentTab: 'toolbox', // 'toolbox', 'bookmarks', or 'projects'
  links: [],
  pinnedIds: Storage.getJson('pinned_v1', []),
  activeCategory: 'All', // 'All' for bookmarks
  activeToolboxCategory: 'All', // 'All' for toolbox
  activeProjectCategory: 'All',
  searchQuery: '',
  isDarkMode: Storage.get('theme') === 'dark' || (Storage.get('theme') === null && window.matchMedia('(prefers-color-scheme: dark)').matches),
  isCompact: Storage.get('compact') === 'true',
  hideUrls: Storage.get('hide_urls') === 'true',
  hideIcons: Storage.get('hide_icons') === 'true',
  disableGlass: Storage.get('disable_glass') === 'true',
  showStats: Storage.get('show_stats') !== 'false',
  enableAurora: Storage.get('enable_aurora') !== 'false',
  reducedMotion: Storage.get('reduced_motion') === 'true',
  autoFocusSearch: Storage.get('auto_focus_search') === 'true',
  openInNewTab: Storage.get('open_newtab') !== 'false',
  confirmDelete: Storage.get('confirm_delete') !== 'false',
  groupToolbox: Storage.get('group_toolbox') !== 'false',
  openProjectsInternally: Storage.get('open_projects_internally') === 'true',
  accentColor: Storage.get('accent_color') || 'indigo',
  isDropdownOpen: false,
  isModalOpen: false,
  currentLink: null,
  activeProjectId: null,
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
    const target = STATE.openInNewTab ? '_blank' : '_self';
    const win = window.open(primaryUrl, target, 'noopener,noreferrer');

    // If there are fallback URLs and window didn't open, try fallbacks
    if (urls.length > 1 && (!win || win.closed || typeof win.closed === 'undefined')) {
      // Try next URL
      let tried = 1;
      const tryNext = () => {
        if (tried < urls.length) {
          const fallbackUrl = urls[tried];
          console.log(`Trying fallback URL ${tried} for ${linkTitle}: ${fallbackUrl}`);
          const target = STATE.openInNewTab ? '_blank' : '_self';
          const fallbackWin = window.open(fallbackUrl, target, 'noopener,noreferrer');
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
          category: category,
          isInternal: item.isInternal || false,
          toolId: item.toolId || null
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
    if (!STATE.confirmDelete || confirm("Are you sure you want to delete this bookmark?")) {
      STATE.links = STATE.links.filter(l => l.id !== id);
      STATE.pinnedIds = STATE.pinnedIds.filter(pid => pid !== id);
      Storage.setJson('pinned_v1', STATE.pinnedIds);
      this.saveData();
    }
  },

  getStats() {
    const stats = {};
    STATE.links.forEach(l => {
      if (l.category === 'Toolbox' || l.isInternal) return;
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

  setView(view, toolId = null) {
    // Close dropdowns on view change
    STATE.isDropdownOpen = false;

    // Handle main tab switches
    if (view === 'bookmarks' || view === 'toolbox' || view === 'projects') {
      STATE.currentTab = view;
      STATE.currentView = view; // For backward compatibility if needed
      this.updateTabUI();
    } else if (view === 'tool') {
      STATE.currentTab = 'toolbox';
      STATE.currentView = view;
      this.updateTabUI();
    } else if (view === 'project') {
      STATE.currentTab = 'projects';
      STATE.currentView = view;
      this.updateTabUI();
    } else {
      STATE.currentView = view;
    }

    if (view === 'tool') STATE.activeToolId = toolId;
    if (view === 'project') STATE.activeProjectId = toolId;
    this.render();
    this.renderBreadcrumb();

    // Auto-focus search if enabled
    if (STATE.autoFocusSearch && (view === 'bookmarks' || view === 'toolbox' || view === 'projects')) {
        // Only auto-focus on desktop to avoid keyboard popping up on mobile
        if (window.innerWidth > 768) {
            setTimeout(() => {
                const search = document.getElementById('search');
                if (search) search.focus();
            }, 100);
        }
    }

    // Hide/Show main nav based on view
    const mainNav = document.getElementById('main-category-nav');
    if (mainNav) {
      // mainNav is for bookmarks horizontal pills, only show in bookmarks view
      // But we want it visible in toolbox as well if not inside a specific tool
      const isHubView = (STATE.currentTab === 'bookmarks' && STATE.currentView === 'bookmarks') ||
                        (STATE.currentTab === 'toolbox' && STATE.currentView === 'toolbox') ||
                        (STATE.currentTab === 'projects');
      mainNav.style.display = isHubView ? 'flex' : 'none';
    }
  },

  updateTabUI() {
    const searchInput = document.getElementById('search');
    if (searchInput) {
      if (STATE.currentTab === 'bookmarks') {
        searchInput.placeholder = "Search Bookmarks... [/]";
      } else if (STATE.currentTab === 'projects') {
        searchInput.placeholder = "Search Projects... [/]";
      } else {
        searchInput.placeholder = "Search Toolbox... [/]";
      }
    }

    const tabs = ['bookmarks', 'toolbox', 'projects'];
    tabs.forEach(tab => {
      const el = document.getElementById(`tab-${tab}`);
      if (el) {
        if (STATE.currentTab === tab) {
          el.classList.add('active');
        } else {
          el.classList.remove('active');
        }
      }
    });
  },

  init() {
    this.updateTabUI();
    this.renderBreadcrumb();
    this.render();
    this.updateLogo();

    if (this._eventsInitialized) return;
    this._eventsInitialized = true;

    // Logo click listener (Back to Bookmarks)
    const logoContainer = document.querySelector('.logo-container');
    if (logoContainer) {
      logoContainer.addEventListener('click', (e) => {
        // Prevent triggering during long press
        if (e.detail === 1) {
           this.setView('bookmarks');
        }
      });
    }

    // Tab Listeners
    const toolboxTab = document.getElementById('tab-toolbox');
    if (toolboxTab) {
      toolboxTab.addEventListener('click', () => this.setView('toolbox'));
    }

    const bookmarksTab = document.getElementById('tab-bookmarks');
    if (bookmarksTab) {
      bookmarksTab.addEventListener('click', () => this.setView('bookmarks'));
    }

    const projectsTab = document.getElementById('tab-projects');
    if (projectsTab) {
      projectsTab.addEventListener('click', () => this.setView('projects'));
    }

    // Event Listeners
    // Search Toggle
    const searchContainer = document.getElementById('search-container');
    const searchInput = document.getElementById('search');

    document.getElementById('search-toggle').addEventListener('click', (e) => {
      e.stopPropagation();

      const isActive = searchContainer.classList.toggle('active');
      document.body.classList.toggle('search-active', isActive);

      if (isActive) {
        // Close dropdown if opening search
        if (STATE.isDropdownOpen) {
          STATE.isDropdownOpen = false;
          this.renderBreadcrumb();
        }
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
      if (!e.target.closest('.breadcrumb-nav') && !e.target.closest('.category-dropdown')) {
        if (STATE.isDropdownOpen) {
          STATE.isDropdownOpen = false;
          this.renderBreadcrumb();
        }
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
        if (STATE.isDropdownOpen) {
          STATE.isDropdownOpen = false;
          this.renderBreadcrumb();
        }
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
    const bookmarksTab = document.getElementById('tab-bookmarks');
    if (!bookmarksTab) return;

    let pressTimer;
    let startX, startY;

    const startPress = (e) => {
      // Restrict to left click for mouse events
      if (e.type === 'mousedown' && e.button !== 0) return;

      clearTimeout(pressTimer);

      if (e.type === 'touchstart') {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
      }

      bookmarksTab.classList.add('long-press');

      pressTimer = setTimeout(() => {
        bookmarksTab.classList.remove('long-press');
        this.openProfileModal();
      }, 600);
    };

    const cancelPress = () => {
      clearTimeout(pressTimer);
      bookmarksTab.classList.remove('long-press');
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

    bookmarksTab.addEventListener('mousedown', startPress);
    bookmarksTab.addEventListener('mouseup', cancelPress);
    bookmarksTab.addEventListener('mouseleave', cancelPress);
    bookmarksTab.addEventListener('touchstart', startPress, { passive: true });
    bookmarksTab.addEventListener('touchend', cancelPress);
    bookmarksTab.addEventListener('touchmove', handleMove, { passive: true });
    bookmarksTab.addEventListener('touchcancel', cancelPress);

    // Prevent default context menu on bookmarks tab to allow long press
    bookmarksTab.addEventListener('contextmenu', (e) => {
      e.preventDefault();
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
    // For N Box, we want a consistent logo but maybe profile-aware
    // The user asked for "N Box" name and "new website logo".
    // I already set 'inbox' as a placeholder logo in HTML.

    const logoEl = logoContainer.querySelector('.app-logo');
    if (logoEl) {
      if (STATE.currentProfile === 'Default') {
        logoEl.textContent = 'inbox';
      } else {
        logoEl.textContent = icon;
      }
    }

    const titleEl = logoContainer.querySelector('.page-title');
    if (titleEl) titleEl.textContent = 'N Box';
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

    // Close dropdown on scroll
    container.addEventListener('scroll', () => {
      if (STATE.isDropdownOpen) {
        STATE.isDropdownOpen = false;
        this.renderBreadcrumb();
      }
    }, { passive: true });

    window.addEventListener('resize', () => {
      if (STATE.isDropdownOpen) {
        STATE.isDropdownOpen = false;
        this.renderBreadcrumb();
      }
    }, { passive: true });
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
      if (target && !target.classList.contains('fab-item') && !target.classList.contains('tab-item')) {
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
    this.renderToolboxBreadcrumb();
    this.renderBookmarksBreadcrumb();
    this.renderProjectsBreadcrumb();
  },

  renderBookmarksBreadcrumb() {
    const nav = document.getElementById('bookmarks-breadcrumb');
    if (!nav) return;

    const stats = Core.getStats();
    const totalBookmarks = Object.values(stats).reduce((a, b) => a + b, 0);
    const definedCats = Object.keys(CAT_ICONS).filter(c => c !== 'All' && c !== 'Pinned' && c !== 'Toolbox');
    const existingCats = Object.keys(stats);
    const allCats = [...new Set([...definedCats, ...existingCats])].sort((a, b) => a.localeCompare(b));

    const activeIcon = CAT_ICONS[STATE.activeCategory] || 'folder';
    nav.innerHTML = `
      <div class="breadcrumb-wrapper">
         <span class="breadcrumb-active breadcrumb-item" onclick="UI.toggleDropdown(event, 'bookmarks')">
            ${Utils.renderIcon(activeIcon)} ${STATE.activeCategory} <span class="material-icons" style="font-size:1.2rem;opacity:0.6">expand_more</span>
         </span>
         <div class="category-dropdown ${STATE.isDropdownOpen === 'bookmarks' ? 'active' : ''}">
             <div class="pill ${STATE.activeCategory === 'All' ? 'active' : ''}" onclick="UI.setCategory('All', 'bookmarks')" aria-label="Show All Bookmarks">
                ${Utils.renderIcon('home')}
                <span>All Bookmarks</span>
                ${STATE.showStats ? `<span class="count">${totalBookmarks}</span>` : ''}
             </div>
             <div class="pill ${STATE.activeCategory === 'Pinned' ? 'active' : ''}" onclick="UI.setCategory('Pinned', 'bookmarks')" aria-label="Show Pinned Bookmarks">
                ${Utils.renderIcon('push_pin')}
                <span>Pinned</span>
                ${STATE.showStats ? `<span class="count">${STATE.pinnedIds.length}</span>` : ''}
             </div>
             ${allCats.map(cat => {
               const count = stats[cat] || 0;
               const icon = CAT_ICONS[cat] || 'folder';
               return `
                 <div class="pill ${STATE.activeCategory === cat ? 'active' : ''}" onclick="UI.setCategory('${cat}', 'bookmarks')" aria-label="Category: ${cat}">
                    ${Utils.renderIcon(icon)}
                    <span>${cat}</span>
                    ${STATE.showStats ? `<span class="count">${count}</span>` : ''}
                 </div>`;
             }).join('')}
         </div>
      </div>
    `;

    const mainNav = document.getElementById('main-category-nav');
    if (mainNav) {
      if (STATE.currentTab === 'bookmarks') {
        mainNav.innerHTML = `
          <div class="pill ${STATE.activeCategory === 'All' ? 'active' : ''}" onclick="UI.setCategory('All', 'bookmarks')" aria-label="Show All Bookmarks">
            ${Utils.renderIcon('home')} <span>All</span>
          </div>
          <div class="pill ${STATE.activeCategory === 'Pinned' ? 'active' : ''}" onclick="UI.setCategory('Pinned', 'bookmarks')" aria-label="Show Pinned Bookmarks">
            ${Utils.renderIcon('push_pin')} <span>Pinned</span>
          </div>
          ${allCats.map(cat => {
            const icon = CAT_ICONS[cat] || 'folder';
            return `
              <div class="pill ${STATE.activeCategory === cat ? 'active' : ''}" onclick="UI.setCategory('${cat}', 'bookmarks')" aria-label="Category: ${cat}">
                ${Utils.renderIcon(icon)} <span>${cat}</span>
              </div>
            `;
          }).join('')}
        `;
      } else if (STATE.currentTab === 'toolbox' && typeof TOOLS !== 'undefined') {
        const toolboxCats = [...new Set(TOOLS.map(t => t.category))].sort();
        mainNav.innerHTML = `
          <div class="pill ${STATE.activeToolboxCategory === 'All' ? 'active' : ''}" onclick="UI.setCategory('All', 'toolbox')" aria-label="Show All Tools">
            ${Utils.renderIcon('home')} <span>All</span>
          </div>
          ${toolboxCats.map(cat => {
            const icon = Toolbox.getCategoryIcon(cat);
            return `
              <div class="pill ${STATE.activeToolboxCategory === cat ? 'active' : ''}" onclick="UI.setCategory('${cat}', 'toolbox')" aria-label="Category: ${cat}">
                ${Utils.renderIcon(icon)} <span>${cat}</span>
              </div>
            `;
          }).join('')}
        `;
      } else if (STATE.currentTab === 'projects' && STATE.projects) {
        const projectCats = [...new Set(STATE.projects.map(p => p.category))].sort();
        mainNav.innerHTML = `
          <div class="pill ${STATE.activeProjectCategory === 'All' ? 'active' : ''}" onclick="UI.setCategory('All', 'projects')" aria-label="Show All Projects">
            ${Utils.renderIcon('home')} <span>All</span>
          </div>
          ${projectCats.map(cat => {
            return `
              <div class="pill ${STATE.activeProjectCategory === cat ? 'active' : ''}" onclick="UI.setCategory('${cat}', 'projects')" aria-label="Category: ${cat}">
                ${Utils.renderIcon('folder')} <span>${cat}</span>
              </div>
            `;
          }).join('')}
        `;
      }
    }
  },

  renderProjectsBreadcrumb() {
    const nav = document.getElementById('projects-breadcrumb');
    if (!nav || !STATE.projects) return;

    const stats = {};
    STATE.projects.forEach(p => {
      stats[p.category] = (stats[p.category] || 0) + 1;
    });

    const totalProjects = STATE.projects.length;
    const allCats = [...new Set(STATE.projects.map(p => p.category))].sort();

    nav.innerHTML = `
      <div class="breadcrumb-wrapper">
         <span class="breadcrumb-active breadcrumb-item" onclick="UI.toggleDropdown(event, 'projects')">
            <span class="material-icons">folder</span> ${STATE.activeProjectCategory} <span class="material-icons" style="font-size:1.2rem;opacity:0.6">expand_more</span>
         </span>
         <div class="category-dropdown ${STATE.isDropdownOpen === 'projects' ? 'active' : ''}">
             <div class="pill ${STATE.activeProjectCategory === 'All' ? 'active' : ''}" onclick="UI.setCategory('All', 'projects')" aria-label="Show All Projects">
                ${Utils.renderIcon('home')}
                <span>All Projects</span>
                ${STATE.showStats ? `<span class="count">${totalProjects}</span>` : ''}
             </div>
             ${allCats.map(cat => {
               const count = stats[cat] || 0;
               return `
                 <div class="pill ${STATE.activeProjectCategory === cat ? 'active' : ''}" onclick="UI.setCategory('${cat}', 'projects')" aria-label="Category: ${cat}">
                    ${Utils.renderIcon('folder')}
                    <span>${cat}</span>
                    ${STATE.showStats ? `<span class="count">${count}</span>` : ''}
                 </div>`;
             }).join('')}
         </div>
      </div>
    `;
  },

  renderToolboxBreadcrumb() {
    const nav = document.getElementById('toolbox-breadcrumb');
    if (!nav || typeof Toolbox === 'undefined' || typeof TOOLS === 'undefined') return;

    const toolboxStats = Toolbox.getStats();
    const toolboxCats = [...new Set(TOOLS.map(t => t.category))].sort();
    const activeIcon = Toolbox.getCategoryIcon(STATE.activeToolboxCategory);

    let activeTool = null;
    if (STATE.activeToolId) {
      activeTool = TOOLS.find(t => t.id === STATE.activeToolId);
    }

    nav.innerHTML = `
      <div class="breadcrumb-wrapper" style="display: flex; align-items: center;">
         <span class="breadcrumb-item ${!activeTool ? 'breadcrumb-active' : ''}" onclick="UI.toggleDropdown(event, 'toolbox')">
            ${Utils.renderIcon(activeIcon)} ${STATE.activeToolboxCategory} <span class="material-icons" style="font-size:1.2rem;opacity:0.6">expand_more</span>
         </span>
         <div class="category-dropdown ${STATE.isDropdownOpen === 'toolbox' ? 'active' : ''}">
             <div class="pill ${STATE.activeToolboxCategory === 'All' ? 'active' : ''}" onclick="UI.setCategory('All', 'toolbox')" aria-label="Show All Tools">
                ${Utils.renderIcon('home')}
                <span>All Tools</span>
                ${STATE.showStats ? `<span class="count">${TOOLS.length}</span>` : ''}
             </div>
             ${toolboxCats.map(cat => {
               const icon = Toolbox.getCategoryIcon(cat);
               const count = toolboxStats[cat] || 0;
               return `
                 <div class="pill ${STATE.activeToolboxCategory === cat ? 'active' : ''}" onclick="UI.setCategory('${cat}', 'toolbox')" aria-label="Category: ${cat}">
                    ${Utils.renderIcon(icon)}
                    <span>${cat}</span>
                    ${STATE.showStats ? `<span class="count">${count}</span>` : ''}
                 </div>`;
             }).join('')}
         </div>
         ${activeTool ? `
           <span class="material-icons breadcrumb-separator">chevron_right</span>
           <span class="breadcrumb-active breadcrumb-item">
             ${Utils.renderIcon(activeTool.icon)} ${activeTool.title}
           </span>
         ` : ''}
      </div>
    `;
  },

  toggleDropdown(e, type) {
    e.stopPropagation();
    const wasOpen = STATE.isDropdownOpen;

    // Toggle current or switch to new
    STATE.isDropdownOpen = wasOpen === type ? false : type;

    if (STATE.isDropdownOpen) {
      const trigger = e.currentTarget;
      const rect = trigger.getBoundingClientRect();

      // On mobile we use fixed positioning, so we need the exact top
      document.documentElement.style.setProperty('--dropdown-top', `${Math.round(rect.bottom + 12)}px`);

      // Handle mobile alignment due to containing block issues (backdrop-filter)
      if (window.innerWidth <= 768) {
        const tabGroup = trigger.closest('.tab-group');
        const cbLeft = tabGroup ? tabGroup.getBoundingClientRect().left : 0;
        const targetLeft = window.innerWidth * 0.03; // 3vw
        document.documentElement.style.setProperty('--dropdown-left', `${targetLeft - cbLeft}px`);
      }

      // Accessibility: Focus first active pill or first pill in dropdown
      setTimeout(() => {
        const dropdown = trigger.parentElement.querySelector('.category-dropdown');
        if (dropdown) {
          const firstPill = dropdown.querySelector('.pill.active') || dropdown.querySelector('.pill');
          if (firstPill) firstPill.focus();
        }
      }, 50);
    }

    this.renderBreadcrumb();
  },

  setCategory(cat, type) {
    if (type === 'bookmarks') {
      STATE.activeCategory = cat;
    } else if (type === 'projects') {
      STATE.activeProjectCategory = cat;
    } else {
      STATE.activeToolboxCategory = cat;
      STATE.activeToolId = null; // Clear active tool when changing category
    }
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

    // Dispatch based on tab and view
    if (STATE.currentTab === 'toolbox') {
      if (STATE.activeToolId) {
        if (typeof Toolbox !== 'undefined') Toolbox.renderTool(container, STATE.activeToolId);
      } else {
        if (typeof Toolbox !== 'undefined') Toolbox.renderHome(container);
      }
      return;
    }

    if (STATE.currentTab === 'projects') {
      if (STATE.currentView === 'project' && STATE.activeProjectId) {
        this.renderProjectDetail(container, STATE.activeProjectId);
      } else {
        this.renderProjects(container);
      }
      return;
    }

    // Default to bookmarks tab
    this.renderHub(container);
  },

  renderProjects(container) {
    if (!STATE.projects) {
      STATE.projects = [];
      fetch('data/projects.json')
        .then(res => res.json())
        .then(data => {
          STATE.projects = data;
          if (STATE.currentTab === 'projects') this.render();
        })
        .catch(err => console.error("Error loading projects:", err));

      container.innerHTML = `<div style="text-align:center; padding:3rem; opacity:0.5;">Loading projects...</div>`;
      return;
    }

    const filtered = STATE.projects.filter(p => {
      let matchesSearch = !STATE.searchQuery;
      let matchesCat = false;

      if (STATE.searchQuery) {
        matchesSearch = p.title.toLowerCase().includes(STATE.searchQuery) ||
          p.description.toLowerCase().includes(STATE.searchQuery) ||
          p.category.toLowerCase().includes(STATE.searchQuery);
        matchesCat = true;
      } else {
        if (STATE.activeProjectCategory === 'All') matchesCat = true;
        else matchesCat = p.category === STATE.activeProjectCategory;
      }
      return matchesSearch && matchesCat;
    });

    const grouped = {};
    filtered.forEach(p => {
      (grouped[p.category] ||= []).push(p);
    });

    const cats = Object.keys(grouped).sort();

    const fragment = document.createDocumentFragment();

    const header = document.createElement('div');
    header.className = 'toolbox-page-header';
    header.innerHTML = `
      <h2>My Projects</h2>
      <p>A collection of my recent developments and experiments.</p>
    `;
    fragment.appendChild(header);

    if (cats.length === 0) {
      const empty = document.createElement('div');
      empty.style.textAlign = 'center';
      empty.style.color = '#888';
      empty.style.marginTop = '3rem';
      empty.textContent = 'No projects found';
      fragment.appendChild(empty);
    } else {
      cats.forEach(cat => {
        const section = document.createElement('div');
        section.className = 'category-section';

        const catHeader = document.createElement('div');
        catHeader.className = 'category-header';
        catHeader.innerHTML = `
          <div class="category-title">
            <span class="material-icons">folder</span>
            ${cat}
            ${STATE.showStats ? `<span class="count">${grouped[cat].length}</span>` : ''}
          </div>
          <span class="material-icons expand-icon">expand_more</span>
        `;
        catHeader.onclick = () => section.classList.toggle('collapsed');

        const grid = document.createElement('div');
        grid.className = 'category-grid';

        grouped[cat].forEach((p, idx) => {
          const card = document.createElement('div');
          card.className = 'card';
          card.style.setProperty('--delay', idx);
          card.onclick = () => {
            if (STATE.openProjectsInternally) {
              UI.setView('project', p.id);
            } else {
              window.open(p.url, '_blank');
            }
          };

          card.innerHTML = `
            <div class="card-header">
              <div class="card-icon" style="display:grid;place-items:center;background:var(--bg)">
                <span class="material-icons">${p.icon || 'code'}</span>
              </div>
              <div class="card-title">${UI.highlightText(p.title, STATE.searchQuery)}</div>
            </div>
            <p style="padding: 0 1rem 1rem; font-size: 0.9rem; opacity: 0.7;">${p.description}</p>
          `;
          grid.appendChild(card);
        });

        section.appendChild(catHeader);
        section.appendChild(grid);
        fragment.appendChild(section);
      });
    }

    container.innerHTML = '';
    container.appendChild(fragment);
  },

  renderProjectDetail(container, projectId) {
    const project = STATE.projects.find(p => p.id === projectId);
    if (!project) {
      container.innerHTML = `<div style="text-align:center; padding:3rem; opacity:0.5;">Project not found.</div>`;
      return;
    }

    container.innerHTML = `
      <div class="tool-view-header">
          <button class="icon-btn" onclick="UI.setView('projects')" title="Back to Projects">
              <span class="material-icons">arrow_back</span>
          </button>
          <div style="display: flex; align-items: center; gap: 12px;">
              <span class="material-icons" style="font-size: 2rem; color: var(--primary);">${project.icon || 'rocket_launch'}</span>
              <h2 style="margin: 0; font-size: 1.75rem;">${project.title}</h2>
          </div>
      </div>
      <div class="tool-container-inner" style="height: calc(100% - 100px); max-width: none;">
          <iframe src="${project.url}" style="width: 100%; height: 100%; border: none; border-radius: 16px; background: white; box-shadow: var(--shadow-lg);"></iframe>
      </div>
    `;
  },

  renderHub(container) {
    // Ensure we have primary colors cached
    if (!STATE.primaryColor) {
      STATE.primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
      STATE.encodedColor = encodeURIComponent(STATE.primaryColor);
    }

    // Filter Logic
    let filtered = STATE.links.filter(l => {
      // Exclude Toolbox from Bookmarks Hub
      if (l.category === 'Toolbox' || l.isInternal) return false;

      let matchesSearch = !STATE.searchQuery;
      let matchesCat = false;

      if (STATE.searchQuery) {
        matchesSearch = l.title.toLowerCase().includes(STATE.searchQuery) ||
          l.category.toLowerCase().includes(STATE.searchQuery) ||
          (l.urls || [l.url]).some(u => u.toLowerCase().includes(STATE.searchQuery));
        matchesCat = true; // Global search overrides active category
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

    // Header for Bookmarks Page
    const hubHeader = document.createElement('div');
    hubHeader.className = 'toolbox-page-header';
    hubHeader.innerHTML = `
        <h2>Bookmarks</h2>
        <p>Access your favorite links and resources.</p>
    `;
    fragment.appendChild(hubHeader);

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

          // Internal Toolbox Tool support
          if (link.isInternal && typeof Toolbox !== 'undefined') {
            Toolbox.open(link.toolId);
            return;
          }

          const urls = link.urls || [link.url];
          Utils.tryUrlWithFallback(urls, link.title);
        };
        card.style.cursor = 'pointer';

        // Icon Logic:
        // 1. User defined Icon (if emoji, Material Icon ligature or URL)
        // 2. Google Favicon
        // 3. Category Fallback Emoji

        let imgHtml = '';
        if (!STATE.hideIcons) {
          const userIcon = link.icon || "";
          const isEmoji = userIcon && !userIcon.includes('/') && userIcon.length < 5;
          const isMaterialIcon = userIcon && /^[a-z0-9_]+$/.test(userIcon) && !userIcon.includes('.') && !isEmoji;

          if (isEmoji) {
            imgHtml = `<div class="card-icon" style="display:grid;place-items:center;font-size:24px;background:var(--bg)">${userIcon}</div>`;
          } else if (isMaterialIcon) {
            imgHtml = `<div class="card-icon" style="display:grid;place-items:center;background:var(--bg)">${Utils.renderIcon(userIcon)}</div>`;
          } else {
            // URL (User provided or Auto Favicon)
            const hostname = Utils.getHostname(link.url);
            const src = userIcon || `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
            const fallback = CAT_ICONS[cat] || "link";
            const fallbackSvg = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='${STATE.encodedColor}'><text y='.9em' font-size='80' font-family='Material Icons'>${fallback}</text></svg>`;

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
        let urlHtml = STATE.hideUrls ? '' : `<div class="card-url">${Utils.getHostname(link.url)}${fallbackBadge}</div>`;


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
             ${link.isInternal ? '' : `
             <button onclick="Utils.copyToClipboard('${link.url}', this)" title="Copy URL">
               <span class="material-icons" style="font-size:1.2rem">content_copy</span>
             </button>`}
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

    // Close any open dropdowns when a modal opens
    if (STATE.isDropdownOpen) {
      STATE.isDropdownOpen = false;
      this.renderBreadcrumb();
    }

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
      const bookmarkStats = Core.getStats();
      const toolboxCats = typeof TOOLS !== 'undefined' ? [...new Set(TOOLS.map(t => t.category))] : [];
      const allCats = [...new Set([...Object.keys(bookmarkStats), ...toolboxCats])].sort();
      dl.innerHTML = allCats.map(c => `<option value="${c}">`).join('');
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

    // Handle mapping of tab names to pane IDs if needed
    let paneId = tabId;
    if (tabId === 'bookmarks' || tabId === 'toolbox' || tabId === 'projects') {
      paneId = `${tabId}-settings`;
    }

    // Show selected tab pane
    const activePane = document.getElementById(`tab-${paneId}`);
    if (activePane) {
      activePane.style.display = 'block';
    }

    // Add active class to selected tab button
    const activeBtn = document.querySelector(`.tab-btn[onclick*="'${tabId}'"]`);
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
    if (modalTitle) modalTitle.textContent = 'Add Bookmark';
    const tabLabel = document.getElementById('tab-add-label');
    if (tabLabel) tabLabel.textContent = 'Add Bookmark';

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
      text: `Check out ${link.title} on Bookmarks!`,
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

    document.getElementById('modal-title').textContent = 'Edit Bookmark';
    const tabLabel = document.getElementById('tab-add-label');
    if (tabLabel) tabLabel.textContent = 'Edit Bookmark';
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
    this.applyReducedMotion();
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

  toggleProjectsInternal() {
    STATE.openProjectsInternally = !STATE.openProjectsInternally;
    Storage.set('open_projects_internally', STATE.openProjectsInternally);
    this.updateSettingsUI();
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

  toggleReducedMotion() {
    STATE.reducedMotion = !STATE.reducedMotion;
    Storage.set('reduced_motion', STATE.reducedMotion);
    this.applyReducedMotion();
    this.updateSettingsUI();
  },

  applyReducedMotion() {
    if (STATE.reducedMotion) document.body.classList.add('reduced-motion');
    else document.body.classList.remove('reduced-motion');
  },

  toggleAutoFocus() {
    STATE.autoFocusSearch = !STATE.autoFocusSearch;
    Storage.set('auto_focus_search', STATE.autoFocusSearch);
    this.updateSettingsUI();
  },

  toggleNewTab() {
    STATE.openInNewTab = !STATE.openInNewTab;
    Storage.set('open_newtab', STATE.openInNewTab);
    this.updateSettingsUI();
  },

  toggleConfirmDelete() {
    STATE.confirmDelete = !STATE.confirmDelete;
    Storage.set('confirm_delete', STATE.confirmDelete);
    this.updateSettingsUI();
  },

  toggleToolboxGroups() {
    STATE.groupToolbox = !STATE.groupToolbox;
    Storage.set('group_toolbox', STATE.groupToolbox);
    this.updateSettingsUI();
    UI.render();
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

    const toolboxStatsBtn = document.getElementById('toolbox-stats-btn');
    if (toolboxStatsBtn) {
      if (STATE.showStats) toolboxStatsBtn.classList.add('active');
      else toolboxStatsBtn.classList.remove('active');
    }

    const auroraBtn = document.getElementById('settings-aurora-btn');
    if (auroraBtn) {
      if (STATE.enableAurora) auroraBtn.classList.add('active');
      else auroraBtn.classList.remove('active');
    }

    const motionBtn = document.getElementById('settings-motion-btn');
    if (motionBtn) {
      if (STATE.reducedMotion) motionBtn.classList.add('active');
      else motionBtn.classList.remove('active');
    }

    const focusBtn = document.getElementById('settings-focus-btn');
    if (focusBtn) {
      if (STATE.autoFocusSearch) focusBtn.classList.add('active');
      else focusBtn.classList.remove('active');
    }

    const newtabBtn = document.getElementById('settings-newtab-btn');
    if (newtabBtn) {
      if (STATE.openInNewTab) newtabBtn.classList.add('active');
      else newtabBtn.classList.remove('active');
    }

    const confirmBtn = document.getElementById('settings-confirm-btn');
    if (confirmBtn) {
      if (STATE.confirmDelete) confirmBtn.classList.add('active');
      else confirmBtn.classList.remove('active');
    }

    const groupsBtn = document.getElementById('toolbox-groups-btn');
    if (groupsBtn) {
      if (STATE.groupToolbox) groupsBtn.classList.add('active');
      else groupsBtn.classList.remove('active');
    }

    const projectsInternalBtn = document.getElementById('projects-internal-btn');
    if (projectsInternalBtn) {
      if (STATE.openProjectsInternally) projectsInternalBtn.classList.add('active');
      else projectsInternalBtn.classList.remove('active');
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
