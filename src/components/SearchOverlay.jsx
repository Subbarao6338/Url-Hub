import React, { useEffect, useRef } from 'react';

const SearchOverlay = ({ active, query, onChange, onClear, onToggle, currentTab }) => {
  const inputRef = useRef(null);

  useEffect(() => {
    if (active && inputRef.current) {
      inputRef.current.focus();
    }
  }, [active]);

  return (
    <div className={`search-overlay ${active ? 'active' : ''}`}>
      <div className="search-header">
        <button className="icon-btn" onClick={onToggle} title="Back">
          <span className="material-icons">arrow_back</span>
        </button>
        <div className="search-input-wrapper">
          <span className="material-icons" style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>search</span>
          <input
            ref={inputRef}
            type="search"
            id="search-mobile"
            placeholder={`Search ${currentTab.charAt(0).toUpperCase() + currentTab.slice(1)}...`}
            value={query}
            onChange={(e) => onChange(e.target.value)}
          />
          {query && (
            <button className="search-clear-btn" onClick={onClear}>
              <span className="material-icons">close</span>
            </button>
          )}
        </div>
      </div>
      <div className="search-results">
        {/* Results are handled by the main views, this is just the UI for the search bar in the overlay */}
        <div style={{ textAlign: 'center', opacity: 0.5, marginTop: '2rem' }}>
          <span className="material-icons" style={{ fontSize: '3rem', marginBottom: '1rem' }}>manage_search</span>
          <p>Looking for something in the forest?</p>
        </div>
      </div>
    </div>
  );
};

export default SearchOverlay;
