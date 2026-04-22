import React, { useState, useEffect } from 'react';
import CategoryNav from './CategoryNav';
import NatureEmptyState from './NatureEmptyState';
import API_BASE from '../api';

const highlightText = (text, query) => {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
};

const BookmarksView = ({ profileId, searchQuery, onEdit, onDelete, onPin, refreshTrigger, hideUrls, hideIcons, showStats, openInNewTab }) => {
  const [links, setLinks] = useState([]);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [selectedLinkForUrls, setSelectedLinkForUrls] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const handleShare = async (link) => {
    if (navigator.share) {
      try {
        await navigator.share({ title: link.title, url: link.url });
      } catch (err) { console.error("Share failed:", err); }
    } else {
      navigator.clipboard.writeText(`${link.title}: ${link.url}`);
      alert("Link copied to clipboard!");
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };
  const [categories, setCategories] = useState({});
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [collapsedCategories, setCollapsedCategories] = useState({});

  useEffect(() => {
    if (!profileId) return;
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/links?profile_id=${profileId}`).then(res => res.json()),
      fetch(`${API_BASE}/categories?profile_id=${profileId}`).then(res => res.json())
    ]).then(([linksData, catsData]) => {
      setLinks(Array.isArray(linksData) ? linksData : []);
      const catsMap = {};
      if (Array.isArray(catsData)) {
        catsData.forEach(c => catsMap[c.name] = c.icon);
      }
      setCategories(catsMap);
      setLoading(false);
      setActiveCategory('All');
    }).catch(err => {
      console.error("Failed to fetch bookmarks:", err);
      setLoading(false);
      setLinks(null); // Set to null to indicate error
      setCategories({});
    });
  }, [profileId, refreshTrigger]);

  const currentLinks = Array.isArray(links) ? links : [];
  const filteredLinks = currentLinks.filter(l => {
    if (l.is_internal) return false;

    let matchesSearch = true;
    let matchesCat = true;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (query.startsWith('cat:')) {
        const catQuery = query.replace('cat:', '').trim();
        matchesCat = l.category.toLowerCase().includes(catQuery);
        matchesSearch = true; // category match is the search match
      } else {
        matchesSearch = l.title.toLowerCase().includes(query) ||
          l.category.toLowerCase().includes(query) ||
          l.url.toLowerCase().includes(query) ||
          (l.urls && l.urls.some(u => u.toLowerCase().includes(query)));
      }
    }

    if (!searchQuery || !searchQuery.toLowerCase().startsWith('cat:')) {
      if (activeCategory === 'Pinned') matchesCat = l.is_pinned;
      else if (activeCategory !== 'All') matchesCat = l.category === activeCategory;
    }

    return matchesSearch && matchesCat;
  });

  const grouped = {};
  filteredLinks.forEach(l => {
    (grouped[l.category] || (grouped[l.category] = [])).push(l);
  });

  const cats = Object.keys(grouped).sort();

  const toggleCategoryCollapse = (cat) => {
    setCollapsedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const collapseAll = () => {
    const newCollapsed = {};
    cats.forEach(cat => newCollapsed[cat] = true);
    setCollapsedCategories(newCollapsed);
  };

  const expandAll = () => {
    setCollapsedCategories({});
  };

  const stats = {};
  const visibleCategories = {};
  currentLinks.forEach(l => {
    if (l.is_internal) return;
    stats[l.category] = (stats[l.category] || 0) + 1;
    visibleCategories[l.category] = categories[l.category] || 'folder';
  });
  const totalCount = Object.values(stats).reduce((a, b) => a + b, 0);
  const pinnedCount = currentLinks.filter(l => l.is_pinned).length;

  if (loading) return (
    <div style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '2rem', overflowX: 'auto' }}>
            {[1,2,3,4,5].map(i => <div key={i} className="skeleton" style={{ width: '100px', height: '40px', borderRadius: '20px', flexShrink: 0 }} />)}
        </div>
        <div className="category-grid">
            {[1,2,3,4,5,6].map(i => (
                <div key={i} className="card skeleton" style={{ height: '120px' }}></div>
            ))}
        </div>
        <style>{`
            .skeleton {
                background: linear-gradient(90deg, var(--surface) 25%, var(--border) 50%, var(--surface) 75%);
                background-size: 200% 100%;
                animation: skeleton-loading 1.5s infinite;
            }
            @keyframes skeleton-loading {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
        `}</style>
    </div>
  );

  if (links === null) return (
    <div style={{textAlign:'center', padding:'3rem'}}>
      <span className="material-icons" style={{fontSize: '3rem', color: 'var(--danger)', marginBottom: '1rem'}}>error_outline</span>
      <h3 style={{marginBottom: '0.5rem'}}>Failed to load bookmarks</h3>
      <p style={{opacity: 0.7, marginBottom: '1rem'}}>Could not connect to the server.</p>
      <div style={{background: 'var(--surface)', padding: '1rem', borderRadius: '12px', fontSize: '0.8rem', marginBottom: '1.5rem', wordBreak: 'break-all', textAlign: 'left'}}>
        <strong>API Base:</strong> {API_BASE}
      </div>
      <button className="btn-primary" onClick={() => window.location.reload()}>
        <span className="material-icons" style={{fontSize: '1.1rem', verticalAlign: 'middle', marginRight: '4px'}}>refresh</span>
        Retry
      </button>
    </div>
  );

  if (!profileId) return (
    <div style={{textAlign:'center', padding:'3rem', opacity:0.5}}>
      <p>No profile selected.</p>
      <button className="btn-primary" style={{marginTop: '1rem'}} onClick={() => window.location.reload()}>Retry</button>
    </div>
  );

  const copyAllUrls = () => {
    const allUrls = selectedLinkForUrls.urls || [selectedLinkForUrls.url];
    navigator.clipboard.writeText(allUrls.join('\n'));
    alert("All URLs copied to clipboard!");
  };

  return (
    <>
      {isUrlModalOpen && selectedLinkForUrls && (
        <>
          <div className="modal-overlay" style={{display: 'block'}} onClick={() => setIsUrlModalOpen(false)}></div>
          <div className="modal" style={{display: 'block'}}>
            <h2>Select URL</h2>
            <div className="url-list">
              {(selectedLinkForUrls.urls || [selectedLinkForUrls.url]).map((url, i) => (
                <a key={i} href={url} target={openInNewTab ? '_blank' : '_self'} className="url-btn" onClick={() => setIsUrlModalOpen(false)}>
                  <span>{url}</span>
                  <span className="url-btn-icon">🔗</span>
                </a>
              ))}
            </div>
            <div className="form-actions" style={{justifyContent: 'space-between', alignItems: 'center'}}>
              <button type="button" className="btn-small" onClick={copyAllUrls} style={{margin: 0}}>
                <span className="material-icons" style={{fontSize: '1rem', verticalAlign: 'middle'}}>content_copy</span> Copy All
              </button>
              <button type="button" onClick={() => setIsUrlModalOpen(false)}>Cancel</button>
            </div>
          </div>
        </>
      )}

      <CategoryNav
        categories={visibleCategories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        showStats={showStats}
        stats={stats}
        totalCount={totalCount}
        extraCategories={[
          { name: 'Pinned', icon: 'push_pin', count: pinnedCount }
        ]}
      />

      <div className="toolbox-page-header">
        <h2>Bookmarks</h2>
        <p>Access your favorite links and resources.</p>
        {cats.length > 0 && (
          <div className="pill-group" style={{justifyContent: 'center', marginTop: '1rem'}}>
            <button className="pill" onClick={collapseAll} style={{padding: '8px 16px', fontSize: '0.8rem'}}>
              <span className="material-icons" style={{fontSize: '1.1rem'}}>unfold_less</span> Collapse All
            </button>
            <button className="pill" onClick={expandAll} style={{padding: '8px 16px', fontSize: '0.8rem'}}>
              <span className="material-icons" style={{fontSize: '1.1rem'}}>unfold_more</span> Expand All
            </button>
          </div>
        )}
      </div>

      {cats.length === 0 ? (
    <NatureEmptyState
      title={searchQuery ? "No matching bookmarks" : "No bookmarks here yet"}
      body={searchQuery ? `We couldn't find any bookmarks matching "${searchQuery}".` : "Start by adding some of your favorite links!"}
    />
      ) : (
        cats.map(cat => (
          <div key={cat} className={`category-section ${collapsedCategories[cat] ? 'collapsed' : ''}`}>
            <div className="category-header" onClick={() => toggleCategoryCollapse(cat)}>
              <div className="category-title">
                <span className="material-icons">{categories[cat] || 'folder'}</span>
                {cat}
                {showStats && <span className="count">{grouped[cat].length}</span>}
              </div>
              <span className="material-icons expand-icon">expand_more</span>
            </div>
            <div className="category-grid">
              {grouped[cat].map((link, idx) => (
                <BookmarkCard
                  key={link.id}
                  link={link}
                  idx={idx}
                  openInNewTab={openInNewTab}
                  onPin={onPin}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  handleShare={handleShare}
                  handleCopy={handleCopy}
                  isCopied={copiedId === link.id}
                  onLongPress={() => { setSelectedLinkForUrls(link); setIsUrlModalOpen(true); }}
                  categoryIcon={categories[cat]}
                  hideIcons={hideIcons}
                  hideUrls={hideUrls}
                  searchQuery={searchQuery}
                />
              ))}
            </div>
          </div>
        ))
      )}
    </>
  );
};

const BookmarkCard = ({ link, idx, openInNewTab, onPin, onEdit, onDelete, handleShare, handleCopy, isCopied, onLongPress, categoryIcon, hideIcons, hideUrls, searchQuery }) => {
  const [pressTimer, setPressTimer] = useState(null);
  const isLongPress = React.useRef(false);

  const startPress = () => {
    isLongPress.current = false;
    const timer = setTimeout(() => {
      isLongPress.current = true;
      if (link.urls && link.urls.length > 1) {
        onLongPress();
      }
    }, 500);
    setPressTimer(timer);
  };

  const cancelPress = () => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
  };

  const handleClick = (e) => {
    if (isLongPress.current) {
      isLongPress.current = false;
      return;
    }
    window.open(link.url, openInNewTab ? '_blank' : '_self');
  };

  let hostname = '';
  try {
    hostname = new URL(link.url.startsWith('http') ? link.url : 'http://' + link.url).hostname;
  } catch (e) {
    hostname = 'invalid-url';
  }

  return (
    <div
      className="card"
      style={{'--delay': idx}}
      onClick={handleClick}
      onMouseDown={startPress}
      onMouseUp={cancelPress}
      onMouseLeave={cancelPress}
      onTouchStart={startPress}
      onTouchEnd={cancelPress}
    >
      <div className="card-header">
        {!hideIcons && <BookmarkIcon link={link} categoryIcon={categoryIcon || 'link'} />}
        <div className="card-title" dangerouslySetInnerHTML={{ __html: highlightText(link.title, searchQuery) }} />
      </div>
      {!hideUrls && (
        <div className="card-url">
          {hostname}
          {link.urls && link.urls.length > 1 && <span className="fallback-badge">{link.urls.length} URLs</span>}
        </div>
      )}
      <div className="card-actions" onClick={e => e.stopPropagation()}>
        <button className={`pin-btn ${link.is_pinned ? 'active' : ''}`} onClick={() => onPin(link)} title={link.is_pinned ? 'Unpin' : 'Pin to Top'}>
          <span className="material-icons">push_pin</span>
        </button>
        <button onClick={() => handleShare(link)} title="Share Bookmark">
          <span className="material-icons">share</span>
        </button>
        <button onClick={() => handleCopy(link.id, link.url)} title="Copy URL">
          <span className="material-icons" style={{color: isCopied ? 'var(--accent-green)' : 'inherit'}}>
            {isCopied ? 'check' : 'content_copy'}
          </span>
        </button>
        <button onClick={() => onEdit(link)} title="Edit">
          <span className="material-icons">edit</span>
        </button>
        <button className="btn-delete" onClick={() => onDelete(link.id)} title="Delete">
          <span className="material-icons">delete</span>
        </button>
      </div>
    </div>
  );
};

const BookmarkIcon = ({ link, categoryIcon }) => {
  const getHostname = (url) => {
    try {
      return new URL(url.startsWith('http') ? url : 'http://' + url).hostname;
    } catch (e) {
      return '';
    }
  };

  const [src, setSrc] = useState(link.icon || `https://www.google.com/s2/favicons?domain=${getHostname(link.url)}&sz=64`);
  const [errorCount, setErrorCount] = useState(0);

  const handleError = () => {
    if (errorCount === 0 && link.optional_icon) {
      setSrc(link.optional_icon);
    } else if (errorCount === 1) {
      const hostname = getHostname(link.url);
      setSrc(hostname ? `https://icons.duckduckgo.com/ip3/${hostname}.ico` : null);
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
