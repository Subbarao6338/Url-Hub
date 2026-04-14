// ============= CONFIG & STATE =============
const STORAGE_KEY = "url_hub_links_v1";
const STATE = {
  links: [],
  activeCategory: 'All', // 'All' or specific category name
  searchQuery: '',
  isDarkMode: localStorage.getItem('hub_theme') === 'dark',
  accentColor: localStorage.getItem('hub_accent_color') || 'indigo',
  isDropdownOpen: false,
  isModalOpen: false,
  currentLink: null
};

const CAT_ICONS = {
  "All": "home",
  "Government Services": "account_balance",
  "Privacy & Security": "security",
  "Network": "lan",

  "AI": "psychology",
  "Tools": "construction",
  "Utilities": "settings",

  "Productivity": "rocket_launch",
  "Personal": "person",

  "Media": "movie",
  "Streaming": "live_tv",
  "Manga / Anime": "auto_awesome",
  "Music": "music_note",
  "Games": "sports_esports",

  "Shopping": "shopping_cart",
  "Banking / Finance": "payments",

  "Email": "email",
  "Storage": "cloud",
  "Hosting": "dns",

  "Google": "language",
  "Search": "search",

  "Social": "forum",
  "News": "newspaper",
  "Jobs": "work",

  "Android": "android",
  "Linux": "terminal",
  "Windows": "window",
  "Coding": "code",

  "Travel": "flight",
  "Web apps": "language"
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
    UI.renderBreadcrumb();
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
    this.renderBreadcrumb();
    this.render();

    // Event Listeners
    // Search Toggle
    const searchContainer = document.getElementById('search-container');
    const searchInput = document.getElementById('search');

    document.getElementById('search-toggle').addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = searchContainer.classList.toggle('active');
      const toggleBtn = document.getElementById('search-toggle');
      document.body.classList.toggle('search-active', isActive);
      if (isActive) {
        searchInput.focus();
        toggleBtn.innerHTML = '<span class="material-icons">close</span>';
      } else {
        toggleBtn.innerHTML = '<span class="material-icons">search</span>';
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
      searchInput.value = '';
      STATE.searchQuery = '';
      searchInput.focus();
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
        const toggleBtn = document.getElementById('search-toggle');
        searchContainer.classList.add('active');
        document.body.classList.add('search-active');
        searchInput.focus();
        toggleBtn.innerHTML = '<span class="material-icons">close</span>';
      }
    });

    this.setupTooltips();
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

    // Get all unique categories
    const definedCats = Object.keys(CAT_ICONS).filter(c => c !== 'All');
    const existingCats = Object.keys(stats);
    const allCats = [...new Set([...definedCats, ...existingCats])].sort((a, b) => a.localeCompare(b));

    // 1. Breadcrumb / Dropdown UI
    const activeIcon = CAT_ICONS[STATE.activeCategory] || 'folder';
    let html = `
      <div style="position:relative">
         <span class="breadcrumb-active breadcrumb-item" onclick="UI.toggleDropdown(event)">
            <span class="material-icons">${activeIcon}</span> ${STATE.activeCategory} <span class="material-icons" style="font-size:1.2rem;opacity:0.6">expand_more</span>
         </span>

         <div class="category-dropdown ${STATE.isDropdownOpen ? 'active' : ''}">
             <div class="pill ${STATE.activeCategory === 'All' ? 'active' : ''}" onclick="UI.setCategory('All')">
                <span class="material-icons">home</span>
                <span>All Tools</span>
                <span class="count">${STATE.links.length}</span>
             </div>
             ${allCats.map(cat => {
      const count = stats[cat] || 0;
      const icon = CAT_ICONS[cat] || 'folder';
      return `
                 <div class="pill ${STATE.activeCategory === cat ? 'active' : ''}" onclick="UI.setCategory('${cat}')">
                    <span class="material-icons">${icon}</span>
                    <span>${cat}</span>
                    <span class="count">${count}</span>
                 </div>`;
    }).join('')}
         </div>
      </div>
    `;
    nav.innerHTML = html;

    // 2. Main UI Horizontal Pill Nav
    if (mainNav) {
      let mainHtml = `
        <div class="pill ${STATE.activeCategory === 'All' ? 'active' : ''}" onclick="UI.setCategory('All')">
          <span class="material-icons">home</span> <span>All</span>
        </div>
        ${allCats.map(cat => {
        const icon = CAT_ICONS[cat] || 'folder';
        return `
            <div class="pill ${STATE.activeCategory === cat ? 'active' : ''}" onclick="UI.setCategory('${cat}')">
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
      const catIcon = CAT_ICONS[cat] || 'folder';
      header.innerHTML = `
        <div class="category-title">
          <span class="material-icons">${catIcon}</span>
          ${cat}
          <span class="count">${grouped[cat].length}</span>
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
          const fallback = CAT_ICONS[cat] || "link";
          const fallbackSvg = `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100' fill='%236366f1'><text y='.9em' font-size='80' font-family='Material Icons'>${fallback}</text></svg>`;

          // Optional Icon Logic
          const optionalIcon = link.optional_icon ? `'${link.optional_icon}'` : 'null';

          imgHtml = `<img src="${src}" class="card-icon" loading="lazy" onerror="
              if (this.getAttribute('data-tried-optional') !== 'true' && ${optionalIcon}) {
                  this.setAttribute('data-tried-optional', 'true');
                  this.src = ${optionalIcon};
              } else {
                  this.src='${fallbackSvg}';
                  this.onerror=null;
              }
          ">`;
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
      container.appendChild(section);
    });
  },

  // Modal Handling
  openModal(id) {
    document.getElementById(id).style.display = 'block';
    document.getElementById('modal-overlay').style.display = 'block';
    STATE.isModalOpen = true;

    if (id === 'modal-settings') {
      PageTools.updateSettingsUI();
    }

    // Populate Datalist for categories
    const dl = document.getElementById('category-list');
    if (dl) {
      dl.innerHTML = Object.keys(Core.getStats()).map(c => `<option value="${c}">`).join('');
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
    const modal = document.getElementById('modal-about');
    const overlay = document.getElementById('modal-overlay');
    const content = document.getElementById('about-content');

    // Load README content
    try {
      const response = await fetch('README.md');
      if (response.ok) {
        const markdown = await response.text();
        content.innerHTML = this.markdownToHTML(markdown);
      } else {
        content.innerHTML = '<p>Unable to load README content.</p>';
      }
    } catch (error) {
      console.error('Error loading README:', error);
      content.innerHTML = '<p>Error loading README content.</p>';
    }

    modal.style.display = 'block';
    overlay.style.display = 'block';
    STATE.isModalOpen = true;
  },

  closeAboutModal() {
    document.getElementById('modal-about').style.display = 'none';
    document.getElementById('modal-overlay').style.display = 'none';
    STATE.isModalOpen = false;
  },

  // Simple Markdown to HTML converter
  markdownToHTML(markdown) {
    let html = markdown;

    // Convert images (must be before links to avoid conflicts)
    html = html.replace(/!\[(.*?)\]\((.*?)\)/gim, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; border-radius: 12px; margin: 1rem 0; box-shadow: var(--shadow-md);">');

    // Convert headings
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');

    // Convert bold
    html = html.replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>');

    // Convert links [text](url)
    html = html.replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2" target="_blank" style="color: var(--primary); text-decoration: none;">$1</a>');

    // Convert code blocks
    html = html.replace(/```json\n([\s\S]*?)```/gim, '<pre><code>$1</code></pre>');
    html = html.replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>');

    // Convert inline code
    html = html.replace(/`([^`]+)`/gim, '<code>$1</code>');

    // Convert unordered lists
    html = html.replace(/^\s*[\-\*]\s+(.*)$/gim, '<ul><li>$1</li></ul>');

    // Convert numbered lists
    html = html.replace(/^\s*\d+\.\s+(.*)$/gim, '<ol><li>$1</li></ol>');

    // Merge adjacent lists
    html = html.replace(/<\/ul>\n<ul>/gim, '');
    html = html.replace(/<\/ol>\n<ol>/gim, '');

    // Convert paragraphs (lines separated by blank lines)
    html = html.split('\n\n').map(para => {
      const trimmed = para.trim();
      if (!trimmed.match(/^<(h\d|ul|ol|li|pre|img|p)/i)) {
        return '<p>' + para.replace(/\n/g, ' ') + '</p>';
      }
      return para;
    }).join('\n');

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
    const primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
    if (primaryColor) {
      document.querySelector('meta[name="theme-color"]').setAttribute('content', primaryColor);
    }
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

    // Update color pills
    document.querySelectorAll('.color-pill').forEach(pill => {
      if (pill.getAttribute('data-color') === STATE.accentColor) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });
  },

  cleanPage() {
    // "Zap Ads" logic from original tools
    const selectors = ['iframe', '[class*="ad"]', '[id*="ad"]', '[class*="popup"]', '[class*="overlay"]'];
    let count = 0;
    const protectedIds = ['site-viewer', 'modal-overlay'];
    selectors.forEach(sel => {
      document.querySelectorAll(sel).forEach(el => {
        if (!protectedIds.includes(el.id)) { el.remove(); count++; }
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
