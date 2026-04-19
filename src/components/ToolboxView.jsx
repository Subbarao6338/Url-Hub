import React, { useState, useEffect } from 'react';
import CategoryNav from './CategoryNav';
import Calculator from './tools/Calculator';
import QrGen from './tools/QrGen';
import PasswordGenerator from './tools/PasswordGenerator';
import UnitConverter from './tools/UnitConverter';
import CurrencyConverter from './tools/CurrencyConverter';
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
import WordRankCalculator from './tools/WordRankCalculator';
import JsonFormatter from './tools/JsonFormatter';
import CsvJsonConverter from './tools/CsvJsonConverter';
import ImageOptimizer from './tools/ImageOptimizer';
import Base64Converter from './tools/Base64Converter';
import DeviceInfo from './tools/DeviceInfo';
import AndroidSensors from './tools/AndroidSensors';
import PomodoroTimer from './tools/PomodoroTimer';
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
import AnomalyDetection from './tools/AnomalyDetection';
import HashGenerator from './tools/HashGenerator';
import GlassGenerator from './tools/GlassGenerator';
import JsonToCsv from './tools/JsonToCsv';
import DataQuality from './tools/DataQuality';
import DataAnonymizer from './tools/DataAnonymizer';
import Observability from './tools/Observability';
import DataPortal from './tools/DataPortal';
import AzureIntegration from './tools/AzureIntegration';
import SpecializedTools from './tools/SpecializedTools';
import UuidGenerator from './tools/UuidGenerator';
import DiceRoller from './tools/DiceRoller';
import CoinFlipper from './tools/CoinFlipper';
import Counter from './tools/Counter';
import MarkdownTable from './tools/MarkdownTable';

const TOOLS = [
    // Calculators
    { id: 'calculator', title: 'Calculator', icon: 'calculate', category: 'Calculators', component: Calculator },
    { id: 'age-calculator', title: 'Age Calculator', icon: 'calendar_today', category: 'Calculators', component: AgeCalculator },
    { id: 'bmi-calculator', title: 'BMI Calculator', icon: 'person', category: 'Calculators', component: BMICalculator },

    // Converters
    { id: 'unit-converter', title: 'Unit Converter', icon: 'balance', category: 'Converters', component: UnitConverter },
    { id: 'currency-converter', title: 'Currency', icon: 'payments', category: 'Converters', component: CurrencyConverter },
    { id: 'timestamp-conv', title: 'Timestamp', icon: 'schedule', category: 'Converters', component: TimestampConverter },
    { id: 'base64-converter', title: 'Base64', icon: 'transform', category: 'Converters', component: Base64Converter },

    // Text Tools
    { id: 'translate', title: 'Translate', icon: 'translate', category: 'Text Tools', component: Translate },
    { id: 'text-utils', title: 'Text Tools', icon: 'title', category: 'Text Tools', component: TextUtils },
    { id: 'word-counter', title: 'Word Counter', icon: 'format_list_numbered', category: 'Text Tools', component: WordCounter },
    { id: 'word-rank', title: 'Word Rank', icon: 'sort_by_alpha', category: 'Text Tools', component: WordRankCalculator },
    { id: 'lorem-ipsum', title: 'Lorem Ipsum', icon: 'notes', category: 'Text Tools', component: LoremIpsum },

    // Web Tools
    { id: 'qr-gen', title: 'QR Gen', icon: 'qr_code_2', category: 'Web Tools', component: QrGen },
    { id: 'url-tool', title: 'URL Tool', icon: 'link', category: 'Web Tools', component: UrlTool },
    { id: 'json-formatter', title: 'JSON Formatter', icon: 'code', category: 'Web Tools', component: JsonFormatter },
    { id: 'csv-json', title: 'CSV/JSON', icon: 'swap_horiz', category: 'Web Tools', component: CsvJsonConverter },
    { id: 'json-to-csv', title: 'JSON to CSV', icon: 'table_view', category: 'Web Tools', component: JsonToCsv },
    { id: 'network-tools', title: 'Network', icon: 'timeline', category: 'Web Tools', component: NetworkTools },
    { id: 'cookies', title: 'Cookies', icon: 'cookie', category: 'Web Tools', component: Cookies },
    { id: 'inspect', title: 'Inspect', icon: 'search', category: 'Web Tools', component: Inspect },
    { id: 'omni-hub', title: 'Omni Hub', icon: 'public', category: 'Web Tools', component: OmniHub },

    // Security
    { id: 'password-gen', title: 'Password', icon: 'vpn_key', category: 'Security', component: PasswordGenerator },
    { id: 'hash-gen', title: 'Hash Gen', icon: 'security', category: 'Security', component: HashGenerator },
    { id: 'uuid-gen', title: 'UUID Gen', icon: 'fingerprint', category: 'Security', component: UuidGenerator },
    { id: 'security-info', title: 'Security Info', icon: 'verified_user', category: 'Security', component: SecurityInfo },

    // System
    { id: 'device-info', title: 'Device Info', icon: 'memory', category: 'System', component: DeviceInfo },
    { id: 'android-sensors', title: 'Sensors', icon: 'sensors', category: 'System', component: AndroidSensors },

    // Dev Tools
    { id: 'markdown-preview', title: 'Markdown', icon: 'article', category: 'Dev Tools', component: MarkdownPreview },
    { id: 'markdown-table', title: 'MD Table', icon: 'grid_on', category: 'Dev Tools', component: MarkdownTable },
    { id: 'diff-viewer', title: 'Diff Viewer', icon: 'difference', category: 'Dev Tools', component: DiffViewer },
    { id: 'color-picker', title: 'Color Picker', icon: 'palette', category: 'Dev Tools', component: ColorPicker },
    { id: 'glass-gen', title: 'Glass Gen', icon: 'blur_on', category: 'Dev Tools', component: GlassGenerator },
    { id: 'user-scripts', title: 'User Scripts', icon: 'add', category: 'Dev Tools', component: UserScripts },

    // Misc
    { id: 'notes', title: 'Notes', icon: 'description', category: 'Misc', component: Notes },
    { id: 'pomodoro', title: 'Pomodoro', icon: 'timer', category: 'Misc', component: PomodoroTimer },
    { id: 'stopwatch', title: 'Stopwatch', icon: 'timer', category: 'Misc', component: Stopwatch },
    { id: 'ai-summary', title: 'AI Summary', icon: 'auto_fix_high', category: 'Misc', component: AiSummary },
    { id: 'counter', title: 'Counter', icon: 'add_circle_outline', category: 'Misc', component: Counter },
    { id: 'img-optimizer', title: 'Image Optimizer', icon: 'image', category: 'Misc', component: ImageOptimizer },
    { id: 'dice-roller', title: 'Dice Roller', icon: 'casino', category: 'Misc', component: DiceRoller },
    { id: 'coin-flipper', title: 'Coin Flip', icon: 'monetization_on', category: 'Misc', component: CoinFlipper },
    { id: 'panchangam', title: 'Panchangam', icon: 'auto_awesome', category: 'Misc', component: TeluguPanchangam },
    { id: 'morse', title: 'Morse', icon: 'timeline', category: 'Misc', component: MorseCode },

    // Graviton
    { id: 'anomaly-detection', title: 'Anomaly Detection', icon: 'notifications_active', category: 'Graviton', component: AnomalyDetection },
    { id: 'data-quality', title: 'Data Quality', icon: 'verified', category: 'Graviton', component: DataQuality },
    { id: 'data-anonymizer', title: 'Data Anonymizer', icon: 'security', category: 'Graviton', component: DataAnonymizer },
    { id: 'observability', title: 'Observability', icon: 'visibility', category: 'Graviton', component: Observability },
    { id: 'data-portal', title: 'Data Portal', icon: 'dashboard', category: 'Graviton', component: DataPortal },
    { id: 'azure-integration', title: 'Azure Functions', icon: 'cloud', category: 'Graviton', component: AzureIntegration },
    { id: 'specialized-tools', title: 'Specialized Tools', icon: 'construction', category: 'Graviton', component: SpecializedTools },
];

const ToolboxView = ({ searchQuery, groupToolbox, showStats, recentTools, setRecentTools, hideRecentTools }) => {
  const [activeToolId, setActiveToolId] = useState(null);
  const [currentResult, setCurrentResult] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [pinnedTools, setPinnedTools] = useState(JSON.parse(localStorage.getItem('hub_pinned_tools') || '[]'));

  useEffect(() => {
    localStorage.setItem('hub_pinned_tools', JSON.stringify(pinnedTools));
  }, [pinnedTools]);

  const togglePin = (e, id) => {
    e.stopPropagation();
    let newPinned;
    if (pinnedTools.includes(id)) {
      newPinned = pinnedTools.filter(t => t !== id);
    } else {
      newPinned = [id, ...pinnedTools];
    }
    setPinnedTools(newPinned);
    localStorage.setItem('hub_pinned_tools', JSON.stringify(newPinned));
  };

  const openTool = (id) => {
    setActiveToolId(id);
    setCurrentResult(null);
    const newRecents = [id, ...recentTools.filter(t => t !== id)].slice(0, 4);
    setRecentTools(newRecents);
    localStorage.setItem('hub_recent_tools', JSON.stringify(newRecents));
  };

  const handleShare = async (e, tool) => {
    e.stopPropagation();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `N Box - ${tool.title}`,
          text: `Check out the ${tool.title} tool on N Box dashboard!`,
          url: window.location.origin + window.location.pathname + `?tab=toolbox&tool=${tool.id}`
        });
      } catch (err) { console.error("Share failed:", err); }
    } else {
      navigator.clipboard.writeText(window.location.origin + window.location.pathname + `?tab=toolbox&tool=${tool.id}`);
      alert("Tool link copied to clipboard!");
    }
  };

  const filteredTools = TOOLS.filter(t => {
    let matchesSearch = true;
    let matchesCat = true;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (query.startsWith('cat:')) {
        const catQuery = query.replace('cat:', '').trim();
        matchesCat = t.category.toLowerCase().includes(catQuery);
        matchesSearch = true;
      } else {
        matchesSearch = t.title.toLowerCase().includes(query) ||
          t.category.toLowerCase().includes(query);
      }
    }

    if (!searchQuery || !searchQuery.toLowerCase().startsWith('cat:')) {
      if (activeCategory !== 'All') matchesCat = t.category === activeCategory;
    }

    return matchesSearch && matchesCat;
  });

  const grouped = {};
  filteredTools.forEach(t => {
    (grouped[t.category] || (grouped[t.category] = [])).push(t);
  });

  const cats = Object.keys(grouped).sort();

  const toggleCategoryCollapse = (cat) => {
    setCollapsedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const collapseAll = () => {
    const newCollapsed = {};
    cats.forEach(cat => newCollapsed[cat] = true);
    setCollapsedCategories(newCollapsed);
  };

  const expandAll = () => {
    setCollapsedCategories({});
  };

  const stats = {};
  TOOLS.forEach(t => {
    stats[t.category] = (stats[t.category] || 0) + 1;
  });

  const highlightText = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

  const handleCopyResult = () => {
    if (!currentResult?.text) return;
    navigator.clipboard.writeText(currentResult.text).then(() => {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    });
  };

  const handleDownloadResult = () => {
    if (!currentResult) return;
    const { text, blob, filename } = currentResult;
    const finalBlob = blob || new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(finalBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename || 'result.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (activeToolId) {
    const tool = TOOLS.find(t => t.id === activeToolId);
    return (
      <div className="tool-view">
        <div className="tool-view-header">
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <button className="icon-btn" onClick={() => setActiveToolId(null)} title="Back to Toolbox">
              <span className="material-icons">arrow_back</span>
            </button>
            <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
              <span className="material-icons" style={{fontSize: '2rem', color: 'var(--primary)'}}>{tool.icon}</span>
              <h2 style={{margin: 0, fontSize: '1.75rem'}}>{tool.title}</h2>
            </div>
          </div>
          <div style={{display: 'flex', gap: '10px'}}>
            {currentResult?.text && (
              <button className={`icon-btn ${copySuccess ? 'copy-success' : ''}`} onClick={handleCopyResult} title="Copy Result">
                <span className="material-icons">{copySuccess ? 'check' : 'content_copy'}</span>
              </button>
            )}
            {currentResult && (
              <button className="icon-btn" onClick={handleDownloadResult} title="Download Result">
                <span className="material-icons">download</span>
              </button>
            )}
          </div>
        </div>
        <div className="tool-container-inner">
          {tool.component ? <tool.component onResultChange={setCurrentResult} /> : <div style={{textAlign:'center', padding:'3rem', opacity:0.5}}>This tool is under development.</div>}
        </div>
      </div>
    );
  }

  const toolboxCategories = {};
  [...new Set(TOOLS.map(t => t.category))].forEach(cat => {
    toolboxCategories[cat] = getCategoryIcon(cat);
  });

  return (
    <>
      <CategoryNav
        categories={toolboxCategories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        showStats={showStats}
        stats={stats}
        totalCount={TOOLS.length}
      />

      <div className="toolbox-page-header">
        <h2>Toolbox</h2>
        <p>Collection of useful offline utilities.</p>
        {groupToolbox && cats.length > 0 && (
          <div className="pill-group" style={{justifyContent: 'center', marginTop: '1rem'}}>
            <button className="pill" onClick={collapseAll} style={{padding: '8px 16px', fontSize: '0.8rem'}}>
              <span className="material-icons" style={{fontSize: '1.1rem'}}>unfold_less</span> Collapse All
            </button>
            <button className="pill" onClick={expandAll} style={{padding: '8px 16px', fontSize: '0.8rem'}}>
              <span className="material-icons" style={{fontSize: '1.1rem'}}>unfold_more</span> Expand All
            </button>
          </div>
        )}
      </div>

      {activeCategory === 'All' && !searchQuery && (
        <div style={{ padding: '0 10px', marginBottom: '2rem' }}>
          {(pinnedTools.length > 0 || (recentTools.length > 0 && !hideRecentTools)) && (
            <div className="toolbox-special-sections" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
              {pinnedTools.length > 0 && (
                <div className="special-section">
                  <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', opacity: 0.6, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-icons" style={{ fontSize: '1.2rem' }}>push_pin</span> Pinned
                  </h3>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {pinnedTools.map(id => {
                      const tool = TOOLS.find(t => t.id === id);
                      if (!tool) return null;
                      return (
                        <div key={id} className="card" style={{ padding: '12px 16px', minHeight: 'unset', animation: 'none' }} onClick={() => openTool(tool.id)}>
                          <div className="card-header" style={{ marginBottom: 0, gap: '12px' }}>
                            <span className="material-icons" style={{ color: 'var(--primary)' }}>{tool.icon}</span>
                            <span style={{ fontWeight: 600 }}>{tool.title}</span>
                          </div>
                          <div className="card-actions">
                            <button className="pin-btn active" onClick={(e) => togglePin(e, tool.id)}><span className="material-icons">push_pin</span></button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {recentTools.length > 0 && !hideRecentTools && (
                <div className="special-section">
                  <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '1rem', opacity: 0.6, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-icons" style={{ fontSize: '1.2rem' }}>history</span> Recent
                  </h3>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {recentTools.filter(id => !pinnedTools.includes(id)).map(id => {
                      const tool = TOOLS.find(t => t.id === id);
                      if (!tool) return null;
                      return (
                        <div key={id} className="card" style={{ padding: '12px 16px', minHeight: 'unset', animation: 'none' }} onClick={() => openTool(tool.id)}>
                          <div className="card-header" style={{ marginBottom: 0, gap: '12px' }}>
                            <span className="material-icons" style={{ color: 'var(--text-muted)' }}>{tool.icon}</span>
                            <span style={{ fontWeight: 600 }}>{tool.title}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {filteredTools.length === 0 ? (
        <div style={{textAlign:'center', color:'#888', marginTop:'3rem'}}>No tools found</div>
      ) : !groupToolbox ? (
        <div className="category-grid" style={{padding: '0 10px'}}>
           {filteredTools.map((tool, idx) => (
              <div key={tool.id} className="card" style={{'--delay': idx}} onClick={() => openTool(tool.id)}>
                 <div className="card-actions">
                      <button className={`pin-btn ${pinnedTools.includes(tool.id) ? 'active' : ''}`} onClick={(e) => togglePin(e, tool.id)} title="Pin Tool">
                          <span className="material-icons">push_pin</span>
                      </button>
                      <button onClick={(e) => handleShare(e, tool)} title="Share Tool">
                          <span className="material-icons">share</span>
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
          <div key={cat} className={`category-section ${collapsedCategories[cat] ? 'collapsed' : ''}`}>
            <div className="category-header" onClick={() => toggleCategoryCollapse(cat)}>
              <div className="category-title">
                <span className="material-icons">{getCategoryIcon(cat)}</span>
                {cat}
                {showStats && <span className="count">{grouped[cat].length}</span>}
              </div>
              <span className="material-icons expand-icon">expand_more</span>
            </div>
            <div className="category-grid">
              {grouped[cat].map((tool, idx) => (
                <div key={tool.id} id={`card-${tool.id}`} className="card" style={{'--delay': idx}} onClick={() => openTool(tool.id)}>
                   <div className="card-actions">
                        <button className={`pin-btn ${pinnedTools.includes(tool.id) ? 'active' : ''}`} onClick={(e) => togglePin(e, tool.id)} title="Pin Tool">
                            <span className="material-icons">push_pin</span>
                        </button>
                        <button onClick={(e) => handleShare(e, tool)} title="Share Tool">
                            <span className="material-icons">share</span>
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
        'Calculators': 'calculate',
        'Converters': 'swap_horiz',
        'Text Tools': 'title',
        'Web Tools': 'public',
        'Security': 'security',
        'System': 'settings_input_component',
        'Dev Tools': 'terminal',
        'Misc': 'auto_fix_high',
        'Graviton': 'insights',
    };
    return icons[cat] || 'folder';
};

export default ToolboxView;
