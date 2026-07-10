import React, { useState, useEffect } from 'react';
import ToolResult from './ToolResult';

// Import subtools from AI Hub
import AiImageGen from './subtools/AiImageGen';
import AiChat from './subtools/AiChat';
import AiLocal from './subtools/AiLocal';

// Import subtools from Agent Lab
import AgentIngest from './subtools/AgentIngest';
import AgentGenerate from './subtools/AgentGenerate';
import AgentResults from './subtools/AgentResults';
import AgentSetup from './subtools/AgentSetup';

const AI_AGENT_TABS = [
  // AI Tools
  { id: 'image-gen', label: 'AI Image Gen', icon: 'image', category: 'AI' },
  { id: 'chat', label: 'AI Chat Assistant', icon: 'chat', category: 'AI' },
  { id: 'local', label: 'Local AI Utilities', icon: 'analytics', category: 'AI' },
  // Agent Tools
  { id: 'ingest', label: 'Code Ingestion', icon: 'upload_file', category: 'Agent' },
  { id: 'generate', label: 'Test Generation', icon: 'smart_toy', category: 'Agent' },
  { id: 'results', label: 'View Results', icon: 'list_alt', category: 'Agent' },
  { id: 'setup', label: 'API Setup', icon: 'settings', category: 'Agent' }
];

const AiAgentHub = ({ toolId, onSubtoolChange }) => {
  const [activeTab, setActiveTab] = useState(null);

  // Agent specific state
  const [apiKey, setApiKey] = useState(localStorage.getItem('agent_openai_key') || '');
  const [knowledgeBase, setKnowledgeBase] = useState(JSON.parse(localStorage.getItem('agent_knowledge_base') || '[]'));

  useEffect(() => {
    if (activeTab) {
      const current = AI_AGENT_TABS.find(t => t.id === activeTab);
      if (current && onSubtoolChange) onSubtoolChange(current.label);
    } else {
      if (onSubtoolChange) onSubtoolChange(null);
    }
  }, [activeTab, onSubtoolChange]);

  useEffect(() => {
    if (toolId) {
      const mapping = {
        'ai-chat': 'chat',
        'chat': 'chat',
        'ai-image': 'image-gen',
        'image-gen': 'image-gen',
        'ai-sentiment': 'local',
        'local': 'local',
        'sentiment': 'local',
        'agent-ingest': 'ingest',
        'ingest': 'ingest',
        'agent-generate': 'generate',
        'generate': 'generate',
        'agent-results': 'results',
        'results': 'results',
        'agent-setup': 'setup',
        'setup': 'setup'
      };
      if (mapping[toolId]) setActiveTab(mapping[toolId]);
      else if (AI_AGENT_TABS.some(t => t.id === toolId)) setActiveTab(toolId);
    }
  }, [toolId]);

  const handleClearKnowledge = () => {
    setKnowledgeBase([]);
    localStorage.removeItem('agent_knowledge_base');
  };

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
            <span className="material-icons" style={{fontSize: '1.1rem'}}>psychology</span>
            AI & Agent Hub
          </div>
          <button className="pill" onClick={closeHub}>
            <span className="material-icons" style={{fontSize: '1.1rem'}}>close</span>
            Exit Category
          </button>
        </div>

        <div className="category-section mb-20">
          <div className="category-title mb-10 opacity-6 uppercase smallest font-bold tracking-wider">AI Utilities</div>
          <div className="category-grid">
            {AI_AGENT_TABS.filter(t => t.category === 'AI').map(tab => (
              <div key={tab.id} className="card cursor-pointer" onClick={() => setActiveTab(tab.id)}>
                <div className="card-body">
                  <div className="card-icon flex-center">
                    <span className="material-icons">{tab.icon}</span>
                  </div>
                  <div className="card-title">{tab.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="category-section mb-20">
          <div className="category-title mb-10 opacity-6 uppercase smallest font-bold tracking-wider">Agent Lab</div>
          <div className="category-grid">
            {AI_AGENT_TABS.filter(t => t.category === 'Agent').map(tab => (
              <div key={tab.id} className="card cursor-pointer" onClick={() => setActiveTab(tab.id)}>
                <div className="card-body">
                  <div className="card-icon flex-center">
                    <span className="material-icons">{tab.icon}</span>
                  </div>
                  <div className="card-title">{tab.label}</div>
                </div>
              </div>
            ))}
          </div>
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
        {/* AI Hub Content */}
        {activeTab === 'image-gen' && <AiImageGen />}
        {activeTab === 'chat' && <AiChat />}
        {activeTab === 'local' && <AiLocal />}

        {/* Agent Lab Content */}
        {activeTab === 'setup' && <AgentSetup apiKey={apiKey} setApiKey={setApiKey} onClearKB={handleClearKnowledge} />}
        {activeTab === 'ingest' && <AgentIngest setKB={setKnowledgeBase} currentKB={knowledgeBase} />}
        {activeTab === 'generate' && <AgentGenerate apiKey={apiKey} knowledgeBase={knowledgeBase} />}
        {activeTab === 'results' && <AgentResults />}
      </div>
    </div>
  );
};

export default AiAgentHub;
