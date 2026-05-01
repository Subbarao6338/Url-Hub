import React from 'react';

const SearchOverlay = ({ active, query, onChange, onClear, currentTab }) => {
  return (
    <div className={`search-container ${active ? 'active' : 'desktop-only'}`}>
      <span className="material-icons search-icon">search</span>
      <input
        type="search"
        id="search"
        placeholder={`Search ${currentTab.charAt(0).toUpperCase() + currentTab.slice(1)}... [/]`}
        value={query}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => e.target.select()}
      />
      {query && (
        <button id="search-clear" className="search-clear-btn" title="Clear Search" onClick={onClear}>
          <span className="material-icons">close</span>
        </button>
      )}
    </div>
  );
};

export default SearchOverlay;
