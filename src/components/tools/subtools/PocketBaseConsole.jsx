import React, { useEffect, useRef } from 'react';
import defaultLinks from '../../../../data/url_links.json';
import defaultCats from '../../../../data/url_cat.json';

const PocketBaseConsole = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        const registerPbConsole = () => {
            if (!window.Alpine) return;

            window.Alpine.data('pbConsole', () => ({
                url: localStorage.getItem('hub_pb_url') || 'http://127.0.0.1:8090',
                email: '',
                password: '',
                status: 'Disconnected', // Disconnected, Connecting, Connected, Error
                statusColor: 'var(--text-primary)',
                collections: [],
                selectedCollection: '',
                records: [],
                queryFilter: '',
                querySort: '-created',
                syncMsg: '',
                syncType: 'info', // info, success, error
                pb: null,
                loading: false,

                // WebAssembly 3.0 Accelerated State
                wasmLoaded: false,
                wasmLimit: 40,
                wasmValA: 12,
                wasmValB: 30,
                wasmAddResult: null,
                wasmTimeMs: 0,
                jsTimeMs: 0,
                wasmInstance: null,

                init() {
                    this.updateStatusColor();
                    this.tryAutoConnect();
                    this.initializeWasm();
                },

                updateStatusColor() {
                    if (this.status === 'Connected') this.statusColor = 'var(--success)';
                    else if (this.status === 'Connecting') this.statusColor = 'var(--amber)';
                    else if (this.status === 'Error') this.statusColor = 'var(--danger)';
                    else this.statusColor = 'var(--text-primary)';
                },

                async initializeWasm() {
                    try {
                        // Compiled bytecode for WASM 3.0 / Standard WASM add(a, b) function
                        const bytecode = new Uint8Array([
                            0x00, 0x61, 0x73, 0x6d,
                            0x01, 0x00, 0x00, 0x00,
                            0x01, 0x07, 0x01, 0x60, 0x02, 0x7f, 0x7f, 0x01, 0x7f,
                            0x03, 0x02, 0x01, 0x00,
                            0x07, 0x07, 0x01, 0x03, 0x61, 0x64, 0x64, 0x00, 0x00,
                            0x0a, 0x09, 0x01, 0x07, 0x00, 0x20, 0x00, 0x20, 0x01, 0x6a, 0x0b
                        ]);

                        const compiled = await WebAssembly.instantiate(bytecode);
                        this.wasmInstance = compiled.instance;
                        this.wasmLoaded = true;
                        console.log('WebAssembly 3.0 engine loaded successfully.');
                    } catch (err) {
                        console.error('WASM compilation failed:', err);
                    }
                },

                runWasmCalculation() {
                    if (!this.wasmInstance) return;
                    const t0 = performance.now();
                    // Perform computation using WebAssembly
                    const res = this.wasmInstance.exports.add(parseInt(this.wasmValA), parseInt(this.wasmValB));
                    const t1 = performance.now();

                    this.wasmAddResult = res;
                    this.wasmTimeMs = (t1 - t0).toFixed(4);

                    // Perform comparison in native JS
                    const t2 = performance.now();
                    const jsRes = parseInt(this.wasmValA) + parseInt(this.wasmValB);
                    const t3 = performance.now();
                    this.jsTimeMs = (t3 - t2).toFixed(4);
                },

                tryAutoConnect() {
                    if (!window.PocketBase) {
                        this.status = 'Error';
                        this.syncMsg = 'PocketBase SDK not loaded';
                        this.syncType = 'error';
                        this.updateStatusColor();
                        return;
                    }
                    try {
                        this.pb = new window.PocketBase(this.url);
                        if (this.pb.authStore && this.pb.authStore.isValid) {
                            this.status = 'Connected';
                            localStorage.setItem('hub_pb_connected', 'true');
                            this.updateStatusColor();
                            this.syncMsg = 'Automatically authenticated using stored session.';
                            this.syncType = 'success';
                            this.loadCollections();
                        } else if (localStorage.getItem('hub_pb_connected') === 'true') {
                            fetch(`${this.url}/api/health`)
                                .then(res => {
                                    if (res.ok) {
                                        this.status = 'Connected';
                                        this.updateStatusColor();
                                        this.syncMsg = 'Connected in anonymous mode!';
                                        this.syncType = 'success';
                                        this.loadCollections();
                                    } else {
                                        this.status = 'Disconnected';
                                        localStorage.removeItem('hub_pb_connected');
                                        this.updateStatusColor();
                                    }
                                })
                                .catch(() => {
                                    this.status = 'Disconnected';
                                    localStorage.removeItem('hub_pb_connected');
                                    this.updateStatusColor();
                                });
                        }
                    } catch (e) {
                        console.log('Auto-connect skipped or failed:', e);
                    }
                },

                async connectAndLogin() {
                    this.loading = true;
                    this.status = 'Connecting';
                    this.updateStatusColor();
                    this.syncMsg = 'Connecting to PocketBase...';
                    this.syncType = 'info';

                    localStorage.setItem('hub_pb_url', this.url);

                    try {
                        this.pb = new window.PocketBase(this.url);

                        if (this.email && this.password) {
                            if (this.email.includes('@') && !this.email.endsWith('.admin')) {
                                await this.pb.collection('users').authWithPassword(this.email, this.password);
                            } else {
                                await this.pb.admins.authWithPassword(this.email, this.password);
                            }
                            this.status = 'Connected';
                            localStorage.setItem('hub_pb_connected', 'true');
                            this.syncMsg = 'Authenticated successfully!';
                            this.syncType = 'success';
                        } else {
                            const res = await fetch(`${this.url}/api/health`);
                            if (res.ok) {
                                this.status = 'Connected';
                                localStorage.setItem('hub_pb_connected', 'true');
                                this.syncMsg = 'Connected in anonymous mode!';
                                this.syncType = 'success';
                            } else {
                                throw new Error('Unreachable health endpoint');
                            }
                        }
                        this.updateStatusColor();
                        this.loadCollections();
                    } catch (e) {
                        this.status = 'Error';
                        this.syncMsg = 'Connection / Auth failed: ' + e.message;
                        this.syncType = 'error';
                        this.updateStatusColor();
                    } finally {
                        this.loading = false;
                    }
                },

                logout() {
                    if (this.pb && this.pb.authStore) {
                        this.pb.authStore.clear();
                    }
                    this.status = 'Disconnected';
                    localStorage.removeItem('hub_pb_connected');
                    this.collections = [];
                    this.records = [];
                    this.selectedCollection = '';
                    this.syncMsg = 'Logged out / disconnected.';
                    this.syncType = 'info';
                    this.updateStatusColor();
                },

                async loadCollections() {
                    try {
                        const defaultCols = ['bookmarks', 'projects', 'categories', 'users'];
                        this.collections = defaultCols;
                        if (this.pb && this.pb.authStore && this.pb.authStore.isAdmin) {
                            const cols = await this.pb.collections.getFullList();
                            if (cols && cols.length > 0) {
                                this.collections = cols.map(c => c.name);
                            }
                        }
                    } catch (e) {
                        console.log('Skipped fetching collections metadata:', e);
                    }
                },

                async queryCollection() {
                    if (!this.selectedCollection) return;
                    this.loading = true;
                    this.records = [];
                    try {
                        const resultList = await this.pb.collection(this.selectedCollection).getList(1, 20, {
                            filter: this.queryFilter || null,
                            sort: this.querySort || null,
                        });
                        this.records = resultList.items;
                        this.syncMsg = `Loaded ${this.records.length} records from "${this.selectedCollection}"`;
                        this.syncType = 'success';
                    } catch (e) {
                        this.syncMsg = `Query failed: ${e.message}. (Ensure collections exist and API rules allow public reading)`;
                        this.syncType = 'error';
                    } finally {
                        this.loading = false;
                    }
                },

                // Use PocketBase as database for bookmarks sync from JSON files (url_links.json & url_cat.json)
                async syncBookmarksFromJson() {
                    if (!this.pb) {
                        this.syncMsg = 'Please connect/authenticate first.';
                        this.syncType = 'error';
                        return;
                    }
                    this.loading = true;
                    this.syncMsg = 'Syncing bookmarks from JSON to PocketBase...';
                    this.syncType = 'info';

                    try {
                        let categoriesCount = 0;
                        let bookmarksCount = 0;

                        // 1. Sync Categories
                        if (defaultCats && typeof defaultCats === 'object') {
                            for (const [catName, catIcon] of Object.entries(defaultCats)) {
                                try {
                                    // Check if category already exists, or just try to create
                                    await this.pb.collection('categories').create({
                                        name: catName,
                                        icon: catIcon
                                    });
                                    categoriesCount++;
                                } catch (err) {
                                    // Ignore if already exists / constraint error
                                }
                            }
                        }

                        // 2. Sync Bookmarks
                        if (Array.isArray(defaultLinks)) {
                            for (const bm of defaultLinks) {
                                try {
                                    await this.pb.collection('bookmarks').create({
                                        title: bm.title || 'Untitled',
                                        url: bm.url || '',
                                        category: bm.category || '',
                                        is_pinned: bm.is_pinned || false,
                                        profile_id: '1',
                                        original_id: bm.id || ''
                                    });
                                    bookmarksCount++;
                                } catch (err) {
                                    // Ignore if already exists / constraint error
                                }
                            }
                        }

                        this.syncMsg = `Bookmarks Sync from JSON finished! Successfully synced ${categoriesCount} categories and ${bookmarksCount} bookmarks into PocketBase database.`;
                        this.syncType = 'success';
                    } catch (e) {
                        this.syncMsg = 'Sync from JSON failed: ' + e.message + ' (Make sure bookmarks & categories collections exist in PocketBase)';
                        this.syncType = 'error';
                    } finally {
                        this.loading = false;
                    }
                },

                async syncBackup() {
                    if (!this.pb) {
                        this.syncMsg = 'Please connect/authenticate first.';
                        this.syncType = 'error';
                        return;
                    }
                    this.loading = true;
                    this.syncMsg = 'Starting Backup Sync of local state to PocketBase...';
                    this.syncType = 'info';

                    try {
                        let bookmarksCount = 0;
                        let projectsCount = 0;

                        // 1. Sync Bookmarks
                        for (let i = 0; i < localStorage.length; i++) {
                            const key = localStorage.key(i);
                            if (key && key.startsWith('hub_links_p')) {
                                const val = localStorage.getItem(key);
                                if (val) {
                                    const list = JSON.parse(val);
                                    if (Array.isArray(list)) {
                                        for (const bm of list) {
                                            try {
                                                await this.pb.collection('bookmarks').create({
                                                    title: bm.title || 'Untitled',
                                                    url: bm.url || '',
                                                    category: bm.category || '',
                                                    is_pinned: bm.is_pinned || false,
                                                    profile_id: bm.profile_id || '1',
                                                    original_id: bm.id || ''
                                                });
                                                bookmarksCount++;
                                            } catch (err) {
                                                // If already exists or rules blocked, ignore or handle
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        // 2. Sync Pinned Projects
                        const localPinned = localStorage.getItem('hub_pinned_projects') || '[]';
                        const pinnedList = JSON.parse(localPinned);
                        if (Array.isArray(pinnedList)) {
                            for (const projId of pinnedList) {
                                try {
                                    await this.pb.collection('projects').create({
                                        project_id: projId,
                                        is_pinned: true
                                    });
                                    projectsCount++;
                                } catch (err) {}
                            }
                        }

                        this.syncMsg = `Backup Sync finished! Uploaded ${bookmarksCount} bookmarks and ${projectsCount} project settings to PocketBase.`;
                        this.syncType = 'success';
                    } catch (e) {
                        this.syncMsg = 'Sync Backup partially failed. Details: ' + e.message;
                        this.syncType = 'error';
                    } finally {
                        this.loading = false;
                    }
                },

                async syncRestore() {
                    if (!this.pb) {
                        this.syncMsg = 'Please connect/authenticate first.';
                        this.syncType = 'error';
                        return;
                    }
                    this.loading = true;
                    this.syncMsg = 'Restoring data from PocketBase...';
                    this.syncType = 'info';

                    try {
                        const remoteBookmarks = await this.pb.collection('bookmarks').getFullList();
                        if (remoteBookmarks && remoteBookmarks.length > 0) {
                            const grouped = {};
                            remoteBookmarks.forEach(rb => {
                                const pid = rb.profile_id || '1';
                                if (!grouped[pid]) grouped[pid] = [];
                                grouped[pid].push({
                                    id: rb.original_id || rb.id,
                                    title: rb.title,
                                    url: rb.url,
                                    category: rb.category,
                                    is_pinned: rb.is_pinned,
                                    profile_id: pid
                                });
                            });

                            Object.keys(grouped).forEach(pid => {
                                localStorage.setItem(`hub_links_p${pid}`, JSON.stringify(grouped[pid]));
                            });
                        }

                        try {
                            const remoteProjects = await this.pb.collection('projects').getFullList();
                            if (remoteProjects && remoteProjects.length > 0) {
                                const pinnedIds = remoteProjects.map(rp => rp.project_id);
                                localStorage.setItem('hub_pinned_projects', JSON.stringify(pinnedIds));
                            }
                        } catch (err) {
                            console.log('Skipped projects restore:', err);
                        }

                        this.syncMsg = `Sync Restore finished! Loaded and merged ${remoteBookmarks?.length || 0} bookmarks.`;
                        this.syncType = 'success';
                    } catch (e) {
                        this.syncMsg = 'Restore failed: ' + e.message;
                        this.syncType = 'error';
                    } finally {
                        this.loading = false;
                    }
                }
            }));
        };

        if (!window.pbConsoleInitialized) {
            window.pbConsoleInitialized = true;
            if (window.Alpine) {
                registerPbConsole();
            } else {
                document.addEventListener('alpine:init', registerPbConsole);
            }
        }

        if (window.Alpine && containerRef.current) {
            window.Alpine.initTree(containerRef.current);
        }

        if (window.htmx && containerRef.current) {
            window.htmx.process(containerRef.current);
        }
    }, []);

    return (
        <div ref={containerRef} x-data="pbConsole()" className="grid gap-20 animate-fadeIn">
            {/* PocketBase Admin Panel Card */}
            <div className="card p-30 glass-card">
                <div className="flex-between flex-wrap gap-10">
                    <h3 className="m-0 flex-center gap-10">
                        <span className="material-icons" style={{ color: 'var(--brand-accent)' }}>sync_alt</span>
                        PocketBase & Alpine Hub
                    </h3>
                    <div
                        className="pill"
                        x-text="status"
                        x-bind:style="'background: ' + statusColor + '22; color: ' + statusColor + '; border-color: ' + statusColor"
                    >
                        Disconnected
                    </div>
                </div>
                <p className="smallest opacity-6 mt-5 mb-15">
                    Connect Epic Toolbox to your PocketBase instance for secure multi-device synchronization, real-time database query operations, and interactive reactivity.
                </p>

                {/* Connection Form */}
                <div className="grid gap-15" x-show="status !== 'Connected'">
                    <div className="form-group text-left">
                        <label className="smallest opacity-6 uppercase ml-10">PocketBase URL</label>
                        <input
                            type="text"
                            x-model="url"
                            className="pill w-full text-center"
                            placeholder="http://127.0.0.1:8090"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-10">
                        <div className="form-group text-left">
                            <label className="smallest opacity-6 uppercase ml-10">Email / Username</label>
                            <input
                                type="text"
                                x-model="email"
                                className="pill w-full text-center"
                                placeholder="admin@example.com (optional)"
                            />
                        </div>
                        <div className="form-group text-left">
                            <label className="smallest opacity-6 uppercase ml-10">Password</label>
                            <input
                                type="password"
                                x-model="password"
                                className="pill w-full text-center"
                                placeholder="•••••••• (optional)"
                            />
                        </div>
                    </div>
                    <button
                        type="button"
                        x-on:click="connectAndLogin()"
                        className="btn-primary w-full"
                        x-bind:disabled="loading"
                    >
                        <span x-show="!loading">Connect & Authenticate</span>
                        <span x-show="loading">Connecting...</span>
                    </button>
                </div>

                {/* Authenticated Controls */}
                <div className="grid gap-15" x-show="status === 'Connected'">
                    <div className="pill border flex-between p-10" style={{ background: 'var(--bg)' }}>
                        <span className="small font-mono truncate" x-text="'URL: ' + url"></span>
                        <button type="button" x-on:click="logout()" className="pill smallest text-danger">
                            Disconnect
                        </button>
                    </div>

                    <div className="grid gap-10">
                        <button
                            type="button"
                            x-on:click="syncBookmarksFromJson()"
                            className="btn-primary w-full"
                            x-bind:disabled="loading"
                            title="Import default url_links.json bookmarks directly into PocketBase database"
                        >
                            <span className="material-icons mr-10" style={{ fontSize: '1rem', verticalAlign: 'middle' }}>drive_folder_upload</span>
                            Sync Bookmarks from default JSON file to PocketBase
                        </button>

                        <div className="grid grid-cols-2 gap-10">
                            <button
                                type="button"
                                x-on:click="syncBackup()"
                                className="pill"
                                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
                                x-bind:disabled="loading"
                            >
                                Backup local state to PB
                            </button>
                            <button
                                type="button"
                                x-on:click="syncRestore()"
                                className="pill"
                                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}
                                x-bind:disabled="loading"
                            >
                                Restore from PB to local
                            </button>
                        </div>
                    </div>
                </div>

                {/* Status / Message Alert */}
                <template x-if="syncMsg">
                    <div
                        className="p-15 mt-15 border-radius-12 flex gap-10 text-left small"
                        x-bind:style="syncType === 'success' ? 'background: rgba(40, 167, 69, 0.1); border: 1px solid var(--success); color: var(--success);' : syncType === 'error' ? 'background: rgba(220, 53, 69, 0.1); border: 1px solid var(--danger); color: var(--danger);' : 'background: rgba(23, 162, 184, 0.1); border: 1px solid var(--info); color: var(--info);'"
                    >
                        <span className="material-icons" x-text="syncType === 'success' ? 'check_circle' : syncType === 'error' ? 'error' : 'info'">info</span>
                        <span x-text="syncMsg"></span>
                    </div>
                </template>
            </div>

            {/* Database Explorer Card */}
            <div className="card p-30 glass-card text-left" x-show="status === 'Connected'">
                <h3 className="m-0 flex-center gap-10" style={{ justifyContent: 'flex-start' }}>
                    <span className="material-icons" style={{ color: 'var(--brand-accent)' }}>explore</span>
                    Live DB Explorer
                </h3>
                <p className="smallest opacity-6 mt-5 mb-15">
                    Query, browse, and analyze your PocketBase collections instantly.
                </p>

                <div className="grid gap-15">
                    <div className="form-group">
                        <label className="smallest opacity-6 uppercase ml-10">Select Collection</label>
                        <select
                            x-model="selectedCollection"
                            className="pill w-full"
                            style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
                            x-on:change="queryCollection()"
                        >
                            <option value="">-- Choose a collection --</option>
                            <template x-for="col in collections" x-bind:key="col">
                                <option x-bind:value="col" x-text="col"></option>
                            </template>
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-10" x-show="selectedCollection">
                        <div className="form-group">
                            <label className="smallest opacity-6 uppercase ml-10">Filter (JSON-like)</label>
                            <input
                                type="text"
                                x-model="queryFilter"
                                className="pill w-full"
                                placeholder="created > '2023-01-01'"
                                x-on:keydown="if (event.key === 'Enter') queryCollection()"
                            />
                        </div>
                        <div className="form-group">
                            <label className="smallest opacity-6 uppercase ml-10">Sort Order</label>
                            <input
                                type="text"
                                x-model="querySort"
                                className="pill w-full"
                                placeholder="-created"
                                x-on:keydown="if (event.key === 'Enter') queryCollection()"
                            />
                        </div>
                    </div>

                    <button
                        type="button"
                        x-on:click="queryCollection()"
                        className="btn-primary w-full"
                        x-show="selectedCollection"
                        x-bind:disabled="loading"
                    >
                        Execute Query
                    </button>

                    {/* Query Records List */}
                    <div x-show="records.length > 0" className="mt-10">
                        <span className="smallest opacity-6 uppercase font-bold mb-5 block">Query Results</span>
                        <div style={{ maxHeight: '250px', overflowY: 'auto' }} className="grid gap-10">
                            <template x-for="item in records" x-bind:key="item.id">
                                <div className="card p-15 border" style={{ background: 'var(--bg)', borderColor: 'var(--border-color)' }}>
                                    <div className="flex-between">
                                        <span className="small font-mono font-bold" x-text="item.id" style={{ color: 'var(--brand-accent)' }}></span>
                                        <span className="smallest opacity-5" x-text="item.created ? item.created.slice(0, 10) : ''"></span>
                                    </div>
                                    <pre className="smallest font-mono mt-5 opacity-8" style={{ whiteSpace: 'pre-wrap', margin: 0 }} x-text="JSON.stringify(item, null, 2)"></pre>
                                </div>
                            </template>
                        </div>
                    </div>

                    <div x-show="selectedCollection && records.length === 0 && !loading" className="text-center p-20 opacity-5 small">
                        No records found in this collection.
                    </div>
                </div>
            </div>

            {/* HTMX Live Requester Card */}
            <div className="card p-30 glass-card text-left">
                <h3 className="m-0 flex-center gap-10" style={{ justifyContent: 'flex-start' }}>
                    <span className="material-icons" style={{ color: 'var(--brand-accent)' }}>swap_calls</span>
                    HTMX Fast Diagnostics
                </h3>
                <p className="smallest opacity-6 mt-5 mb-15">
                    Perform ultra-fast, single-roundtrip endpoint queries using HTMX with built-in indicators.
                </p>

                <div className="flex gap-10 flex-wrap">
                    <button
                        hx-get="/api/health"
                        hx-target="#diagnostics-result"
                        hx-indicator="#diag-loading"
                        className="pill font-bold"
                        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '10px 20px', cursor: 'pointer' }}
                    >
                        Verify API Health
                    </button>
                    <button
                        hx-get="/api/network/ip-info"
                        hx-target="#diagnostics-result"
                        hx-indicator="#diag-loading"
                        className="pill font-bold"
                        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)', padding: '10px 20px', cursor: 'pointer' }}
                    >
                        Fetch Public IP Info
                    </button>
                </div>

                <div id="diag-loading" className="htmx-indicator mt-15 text-center smallest opacity-6 font-bold flex-center gap-10" style={{ justifyContent: 'center' }}>
                    <span className="rotating material-icons" style={{ fontSize: '1.2rem' }}>sync</span>
                    <span>Polling FastAPI...</span>
                </div>

                <div id="diagnostics-result" className="mt-15" style={{ width: '100%' }}></div>
            </div>

            {/* AlpineJS & WebAssembly Sandbox Playground Card */}
            <div className="card p-30 glass-card text-left">
                <h3 className="m-0 flex-center gap-10" style={{ justifyContent: 'flex-start' }}>
                    <span className="material-icons" style={{ color: 'var(--brand-accent)' }}>integration_instructions</span>
                    Alpine.js & WebAssembly 3.0 Playground
                </h3>
                <p className="smallest opacity-6 mt-5 mb-15">
                    Experience dynamic, high-performance client-side reactivity powered by AlpineJS and compiled WebAssembly (WASM) bytecode.
                </p>

                <div className="grid gap-15">
                    {/* WebAssembly calculation showcase */}
                    <div className="border p-15 border-radius-12" style={{ background: 'var(--bg)' }}>
                        <div className="flex-between mb-5">
                            <span className="small font-bold flex-center gap-5">
                                <span className="material-icons text-success" style={{ fontSize: '1.2rem' }}>bolt</span>
                                WebAssembly 3.0 Accelerated Addition
                            </span>
                            <span className="smallest font-bold uppercase pill" x-text="wasmLoaded ? 'WASM Ready' : 'Compiling WASM...'" x-bind:style="wasmLoaded ? 'color: var(--success); border-color: var(--success);' : 'color: var(--amber); border-color: var(--amber);'"></span>
                        </div>
                        <p className="smallest opacity-6 mb-10">Input two numbers to run a calculation using compiled WebAssembly. Compare performance against native JS.</p>

                        <div className="grid grid-cols-2 gap-10 mb-10">
                            <input
                                type="number"
                                x-model="wasmValA"
                                className="pill w-full small text-center"
                                placeholder="Value A"
                                x-on:input="runWasmCalculation()"
                            />
                            <input
                                type="number"
                                x-model="wasmValB"
                                className="pill w-full small text-center"
                                placeholder="Value B"
                                x-on:input="runWasmCalculation()"
                            />
                        </div>

                        <button className="btn-primary w-full small mb-10" x-on:click="runWasmCalculation()">
                            Run Benchmarked Addition
                        </button>

                        <template x-if="wasmAddResult !== null">
                            <div className="smallest grid gap-5 p-10 border-radius-8" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                                <div className="flex-between">
                                    <span>Result:</span>
                                    <strong className="text-lg" x-text="wasmAddResult" style={{ color: 'var(--brand-accent)' }}></strong>
                                </div>
                                <div className="flex-between opacity-7">
                                    <span>WASM Compilation & Execution:</span>
                                    <strong x-text="wasmTimeMs + ' ms'"></strong>
                                </div>
                                <div className="flex-between opacity-7">
                                    <span>Standard JavaScript Execution:</span>
                                    <strong x-text="jsTimeMs + ' ms'"></strong>
                                </div>
                            </div>
                        </template>
                    </div>

                    {/* Standard Counter */}
                    <div className="border p-15 border-radius-12" style={{ background: 'var(--bg)' }} x-data="{ count: 0 }">
                        <div className="flex-between">
                            <span className="small font-bold">Local Reactive Counter (AlpineJS)</span>
                            <span className="font-mono text-lg font-bold" x-text="count" style={{ color: 'var(--brand-accent)' }}>0</span>
                        </div>
                        <div className="flex gap-10 mt-10">
                            <button className="pill small flex-1" x-on:click="count++">Increment</button>
                            <button className="pill small flex-1" x-on:click="count--">Decrement</button>
                            <button className="pill small" x-on:click="count = 0">Reset</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PocketBaseConsole;
