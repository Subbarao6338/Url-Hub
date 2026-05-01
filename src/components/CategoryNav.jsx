import React from 'react';

const CategoryNav = ({ categories, activeCategory, setActiveCategory, showStats, stats, totalCount, extraCategories = [] }) => {
  return (
    <nav className="main-category-nav scrollable-x">
      <div
        className={`pill ${activeCategory === 'All' ? 'active' : ''}`}
        onClick={() => setActiveCategory('All')}
      >
        <span className="material-icons">home</span>
        <span>All</span>
        {showStats && totalCount !== undefined && <span className="count">{totalCount}</span>}
      </div>

      {extraCategories.map(cat => (
        <div
          key={cat.name}
          className={`pill ${activeCategory === cat.name ? 'active' : ''}`}
          onClick={() => setActiveCategory(cat.name)}
        >
          <span className="material-icons">{cat.icon}</span>
          <span>{cat.name}</span>
          {showStats && cat.count !== undefined && <span className="count">{cat.count}</span>}
        </div>
      ))}

      {Object.keys(categories).sort().filter(c => c !== 'All' && !extraCategories.some(ec => ec.name === c)).map(cat => (
        <div
          key={cat}
          className={`pill ${activeCategory === cat ? 'active' : ''}`}
          onClick={() => setActiveCategory(cat)}
        >
          <span className="material-icons">{categories[cat] || 'folder'}</span>
          <span>{cat}</span>
          {showStats && stats && stats[cat] > 0 && <span className="count">{stats[cat]}</span>}
        </div>
      ))}
    </nav>
  );
};

export default CategoryNav;
