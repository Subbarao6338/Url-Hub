/**
 * URL Hub Toolbox - Offline Utilities
 */

const TOOLS = [
    // Personal
    { id: 'history', title: 'History', icon: 'history', category: 'Personal' },
    { id: 'saved', title: 'Saved', icon: 'bookmark', category: 'Personal' },
    { id: 'notes', title: 'Notes', icon: 'description', category: 'Personal' },

    // Productivity
    { id: 'ai-summary', title: 'AI Summary', icon: 'auto_fix_high', category: 'Productivity' },
    { id: 'calculator', title: 'Calculator', icon: 'calculate', category: 'Productivity' },
    { id: 'translate', title: 'Translate', icon: 'translate', category: 'Productivity' },
    { id: 'qr-gen', title: 'QR Gen', icon: 'qr_code_2', category: 'Productivity' },
    { id: 'stopwatch', title: 'Stopwatch', icon: 'timer', category: 'Productivity' },
    { id: 'morse', title: 'Morse', icon: 'timeline', category: 'Productivity' },
    { id: 'age-calculator', title: 'Age', icon: 'calendar_today', category: 'Productivity' },
    { id: 'bmi-calculator', title: 'BMI', icon: 'person', category: 'Productivity' },
    { id: 'color-picker', title: 'Color', icon: 'palette', category: 'Productivity' },
    { id: 'timestamp-conv', title: 'Timestamp', icon: 'schedule', category: 'Productivity' },

    // Utilities
    { id: 'password-gen', title: 'Password', icon: 'vpn_key', category: 'Utilities' },
    { id: 'unit-converter', title: 'Converter', icon: 'balance', category: 'Utilities' },
    { id: 'panchangam', title: 'Telugu Panchangam', icon: 'auto_awesome', category: 'Utilities' },
    { id: 'lorem-ipsum', title: 'Lorem Ipsum', icon: 'notes', category: 'Utilities' },
    { id: 'text-utils', title: 'Text Tools', icon: 'title', category: 'Utilities' },
    { id: 'word-counter', title: 'Word Counter', icon: 'format_list_numbered', category: 'Utilities' },
    { id: 'case-converter', title: 'Case Converter', icon: 'format_size', category: 'Utilities' },

    // Web Tools
    { id: 'omni-hub', title: 'Omni Hub', icon: 'public', category: 'Web Tools' },
    { id: 'network-tools', title: 'Network', icon: 'timeline', category: 'Web Tools' },
    { id: 'cookies', title: 'Cookies', icon: 'cookie', category: 'Web Tools' },
    { id: 'translator', title: 'Translator', icon: 'language', category: 'Web Tools' },
    { id: 'inspect', title: 'Inspect', icon: 'search', category: 'Web Tools' },
    { id: 'reader', title: 'Reader', icon: 'article', category: 'Web Tools' },
    { id: 'json-formatter', title: 'JSON', icon: 'code', category: 'Web Tools' },
    { id: 'base64-converter', title: 'Base64 Converter', icon: 'transform', category: 'Web Tools' },
    { id: 'url-tool', title: 'URL Tool', icon: 'link', category: 'Web Tools' },

    // System
    { id: 'device-info', title: 'Device', icon: 'memory', category: 'System' },
    { id: 'security-info', title: 'Security', icon: 'verified_user', category: 'System' },

    // Dev Tools
    { id: 'user-scripts', title: 'User Scripts', icon: 'add', category: 'Dev Tools' },
    { id: 'markdown-preview', title: 'Markdown', icon: 'article', category: 'Dev Tools' },
    { id: 'diff-viewer', title: 'Diff Viewer', icon: 'difference', category: 'Dev Tools' },
];

const Toolbox = {
    getStats() {
        const stats = {};
        TOOLS.forEach(t => {
            stats[t.category] = (stats[t.category] || 0) + 1;
        });
        return stats;
    },

    open(toolId) {
        if (!['history', 'saved'].includes(toolId)) {
            let history = Storage.getJson('tool_history', []);
            history = [toolId, ...history.filter(id => id !== toolId)].slice(0, 12);
            Storage.setJson('tool_history', history);
        }
        UI.setView('tool', toolId);
    },

    togglePin(e, toolId) {
        e.stopPropagation();
        let pinned = Storage.getJson('pinned_tools', []);
        if (pinned.includes(toolId)) {
            pinned = pinned.filter(id => id !== toolId);
        } else {
            pinned.push(toolId);
        }
        Storage.setJson('pinned_tools', pinned);
        this.renderHome(document.getElementById('toolbox-content'));
    },

    close() {
        UI.setView('hub');
    },

    renderHome(container) {
        container.innerHTML = '';
        let filtered = TOOLS.filter(t => {
            let matchesSearch = !STATE.searchQuery;
            let matchesCat = false;
            if (STATE.searchQuery) {
                matchesSearch = t.title.toLowerCase().includes(STATE.searchQuery) ||
                               t.category.toLowerCase().includes(STATE.searchQuery);
                matchesCat = true;
            } else {
                if (STATE.activeToolboxCategory === 'All') matchesCat = true;
                else matchesCat = t.category === STATE.activeToolboxCategory;
            }
            return matchesSearch && matchesCat;
        });

        const grouped = {};
        filtered.forEach(t => { (grouped[t.category] ||= []).push(t); });
        const fragment = document.createDocumentFragment();
        const toolboxHeader = document.createElement('div');
        toolboxHeader.className = 'toolbox-page-header';
        toolboxHeader.innerHTML = `<h2>Toolbox</h2><p>Collection of useful offline utilities.</p>`;
        fragment.appendChild(toolboxHeader);

        const pinned = Storage.getJson('pinned_tools', []);

        if (filtered.length === 0) {
            const noResults = document.createElement('div');
            noResults.style.textAlign = 'center'; noResults.style.color = '#888'; noResults.style.marginTop = '3rem';
            noResults.textContent = 'No tools found';
            fragment.appendChild(noResults);
        } else if (!STATE.groupToolbox) {
            const grid = document.createElement('div');
            grid.className = 'category-grid'; grid.style.padding = '0 10px';
            grid.innerHTML = filtered.map(tool => `
                <div class="card" onclick="Toolbox.open('${tool.id}')">
                    <div class="card-actions">
                         <button class="action-btn pin-btn ${pinned.includes(tool.id) ? 'active' : ''}" onclick="Toolbox.togglePin(event, '${tool.id}')" title="Pin Tool">
                             <span class="material-icons">push_pin</span>
                         </button>
                    </div>
                    <div class="card-header">
                        <div class="card-icon" style="display:grid;place-items:center;background:var(--bg)">
                            <span class="material-icons">${tool.icon}</span>
                        </div>
                        <div class="card-title">${UI.highlightText(tool.title, STATE.searchQuery)}</div>
                    </div>
                </div>
            `).join('');
            fragment.appendChild(grid);
        } else {
            Object.keys(grouped).sort().forEach(cat => {
                const section = document.createElement('div');
                section.className = 'category-section';
                const catIcon = this.getCategoryIcon(cat);
                section.innerHTML = `
                    <div class="category-header">
                        <div class="category-title">
                            <span class="material-icons">${catIcon}</span>
                            ${cat}
                            ${STATE.showStats ? `<span class="count">${grouped[cat].length}</span>` : ''}
                        </div>
                        <span class="material-icons expand-icon">expand_more</span>
                    </div>
                    <div class="category-grid">
                        ${grouped[cat].map(tool => `
                            <div class="card" onclick="Toolbox.open('${tool.id}')">
                                <div class="card-actions">
                                     <button class="action-btn pin-btn ${pinned.includes(tool.id) ? 'active' : ''}" onclick="Toolbox.togglePin(event, '${tool.id}')" title="Pin Tool">
                                         <span class="material-icons">push_pin</span>
                                     </button>
                                </div>
                                <div class="card-header">
                                    <div class="card-icon" style="display:grid;place-items:center;background:var(--bg)">
                                        <span class="material-icons">${tool.icon}</span>
                                    </div>
                                    <div class="card-title">${UI.highlightText(tool.title, STATE.searchQuery)}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
                const header = section.querySelector('.category-header');
                header.onclick = () => section.classList.toggle('collapsed');
                fragment.appendChild(section);
            });
        }
        container.appendChild(fragment);
    },

    getCategoryIcon(cat) {
        const icons = {
            'Personal': 'person',
            'Productivity': 'auto_fix_high',
            'Utilities': 'construction',
            'Web Tools': 'public',
            'System': 'settings_input_component',
            'Dev Tools': 'terminal',
        };
        return icons[cat] || 'folder';
    },

    renderTool(container, toolId) {
        const tool = TOOLS.find(t => t.id === toolId);
        container.innerHTML = `
            <div class="tool-view-header">
                <button class="icon-btn" onclick="Toolbox.close()" title="Back to Toolbox">
                    <span class="material-icons">arrow_back</span>
                </button>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <span class="material-icons" style="font-size: 2rem; color: var(--primary);">${tool ? tool.icon : 'construction'}</span>
                    <h2 style="margin: 0; font-size: 1.75rem;">${tool ? tool.title : 'Tool'}</h2>
                </div>
            </div>
            <div id="toolbox-content-inner" class="tool-container-inner"></div>
        `;
        const innerContainer = document.getElementById('toolbox-content-inner');
        switch (toolId) {
            case 'history': this.renderHistory(innerContainer); break;
            case 'saved': this.renderSaved(innerContainer); break;
            case 'notes': this.renderNotes(innerContainer); break;
            case 'ai-summary': this.renderAiSummary(innerContainer); break;
            case 'calculator': this.renderCalculator(innerContainer); break;
            case 'translate': this.renderTranslate(innerContainer); break;
            case 'qr-gen': this.renderQrGen(innerContainer); break;
            case 'stopwatch': this.renderStopwatch(innerContainer); break;
            case 'morse': this.renderMorse(innerContainer); break;
            case 'age-calculator': this.renderAgeCalculator(innerContainer); break;
            case 'bmi-calculator': this.renderBmiCalculator(innerContainer); break;
            case 'color-picker': this.renderColorPicker(innerContainer); break;
            case 'timestamp-conv': this.renderTimestampConv(innerContainer); break;
            case 'password-gen': this.renderPasswordGen(innerContainer); break;
            case 'unit-converter': this.renderUnitConverter(innerContainer); break;
            case 'panchangam': this.renderPanchangam(innerContainer); break;
            case 'lorem-ipsum': this.renderLoremIpsum(innerContainer); break;
            case 'text-utils': this.renderTextUtils(innerContainer); break;
            case 'word-counter': this.renderWordCounter(innerContainer); break;
            case 'case-converter': this.renderCaseConverter(innerContainer); break;
            case 'omni-hub': this.renderOmniHub(innerContainer); break;
            case 'network-tools': this.renderNetworkTools(innerContainer); break;
            case 'cookies': this.renderCookies(innerContainer); break;
            case 'translator': this.renderTranslator(innerContainer); break;
            case 'inspect': this.renderInspect(innerContainer); break;
            case 'reader': this.renderReader(innerContainer); break;
            case 'json-formatter': this.renderJsonFormatter(innerContainer); break;
            case 'base64-converter': this.renderBase64Converter(innerContainer); break;
            case 'url-tool': this.renderUrlTool(innerContainer); break;
            case 'device-info': this.renderDeviceInfo(innerContainer); break;
            case 'security-info': this.renderSecurityInfo(innerContainer); break;
            case 'user-scripts': this.renderUserScripts(innerContainer); break;
            case 'markdown-preview': this.renderMarkdownPreview(innerContainer); break;
            case 'diff-viewer': this.renderDiffViewer(innerContainer); break;
            default: this.renderPlaceholder(innerContainer, toolId);
        }
    },

    renderPlaceholder(container, toolId) {
        const tool = TOOLS.find(t => t.id === toolId);
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem 1rem;">
                <span class="material-icons" style="font-size: 4rem; color: var(--primary); opacity: 0.5;">${tool ? tool.icon : 'construction'}</span>
                <h2 style="margin-top: 1.5rem;">${tool ? tool.title : 'Tool'}</h2>
                <p style="color: #888; max-width: 300px; margin: 1rem auto;">This tool is currently under development.</p>
                <button class="btn-primary" onclick="Toolbox.close()" style="margin-top: 2rem;">Back to Toolbox</button>
            </div>
        `;
    },

    renderHistory(container) {
        const historyIds = Storage.getJson('tool_history', []);
        const historyTools = historyIds.map(id => TOOLS.find(t => t.id === id)).filter(Boolean);
        if (historyTools.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding:3rem; opacity:0.5;">No history yet.</div>`; return;
        }
        container.innerHTML = `
            <div class="category-grid" style="padding: 10px;">
                ${historyTools.map(tool => `
                    <div class="card" onclick="Toolbox.open('${tool.id}')">
                        <div class="card-header">
                            <div class="card-icon" style="display:grid;place-items:center;background:var(--bg)"><span class="material-icons">${tool.icon}</span></div>
                            <div class="card-title">${tool.title}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <button class="btn-primary" style="margin: 2rem auto; display: block;" onclick="Storage.setJson('tool_history', []); Toolbox.renderHistory(document.getElementById('toolbox-content-inner'))">Clear History</button>
        `;
    },

    renderSaved(container) {
        const pinnedIds = Storage.getJson('pinned_tools', []);
        const pinnedTools = pinnedIds.map(id => TOOLS.find(t => t.id === id)).filter(Boolean);
        if (pinnedTools.length === 0) {
            container.innerHTML = `<div style="text-align:center; padding:3rem; opacity:0.5;">No saved tools.</div>`; return;
        }
        container.innerHTML = `
            <div class="category-grid" style="padding: 10px;">
                ${pinnedTools.map(tool => `
                    <div class="card" onclick="Toolbox.open('${tool.id}')">
                        <div class="card-actions">
                             <button class="action-btn pin-btn active" onclick="Toolbox.togglePin(event, '${tool.id}'); Toolbox.renderSaved(document.getElementById('toolbox-content-inner'))">
                                 <span class="material-icons">push_pin</span>
                             </button>
                        </div>
                        <div class="card-header">
                            <div class="card-icon" style="display:grid;place-items:center;background:var(--bg)"><span class="material-icons">${tool.icon}</span></div>
                            <div class="card-title">${tool.title}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    },

    renderNotes(container) {
        const notes = Storage.get('tool_notes') || '';
        container.innerHTML = `
            <div class="tool-form" style="height: 100%; display: flex; flex-direction: column;">
                <label style="margin-bottom: 8px; display: block; font-weight: 500;">Quick Notepad (Auto-saves)</label>
                <textarea id="notes-area" style="flex: 1; min-height: 300px; font-family: inherit; line-height: 1.6; padding: 1rem; border-radius: 12px; background: rgba(var(--primary-rgb), 0.05); border: 1px solid rgba(var(--primary-rgb), 0.1);" placeholder="Type your notes here...">${notes}</textarea>
            </div>
        `;
        const area = document.getElementById('notes-area');
        area.addEventListener('input', () => { Storage.set('tool_notes', area.value); });
    },

    renderAiSummary(container) {
        container.innerHTML = `
            <div class="tool-form">
                <div class="form-group"><label>Article URL or Text Content</label><textarea id="ai-input" rows="6" placeholder="Paste link or long text here..."></textarea></div>
                <button class="btn-primary" style="width:100%;" onclick="Toolbox.mockAiSummary()">Generate AI Summary</button>
                <div id="ai-result-container" class="tool-result" style="display:none; margin-top:1.5rem;">
                    <div style="font-weight: 500; margin-bottom: 10px; color: var(--primary);"><span class="material-icons" style="vertical-align: middle; font-size: 1.2rem;">auto_fix_high</span> AI Generated Summary</div>
                    <div id="ai-result" style="line-height: 1.6; opacity: 0.9;"></div>
                </div>
            </div>
        `;
    },
    mockAiSummary() {
        const input = document.getElementById('ai-input').value; if (!input) return;
        const resultContainer = document.getElementById('ai-result-container');
        const resultEl = document.getElementById('ai-result');
        resultEl.innerHTML = "<i>Processing with local AI model...</i>"; resultContainer.style.display = 'block';
        setTimeout(() => {
            resultEl.innerHTML = `<p>Simulated AI summary based on input:</p><ul><li><b>Key Point 1:</b> Effective summarization reduces cognitive load by highlighting essential facts.</li><li><b>Key Point 2:</b> This tool provides an offline-first approach to content digestion.</li><li><b>Key Point 3:</b> Structured data extraction helps in quick scanning and recall.</li></ul>`;
        }, 1200);
    },

    renderCalculator(container) {
        container.innerHTML = `
            <div class="calculator" style="max-width: 320px; margin: 0 auto; background: rgba(var(--primary-rgb), 0.05); padding: 20px; border-radius: 24px; border: 1px solid rgba(var(--primary-rgb), 0.1);">
                <div id="calc-display" style="background: var(--surface); padding: 15px; text-align: right; font-size: 2rem; font-family: monospace; border-radius: 12px; margin-bottom: 20px; min-height: 40px; overflow: hidden; white-space: nowrap; box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);">0</div>
                <div class="calc-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;">
                    <button class="pill" onclick="Toolbox.calcInput('C')" style="color: #ef4444; font-weight: bold;">C</button>
                    <button class="pill" onclick="Toolbox.calcInput('(')">(</button><button class="pill" onclick="Toolbox.calcInput(')')">)</button>
                    <button class="pill" onclick="Toolbox.calcInput('/')" style="color: var(--primary); font-size: 1.5rem;">÷</button>
                    <button class="pill" onclick="Toolbox.calcInput('7')">7</button><button class="pill" onclick="Toolbox.calcInput('8')">8</button><button class="pill" onclick="Toolbox.calcInput('9')">9</button>
                    <button class="pill" onclick="Toolbox.calcInput('*')" style="color: var(--primary); font-size: 1.5rem;">×</button>
                    <button class="pill" onclick="Toolbox.calcInput('4')">4</button><button class="pill" onclick="Toolbox.calcInput('5')">5</button><button class="pill" onclick="Toolbox.calcInput('6')">6</button>
                    <button class="pill" onclick="Toolbox.calcInput('-')" style="color: var(--primary); font-size: 1.5rem;">−</button>
                    <button class="pill" onclick="Toolbox.calcInput('1')">1</button><button class="pill" onclick="Toolbox.calcInput('2')">2</button><button class="pill" onclick="Toolbox.calcInput('3')">3</button>
                    <button class="pill" onclick="Toolbox.calcInput('+')" style="color: var(--primary); font-size: 1.5rem;">+</button>
                    <button class="pill" onclick="Toolbox.calcInput('0')">0</button><button class="pill" onclick="Toolbox.calcInput('.')">.</button>
                    <button class="pill" onclick="Toolbox.calcInput('=')" style="grid-column: span 2; background: var(--primary); color: white; font-weight: bold; font-size: 1.5rem;">=</button>
                </div>
            </div>
        `;
        this._calcExpr = "";
    },
    calcInput(val) {
        const display = document.getElementById('calc-display');
        if (val === 'C') { this._calcExpr = ""; display.textContent = "0"; }
        else if (val === '=') {
            try {
                if (!this._calcExpr) return;
                // Basic sanitization
                const sanitized = this._calcExpr.replace(/[^-+*/().0-9]/g, '');
                const result = new Function(`return ${sanitized}`)();
                display.textContent = Number.isInteger(result) ? result : parseFloat(result.toFixed(8)).toString();
                this._calcExpr = display.textContent;
            } catch (e) { display.textContent = "Error"; this._calcExpr = ""; }
        } else {
            if (display.textContent === "0" && !isNaN(val)) this._calcExpr = val;
            else this._calcExpr += val;
            display.textContent = this._calcExpr;
        }
    },

    renderTranslate(container) {
        container.innerHTML = `
            <div class="tool-form">
                <div style="display: flex; gap: 10px; margin-bottom: 15px; align-items: center;">
                    <select id="trans-from" style="flex: 1; padding: 8px; border-radius: 8px; border: 1px solid rgba(var(--primary-rgb), 0.2);"><option value="auto">Detect Language</option><option value="en">English</option><option value="te">Telugu</option><option value="hi">Hindi</option></select>
                    <span class="material-icons" style="opacity: 0.5;">sync_alt</span>
                    <select id="trans-to" style="flex: 1; padding: 8px; border-radius: 8px; border: 1px solid rgba(var(--primary-rgb), 0.2);"><option value="te">Telugu</option><option value="en">English</option><option value="hi">Hindi</option></select>
                </div>
                <textarea id="trans-input" rows="5" placeholder="Enter text to translate..." style="width: 100%; margin-bottom: 15px;"></textarea>
                <button class="btn-primary" style="width: 100%;" onclick="Toolbox.mockTranslate()">Translate</button>
                <div id="trans-result-container" class="tool-result" style="display:none; margin-top:1.5rem; background: rgba(var(--primary-rgb), 0.05);">
                    <div style="font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; opacity: 0.6; margin-bottom: 8px;">Translation Result</div>
                    <div id="trans-result" style="font-size: 1.1rem; line-height: 1.5;"></div>
                </div>
            </div>
        `;
    },
    mockTranslate() {
        const input = document.getElementById('trans-input').value.trim(); if (!input) return;
        const resCont = document.getElementById('trans-result-container');
        const resEl = document.getElementById('trans-result');
        const to = document.getElementById('trans-to').value;
        resEl.innerHTML = "<i>Translating...</i>"; resCont.style.display = 'block';
        setTimeout(() => {
            const mocks = { 'te': 'ఇది నమూనా అనువాదం.', 'hi': 'यह एक नमूना अनुवाद है।', 'en': 'This is a sample translation.' };
            resEl.textContent = mocks[to] || "Translation not available in offline mode.";
        }, 800);
    },

    renderQrGen(container) {
        container.innerHTML = `
            <div class="tool-form">
                <div class="form-group">
                    <label>URL or Text</label>
                    <input type="text" id="qr-input" placeholder="https://google.com" oninput="Toolbox.generateQr()" style="width: 100%;">
                </div>
                <div id="qr-result-container" style="text-align: center; margin-top: 2rem; display: none; padding: 20px; background: white; border-radius: 16px; border: 1px solid #eee;">
                    <img id="qr-img" style="max-width: 100%; height: auto;">
                    <p style="margin-top: 15px; font-size: 0.8rem; color: #888;">Scan this code with your camera</p>
                </div>
            </div>
        `;
    },
    generateQr() {
        const input = document.getElementById('qr-input').value.trim();
        const img = document.getElementById('qr-img');
        const cont = document.getElementById('qr-result-container');
        if (!input) { cont.style.display = 'none'; return; }
        img.src = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(input)}`;
        cont.style.display = 'block';
    },

    renderStopwatch(container) {
        container.innerHTML = `
            <div class="tool-form" style="text-align: center; padding: 20px;">
                <div id="stopwatch-display" style="font-size: 4rem; font-family: 'JetBrains Mono', monospace; font-variant-numeric: tabular-nums; margin-bottom: 2rem; color: var(--primary);">00:00:00<span style="font-size: 2rem; opacity: 0.5;">.00</span></div>
                <div style="display: flex; gap: 15px; justify-content: center;">
                    <button id="sw-start" class="btn-primary" style="min-width: 120px;" onclick="Toolbox.toggleStopwatch()">Start</button>
                    <button class="pill" style="min-width: 120px; border: 1px solid rgba(var(--primary-rgb), 0.2);" onclick="Toolbox.resetStopwatch()">Reset</button>
                </div>
                <div id="sw-laps" style="margin-top: 2rem; text-align: left; max-height: 200px; overflow-y: auto; border-top: 1px solid #eee; padding-top: 15px;"></div>
            </div>
        `;
        this._swTime = 0; this._swInterval = null;
    },
    toggleStopwatch() {
        const btn = document.getElementById('sw-start');
        const display = document.getElementById('stopwatch-display');
        if (this._swInterval) {
            clearInterval(this._swInterval); this._swInterval = null;
            btn.textContent = 'Resume'; btn.classList.remove('active');
        } else {
            const startTime = Date.now() - this._swTime;
            this._swInterval = setInterval(() => {
                this._swTime = Date.now() - startTime;
                const ms = Math.floor((this._swTime % 1000) / 10);
                const s = Math.floor((this._swTime / 1000) % 60);
                const m = Math.floor((this._swTime / 60000) % 60);
                const h = Math.floor(this._swTime / 3600000);
                display.innerHTML = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}<span style="font-size: 2rem; opacity: 0.5;">.${ms.toString().padStart(2, '0')}</span>`;
            }, 50);
            btn.textContent = 'Pause'; btn.classList.add('active');
        }
    },
    resetStopwatch() {
        if (this._swInterval) { clearInterval(this._swInterval); this._swInterval = null; }
        this._swTime = 0;
        document.getElementById('sw-start').textContent = 'Start';
        document.getElementById('stopwatch-display').innerHTML = '00:00:00<span style="font-size: 2rem; opacity: 0.5;">.00</span>';
        document.getElementById('sw-laps').innerHTML = '';
    },

    renderMorse(container) {
        container.innerHTML = `
            <div class="tool-form">
                <div class="form-group"><label>Text</label><textarea id="morse-text" rows="3" placeholder="Hello World" oninput="Toolbox.toMorse()"></textarea></div>
                <div style="text-align: center; margin: 10px 0;"><span class="material-icons" style="opacity: 0.3;">expand_more</span></div>
                <div class="form-group"><label>Morse Code</label><textarea id="morse-code" rows="3" placeholder=".... . .-.. .-.. ---" oninput="Toolbox.fromMorse()"></textarea></div>
            </div>
        `;
        this._morseMap = { 'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-', 'Y': '-.--', 'Z': '--..', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.', '0': '-----', ' ': '/' };
        this._revMorseMap = Object.fromEntries(Object.entries(this._morseMap).map(([k, v]) => [v, k]));
    },
    toMorse() {
        const text = document.getElementById('morse-text').value.toUpperCase();
        document.getElementById('morse-code').value = text.split('').map(c => this._morseMap[c] || (c === '\n' ? '\n' : '')).join(' ').replace(/\s+/g, ' ').trim();
    },
    fromMorse() {
        const code = document.getElementById('morse-code').value.trim();
        document.getElementById('morse-text').value = code.split(' ').map(c => this._revMorseMap[c] || (c === '/' ? ' ' : '')).join('');
    },

    renderColorPicker(container) {
        container.innerHTML = `
            <div class="tool-form" style="text-align: center;">
                <div id="cp-preview" style="width: 150px; height: 150px; border-radius: 50%; margin: 0 auto 2rem; background: #6366f1; border: 8px solid white; box-shadow: 0 10px 30px rgba(0,0,0,0.1);"></div>
                <input type="color" id="cp-input" value="#6366f1" oninput="Toolbox.updateColor(this.value)" style="width: 100%; height: 50px; border-radius: 12px; cursor: pointer; border: none; background: transparent;">
                <div style="display: flex; gap: 10px; margin-top: 2rem;">
                    <div class="tool-result" style="flex: 1; font-family: monospace; font-size: 1.2rem;" id="cp-hex">#6366F1</div>
                    <div class="tool-result" style="flex: 1; font-family: monospace; font-size: 1rem;" id="cp-rgb">rgb(99, 102, 241)</div>
                </div>
            </div>
        `;
    },
    updateColor(hex) {
        document.getElementById('cp-preview').style.background = hex;
        document.getElementById('cp-hex').textContent = hex.toUpperCase();
        const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
        document.getElementById('cp-rgb').textContent = `rgb(${r}, ${g}, ${b})`;
    },

    renderTimestampConv(container) {
        const now = Math.floor(Date.now() / 1000);
        container.innerHTML = `
            <div class="tool-form">
                <div class="form-group"><label>Unix Timestamp (seconds)</label><input type="number" id="ts-unix" value="${now}" oninput="Toolbox.fromUnix()"></div>
                <div class="tool-result" style="margin-top: 1.5rem; text-align: center;">
                    <div style="font-size: 0.8rem; text-transform: uppercase; opacity: 0.5; margin-bottom: 5px;">Local Time</div>
                    <div id="ts-local" style="font-size: 1.3rem; font-weight: 500;"></div>
                    <div id="ts-iso" style="font-size: 0.9rem; opacity: 0.7; margin-top: 5px; font-family: monospace;"></div>
                </div>
                <div style="text-align: center; margin-top: 1.5rem;"><button class="pill" onclick="Toolbox.tsNow()">Current Time</button></div>
            </div>
        `;
        this.fromUnix();
    },
    tsNow() { document.getElementById('ts-unix').value = Math.floor(Date.now() / 1000); this.fromUnix(); },
    fromUnix() {
        const unix = document.getElementById('ts-unix').value; if (!unix) return;
        const d = new Date(unix * 1000);
        document.getElementById('ts-local').textContent = d.toLocaleString();
        document.getElementById('ts-iso').textContent = d.toISOString();
    },

    renderAgeCalculator(container) {
        container.innerHTML = `
            <div class="tool-form">
                <div class="form-group"><label>Date of Birth</label><input type="date" id="age-dob" oninput="Toolbox.calculateAge()" style="width: 100%;"></div>
                <div id="age-result-cont" style="display: none; margin-top: 2rem;">
                    <div class="tool-result" style="text-align: center;">
                        <div style="font-size: 3rem; font-weight: bold; color: var(--primary);" id="age-val">-</div>
                        <div style="font-size: 1.1rem; opacity: 0.7;">Years Old</div>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 1.5rem;">
                        <div class="tool-result" style="text-align: center; font-size: 0.9rem;">
                            <div id="age-months" style="font-weight: bold;">-</div> Months
                        </div>
                        <div class="tool-result" style="text-align: center; font-size: 0.9rem;">
                            <div id="age-days" style="font-weight: bold;">-</div> Days
                        </div>
                    </div>
                </div>
            </div>
        `;
    },
    calculateAge() {
        const dobStr = document.getElementById('age-dob').value; if (!dobStr) return;
        const dob = new Date(dobStr); const now = new Date();
        let years = now.getFullYear() - dob.getFullYear();
        let months = now.getMonth() - dob.getMonth();
        let days = now.getDate() - dob.getDate();
        if (days < 0) { months--; days += new Date(now.getFullYear(), now.getMonth(), 0).getDate(); }
        if (months < 0) { years--; months += 12; }
        document.getElementById('age-val').textContent = years;
        document.getElementById('age-months').textContent = years * 12 + months;
        document.getElementById('age-days').textContent = Math.floor((now - dob) / 86400000);
        document.getElementById('age-result-cont').style.display = 'block';
    },

    renderBmiCalculator(container) {
        container.innerHTML = `
            <div class="tool-form">
                <div style="display: flex; gap: 15px; margin-bottom: 20px;">
                    <div class="form-group" style="flex: 1;"><label>Weight (kg)</label><input type="number" id="bmi-w" placeholder="70"></div>
                    <div class="form-group" style="flex: 1;"><label>Height (cm)</label><input type="number" id="bmi-h" placeholder="175"></div>
                </div>
                <button class="btn-primary" style="width: 100%;" onclick="Toolbox.calculateBmi()">Calculate BMI</button>
                <div id="bmi-result-cont" style="display: none; margin-top: 2rem; text-align: center;">
                    <div class="tool-result" style="padding: 2rem;">
                        <div id="bmi-val" style="font-size: 3.5rem; font-weight: bold; color: var(--primary);">0.0</div>
                        <div id="bmi-label" style="font-size: 1.2rem; font-weight: 500; margin-top: 10px;">Normal</div>
                    </div>
                </div>
            </div>
        `;
    },
    calculateBmi() {
        const w = parseFloat(document.getElementById('bmi-w').value);
        const h = parseFloat(document.getElementById('bmi-h').value) / 100;
        if (!w || !h) return;
        const bmi = parseFloat((w / (h * h)).toFixed(1));
        document.getElementById('bmi-val').textContent = bmi;
        let label = "Normal", color = "var(--primary)";
        if (bmi < 18.5) { label = "Underweight"; color = "#3b82f6"; }
        else if (bmi >= 25 && bmi < 30) { label = "Overweight"; color = "#f59e0b"; }
        else if (bmi >= 30) { label = "Obese"; color = "#ef4444"; }
        const labelEl = document.getElementById('bmi-label');
        labelEl.textContent = label; labelEl.style.color = color;
        document.getElementById('bmi-val').style.color = color;
        document.getElementById('bmi-result-cont').style.display = 'block';
    },

    renderPasswordGen(container) {
        container.innerHTML = `
            <div class="tool-form">
                <div class="form-group"><label>Length: <span id="pw-len-val">16</span></label><input type="range" id="pw-len" min="8" max="64" value="16" oninput="document.getElementById('pw-len-val').textContent=this.value" style="width: 100%;"></div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px;">
                    <label class="pill" style="display:flex; align-items:center; gap:8px; cursor:pointer;"><input type="checkbox" id="pw-up" checked> ABC</label>
                    <label class="pill" style="display:flex; align-items:center; gap:8px; cursor:pointer;"><input type="checkbox" id="pw-num" checked> 123</label>
                    <label class="pill" style="display:flex; align-items:center; gap:8px; cursor:pointer;"><input type="checkbox" id="pw-sym" checked> !@#</label>
                </div>
                <button class="btn-primary" style="width: 100%;" onclick="Toolbox.generatePassword()">Generate Secure Password</button>
                <div id="pw-res-cont" class="tool-result" style="display:none; margin-top:1.5rem; position: relative; padding-right: 50px;">
                    <div id="pw-res" style="word-break: break-all; font-family: monospace; font-size: 1.2rem; letter-spacing: 0.05em;"></div>
                    <button class="icon-btn" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%);" onclick="Utils.copyToClipboard(document.getElementById('pw-res').textContent, this)"><span class="material-icons">content_copy</span></button>
                </div>
            </div>
        `;
    },
    generatePassword() {
        const len = document.getElementById('pw-len').value;
        let charset = "abcdefghijklmnopqrstuvwxyz";
        if (document.getElementById('pw-up').checked) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        if (document.getElementById('pw-num').checked) charset += "0123456789";
        if (document.getElementById('pw-sym').checked) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?";
        let res = ""; for (let i = 0; i < len; i++) res += charset.charAt(Math.floor(Math.random() * charset.length));
        document.getElementById('pw-res').textContent = res; document.getElementById('pw-res-cont').style.display = 'block';
    },

    renderUnitConverter(container) {
        container.innerHTML = `
            <div class="tool-form">
                <div class="form-group"><label>Value</label><input type="number" id="u-val" value="1" oninput="Toolbox.convertUnits()"></div>
                <div style="display: flex; gap: 10px; align-items: center; margin-top: 15px;">
                    <select id="u-from" onchange="Toolbox.convertUnits()" style="flex: 1;"><option value="km">Kilometers (km)</option><option value="m">Meters (m)</option><option value="mi">Miles (mi)</option><option value="kg">Kilograms (kg)</option><option value="lb">Pounds (lb)</option></select>
                    <span class="material-icons" style="opacity: 0.3;">arrow_forward</span>
                    <select id="u-to" onchange="Toolbox.convertUnits()" style="flex: 1;"><option value="m">Meters (m)</option><option value="km">Kilometers (km)</option><option value="mi">Miles (mi)</option><option value="kg">Kilograms (kg)</option><option value="lb">Pounds (lb)</option></select>
                </div>
                <div class="tool-result" style="margin-top: 2rem; text-align: center;">
                    <div style="font-size: 0.8rem; text-transform: uppercase; opacity: 0.5; margin-bottom: 5px;">Result</div>
                    <div id="u-res" style="font-size: 2rem; font-weight: bold; color: var(--primary);">0</div>
                </div>
            </div>
        `;
        this.convertUnits();
    },
    convertUnits() {
        const val = parseFloat(document.getElementById('u-val').value) || 0;
        const from = document.getElementById('u-from').value;
        const to = document.getElementById('u-to').value;
        const rates = {
            'km_m': 1000, 'm_km': 0.001, 'km_mi': 0.621371, 'mi_km': 1.60934, 'm_mi': 0.000621371, 'mi_m': 1609.34,
            'kg_lb': 2.20462, 'lb_kg': 0.453592
        };
        let res = val;
        if (from !== to) {
            const key = `${from}_${to}`;
            res = rates[key] ? val * rates[key] : (rates[`${to}_${from}`] ? val / rates[`${to}_${from}`] : "Invalid Conversion");
        }
        document.getElementById('u-res').textContent = typeof res === 'number' ? parseFloat(res.toFixed(4)) : res;
    },

    renderLoremIpsum(container) {
        container.innerHTML = `
            <div class="tool-form">
                <div class="form-group"><label>Paragraphs</label><input type="number" id="l-count" value="3" min="1" max="10"></div>
                <button class="btn-primary" style="width: 100%;" onclick="Toolbox.generateLorem()">Generate Placeholder Text</button>
                <div id="l-res-cont" class="tool-result" style="display:none; margin-top:1.5rem; position: relative; padding-right: 40px;">
                    <div id="l-res" style="font-size: 0.95rem; line-height: 1.6; max-height: 400px; overflow-y: auto;"></div>
                    <button class="icon-btn" style="position: absolute; right: 5px; top: 0;" onclick="Utils.copyToClipboard(document.getElementById('l-res').innerText, this)"><span class="material-icons">content_copy</span></button>
                </div>
            </div>
        `;
    },
    generateLorem() {
        const count = parseInt(document.getElementById('l-count').value);
        const text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
        let res = ""; for (let i = 0; i < count; i++) res += `<p style="margin-bottom: 1rem;">${text}</p>`;
        document.getElementById('l-res').innerHTML = res; document.getElementById('l-res-cont').style.display = 'block';
    },

    renderTextUtils(container) {
        container.innerHTML = `
            <div class="tool-form">
                <textarea id="t-input" rows="8" placeholder="Enter text here..." style="width:100%; margin-bottom: 15px;"></textarea>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
                    <button class="pill" onclick="Toolbox.modifyText('up')">UPPER</button>
                    <button class="pill" onclick="Toolbox.modifyText('low')">lower</button>
                    <button class="pill" onclick="Toolbox.modifyText('cap')">Capitalize</button>
                    <button class="pill" onclick="Toolbox.modifyText('trim')">Trim</button>
                    <button class="pill" onclick="Toolbox.modifyText('clean')">Clean Space</button>
                    <button class="pill" onclick="Utils.copyToClipboard(document.getElementById('t-input').value, this)">Copy</button>
                </div>
            </div>
        `;
    },
    modifyText(type) {
        const el = document.getElementById('t-input'); let val = el.value;
        if (type === 'up') val = val.toUpperCase();
        else if (type === 'low') val = val.toLowerCase();
        else if (type === 'cap') val = val.replace(/\b\w/g, l => l.toUpperCase());
        else if (type === 'trim') val = val.trim();
        else if (type === 'clean') val = val.replace(/\s+/g, ' ');
        el.value = val;
    },

    renderWordCounter(container) {
        container.innerHTML = `
            <div class="tool-form">
                <textarea id="wc-input" rows="8" placeholder="Paste your text here..." oninput="Toolbox.countWords()" style="width: 100%;"></textarea>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-top: 20px;">
                    <div class="tool-result"><div style="opacity: 0.5; font-size: 0.8rem;">Words</div><div id="wc-words" style="font-size: 1.5rem; font-weight: bold;">0</div></div>
                    <div class="tool-result"><div style="opacity: 0.5; font-size: 0.8rem;">Characters</div><div id="wc-chars" style="font-size: 1.5rem; font-weight: bold;">0</div></div>
                    <div class="tool-result"><div style="opacity: 0.5; font-size: 0.8rem;">Sentences</div><div id="wc-sent" style="font-size: 1.5rem; font-weight: bold;">0</div></div>
                    <div class="tool-result"><div style="opacity: 0.5; font-size: 0.8rem;">Paragraphs</div><div id="wc-para" style="font-size: 1.5rem; font-weight: bold;">0</div></div>
                </div>
            </div>
        `;
    },
    countWords() {
        const text = document.getElementById('wc-input').value.trim();
        document.getElementById('wc-words').textContent = text ? text.split(/\s+/).length : 0;
        document.getElementById('wc-chars').textContent = text.length;
        document.getElementById('wc-sent').textContent = text ? text.split(/[.!?]+/).filter(Boolean).length : 0;
        document.getElementById('wc-para').textContent = text ? text.split(/\n+/).filter(Boolean).length : 0;
    },

    renderCaseConverter(container) { this.renderTextUtils(container); },

    renderOmniHub(container) {
        container.innerHTML = `
            <div class="tool-form">
                <p style="opacity: 0.7; margin-bottom: 20px;">Quick access to various web search engines.</p>
                <div class="form-group"><input type="text" id="o-query" placeholder="Enter search query..." style="width: 100%; height: 50px; font-size: 1.1rem; padding: 0 15px;"></div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 15px;">
                    <button class="pill" onclick="Toolbox.omniSearch('google')">Google</button>
                    <button class="pill" onclick="Toolbox.omniSearch('duck')">DuckDuckGo</button>
                    <button class="pill" onclick="Toolbox.omniSearch('bing')">Bing</button>
                    <button class="pill" onclick="Toolbox.omniSearch('wiki')">Wikipedia</button>
                    <button class="pill" onclick="Toolbox.omniSearch('git')">GitHub</button>
                    <button class="pill" onclick="Toolbox.omniSearch('ai')">Perplexity</button>
                </div>
            </div>
        `;
    },
    omniSearch(eng) {
        const q = encodeURIComponent(document.getElementById('o-query').value); if (!q) return;
        const urls = { 'google': 'https://google.com/search?q=', 'duck': 'https://duckduckgo.com/?q=', 'bing': 'https://bing.com/search?q=', 'wiki': 'https://en.wikipedia.org/wiki/Special:Search?search=', 'git': 'https://github.com/search?q=', 'ai': 'https://perplexity.ai/search?q=' };
        window.open(urls[eng] + q, '_blank');
    },

    renderNetworkTools(container) {
        container.innerHTML = `
            <div class="tool-form">
                <div class="tool-result" style="text-align: center; padding: 2rem;">
                    <div style="opacity: 0.5; margin-bottom: 10px;">Connection Status</div>
                    <div id="net-status" style="font-size: 2rem; font-weight: bold; color: ${navigator.onLine ? '#10b981' : '#ef4444'}">${navigator.onLine ? 'ONLINE' : 'OFFLINE'}</div>
                    <div style="margin-top: 1.5rem; font-size: 0.9rem; opacity: 0.7;">
                        Platform: ${navigator.platform}<br>
                        Max Touch Points: ${navigator.maxTouchPoints}
                    </div>
                </div>
                <button class="btn-primary" style="width: 100%; margin-top: 20px;" onclick="location.reload()">Refresh Connection</button>
            </div>
        `;
    },

    renderCookies(container) {
        const cookies = document.cookie.split(';').filter(Boolean);
        container.innerHTML = `
            <div class="tool-form">
                <p style="opacity: 0.7; margin-bottom: 15px;">Local storage and session identifiers for this domain.</p>
                <div class="tool-result" style="max-height: 300px; overflow-y: auto;">
                    ${cookies.length ? cookies.map(c => `<div style="padding: 10px; border-bottom: 1px solid #eee; word-break: break-all; font-family: monospace; font-size: 0.85rem;">${c.trim()}</div>`).join('') : '<div style="opacity: 0.5; padding: 20px; text-align: center;">No cookies found.</div>'}
                </div>
                <button class="pill" style="width: 100%; margin-top: 15px; color: #ef4444;" onclick="document.cookie.split(';').forEach(c => document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/')); Toolbox.renderCookies(document.getElementById('toolbox-content-inner'))">Clear Cookies</button>
            </div>
        `;
    },

    renderTranslator(container) { this.renderTranslate(container); },

    renderInspect(container) {
        container.innerHTML = `
            <div class="tool-form">
                <p style="opacity: 0.7; margin-bottom: 15px;">Simple page structure analyzer.</p>
                <div class="tool-result" style="font-family: monospace; font-size: 0.9rem;">
                    <div><b>Tags count:</b></div>
                    <div id="ins-stats">Analyzing...</div>
                </div>
            </div>
        `;
        setTimeout(() => {
            const stats = {};
            document.querySelectorAll('*').forEach(el => stats[el.tagName] = (stats[el.tagName] || 0) + 1);
            document.getElementById('ins-stats').innerHTML = Object.entries(stats).sort((a,b) => b[1]-a[1]).slice(0, 10).map(([k,v]) => `${k}: ${v}`).join('<br>');
        }, 500);
    },

    renderReader(container) {
        container.innerHTML = `
            <div class="tool-form">
                <p style="opacity: 0.7; margin-bottom: 15px;">Clean viewing mode for web articles.</p>
                <div class="form-group"><input type="text" id="read-url" placeholder="https://example.com/article" style="width: 100%;"></div>
                <button class="btn-primary" style="width: 100%;" onclick="alert('Reader mode requires external API integration.')">Enter Reader Mode</button>
            </div>
        `;
    },

    renderJsonFormatter(container) {
        container.innerHTML = `
            <div class="tool-form">
                <textarea id="j-input" rows="10" placeholder='{"key":"value"}' style="width:100%; font-family: monospace; font-size: 0.9rem; margin-bottom: 15px;"></textarea>
                <div style="display: flex; gap: 10px;">
                    <button class="btn-primary" style="flex: 2;" onclick="Toolbox.formatJson()">Format / Beautify</button>
                    <button class="pill" style="flex: 1;" onclick="Toolbox.minifyJson()">Minify</button>
                </div>
            </div>
        `;
    },
    formatJson() {
        const el = document.getElementById('j-input');
        try { el.value = JSON.stringify(JSON.parse(el.value), null, 4); } catch(e) { alert("Invalid JSON: " + e.message); }
    },
    minifyJson() {
        const el = document.getElementById('j-input');
        try { el.value = JSON.stringify(JSON.parse(el.value)); } catch(e) { alert("Invalid JSON: " + e.message); }
    },

    renderBase64Converter(container) {
        container.innerHTML = `
            <div class="tool-form">
                <textarea id="b-input" rows="5" placeholder="Plain text or Base64 string..." style="width:100%; font-family: monospace; margin-bottom: 15px;"></textarea>
                <div style="display: flex; gap: 10px;">
                    <button class="btn-primary" style="flex: 1;" onclick="try { document.getElementById('b-input').value = btoa(document.getElementById('b-input').value) } catch(e) { alert('Error encoding') }">Encode</button>
                    <button class="pill" style="flex: 1;" onclick="try { document.getElementById('b-input').value = atob(document.getElementById('b-input').value) } catch(e) { alert('Invalid Base64') }">Decode</button>
                </div>
            </div>
        `;
    },

    renderUrlTool(container) {
        container.innerHTML = `
            <div class="tool-form">
                <div class="form-group"><label>URL</label><input type="text" id="u-tool-in" value="${window.location.href}" style="width: 100%; font-family: monospace;"></div>
                <div id="u-tool-res" class="tool-result" style="margin-top: 1.5rem; font-family: monospace; font-size: 0.9rem; line-height: 1.6;"></div>
                <button class="pill" style="width: 100%; margin-top: 15px;" onclick="Toolbox.parseUrl()">Parse URL</button>
            </div>
        `;
        this.parseUrl();
    },
    parseUrl() {
        try {
            const url = new URL(document.getElementById('u-tool-in').value);
            document.getElementById('u-tool-res').innerHTML = `
                <b>Protocol:</b> ${url.protocol}<br>
                <b>Hostname:</b> ${url.hostname}<br>
                <b>Path:</b> ${url.pathname}<br>
                <b>Search:</b> ${url.search || 'None'}
            `;
        } catch(e) { document.getElementById('u-tool-res').textContent = "Invalid URL"; }
    },

    renderDeviceInfo(container) {
        const info = [
            { l: 'Platform', v: navigator.platform },
            { l: 'Language', v: navigator.language },
            { l: 'Screen', v: `${window.screen.width}x${window.screen.height}` },
            { l: 'Pixel Ratio', v: window.devicePixelRatio },
            { l: 'Cookies Enabled', v: navigator.cookieEnabled ? 'Yes' : 'No' }
        ];
        container.innerHTML = `
            <div class="tool-form">
                <div style="display: grid; grid-template-columns: 1fr; gap: 10px;">
                    ${info.map(i => `<div class="tool-result" style="display:flex; justify-content:space-between;"><span>${i.l}</span><b>${i.v}</b></div>`).join('')}
                    <div class="tool-result" style="font-size: 0.8rem; overflow-x: auto;"><div style="opacity: 0.5; margin-bottom: 5px;">User Agent</div>${navigator.userAgent}</div>
                </div>
            </div>
        `;
    },

    renderSecurityInfo(container) {
        container.innerHTML = `
            <div class="tool-form">
                <div class="tool-result" style="display: flex; flex-direction: column; gap: 15px;">
                    <div style="display:flex; justify-content:space-between;"><span>Secure Context</span><b style="color: ${window.isSecureContext ? '#10b981' : '#ef4444'}">${window.isSecureContext ? 'YES' : 'NO'}</b></div>
                    <div style="display:flex; justify-content:space-between;"><span>HTTPS</span><b style="color: ${location.protocol === 'https:' ? '#10b981' : '#ef4444'}">${location.protocol === 'https:' ? 'YES' : 'NO'}</b></div>
                    <div style="display:flex; justify-content:space-between;"><span>Permissions (Camera)</span><b id="sec-cam">Checking...</b></div>
                </div>
            </div>
        `;
        navigator.permissions?.query({name:'camera'}).then(res => document.getElementById('sec-cam').textContent = res.state.toUpperCase());
    },

    renderUserScripts(container) {
        container.innerHTML = `
            <div class="tool-form">
                <p style="opacity: 0.7; margin-bottom: 15px;">Execute custom JS in the context of this app.</p>
                <textarea id="us-input" rows="6" placeholder="console.log('Hello from Hub');" style="width:100%; font-family: monospace; margin-bottom: 15px;"></textarea>
                <button class="btn-primary" style="width: 100%;" onclick="try { eval(document.getElementById('us-input').value) } catch(e) { alert(e.message) }">Run Script</button>
            </div>
        `;
    },

    renderMarkdownPreview(container) {
        container.innerHTML = `
            <div class="tool-form" style="display: flex; flex-direction: column; height: 100%;">
                <textarea id="md-in" placeholder="# Markdown Title\n\n**Bold** and *italic* text." style="width: 100%; height: 200px; font-family: monospace; margin-bottom: 20px;" oninput="Toolbox.updateMd()"></textarea>
                <div id="md-out" class="tool-result" style="flex: 1; overflow-y: auto; background: white; min-height: 200px;"></div>
            </div>
        `;
        this.updateMd();
    },
    updateMd() {
        const val = document.getElementById('md-in').value;
        // Simple MD parser
        let html = val.replace(/^# (.*$)/gim, '<h1>$1</h1>')
                      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                      .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
                      .replace(/\*(.*)\*/gim, '<i>$1</i>');
        document.getElementById('md-out').innerHTML = html || '<i style="opacity:0.5">Preview will appear here...</i>';
    },

    renderDiffViewer(container) {
        container.innerHTML = `
            <div class="tool-form">
                <div style="display: flex; gap: 10px; margin-bottom: 15px;">
                    <textarea id="diff-1" placeholder="Original text..." style="flex: 1; height: 150px; font-family: monospace;"></textarea>
                    <textarea id="diff-2" placeholder="Modified text..." style="flex: 1; height: 150px; font-family: monospace;"></textarea>
                </div>
                <button class="btn-primary" style="width: 100%;" onclick="Toolbox.runDiff()">Compare Text</button>
                <div id="diff-res" class="tool-result" style="display:none; margin-top:1.5rem; font-family: monospace; white-space: pre-wrap;"></div>
            </div>
        `;
    },
    runDiff() {
        const s1 = document.getElementById('diff-1').value, s2 = document.getElementById('diff-2').value;
        const resEl = document.getElementById('diff-res');
        resEl.textContent = s1 === s2 ? "Texts are identical." : "Texts are different.";
        resEl.style.color = s1 === s2 ? '#10b981' : '#ef4444'; resEl.style.display = 'block';
    },

    renderPanchangam(container) {
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);

        container.innerHTML = `
            <div class="tool-form">
                <div class="form-group">
                    <label>Date of Birth</label>
                    <input type="date" id="pan-date" value="${dateStr}">
                </div>
                <div class="form-group">
                    <label>Time of Birth</label>
                    <input type="time" id="pan-time" value="${timeStr}">
                </div>
                <div class="form-group">
                    <label>Timezone Offset (hours)</label>
                    <input type="number" id="pan-tz" step="0.5" value="5.5" placeholder="e.g. 5.5 for IST">
                    <small>Indian Standard Time (IST) is +5.5</small>
                </div>
                <div class="form-group">
                    <label>Location (Latitude, Longitude)</label>
                    <div style="display: flex; gap: 8px;">
                        <input type="number" id="pan-lat" step="0.0001" value="17.3850" placeholder="Lat (e.g. 17.38)">
                        <input type="number" id="pan-lng" step="0.0001" value="78.4867" placeholder="Lng (e.g. 78.48)">
                    </div>
                    <small>Default: Hyderabad, India</small>
                </div>
                <button class="btn-primary" style="width:100%; margin-top:1rem;" onclick="Toolbox.calculatePanchangam()">Calculate Details</button>
            </div>
            <div id="panchangam-result" class="tool-result" style="display:none; margin-top:1.5rem;"></div>
        `;
    },

    calculatePanchangam() {
        const date = document.getElementById('pan-date').value;
        const time = document.getElementById('pan-time').value;
        const lat = parseFloat(document.getElementById('pan-lat').value);
        const lng = parseFloat(document.getElementById('pan-lng').value);
        const tz = parseFloat(document.getElementById('pan-tz').value) || 5.5;

        if (!date || !time) return;

        // Create date object. Note: Date constructor with ISO string assumes local time if no TZ specified.
        const dt = new Date(`${date}T${time}`);

        // Calculate Julian Date in UT
        // getJulianDate returns JD for the given Date object (which is local)
        const jdLocal = this.getJulianDate(dt);

        // Convert local JD to UT JD by subtracting the browser's timezone offset
        const browserOffsetHours = -dt.getTimezoneOffset() / 60;
        const jdUT = jdLocal - (browserOffsetHours / 24.0);

        // Now we have JD in UT. We pass the user-specified timezone (tz) to getPanchangamData.
        const results = this.getPanchangamData(jdUT, lat, lng, tz);

        const resultDiv = document.getElementById('panchangam-result');
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
            <div class="result-card">
                <h3>Birth Details (Telugu Panchangam)</h3>
                <div class="result-grid">
                    <div class="result-item"><span class="label">Tithi:</span> <span class="val">${results.tithi}</span></div>
                    <div class="result-item"><span class="label">Nakshatra:</span> <span class="val">${results.nakshatra} (Pada: ${results.pada})</span></div>
                    <div class="result-item"><span class="label">Rasi:</span> <span class="val">${results.rasi}</span></div>
                    <div class="result-item"><span class="label">Yoga:</span> <span class="val">${results.yoga}</span></div>
                    <div class="result-item"><span class="label">Karana:</span> <span class="val">${results.karana}</span></div>
                    <div class="result-item"><span class="label">Vara:</span> <span class="val">${results.vara}</span></div>
                </div>
            </div>
        `;
    },

    // --- Astronomical Calculations (Simplified) ---

    getJulianDate(date) {
        return (date.getTime() / 86400000) - (date.getTimezoneOffset() / 1440) + 2440587.5;
    },

    getAyanamsa(jd) {
        // Lahiri Ayanamsa approximation
        const t = (jd - 2451545.0) / 36525;
        return 23.85 + 1.397 * t;
    },

    rev(angle) {
        return angle - Math.floor(angle / 360.0) * 360.0;
    },

    getSunLongitude(jd) {
        const d = jd - 2451543.5;
        const w = 282.9404 + 4.70935e-5 * d;
        const e = 0.016709 - 1.151e-9 * d;
        const M = this.rev(356.0470 + 0.9856002585 * d);
        const E = M + (180/Math.PI) * e * Math.sin(M * Math.PI/180) * (1 + e * Math.cos(M * Math.PI/180));
        const x = Math.cos(E * Math.PI/180) - e;
        const y = Math.sin(E * Math.PI/180) * Math.sqrt(1 - e*e);
        const r = Math.sqrt(x*x + y*y);
        const v = Math.atan2(y, x) * 180/Math.PI;
        return this.rev(v + w);
    },

    getMoonLongitude(jd) {
        const d = jd - 2451543.5;
        const N = this.rev(125.1228 - 0.0529538083 * d);
        const i = 5.1454;
        const w = this.rev(318.0634 + 0.1643573223 * d);
        const a = 60.2666;
        const e = 0.054900;
        const M = this.rev(115.3654 + 13.0649929509 * d);

        let E = M + (180/Math.PI) * e * Math.sin(M * Math.PI/180) * (1 + e * Math.cos(M * Math.PI/180));
        // Iteration for E
        for(let j=0; j<3; j++) {
            E = E - (E - (180/Math.PI) * e * Math.sin(E * Math.PI/180) - M) / (1 - e * Math.cos(E * Math.PI/180));
        }

        const x = a * (Math.cos(E * Math.PI/180) - e);
        const y = a * Math.sqrt(1 - e*e) * Math.sin(E * Math.PI/180);
        const v = Math.atan2(y, x) * 180/Math.PI;
        const xecl = Math.cos(N * Math.PI/180) * Math.cos((v+w) * Math.PI/180) - Math.sin(N * Math.PI/180) * Math.sin((v+w) * Math.PI/180) * Math.cos(i * Math.PI/180);
        const yecl = Math.sin(N * Math.PI/180) * Math.cos((v+w) * Math.PI/180) + Math.cos(N * Math.PI/180) * Math.sin((v+w) * Math.PI/180) * Math.cos(i * Math.PI/180);
        return this.rev(Math.atan2(yecl, xecl) * 180/Math.PI);
    },

    getPanchangamData(jdUT, lat, lng, tz) {
        // jdUT is Julian Date in Universal Time
        // For astronomical positions, we use UT.
        // For Vara (weekday), we use Local Time.
        const jdLocal = jdUT + (tz / 24.0);

        const sunLong = this.getSunLongitude(jdUT);
        const moonLong = this.getMoonLongitude(jdUT);
        const ayanamsa = this.getAyanamsa(jdUT);

        const nirayanaMoon = this.rev(moonLong - ayanamsa);
        const nirayanaSun = this.rev(sunLong - ayanamsa);

        // Tithi
        let diff = moonLong - sunLong;
        if (diff < 0) diff += 360;
        const tithiIdx = Math.floor(diff / 12);
        const tithis = [
            "Padyami", "Vidiya", "Tadiya", "Chavithi", "Panchami", "Shashti", "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Pournami",
            "Padyami (Bahula)", "Vidiya (Bahula)", "Tadiya (Bahula)", "Chavithi (Bahula)", "Panchami (Bahula)", "Shashti (Bahula)", "Saptami (Bahula)", "Ashtami (Bahula)", "Navami (Bahula)", "Dashami (Bahula)", "Ekadashi (Bahula)", "Dwadashi (Bahula)", "Trayodashi (Bahula)", "Chaturdashi (Bahula)", "Amavasya"
        ];

        // Nakshatra
        const nakIdx = Math.floor(nirayanaMoon / (360/27));
        const nakshatras = [
            "Aswini", "Bharani", "Krittika", "Rohini", "Mrigasira", "Arudra", "Punarvasu", "Pushyami", "Aslesha",
            "Makha", "Pubba", "Uttara", "Hasta", "Chitra", "Swati", "Visakha", "Anuradha", "Jyeshta",
            "Moola", "Poorvashada", "Uttarashada", "Sravanam", "Dhanishta", "Satabhisham", "Poorvabhadra", "Uttarabhadra", "Revati"
        ];
        const pada = Math.floor((nirayanaMoon % (360/27)) / (360/108)) + 1;

        // Rasi
        const rasiIdx = Math.floor(nirayanaMoon / 30);
        const rasis = ["Mesham", "Vrushabham", "Midhunam", "Karkatakam", "Simham", "Kanya", "Thula", "Vrushchikam", "Dhanassu", "Makaram", "Kumbham", "Meenam"];

        // Yoga
        let yogaSum = moonLong + sunLong;
        if (yogaSum >= 360) yogaSum -= 360;
        const yogaIdx = Math.floor(this.rev(yogaSum - 2 * ayanamsa) / (360/27));
        const yogas = [
            "Vishkumbha", "Preeti", "Ayushman", "Saubhagya", "Shobhana", "Atiganda", "Sukarma", "Dhriti", "Shoola", "Ganda", "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra", "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva", "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma", "Indra", "Vaidhriti"
        ];

        // Karana
        const karanaIdx = Math.floor(diff / 6);
        const karanas = [
            "Kimstughna", "Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti",
            "Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti",
            "Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti",
            "Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti",
            "Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti",
            "Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti",
            "Bava", "Balava", "Kaulava", "Taitila", "Gara", "Vanija", "Vishti",
            "Shakuni", "Chatushpada", "Naga"
        ];

        // Vara (Weekday)
        const dayIdx = (Math.floor(jdLocal + 0.5) + 1) % 7;
        const varas = ["Sunday (Aditya)", "Monday (Somu)", "Tuesday (Mangala)", "Wednesday (Budha)", "Thursday (Guru)", "Friday (Sukra)", "Saturday (Sani)"];

        return {
            tithi: tithis[tithiIdx] || "Unknown",
            nakshatra: nakshatras[nakIdx] || "Unknown",
            pada: pada,
            rasi: rasis[rasiIdx] || "Unknown",
            yoga: yogas[yogaIdx] || "Unknown",
            karana: karanas[karanaIdx] || "Unknown",
            vara: varas[dayIdx]
        };
    }
};
