import React, { useState, useEffect } from 'react';

const BookmarkModal = ({ link, profileId, profiles, onClose, onSave }) => {
  const [title, setTitle] = useState(link?.title || '');
  const [url, setUrl] = useState(link?.url || '');
  const [urls, setUrls] = useState(link?.urls || []);
  const [icon, setIcon] = useState(link?.icon || '');
  const [category, setCategory] = useState(link?.category || 'Utilities');
  const [selectedProfileId, setSelectedProfileId] = useState(link?.profile_id || profileId);
  const [suggestedCategories, setSuggestedCategories] = useState([]);

  useEffect(() => {
    if (selectedProfileId) {
      fetch(`/api/links/categories?profile_id=${selectedProfileId}`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setSuggestedCategories(data);
        })
        .catch(err => console.error("Failed to fetch suggested categories:", err));
    }
  }, [selectedProfileId]);

  const handleAddUrl = () => {
    setUrls([...urls, '']);
  };

  const handleUrlChange = (index, value) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const handleRemoveUrl = (index) => {
    setUrls(urls.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      title,
      url,
      urls: [url, ...urls.filter(u => u && u !== url)],
      icon,
      category,
      profile_id: selectedProfileId,
      is_internal: false,
      is_pinned: link?.is_pinned || false
    };

    const method = link ? 'PUT' : 'POST';
    const endpoint = link ? `/api/links/${link.id}` : '/api/links';

    fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(savedLink => {
      onSave(savedLink);
      onClose();
    })
    .catch(err => console.error("Failed to save bookmark:", err));
  };

  return (
    <div className="modal" style={{display: 'block'}}>
      <h2 style={{marginTop: 0}}>{link ? 'Edit Bookmark' : 'Add Bookmark'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Profile</label>
          <select
            value={selectedProfileId}
            onChange={(e) => setSelectedProfileId(parseInt(e.target.value))}
            style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text)' }}
          >
            {profiles?.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label>Title</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="My Bookmark" />
        </div>
        <div className="form-group">
          <label>Primary URL</label>
          <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} required placeholder="https://example.com" />
        </div>
        <div className="form-group">
          <label>
            Alternative URLs (Optional)
            <button type="button" className="btn-small" onClick={handleAddUrl}>
              <span className="material-icons" style={{fontSize: '1rem', verticalAlign: 'middle'}}>add</span> Add URL
            </button>
          </label>
          <div id="alternative-urls-container">
            {urls.filter(u => u !== url).map((u, i) => (
              <div key={i} className="url-field-wrapper">
                <input type="url" value={u} onChange={(e) => handleUrlChange(i, e.target.value)} placeholder="https://alternative-url.com" />
                <button type="button" className="btn-remove" onClick={() => handleRemoveUrl(i)}>
                  <span className="material-icons">close</span>
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label>Icon (URL or Emoji) - Optional</label>
          <input type="text" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="e.g. 🚀 or https://..." />
        </div>
        <div className="form-group">
          <label>Category</label>
          <input
            type="text"
            list="category-suggestions"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            placeholder="Utilities"
          />
          <datalist id="category-suggestions">
            {suggestedCategories.map(cat => (
              <option key={cat} value={cat} />
            ))}
          </datalist>
        </div>
        <div className="form-actions" style={{marginTop: '1.5rem'}}>
          <button type="submit" className="btn-primary" style={{width: '100%'}}>Save Bookmark</button>
        </div>
      </form>
      <div className="form-actions">
        <button type="button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default BookmarkModal;
