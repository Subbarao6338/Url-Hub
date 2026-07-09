import React, { useState, useEffect } from 'react';

// Import subtools
import PdfHub from './subtools/PdfHub';
import ImageHub from './subtools/ImageHub';
import TextHub from './subtools/TextHub';
import MarkdownEditor from './subtools/MarkdownEditor';
import DocTranslator from './subtools/DocTranslator';
import BatchConverter from './subtools/BatchConverter';
import DocxToMd from './subtools/DocxToMd';
import OcrTool from './subtools/OcrTool';

const DOC_CATEGORIES = [
  {
    id: 'pdf-docs',
    title: 'PDF & Documents',
    tools: [
      { id: 'pdf', label: 'PDF Hub', icon: 'picture_as_pdf', description: 'Split, merge, and convert PDF files.' },
      { id: 'docx-md', label: 'Word to MD', icon: 'description', description: 'Convert Word documents (.docx) to Markdown.' },
      { id: 'doc-translator', label: 'Doc Translator', icon: 'translate', description: 'Translate document files between languages.' },
    ]
  },
  {
    id: 'images-media',
    title: 'Images & Media',
    tools: [
      { id: 'image', label: 'Image Hub', icon: 'image', description: 'Resize, compress, and edit images.' },
      { id: 'ocr', label: 'Image OCR', icon: 'document_scanner', description: 'Extract text from images using OCR.' },
      { id: 'batch', label: 'Batch Converter', icon: 'layers', description: 'Convert multiple files at once.' },
    ]
  },
  {
    id: 'text-editing',
    title: 'Text & Editing',
    tools: [
      { id: 'text', label: 'Text Hub', icon: 'text_fields', description: 'Clean, format, and analyze text content.' },
      { id: 'md-editor', label: 'Markdown Editor', icon: 'edit_note', description: 'Live Markdown editor with preview.' },
    ]
  }
];

const DocTools = ({ toolId, onSubtoolChange }) => {
  const [activeTab, setActiveTab] = useState(null);

  useEffect(() => {
    if (activeTab) {
      let current = null;
      for (const cat of DOC_CATEGORIES) {
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
      const exists = DOC_CATEGORIES.some(cat => cat.tools.some(t => t.id === toolId));
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
            <span className="material-icons" style={{fontSize: '1.1rem'}}>description</span>
            Media & Docs
          </div>
          <button className="pill" onClick={closeHub}>
            <span className="material-icons" style={{fontSize: '1.1rem'}}>close</span>
            Exit Category
          </button>
        </div>

        {DOC_CATEGORIES.map(category => (
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
        {activeTab === 'pdf' && <PdfHub />}
        {activeTab === 'image' && <ImageHub />}
        {activeTab === 'text' && <TextHub />}
        {activeTab === 'md-editor' && <MarkdownEditor />}
        {activeTab === 'doc-translator' && <DocTranslator />}
        {activeTab === 'batch' && <BatchConverter />}
        {activeTab === 'docx-md' && <DocxToMd />}
        {activeTab === 'ocr' && <OcrTool />}
      </div>
    </div>
  );
};

export default DocTools;
