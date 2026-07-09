import React, { useState, useEffect } from 'react';

// Import subtools
import SizeGuide from './subtools/SizeGuide';
import FashionGuide from './subtools/FashionGuide';
import TraditionalGuide from './subtools/TraditionalGuide';

const FASHION_TOOLS = [
  { id: 'size-guide', label: 'Size & Body Guide', icon: 'straighten', description: 'Comprehensive size charts for all clothing types.' },
  { id: 'shoes', label: 'Footwear Guide', icon: 'run_circle', description: 'International shoe size conversions and foot measurements.' },
  { id: 'accessories', label: 'Accessories Guide', icon: 'watch', description: 'Ring, hat, glove, and belt size calculations.' },
  { id: 'fashion-guide', label: 'Fashion Guide', icon: 'checkroom', description: 'Body shape styling, dress guides, and modern trends.' },
  { id: 'clothes-guide', label: 'Clothes Guide', icon: 'dry_cleaning', description: 'Material care, fabric types, and wardrobe essentials.' },
  { id: 'traditional-guide', label: 'Traditional & Tribal', icon: 'temple_hindu', description: 'Indian ethnic, world traditional, and tribal styles.' },
  { id: 'worldwide', label: 'World Fashion', icon: 'public', description: 'Explore clothing styles from all countries.' },
];

const FashionTools = ({ toolId, onSubtoolChange }) => {
  const [activeTab, setActiveTab] = useState(null);

  useEffect(() => {
    if (activeTab) {
      const current = FASHION_TOOLS.find(t => t.id === activeTab);
      if (current && onSubtoolChange) onSubtoolChange(current.label);
    } else {
      if (onSubtoolChange) onSubtoolChange(null);
    }
  }, [activeTab, onSubtoolChange]);

  useEffect(() => {
    if (toolId) {
       const exists = FASHION_TOOLS.some(t => t.id === toolId);
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
            <span className="material-icons" style={{fontSize: '1.1rem'}}>checkroom</span>
            Fashion Hub
          </div>
          <button className="pill" onClick={closeHub}>
            <span className="material-icons" style={{fontSize: '1.1rem'}}>close</span>
            Exit Category
          </button>
        </div>

        <div className="category-grid">
          {FASHION_TOOLS.map(tab => (
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
        {activeTab === 'size-guide' && <SizeGuide allowedTabs={['clothing', 'traditional', 'inners', 'body']} />}
        {activeTab === 'shoes' && <SizeGuide initialTab="shoes" allowedTabs={['shoes']} />}
        {activeTab === 'accessories' && <SizeGuide initialTab="rings" allowedTabs={['rings']} />}
        {activeTab === 'fashion-guide' && <FashionGuide allowedTabs={['body-shape', 'style-types']} />}
        {activeTab === 'clothes-guide' && <FashionGuide initialTab="fabrics" allowedTabs={['fabrics']} />}
        {activeTab === 'traditional-guide' && <TraditionalGuide />}
        {activeTab === 'worldwide' && <TraditionalGuide initialRegion="Middle East & North Africa" />}
      </div>
    </div>
  );
};

export default FashionTools;
