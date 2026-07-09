import React, { useState, useEffect } from 'react';

// Import subtools
import DataViewer from './subtools/DataViewer';
import SyntheticDataTool from './subtools/SyntheticDataTool';
import MockDataGenerator from './subtools/MockDataGenerator';
import DataAnonymizer from './subtools/DataAnonymizer';
import ReconciliationTool from './subtools/ReconciliationTool';
import ImageLab from './subtools/ImageLab';
import JsonCsvConverter from './subtools/JsonCsvConverter';
import DataScienceHub from './subtools/DataScienceHub';
import AdvancedDataHub from './subtools/AdvancedDataHub';
import FinanceHub from './subtools/FinanceHub';

const DATA_CATEGORIES = [
  {
    id: 'analysis-viz',
    title: 'Analysis & Visualization',
    tools: [
      { id: 'viewer', label: 'Data Viewer', icon: 'table_view', description: 'View and explore CSV/JSON datasets.' },
      { id: 'science', label: 'Data Science', icon: 'science', description: 'Statistical analysis and data exploration.' },
      { id: 'adv-data', label: 'Advanced Hub', icon: 'analytics', description: 'Advanced data transformation and insights.' },
      { id: 'reconcile', label: 'Reconciliation', icon: 'rule', description: 'Compare and reconcile two datasets.' },
    ]
  },
  {
    id: 'processing-cleaning',
    title: 'Processing & Cleaning',
    tools: [
      { id: 'anonymizer', label: 'Anonymizer', icon: 'fingerprint', description: 'Mask sensitive PII data in datasets.' },
      { id: 'json-csv', label: 'JSON ↔ CSV', icon: 'swap_calls', description: 'Convert between JSON and CSV formats.' },
      { id: 'image-lab', label: 'Image Lab', icon: 'biotech', description: 'Data-driven image processing tools.' },
    ]
  },
  {
    id: 'mock-finance',
    title: 'Mock & Finance',
    tools: [
      { id: 'mock', label: 'Mock Generator', icon: 'reorder', description: 'Generate mock datasets for testing.' },
      { id: 'synthetic', label: 'Synthetic Gen', icon: 'dns', description: 'Create synthetic data based on patterns.' },
      { id: 'finance', label: 'Finance Hub', icon: 'payments', description: 'Financial calculations and data analysis.' },
    ]
  }
];

const DataTools = ({ toolId, onSubtoolChange }) => {
  const [activeTab, setActiveTab] = useState(null);
  const [globalData, setGlobalData] = useState(null);

  useEffect(() => {
    if (activeTab) {
      let current = null;
      for (const cat of DATA_CATEGORIES) {
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
      const exists = DATA_CATEGORIES.some(cat => cat.tools.some(t => t.id === toolId));
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
            <span className="material-icons" style={{fontSize: '1.1rem'}}>insights</span>
            Data Science
          </div>
          <button className="pill" onClick={closeHub}>
            <span className="material-icons" style={{fontSize: '1.1rem'}}>close</span>
            Exit Category
          </button>
        </div>

        {DATA_CATEGORIES.map(category => (
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
        {activeTab === 'viewer' && <DataViewer setGlobalData={setGlobalData} setRawFile={() => {}} />}
        {activeTab === 'science' && <DataScienceHub data={globalData} />}
        {activeTab === 'adv-data' && <AdvancedDataHub data={globalData} />}
        {activeTab === 'reconcile' && <ReconciliationTool />}
        {activeTab === 'synthetic' && <SyntheticDataTool data={globalData} />}
        {activeTab === 'image-lab' && <ImageLab />}
        {activeTab === 'anonymizer' && <DataAnonymizer data={globalData} />}
        {activeTab === 'json-csv' && <JsonCsvConverter />}
        {activeTab === 'mock' && <MockDataGenerator />}
        {activeTab === 'finance' && <FinanceHub />}
      </div>
    </div>
  );
};

export default DataTools;
