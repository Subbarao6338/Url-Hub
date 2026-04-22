import React from 'react';

const SearchOverlay = ({ active, query, onChange, onClear, onToggle, currentTab }) => {
  return (
    <div className={`search-container ${active ? 'active' : 'desktop-only'}`}>
      <button id="search-toggle" className="icon-btn" title="Search" onClick={onToggle}>
        <span className="material-icons">search</span>
      </button>
      <input
        type="search"
        id="search"
        placeholder={`Search ${currentTab.charAt(0).toUpperCase() + currentTab.slice(1)}... [/]`}
        value={query}
        onChange={(e) => onChange(e.target.value)}
        autoFocus
      />
      <button id="search-clear" className="search-clear-btn" title="Clear Search" onClick={onClear}>
        <span className="material-icons">close</span>
      </button>
    </div>
  );
};

export default SearchOverlay;
