import React, { useState, useEffect } from 'react';
import Calculator from './tools/Calculator';
import QrGen from './tools/QrGen';
import PasswordGenerator from './tools/PasswordGenerator';
import UnitConverter from './tools/UnitConverter';
import Stopwatch from './tools/Stopwatch';
import Notes from './tools/Notes';
import Translate from './tools/Translate';
import MorseCode from './tools/MorseCode';
import AgeCalculator from './tools/AgeCalculator';
import BMICalculator from './tools/BMICalculator';
import ColorPicker from './tools/ColorPicker';
import TimestampConverter from './tools/TimestampConverter';
import LoremIpsum from './tools/LoremIpsum';
import TextUtils from './tools/TextUtils';
import WordCounter from './tools/WordCounter';
import JsonFormatter from './tools/JsonFormatter';
import Base64Converter from './tools/Base64Converter';
import DeviceInfo from './tools/DeviceInfo';
import MarkdownPreview from './tools/MarkdownPreview';
import TeluguPanchangam from './tools/TeluguPanchangam';
import AiSummary from './tools/AiSummary';
import OmniHub from './tools/OmniHub';
import NetworkTools from './tools/NetworkTools';
import Cookies from './tools/Cookies';
import Inspect from './tools/Inspect';
import UrlTool from './tools/UrlTool';
import SecurityInfo from './tools/SecurityInfo';
import UserScripts from './tools/UserScripts';
import DiffViewer from './tools/DiffViewer';

const TOOLS = [
    { id: 'notes', title: 'Notes', icon: 'description', category: 'Personal', component: Notes },
    { id: 'ai-summary', title: 'AI Summary', icon: 'auto_fix_high', category: 'Productivity', component: AiSummary },
    { id: 'calculator', title: 'Calculator', icon: 'calculate', category: 'Productivity', component: Calculator },
    { id: 'qr-gen', title: 'QR Gen', icon: 'qr_code_2', category: 'Productivity', component: QrGen },
    { id: 'stopwatch', title: 'Stopwatch', icon: 'timer', category: 'Productivity', component: Stopwatch },
    { id: 'translate', title: 'Translate', icon: 'translate', category: 'Productivity', component: Translate },
    { id: 'age-calculator', title: 'Age', icon: 'calendar_today', category: 'Productivity', component: AgeCalculator },
    { id: 'bmi-calculator', title: 'BMI', icon: 'person', category: 'Productivity', component: BMICalculator },
    { id: 'color-picker', title: 'Color', icon: 'palette', category: 'Productivity', component: ColorPicker },
    { id: 'timestamp-conv', title: 'Timestamp', icon: 'schedule', category: 'Productivity', component: TimestampConverter },
    { id: 'password-gen', title: 'Password', icon: 'vpn_key', category: 'Utilities', component: PasswordGenerator },
    { id: 'unit-converter', title: 'Converter', icon: 'balance', category: 'Utilities', component: UnitConverter },
    { id: 'panchangam', title: 'Panchangam', icon: 'auto_awesome', category: 'Utilities', component: TeluguPanchangam },
    { id: 'lorem-ipsum', title: 'Lorem Ipsum', icon: 'notes', category: 'Utilities', component: LoremIpsum },
    { id: 'text-utils', title: 'Text Tools', icon: 'title', category: 'Utilities', component: TextUtils },
    { id: 'word-counter', title: 'Word Counter', icon: 'format_list_numbered', category: 'Utilities', component: WordCounter },
    { id: 'omni-hub', title: 'Omni Hub', icon: 'public', category: 'Web Tools', component: OmniHub },
    { id: 'network-tools', title: 'Network', icon: 'timeline', category: 'Web Tools', component: NetworkTools },
    { id: 'cookies', title: 'Cookies', icon: 'cookie', category: 'Web Tools', component: Cookies },
    { id: 'inspect', title: 'Inspect', icon: 'search', category: 'Web Tools', component: Inspect },
    { id: 'json-formatter', title: 'JSON', icon: 'code', category: 'Web Tools', component: JsonFormatter },
    { id: 'base64-converter', title: 'Base64', icon: 'transform', category: 'Web Tools', component: Base64Converter },
    { id: 'url-tool', title: 'URL Tool', icon: 'link', category: 'Web Tools', component: UrlTool },
    { id: 'morse', title: 'Morse', icon: 'timeline', category: 'Web Tools', component: MorseCode },
    { id: 'device-info', title: 'Device', icon: 'memory', category: 'System', component: DeviceInfo },
    { id: 'security-info', title: 'Security', icon: 'verified_user', category: 'System', component: SecurityInfo },
    { id: 'user-scripts', title: 'User Scripts', icon: 'add', category: 'Dev Tools', component: UserScripts },
    { id: 'markdown-preview', title: 'Markdown', icon: 'article', category: 'Dev Tools', component: MarkdownPreview },
    { id: 'diff-viewer', title: 'Diff Viewer', icon: 'difference', category: 'Dev Tools', component: DiffViewer },
];

const ToolboxView = ({ searchQuery, groupToolbox, showStats }) => {
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

  const stats = {};
  TOOLS.forEach(t => {
    stats[t.category] = (stats[t.category] || 0) + 1;
  });

  const highlightText = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

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

      {filteredTools.length === 0 ? (
        <div style={{textAlign:'center', color:'#888', marginTop:'3rem'}}>No tools found</div>
      ) : !groupToolbox ? (
        <div className="category-grid" style={{padding: '0 10px'}}>
           {filteredTools.map((tool, idx) => (
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
                      <div className="card-title" dangerouslySetInnerHTML={{ __html: highlightText(tool.title, searchQuery) }} />
                  </div>
              </div>
            ))}
        </div>
      ) : (
        cats.map(cat => (
          <div key={cat} className="category-section">
            <div className="category-header">
              <div className="category-title">
                <span className="material-icons">{getCategoryIcon(cat)}</span>
                {cat}
                {showStats && <span className="count">{grouped[cat].length}</span>}
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
                                    <div className="card-title" dangerouslySetInnerHTML={{ __html: highlightText(tool.title, searchQuery) }} />
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
