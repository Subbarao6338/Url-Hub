import React, { useState, useEffect } from 'react';

// Import subtools
import SqlFormatter from './subtools/SqlFormatter';
import PocketBaseConsole from './subtools/PocketBaseConsole';
import DiffViewer from './subtools/DiffViewer';
import RegexTester from './subtools/RegexTester';
import HashHmac from './subtools/HashHmac';
import QrBarcodeGen from './subtools/QrBarcodeGen';
import JsonToTs from './subtools/JsonToTs';
import ColorPicker from './subtools/ColorPicker';
import UnitConverter from './subtools/UnitConverter';
import KqlFormatter from './subtools/KqlFormatter';
import CurrencyConverter from './subtools/CurrencyConverter';
import JwtDebugger from './subtools/JwtDebugger';
import CronParser from './subtools/CronParser';
import CodeMinifier from './subtools/CodeMinifier';
import XmlTools from './subtools/XmlTools';
import CodeInspiration from './subtools/CodeInspiration';
import JsonFormatter from './subtools/JsonFormatter';
import Base64Tool from './subtools/Base64Tool';
import YamlJsonConverter from './subtools/YamlJsonConverter';
import OtpGenerator from './subtools/OtpGenerator';
import UrlTool from './subtools/UrlTool';
import PasswordTool from './subtools/PasswordTool';
import RsaTool from './subtools/RsaTool';

const DEV_CATEGORIES = [
  {
    id: 'web-data',
    title: 'Web & Data',
    tools: [
      { id: 'json-fmt', label: 'JSON Formatter', icon: 'data_object', description: 'Prettify and validate JSON data.' },
      { id: 'sql', label: 'SQL Formatter', icon: 'storage', description: 'Format SQL queries for better readability.' },
      { id: 'pocketbase', label: 'PocketBase Console', icon: 'sync_alt', description: 'Sync bookmarks & manage PocketBase DB with HTMX + Alpine + WASM.' },
      { id: 'xml-fmt', label: 'XML Formatter', icon: 'format_align_left', description: 'Format and validate XML documents.' },
      { id: 'xml-json', label: 'XML ↔ JSON', icon: 'transform', description: 'Convert between XML and JSON formats.' },
      { id: 'yaml', label: 'YAML ↔ JSON', icon: 'swap_horiz', description: 'Convert between YAML and JSON.' },
      { id: 'json-ts', label: 'JSON to TS', icon: 'code', description: 'Generate TypeScript interfaces from JSON.' },
      { id: 'kusto', label: 'KQL Formatter', icon: 'filter_alt', description: 'Format Kusto Query Language (KQL).' },
    ]
  },
  {
    id: 'security',
    title: 'Security & Auth',
    tools: [
      { id: 'security', label: 'Hash & HMAC', icon: 'security', description: 'Generate MD5, SHA-1, SHA-256 hashes.' },
      { id: 'password', label: 'Password Tool', icon: 'lock', description: 'Generate secure passwords.' },
      { id: 'rsa', label: 'RSA Key Gen', icon: 'vpn_key', description: 'Generate RSA public/private key pairs.' },
      { id: 'jwt', label: 'JWT Debugger', icon: 'verified_user', description: 'Decode and verify JSON Web Tokens.' },
      { id: 'otp', label: 'OTP Generator', icon: 'password', description: 'Generate One-Time Passwords.' },
    ]
  },
  {
    id: 'utilities',
    title: 'Utilities & Misc',
    tools: [
      { id: 'diff', label: 'Diff Viewer', icon: 'difference', description: 'Compare two pieces of text or code.' },
      { id: 'regex', label: 'Regex Tester', icon: 'find_replace', description: 'Test and debug regular expressions.' },
      { id: 'base64', label: 'Base64', icon: 'code', description: 'Encode and decode Base64 strings.' },
      { id: 'url', label: 'URL Tool', icon: 'link', description: 'Encode, decode, and parse URLs.' },
      { id: 'cron', label: 'Cron Parser', icon: 'today', description: 'Parse and explain cron expressions.' },
      { id: 'minifier', label: 'Code Minifier', icon: 'compress', description: 'Minify CSS, JS, and HTML.' },
      { id: 'converter', label: 'Unit Converter', icon: 'straighten', description: 'Convert between various units.' },
      { id: 'currency', label: 'Currency Converter', icon: 'currency_exchange', description: 'Real-time exchange rate calculations.' },
      { id: 'color', label: 'Color Picker', icon: 'palette', description: 'Pick and convert colors.' },
      { id: 'qr-barcode', label: 'QR & Barcode', icon: 'qr_code', description: 'Generate QR codes and barcodes.' },
      { id: 'inspiration', label: 'Code Inspiration', icon: 'lightbulb', description: 'Get random coding tips and quotes.' },
    ]
  }
];

const DevTools = ({ toolId, onSubtoolChange }) => {
  const [activeTab, setActiveTab] = useState(null);

  useEffect(() => {
    if (activeTab) {
      let current = null;
      for (const cat of DEV_CATEGORIES) {
        current = cat.tools.find(t => t.id === activeTab);
        if (current) break;
      }
      if (current && onSubtoolChange) onSubtoolChange(current.label);
    } else {
      if (onSubtoolChange) onSubtoolChange(null);
    }
  }, [activeTab, onSubtoolChange]);

  useEffect(() => {
    if (toolId) {
      const exists = DEV_CATEGORIES.some(cat => cat.tools.some(t => t.id === toolId));
      if (exists) setActiveTab(toolId);
    }
  }, [toolId]);

  const goBack = () => setActiveTab(null);
  const closeHub = () => {
    const url = new URL(window.location);
    url.searchParams.delete('tool');
    window.history.pushState({ tab: 'toolbox' }, '', url.toString());
    window.dispatchEvent(new PopStateEvent('popstate'));
  };

  if (!activeTab) {
    return (
      <div className="tool-form mt-20">
        <div className="flex-between mb-20">
          <div className="pill disabled" style={{opacity: 0.5}}>
            <span className="material-icons" style={{fontSize: '1.1rem'}}>terminal</span>
            Dev Hub
          </div>
          <button className="pill" onClick={closeHub}>
            <span className="material-icons" style={{fontSize: '1.1rem'}}>close</span>
            Exit Category
          </button>
        </div>

        {DEV_CATEGORIES.map(category => (
          <div key={category.id} className="category-section mb-20">
            <div className="category-title mb-10 opacity-6 uppercase smallest font-bold tracking-wider">
              {category.title}
            </div>
            <div className="category-grid">
              {category.tools.map(tab => (
                <div key={tab.id} className="card cursor-pointer" onClick={() => setActiveTab(tab.id)}>
                  <div className="card-body">
                    <div className="card-icon flex-center">
                      <span className="material-icons">{tab.icon}</span>
                    </div>
                    <div className="card-title-group">
                      <div className="card-title">{tab.label}</div>
                      <div className="card-subtitle small opacity-6">{tab.description}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="tool-form mt-20">
      <div className="flex-between mb-20">
        <button className="pill" onClick={goBack}>
          <span className="material-icons" style={{fontSize: '1.1rem'}}>arrow_back</span>
          Back to Hub
        </button>
        <button className="pill" onClick={closeHub}>
          <span className="material-icons" style={{fontSize: '1.1rem'}}>close</span>
          Exit Category
        </button>
      </div>

      <div className="hub-content animate-fadeIn">
        {activeTab === 'json-fmt' && <JsonFormatter />}
        {activeTab === 'sql' && <SqlFormatter />}
        {activeTab === 'pocketbase' && <PocketBaseConsole />}
        {activeTab === 'diff' && <DiffViewer />}
        {activeTab === 'regex' && <RegexTester />}
        {activeTab === 'security' && <HashHmac />}
        {activeTab === 'qr-barcode' && <QrBarcodeGen />}
        {activeTab === 'json-ts' && <JsonToTs />}
        {activeTab === 'color' && <ColorPicker />}
        {activeTab === 'converter' && <UnitConverter />}
        {activeTab === 'currency' && <CurrencyConverter />}
        {activeTab === 'kusto' && <KqlFormatter />}
        {activeTab === 'jwt' && <JwtDebugger />}
        {activeTab === 'cron' && <CronParser />}
        {activeTab === 'minifier' && <CodeMinifier />}
        {(activeTab === 'xml-fmt' || activeTab === 'xml-json') && <XmlTools />}
        {activeTab === 'url' && <UrlTool />}
        {activeTab === 'base64' && <Base64Tool />}
        {activeTab === 'yaml' && <YamlJsonConverter />}
        {activeTab === 'otp' && <OtpGenerator />}
        {activeTab === 'password' && <PasswordTool />}
        {activeTab === 'rsa' && <RsaTool />}
        {activeTab === 'inspiration' && <CodeInspiration />}
      </div>
    </div>
  );
};

export default DevTools;
