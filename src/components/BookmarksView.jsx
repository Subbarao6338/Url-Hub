import React, { useState, useEffect } from 'react';

const BookmarksView = ({ profileId, searchQuery, onEdit, onDelete, onPin, pinnedIds, refreshTrigger }) => {
  const [links, setLinks] = useState([]);
  const [categories, setCategories] = useState({});
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/links?profile_id=${profileId}`).then(res => res.json()),
      fetch(`/api/categories?profile_id=${profileId}`).then(res => res.json())
    ]).then(([linksData, catsData]) => {
      setLinks(linksData);
      const catsMap = {};
      catsData.forEach(c => catsMap[c.name] = c.icon);
      setCategories(catsMap);
      setLoading(false);
    }).catch(err => {
      console.error("Failed to fetch bookmarks:", err);
      setLoading(false);
    });
  }, [profileId, refreshTrigger]);

  const filteredLinks = links.filter(l => {
    if (l.is_internal) return false;

    const matchesSearch = !searchQuery ||
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.url.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesCat = true;
    if (!searchQuery) {
      if (activeCategory === 'Pinned') matchesCat = pinnedIds.includes(l.id);
      else if (activeCategory !== 'All') matchesCat = l.category === activeCategory;
    }

    return matchesSearch && matchesCat;
  });

  const grouped = {};
  filteredLinks.forEach(l => {
    (grouped[l.category] || (grouped[l.category] = [])).push(l);
  });

  const cats = Object.keys(grouped).sort();

  if (loading) return <div style={{textAlign:'center', padding:'3rem', opacity:0.5}}>Loading bookmarks...</div>;

  return (
    <>
      <nav className="main-category-nav">
        <div className={`pill ${activeCategory === 'All' ? 'active' : ''}`} onClick={() => setActiveCategory('All')}>
          <span className="material-icons">home</span> <span>All</span>
        </div>
        <div className={`pill ${activeCategory === 'Pinned' ? 'active' : ''}`} onClick={() => setActiveCategory('Pinned')}>
          <span className="material-icons">push_pin</span> <span>Pinned</span>
        </div>
        {Object.keys(categories).sort().map(cat => (
          <div key={cat} className={`pill ${activeCategory === cat ? 'active' : ''}`} onClick={() => setActiveCategory(cat)}>
            <span className="material-icons">{categories[cat] || 'folder'}</span> <span>{cat}</span>
          </div>
        ))}
      </nav>

      <div className="toolbox-page-header">
        <h2>Bookmarks</h2>
        <p>Access your favorite links and resources.</p>
      </div>

      {cats.length === 0 ? (
        <div style={{textAlign:'center', color:'#888', marginTop:'3rem'}}>No bookmarks found</div>
      ) : (
        cats.map(cat => (
          <div key={cat} className="category-section">
            <div className="category-header">
              <div className="category-title">
                <span className="material-icons">{categories[cat] || 'folder'}</span>
                {cat}
                <span className="count">{grouped[cat].length}</span>
              </div>
              <span className="material-icons expand-icon">expand_more</span>
            </div>
            <div className="category-grid">
              {grouped[cat].map((link, idx) => (
                <div key={link.id} className="card" style={{'--delay': idx}} onClick={() => window.open(link.url, '_blank')}>
                  <div className="card-header">
                    <BookmarkIcon link={link} categoryIcon={categories[cat] || 'link'} />
                    <div className="card-title">{link.title}</div>
                  </div>
                  <div className="card-url">
                    {new URL(link.url.startsWith('http') ? link.url : 'http://' + link.url).hostname}
                    {link.urls && link.urls.length > 1 && <span className="fallback-badge">{link.urls.length} URLs</span>}
                  </div>
                  <div className="card-actions" onClick={e => e.stopPropagation()}>
                    <button className={`pin-btn ${pinnedIds.includes(link.id) ? 'active' : ''}`} onClick={() => onPin(link.id)}>
                      <span className="material-icons">push_pin</span>
                    </button>
                    <button onClick={() => onEdit(link)}><span className="material-icons">edit</span></button>
                    <button className="btn-delete" onClick={() => onDelete(link.id)}><span className="material-icons">delete</span></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </>
  );
};

const BookmarkIcon = ({ link, categoryIcon }) => {
  const [src, setSrc] = useState(link.icon || `https://www.google.com/s2/favicons?domain=${new URL(link.url.startsWith('http') ? link.url : 'http://' + link.url).hostname}&sz=64`);
  const [errorCount, setErrorCount] = useState(0);

  const handleError = () => {
    if (errorCount === 0 && link.optional_icon) {
      setSrc(link.optional_icon);
    } else if (errorCount === 1) {
      const hostname = new URL(link.url.startsWith('http') ? link.url : 'http://' + link.url).hostname;
      setSrc(`https://icons.duckduckgo.com/ip3/${hostname}.ico`);
    } else {
      setSrc(null); // Will render fallback
    }
    setErrorCount(errorCount + 1);
  };

  if (!src) return <div className="card-icon" style={{display:'grid', placeItems:'center', background:'var(--bg)'}}><span className="material-icons">{categoryIcon}</span></div>;

  if (src.length < 5 && !src.includes('/') && !src.includes('.')) {
    // Likely emoji or material icon name
    const isMaterialIcon = /^[a-z0-9_]+$/.test(src);
    return (
      <div className="card-icon" style={{display:'grid', placeItems:'center', background:'var(--bg)', fontSize: isMaterialIcon ? 'inherit' : '24px'}}>
        {isMaterialIcon ? <span className="material-icons">{src}</span> : src}
      </div>
    );
  }

  return <img src={src} className="card-icon" loading="lazy" onError={handleError} alt="" />;
};

export default BookmarksView;
