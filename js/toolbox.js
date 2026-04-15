/**
 * URL Hub Toolbox - Offline Utilities
 * Includes Telugu Panchangam, Password Generator, Unit Converter, etc.
 */

const TOOLS = [
    // Favorites
    { id: 'history', title: 'History', icon: 'history', category: 'Favorites' },
    { id: 'saved', title: 'Saved', icon: 'bookmark', category: 'Favorites' },
    { id: 'notes', title: 'Notes', icon: 'description', category: 'Favorites' },

    // Utilities
    { id: 'ai-summary', title: 'AI Summary', icon: 'auto_fix_high', category: 'Utilities' },
    { id: 'calculator', title: 'Calculator', icon: 'calculate', category: 'Utilities' },
    { id: 'translate', title: 'Translate', icon: 'translate', category: 'Utilities' },
    { id: 'qr-gen', title: 'QR Gen', icon: 'qr_code_2', category: 'Utilities' },
    { id: 'password-gen', title: 'Password', icon: 'vpn_key', category: 'Utilities' },
    { id: 'unit-converter', title: 'Converter', icon: 'balance', category: 'Utilities' },
    { id: 'stopwatch', title: 'Stopwatch', icon: 'timer', category: 'Utilities' },
    { id: 'morse', title: 'Morse', icon: 'timeline', category: 'Utilities' },
    { id: 'bmi-calculator', title: 'BMI', icon: 'person', category: 'Utilities' },
    { id: 'age-calculator', title: 'Age', icon: 'calendar_today', category: 'Utilities' },
    { id: 'color-picker', title: 'Color', icon: 'palette', category: 'Utilities' },
    { id: 'panchangam', title: 'Telugu Panchangam', icon: 'auto_awesome', category: 'Utilities' },
    { id: 'lorem-ipsum', title: 'Lorem Ipsum', icon: 'notes', category: 'Utilities' },
    { id: 'timestamp-conv', title: 'Timestamp', icon: 'schedule', category: 'Utilities' },

    // Advanced
    { id: 'omni-hub', title: 'Omni Hub', icon: 'public', category: 'Advanced' },
    { id: 'network-tools', title: 'Network', icon: 'timeline', category: 'Advanced' },
    { id: 'cookies', title: 'Cookies', icon: 'cookie', category: 'Advanced' },
    { id: 'translator', title: 'Translator', icon: 'language', category: 'Advanced' },

    // Page Tools
    { id: 'inspect', title: 'Inspect', icon: 'search', category: 'Page Tools' },
    { id: 'reader', title: 'Reader', icon: 'article', category: 'Page Tools' },
    { id: 'text-utils', title: 'Text Tools', icon: 'title', category: 'Page Tools' },
    { id: 'json-formatter', title: 'JSON', icon: 'code', category: 'Page Tools' },
    { id: 'base64-converter', title: 'Base64 Converter', icon: 'transform', category: 'Page Tools' },
    { id: 'url-tool', title: 'URL Tool', icon: 'link', category: 'Page Tools' },
    { id: 'word-counter', title: 'Word Counter', icon: 'format_list_numbered', category: 'Page Tools' },
    { id: 'case-converter', title: 'Case Converter', icon: 'format_size', category: 'Page Tools' },

    // System
    { id: 'device-info', title: 'Device', icon: 'memory', category: 'System' },
    { id: 'security-info', title: 'Security', icon: 'verified_user', category: 'System' },

    // Developer
    { id: 'user-scripts', title: 'User Scripts', icon: 'add', category: 'Developer' },
    { id: 'markdown-preview', title: 'Markdown', icon: 'article', category: 'Developer' },
    { id: 'diff-viewer', title: 'Diff Viewer', icon: 'difference', category: 'Developer' },

];

const Toolbox = {
    // --- UI Logic ---
    getStats() {
        const stats = {};
        TOOLS.forEach(t => {
            stats[t.category] = (stats[t.category] || 0) + 1;
        });
        return stats;
    },

    open(toolId) {
        UI.setView('tool', toolId);
    },

    close() {
        UI.setView('hub');
    },

    renderHome(container) {
        container.innerHTML = '';

        // Filter Logic
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
        filtered.forEach(t => {
            (grouped[t.category] ||= []).push(t);
        });

        const fragment = document.createDocumentFragment();

        // Header for Toolbox Page
        const toolboxHeader = document.createElement('div');
        toolboxHeader.className = 'toolbox-page-header';
        toolboxHeader.innerHTML = `
            <h2>Toolbox</h2>
            <p>Collection of useful offline utilities.</p>
        `;
        fragment.appendChild(toolboxHeader);

        if (filtered.length === 0) {
            const noResults = document.createElement('div');
            noResults.style.textAlign = 'center';
            noResults.style.color = '#888';
            noResults.style.marginTop = '3rem';
            noResults.textContent = 'No tools found';
            fragment.appendChild(noResults);
        } else if (!STATE.groupToolbox) {
            const grid = document.createElement('div');
            grid.className = 'category-grid';
            grid.style.padding = '0 10px';
            grid.innerHTML = filtered.map(tool => `
                <div class="card" onclick="UI.setView('tool', '${tool.id}')">
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
                            <div class="card" onclick="UI.setView('tool', '${tool.id}')">
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
            'Favorites': 'star',
            'Utilities': 'construction',
            'Advanced': 'settings_suggest',
            'Page Tools': 'auto_stories',
            'System': 'settings_input_component',
            'Developer': 'terminal',
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
            case 'panchangam':
                this.renderPanchangam(innerContainer);
                break;
            case 'password-gen':
                this.renderPasswordGen(innerContainer);
                break;
            case 'unit-converter':
                this.renderUnitConverter(innerContainer);
                break;
            case 'json-formatter':
                this.renderJsonFormatter(innerContainer);
                break;
            case 'base64-converter':
                this.renderBase64Converter(innerContainer);
                break;
            case 'text-utils':
                this.renderTextUtils(innerContainer);
                break;
            case 'age-calculator':
                this.renderAgeCalculator(innerContainer);
                break;
            case 'bmi-calculator':
                this.renderBmiCalculator(innerContainer);
                break;
            case 'lorem-ipsum':
                this.renderLoremIpsum(innerContainer);
                break;
            case 'word-counter':
                this.renderWordCounter(innerContainer);
                break;
            case 'case-converter':
                this.renderCaseConverter(innerContainer);
                break;
            default:
                this.renderPlaceholder(innerContainer, toolId);
        }
    },

    renderPlaceholder(container, toolId) {
        const tool = TOOLS.find(t => t.id === toolId);
        container.innerHTML = `
            <div style="text-align: center; padding: 3rem 1rem;">
                <span class="material-icons" style="font-size: 4rem; color: var(--primary); opacity: 0.5;">
                    ${tool ? tool.icon : 'construction'}
                </span>
                <h2 style="margin-top: 1.5rem;">${tool ? tool.title : 'Tool'}</h2>
                <p style="color: #888; max-width: 300px; margin: 1rem auto;">
                    This tool is currently under development and will be available in a future update.
                </p>
                <button class="btn-primary" onclick="Toolbox.close()" style="margin-top: 2rem;">
                    Back to Toolbox
                </button>
            </div>
        `;
    },

    // --- Password Generator ---
    renderPasswordGen(container) {
        container.innerHTML = `
            <div class="tool-form">
                <div class="form-group">
                    <label>Length: <span id="pw-length-val">16</span></label>
                    <input type="range" id="pw-length" min="4" max="64" value="16" oninput="document.getElementById('pw-length-val').textContent = this.value">
                </div>
                <div class="form-group checkbox-group">
                    <label><input type="checkbox" id="pw-upper" checked> Uppercase (A-Z)</label>
                    <label><input type="checkbox" id="pw-lower" checked> Lowercase (a-z)</label>
                    <label><input type="checkbox" id="pw-numbers" checked> Numbers (0-9)</label>
                    <label><input type="checkbox" id="pw-symbols" checked> Symbols (!@#$%^&*)</label>
                </div>
                <button class="btn-primary" style="width:100%;" onclick="Toolbox.generatePassword()">Generate Password</button>
                <div id="pw-result-container" class="tool-result" style="display:none; margin-top:1.5rem;">
                    <div class="copy-box">
                        <code id="pw-result"></code>
                        <button onclick="Utils.copyToClipboard(document.getElementById('pw-result').textContent, this)" title="Copy">
                            <span class="material-icons">content_copy</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    generatePassword() {
        const length = parseInt(document.getElementById('pw-length').value);
        const upper = document.getElementById('pw-upper').checked;
        const lower = document.getElementById('pw-lower').checked;
        const numbers = document.getElementById('pw-numbers').checked;
        const symbols = document.getElementById('pw-symbols').checked;

        let charset = "";
        if (upper) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        if (lower) charset += "abcdefghijklmnopqrstuvwxyz";
        if (numbers) charset += "0123456789";
        if (symbols) charset += "!@#$%^&*()_+~`|}{[]:;?><,./-=";

        if (charset === "") return;

        let password = "";
        for (let i = 0; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }

        document.getElementById('pw-result').textContent = password;
        document.getElementById('pw-result-container').style.display = 'block';
    },

    // --- Unit Converter ---
    renderUnitConverter(container) {
        container.innerHTML = `
            <div class="tool-form">
                <div class="form-group">
                    <label>From</label>
                    <div style="display: flex; gap: 8px;">
                        <input type="number" id="unit-val" value="1" style="flex: 1;">
                        <select id="unit-from" style="flex: 1;">
                            <optgroup label="Length">
                                <option value="m">Meters</option>
                                <option value="km">Kilometers</option>
                                <option value="cm">Centimeters</option>
                                <option value="inch">Inches</option>
                                <option value="ft">Feet</option>
                            </optgroup>
                            <optgroup label="Weight">
                                <option value="kg">Kilograms</option>
                                <option value="g">Grams</option>
                                <option value="lb">Pounds</option>
                            </optgroup>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>To</label>
                    <select id="unit-to">
                        <optgroup label="Length">
                            <option value="m">Meters</option>
                            <option value="km">Kilometers</option>
                            <option value="cm">Centimeters</option>
                            <option value="inch">Inches</option>
                            <option value="ft">Feet</option>
                        </optgroup>
                        <optgroup label="Weight">
                            <option value="kg">Kilograms</option>
                            <option value="g">Grams</option>
                            <option value="lb">Pounds</option>
                        </optgroup>
                    </select>
                </div>
                <button class="btn-primary" style="width:100%;" onclick="Toolbox.convertUnits()">Convert</button>
                <div id="unit-result-container" class="tool-result" style="display:none; margin-top:1.5rem; font-size: 1.25rem; font-weight: bold; text-align: center;">
                    <span id="unit-result"></span>
                </div>
            </div>
        `;
    },

    convertUnits() {
        const val = parseFloat(document.getElementById('unit-val').value);
        const from = document.getElementById('unit-from').value;
        const to = document.getElementById('unit-to').value;

        const factors = {
            m: 1, km: 1000, cm: 0.01, inch: 0.0254, ft: 0.3048,
            kg: 1, g: 0.001, lb: 0.453592
        };

        if (factors[from] && factors[to]) {
            // Basic sanity check to ensure same category
            const lengthUnits = ['m', 'km', 'cm', 'inch', 'ft'];
            const weightUnits = ['kg', 'g', 'lb'];
            if ((lengthUnits.includes(from) && weightUnits.includes(to)) || (weightUnits.includes(from) && lengthUnits.includes(to))) {
                document.getElementById('unit-result').textContent = "Cannot convert between categories!";
            } else {
                const result = (val * factors[from]) / factors[to];
                document.getElementById('unit-result').textContent = `${val} ${from} = ${result.toFixed(4)} ${to}`;
            }
        }

        document.getElementById('unit-result-container').style.display = 'block';
    },

    // --- JSON Formatter ---
    renderJsonFormatter(container) {
        container.innerHTML = `
            <div class="tool-form">
                <div class="form-group">
                    <label>JSON Input</label>
                    <textarea id="json-input" rows="8" placeholder='{"name": "John"}'></textarea>
                </div>
                <div style="display: flex; gap: 8px; margin-bottom: 1rem;">
                    <button class="btn-primary" style="flex: 1;" onclick="Toolbox.formatJson(true)">Beautify</button>
                    <button class="pill" style="flex: 1;" onclick="Toolbox.formatJson(false)">Minify</button>
                </div>
                <div id="json-result-container" class="tool-result" style="display:none;">
                    <div class="copy-box">
                        <pre id="json-result" style="max-height: 300px; overflow: auto; width: 100%;"></pre>
                        <button onclick="Utils.copyToClipboard(document.getElementById('json-result').textContent, this)" title="Copy">
                            <span class="material-icons">content_copy</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    formatJson(beautify) {
        const input = document.getElementById('json-input').value;
        try {
            const parsed = JSON.parse(input);
            const result = beautify ? JSON.stringify(parsed, null, 2) : JSON.stringify(parsed);
            document.getElementById('json-result').textContent = result;
            document.getElementById('json-result-container').style.display = 'block';
        } catch (e) {
            alert("Invalid JSON: " + e.message);
        }
    },

    // --- Base64 Converter ---
    renderBase64Converter(container) {
        container.innerHTML = `
            <div class="tool-form">
                <div class="form-group">
                    <label>Input Text</label>
                    <textarea id="b64-input" rows="4"></textarea>
                </div>
                <div style="display: flex; gap: 8px; margin-bottom: 1rem;">
                    <button class="btn-primary" style="flex: 1;" onclick="Toolbox.convertBase64(true)">Encode</button>
                    <button class="pill" style="flex: 1;" onclick="Toolbox.convertBase64(false)">Decode</button>
                </div>
                <div id="b64-result-container" class="tool-result" style="display:none;">
                    <div class="copy-box">
                        <code id="b64-result" style="word-break: break-all;"></code>
                        <button onclick="Utils.copyToClipboard(document.getElementById('b64-result').textContent, this)" title="Copy">
                            <span class="material-icons">content_copy</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    convertBase64(encode) {
        const input = document.getElementById('b64-input').value;
        try {
            const result = encode ? btoa(input) : atob(input);
            document.getElementById('b64-result').textContent = result;
            document.getElementById('b64-result-container').style.display = 'block';
        } catch (e) {
            alert("Base64 Error: " + e.message);
        }
    },

    // --- Text Utilities ---
    renderTextUtils(container) {
        container.innerHTML = `
            <div class="tool-form">
                <div class="form-group">
                    <label>Input Text</label>
                    <textarea id="text-input" rows="6" oninput="Toolbox.updateTextStats()"></textarea>
                </div>
                <div id="text-stats" style="margin-bottom: 1rem; opacity: 0.7; font-size: 0.9rem;">
                    Characters: 0 | Words: 0 | Lines: 0
                </div>
                <div class="pill-group">
                    <button class="pill" onclick="Toolbox.textOp('upper')">UPPERCASE</button>
                    <button class="pill" onclick="Toolbox.textOp('lower')">lowercase</button>
                    <button class="pill" onclick="Toolbox.textOp('title')">Title Case</button>
                    <button class="pill" onclick="Toolbox.textOp('clean')">Trim Whitespace</button>
                </div>
            </div>
        `;
    },

    updateTextStats() {
        const text = document.getElementById('text-input').value;
        const chars = text.length;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const lines = text ? text.split('\n').length : 0;
        document.getElementById('text-stats').textContent = `Characters: ${chars} | Words: ${words} | Lines: ${lines}`;
    },

    textOp(op) {
        const input = document.getElementById('text-input');
        let text = input.value;
        if (op === 'upper') text = text.toUpperCase();
        if (op === 'lower') text = text.toLowerCase();
        if (op === 'title') text = text.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
        if (op === 'clean') text = text.trim().replace(/\s+/g, ' ');
        input.value = text;
        this.updateTextStats();
    },

    // --- Age Calculator ---
    renderAgeCalculator(container) {
        container.innerHTML = `
            <div class="tool-form">
                <div class="form-group">
                    <label>Date of Birth</label>
                    <input type="date" id="age-dob">
                </div>
                <button class="btn-primary" style="width:100%;" onclick="Toolbox.calculateAge()">Calculate Age</button>
                <div id="age-result-container" class="tool-result" style="display:none; margin-top:1.5rem; text-align: center;">
                    <div id="age-result" style="font-size: 1.5rem; font-weight: bold; color: var(--primary);"></div>
                    <div id="age-details" style="margin-top: 0.5rem; opacity: 0.8;"></div>
                </div>
            </div>
        `;
    },

    calculateAge() {
        const dobStr = document.getElementById('age-dob').value;
        if (!dobStr) return;
        const dob = new Date(dobStr);
        const now = new Date();

        let years = now.getFullYear() - dob.getFullYear();
        let months = now.getMonth() - dob.getMonth();
        let days = now.getDate() - dob.getDate();

        if (days < 0) {
            months--;
            days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
        }
        if (months < 0) {
            years--;
            months += 12;
        }

        document.getElementById('age-result').textContent = `${years} Years Old`;
        document.getElementById('age-details').textContent = `${months} months, ${days} days since last birthday.`;
        document.getElementById('age-result-container').style.display = 'block';
    },

    // --- BMI Calculator ---
    renderBmiCalculator(container) {
        container.innerHTML = `
            <div class="tool-form">
                <div class="form-group">
                    <label>Weight (kg)</label>
                    <input type="number" id="bmi-weight" placeholder="e.g. 70">
                </div>
                <div class="form-group">
                    <label>Height (cm)</label>
                    <input type="number" id="bmi-height" placeholder="e.g. 175">
                </div>
                <button class="btn-primary" style="width:100%;" onclick="Toolbox.calculateBmi()">Calculate BMI</button>
                <div id="bmi-result-container" class="tool-result" style="display:none; margin-top:1.5rem; text-align: center;">
                    <div id="bmi-val" style="font-size: 2rem; font-weight: bold;"></div>
                    <div id="bmi-cat" style="font-size: 1.25rem; margin-top: 0.5rem; font-weight: 500;"></div>
                </div>
            </div>
        `;
    },

    calculateBmi() {
        const weight = parseFloat(document.getElementById('bmi-weight').value);
        const height = parseFloat(document.getElementById('bmi-height').value) / 100;
        if (!weight || !height) return;

        const bmi = weight / (height * height);
        let cat = "";
        let color = "";

        if (bmi < 18.5) { cat = "Underweight"; color = "#3b82f6"; }
        else if (bmi < 25) { cat = "Normal weight"; color = "#10b981"; }
        else if (bmi < 30) { cat = "Overweight"; color = "#f59e0b"; }
        else { cat = "Obese"; color = "#ef4444"; }

        const valEl = document.getElementById('bmi-val');
        valEl.textContent = bmi.toFixed(1);
        valEl.style.color = color;
        document.getElementById('bmi-cat').textContent = cat;
        document.getElementById('bmi-result-container').style.display = 'block';
    },

    // --- Lorem Ipsum Generator ---
    renderLoremIpsum(container) {
        container.innerHTML = `
            <div class="tool-form">
                <div class="form-group">
                    <label>Paragraphs: <span id="lorem-count-val">3</span></label>
                    <input type="range" id="lorem-count" min="1" max="10" value="3" oninput="document.getElementById('lorem-count-val').textContent = this.value">
                </div>
                <button class="btn-primary" style="width:100%;" onclick="Toolbox.generateLorem()">Generate Lorem Ipsum</button>
                <div id="lorem-result-container" class="tool-result" style="display:none; margin-top:1.5rem;">
                    <div class="copy-box" style="flex-direction: column; align-items: flex-end;">
                        <div id="lorem-result" style="width:100%; font-size: 0.95rem; line-height: 1.6; max-height: 400px; overflow-y: auto;"></div>
                        <button onclick="Utils.copyToClipboard(document.getElementById('lorem-result').innerText, this)" title="Copy" style="margin-top: 10px;">
                            <span class="material-icons">content_copy</span> Copy All
                        </button>
                    </div>
                </div>
            </div>
        `;
    },

    generateLorem() {
        const count = parseInt(document.getElementById('lorem-count').value);
        const text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";

        let result = "";
        for (let i = 0; i < count; i++) {
            result += `<p style="margin-bottom: 1rem;">${text}</p>`;
        }

        document.getElementById('lorem-result').innerHTML = result;
        document.getElementById('lorem-result-container').style.display = 'block';
    },

    // --- Word Counter ---
    renderWordCounter(container) {
        container.innerHTML = `
            <div class="tool-form">
                <div class="form-group">
                    <label>Input Text</label>
                    <textarea id="word-input" rows="8" oninput="Toolbox.runWordCounter()"></textarea>
                </div>
                <div id="word-result" class="result-grid" style="margin-top: 1rem;">
                    <div class="result-item"><span class="label">Words:</span> <span class="val" id="wc-words">0</span></div>
                    <div class="result-item"><span class="label">Characters:</span> <span class="val" id="wc-chars">0</span></div>
                    <div class="result-item"><span class="label">Sentences:</span> <span class="val" id="wc-sent">0</span></div>
                    <div class="result-item"><span class="label">Lines:</span> <span class="val" id="wc-lines">0</span></div>
                </div>
            </div>
        `;
    },

    runWordCounter() {
        const text = document.getElementById('word-input').value;
        const words = text.trim() ? text.trim().split(/\s+/).length : 0;
        const chars = text.length;
        const sentences = text.split(/[.!?]+/).filter(Boolean).length;
        const lines = text ? text.split('\n').length : 0;

        document.getElementById('wc-words').textContent = words;
        document.getElementById('wc-chars').textContent = chars;
        document.getElementById('wc-sent').textContent = sentences;
        document.getElementById('wc-lines').textContent = lines;
    },

    // --- Case Converter ---
    renderCaseConverter(container) {
        container.innerHTML = `
            <div class="tool-form">
                <div class="form-group">
                    <label>Input Text</label>
                    <textarea id="case-input" rows="6"></textarea>
                </div>
                <div class="pill-group">
                    <button class="pill" onclick="Toolbox.convertCase('upper')">UPPERCASE</button>
                    <button class="pill" onclick="Toolbox.convertCase('lower')">lowercase</button>
                    <button class="pill" onclick="Toolbox.convertCase('sentence')">Sentence case</button>
                    <button class="pill" onclick="Toolbox.convertCase('capital')">Capitalize Case</button>
                    <button class="pill" onclick="Toolbox.convertCase('snake')">snake_case</button>
                    <button class="pill" onclick="Toolbox.convertCase('kebab')">kebab-case</button>
                </div>
            </div>
        `;
    },

    convertCase(type) {
        const el = document.getElementById('case-input');
        let text = el.value;
        if (type === 'upper') text = text.toUpperCase();
        if (type === 'lower') text = text.toLowerCase();
        if (type === 'sentence') text = text.toLowerCase().replace(/(^\s*\w|[\.\!\?]\s*\w)/g, c => c.toUpperCase());
        if (type === 'capital') text = text.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
        if (type === 'snake') text = text.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g).map(x => x.toLowerCase()).join('_');
        if (type === 'kebab') text = text.match(/[A-Z]{2,}(?=[A-Z][a-z]+[0-9]*|\b)|[A-Z]?[a-z]+[0-9]*|[A-Z]|[0-9]+/g).map(x => x.toLowerCase()).join('-');
        el.value = text;
    },

    // --- Telugu Panchangam Tool ---
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
        // JD at noon is an integer. Sunday is JD 0.5, 1.5, etc. or simplified:
        // (Math.floor(jdLocal + 0.5) + 1) % 7
        // Let's use a more standard formula for JD to Weekday:
        // Friday is 0 in some systems, but for us 0=Sunday.
        // JD 2451545.0 (Jan 1, 2000) was a Saturday.
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
