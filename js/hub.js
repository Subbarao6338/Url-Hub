// ============= CONFIG & STATE =============
const STORAGE_KEY = "url_hub_links_v1";
const STATE = {
  links: [],
  pinnedIds: JSON.parse(localStorage.getItem('hub_pinned_v1') || '[]'),
  activeCategory: 'All', // 'All' or specific category name
  searchQuery: '',
  isDarkMode: localStorage.getItem('hub_theme') === 'dark' || (localStorage.getItem('hub_theme') === null && window.matchMedia('(prefers-color-scheme: dark)').matches),
  isCompact: localStorage.getItem('hub_compact') === 'true',
  hideUrls: localStorage.getItem('hub_hide_urls') === 'true',
  hideIcons: localStorage.getItem('hub_hide_icons') === 'true',
  disableGlass: localStorage.getItem('hub_disable_glass') === 'true',
  showStats: localStorage.getItem('hub_show_stats') !== 'false',
  enableAurora: localStorage.getItem('hub_enable_aurora') !== 'false',
  accentColor: localStorage.getItem('hub_accent_color') || 'indigo',
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
      const res = await fetch('data/categories.json');
      if (res.ok) {
        CAT_ICONS = await res.json();
      }
    } catch (e) {
      console.error("Failed to load categories", e);
      // Fallback or empty object
      CAT_ICONS = { "All": "home", "Pinned": "push_pin" };
    }
  },

  async loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        STATE.links = JSON.parse(saved);
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
    UI.renderBreadcrumb();
  },

  async migrateFromJSON() {
    try {
      // Try fetching the external file first
      let raw = [];
      try {
        const res = await fetch(`data/links.json?t=${new Date().getTime()}`);
        if (res.ok) raw = await res.json();
      } catch (fetchErr) {
        console.warn("Could not fetch data/links.json", fetchErr);
        // alert("Failed to fetch data/links.json: " + fetchErr.message);
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
        let category = item.category === "Government Services" ? "Govt." : (item.category || "Others");
        // Support both single url and multiple urls
        let urls = item.urls || [item.url];
        return {
          id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
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
      localStorage.setItem('hub_pinned_v1', JSON.stringify(STATE.pinnedIds));
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
  _tooltipInitialized: false,
  _eventsInitialized: false,

  init() {
    this.renderBreadcrumb();
    this.render();

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
        tooltip.style.top = (rect.top - tooltip.offsetHeight - 8) + 'px';
        tooltip.style.left = (rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2)) + 'px';
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
            <span class="material-icons">${activeIcon}</span> ${STATE.activeCategory} <span class="material-icons" style="font-size:1.2rem;opacity:0.6">expand_more</span>
         </span>

         <div class="category-dropdown ${STATE.isDropdownOpen ? 'active' : ''}">
             <div class="pill ${STATE.activeCategory === 'All' ? 'active' : ''}" onclick="UI.setCategory('All')" aria-label="Show All Tools">
                <span class="material-icons">home</span>
                <span>All Tools</span>
                ${STATE.showStats ? `<span class="count">${STATE.links.length}</span>` : ''}
             </div>
             <div class="pill ${STATE.activeCategory === 'Pinned' ? 'active' : ''}" onclick="UI.setCategory('Pinned')" aria-label="Show Pinned Tools">
                <span class="material-icons">push_pin</span>
                <span>Pinned</span>
                ${STATE.showStats ? `<span class="count">${STATE.pinnedIds.length}</span>` : ''}
             </div>
             ${allCats.map(cat => {
      const count = stats[cat] || 0;
      const icon = CAT_ICONS[cat] || 'folder';
      return `
                 <div class="pill ${STATE.activeCategory === cat ? 'active' : ''}" onclick="UI.setCategory('${cat}')" aria-label="Category: ${cat}">
                    <span class="material-icons">${icon}</span>
                    <span>${cat}</span>
                    ${STATE.showStats ? `<span class="count">${count}</span>` : ''}
                 </div>`;
    }).join('')}
         </div>
      </div>
    `;
    nav.innerHTML = html;

    if (mainNav) {
      let mainHtml = `
        <div class="pill ${STATE.activeCategory === 'All' ? 'active' : ''}" onclick="UI.setCategory('All')" aria-label="Show All Tools">
          <span class="material-icons">home</span> <span>All</span>
        </div>
        <div class="pill ${STATE.activeCategory === 'Pinned' ? 'active' : ''}" onclick="UI.setCategory('Pinned')" aria-label="Show Pinned Tools">
          <span class="material-icons">push_pin</span> <span>Pinned</span>
        </div>
        ${allCats.map(cat => {
        const icon = CAT_ICONS[cat] || 'folder';
        return `
            <div class="pill ${STATE.activeCategory === cat ? 'active' : ''}" onclick="UI.setCategory('${cat}')" aria-label="Category: ${cat}">
              <span class="material-icons">${icon}</span> <span>${cat}</span>
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
          <span class="material-icons">${catIcon}</span>
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
    localStorage.setItem('hub_pinned_v1', JSON.stringify(STATE.pinnedIds));
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
    if (confirm("This will reset your dashboard to the default list from links.json. Any local changes will be lost. Continue?")) {
      localStorage.removeItem(STORAGE_KEY);
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
    localStorage.setItem('hub_theme', STATE.isDarkMode ? 'dark' : 'light');
    this.applyTheme();
    this.updateSettingsUI();
  },

  setColor(color) {
    STATE.accentColor = color;
    localStorage.setItem('hub_accent_color', color);
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
    localStorage.setItem('hub_compact', STATE.isCompact);
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
    localStorage.setItem('hub_hide_urls', STATE.hideUrls);
    this.updateSettingsUI();
    UI.render();
  },

  toggleHideIcons() {
    STATE.hideIcons = !STATE.hideIcons;
    localStorage.setItem('hub_hide_icons', STATE.hideIcons);
    this.updateSettingsUI();
    UI.render();
  },

  toggleGlass() {
    STATE.disableGlass = !STATE.disableGlass;
    localStorage.setItem('hub_disable_glass', STATE.disableGlass);
    this.applyGlass();
    this.updateSettingsUI();
  },

  applyGlass() {
    if (STATE.disableGlass) document.body.classList.add('no-glass');
    else document.body.classList.remove('no-glass');
  },

  toggleShowStats() {
    STATE.showStats = !STATE.showStats;
    localStorage.setItem('hub_show_stats', STATE.showStats);
    this.updateSettingsUI();
    UI.renderBreadcrumb();
    UI.render();
  },

  toggleAurora() {
    STATE.enableAurora = !STATE.enableAurora;
    localStorage.setItem('hub_enable_aurora', STATE.enableAurora);
    this.applyAurora();
    this.updateSettingsUI();
  },

  applyAurora() {
    if (STATE.enableAurora) document.body.classList.remove('no-aurora');
    else document.body.classList.add('no-aurora');
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
