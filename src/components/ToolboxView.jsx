import React, { useState, useEffect } from 'react';
import Calculator from './tools/Calculator';
import QrGen from './tools/QrGen';

const TOOLS = [
    { id: 'calculator', title: 'Calculator', icon: 'calculate', category: 'Productivity', component: Calculator },
    { id: 'qr-gen', title: 'QR Gen', icon: 'qr_code_2', category: 'Productivity', component: QrGen },
    // Adding more tools as needed, but for now focusing on structure
    { id: 'notes', title: 'Notes', icon: 'description', category: 'Personal' },
    { id: 'password-gen', title: 'Password', icon: 'vpn_key', category: 'Utilities' },
];

const ToolboxView = ({ searchQuery }) => {
  const [activeToolId, setActiveToolId] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [pinnedTools, setPinnedTools] = useState(JSON.parse(localStorage.getItem('hub_pinned_tools') || '[]'));

  useEffect(() => {
    localStorage.setItem('hub_pinned_tools', JSON.stringify(pinnedTools));
  }, [pinnedTools]);

  const togglePin = (e, id) => {
    e.stopPropagation();
    if (pinnedTools.includes(id)) {
      setPinnedTools(pinnedTools.filter(t => t !== id));
    } else {
      setPinnedTools([...pinnedTools, id]);
    }
  };

  const filteredTools = TOOLS.filter(t => {
    const matchesSearch = !searchQuery ||
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCat = activeCategory === 'All' || t.category === activeCategory;

    return matchesSearch && matchesCat;
  });

  const grouped = {};
  filteredTools.forEach(t => {
    (grouped[t.category] || (grouped[t.category] = [])).push(t);
  });

  const cats = Object.keys(grouped).sort();

  if (activeToolId) {
    const tool = TOOLS.find(t => t.id === activeToolId);
    return (
      <div className="tool-view">
        <div className="tool-view-header">
          <button className="icon-btn" onClick={() => setActiveToolId(null)} title="Back to Toolbox">
            <span className="material-icons">arrow_back</span>
          </button>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <span className="material-icons" style={{fontSize: '2rem', color: 'var(--primary)'}}>{tool.icon}</span>
            <h2 style={{margin: 0, fontSize: '1.75rem'}}>{tool.title}</h2>
          </div>
        </div>
        <div className="tool-container-inner">
          {tool.component ? <tool.component /> : <div style={{textAlign:'center', padding:'3rem', opacity:0.5}}>This tool is under development.</div>}
        </div>
      </div>
    );
  }

  return (
    <>
      <nav className="main-category-nav">
        <div className={`pill ${activeCategory === 'All' ? 'active' : ''}`} onClick={() => setActiveCategory('All')}>
          <span className="material-icons">home</span> <span>All</span>
        </div>
        {[...new Set(TOOLS.map(t => t.category))].sort().map(cat => (
          <div key={cat} className={`pill ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>
            <span className="material-icons">{getCategoryIcon(cat)}</span> <span>{cat}</span>
          </div>
        ))}
      </nav>

      <div className="toolbox-page-header">
        <h2>Toolbox</h2>
        <p>Collection of useful offline utilities.</p>
      </div>

      {cats.length === 0 ? (
        <div style={{textAlign:'center', color:'#888', marginTop:'3rem'}}>No tools found</div>
      ) : (
        cats.map(cat => (
          <div key={cat} className="category-section">
            <div className="category-header">
              <div className="category-title">
                <span className="material-icons">{getCategoryIcon(cat)}</span>
                {cat}
                <span className="count">{grouped[cat].length}</span>
              </div>
              <span className="material-icons expand-icon">expand_more</span>
            </div>
            <div className="category-grid">
              {grouped[cat].map((tool, idx) => (
                <div key={tool.id} className="card" style={{'--delay': idx}} onClick={() => setActiveToolId(tool.id)}>
                   <div className="card-actions">
                        <button className={`pin-btn ${pinnedTools.includes(tool.id) ? 'active' : ''}`} onClick={(e) => togglePin(e, tool.id)} title="Pin Tool">
                            <span className="material-icons">push_pin</span>
                        </button>
                   </div>
                   <div className="card-header">
                        <div className="card-icon" style={{display:'grid', placeItems:'center', background:'var(--bg)'}}>
                            <span className="material-icons">{tool.icon}</span>
                        </div>
                        <div className="card-title">{tool.title}</div>
                    </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </>
  );
};

const getCategoryIcon = (cat) => {
    const icons = {
        'Personal': 'person',
        'Productivity': 'auto_fix_high',
        'Utilities': 'construction',
        'Web Tools': 'public',
        'System': 'settings_input_component',
        'Dev Tools': 'terminal',
    };
    return icons[cat] || 'folder';
};

export default ToolboxView;
