import React from 'react';

const TabBar = ({ currentTab, setTab, onAddClick }) => {
  return (
    <nav className="tab-bar">
      <div className="tab-group" id="group-toolbox">
        <div
          id="tab-toolbox"
          className={`tab-item ${currentTab === 'toolbox' ? 'active' : ''}`}
          onClick={() => setTab('toolbox')}
          title="Toolbox"
        >
          <span className="material-icons">handyman</span>
          <span className="tab-name">Toolbox</span>
        </div>
      </div>
      <div className="tab-group" id="group-bookmarks">
        <div
          id="tab-bookmarks"
          className={`tab-item ${currentTab === 'bookmarks' ? 'active' : ''}`}
          onClick={() => setTab('bookmarks')}
          title="Bookmarks"
        >
          <span className="material-icons">bookmarks</span>
          <span className="tab-name">Bookmarks</span>
        </div>
        <button className="icon-btn" onClick={onAddClick} title="Add Bookmark">
          <span className="material-icons">add</span>
        </button>
      </div>
      <div className="tab-group" id="group-projects">
        <div
          id="tab-projects"
          className={`tab-item ${currentTab === 'projects' ? 'active' : ''}`}
          onClick={() => setTab('projects')}
          title="Projects"
        >
          <span className="material-icons">rocket_launch</span>
          <span className="tab-name">Projects</span>
        </div>
      </div>
    </nav>
  );
};

export default TabBar;
