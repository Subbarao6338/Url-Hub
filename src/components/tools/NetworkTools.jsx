import React, { useState, useEffect } from 'react';

// Import subtools
import SubnetCalc from './subtools/SubnetCalc';
import SpeedTest from './subtools/SpeedTest';
import IpInfo from './subtools/IpInfo';
import DnsLookup from './subtools/DnsLookup';
import WhoisLookup from './subtools/WhoisLookup';
import SslChecker from './subtools/SslChecker';
import PingTester from './subtools/PingTester';
import GeoTool from './subtools/GeoTool';
import BluetoothScanner from './subtools/BluetoothScanner';

const NETWORK_CATEGORIES = [
  {
    id: 'connectivity',
    title: 'Connectivity',
    tools: [
      { id: 'ping', label: 'Ping Tester', icon: 'network_check', description: 'Check latency and reachability of a host.' },
      { id: 'speed', label: 'Speed Test', icon: 'speed', description: 'Measure your internet connection speed.' },
      { id: 'dns', label: 'DNS Lookup', icon: 'language', description: 'Retrieve DNS records for a domain.' },
      { id: 'whois', label: 'WHOIS Record', icon: 'person_search', description: 'Look up domain registration information.' },
    ]
  },
  {
    id: 'diagnostics',
    title: 'Diagnostics & Security',
    tools: [
      { id: 'ip-info', label: 'IP Information', icon: 'info', description: 'Get details about an IP address.' },
      { id: 'geo', label: 'Geolocation', icon: 'my_location', description: 'Find the geographic location of an IP.' },
      { id: 'ssl', label: 'SSL Checker', icon: 'verified_user', description: 'Verify SSL/TLS certificate status.' },
    ]
  },
  {
    id: 'utilities',
    title: 'Utilities',
    tools: [
      { id: 'subnet', label: 'Subnet Calc', icon: 'view_list', description: 'Calculate subnets and IP ranges.' },
      { id: 'bluetooth', label: 'BT Scanner', icon: 'bluetooth', description: 'Scan for nearby Bluetooth devices.' },
    ]
  }
];

const NetworkTools = ({ toolId, onSubtoolChange }) => {
  const [activeTab, setActiveTab] = useState(null);

  useEffect(() => {
    if (activeTab) {
      let current = null;
      for (const cat of NETWORK_CATEGORIES) {
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
      const exists = NETWORK_CATEGORIES.some(cat => cat.tools.some(t => t.id === toolId));
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
            <span className="material-icons" style={{fontSize: '1.1rem'}}>router</span>
            Network Hub
          </div>
          <button className="pill" onClick={closeHub}>
            <span className="material-icons" style={{fontSize: '1.1rem'}}>close</span>
            Exit Category
          </button>
        </div>

        {NETWORK_CATEGORIES.map(category => (
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
        {activeTab === 'ip-info' && <IpInfo />}
        {activeTab === 'dns' && <DnsLookup />}
        {activeTab === 'whois' && <WhoisLookup />}
        {activeTab === 'ssl' && <SslChecker />}
        {activeTab === 'subnet' && <SubnetCalc />}
        {activeTab === 'speed' && <SpeedTest />}
        {activeTab === 'ping' && <PingTester />}
        {activeTab === 'geo' && <GeoTool />}
        {activeTab === 'bluetooth' && <BluetoothScanner />}
      </div>
    </div>
  );
};

export default NetworkTools;
