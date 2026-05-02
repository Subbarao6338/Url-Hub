import React from 'react';

const SearchOverlay = ({ active, query, onChange, onClear, currentTab }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const cards = document.querySelectorAll('.card');
        if (cards.length === 0) return;

        const activeIdx = Array.from(cards).findIndex(c => c === document.activeElement);
        let nextIdx = e.key === 'ArrowDown' ? activeIdx + 1 : activeIdx - 1;

        if (nextIdx < 0) nextIdx = cards.length - 1;
        if (nextIdx >= cards.length) nextIdx = 0;

        cards[nextIdx].focus();
    }
  };

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
        onKeyDown={handleKeyDown}
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
