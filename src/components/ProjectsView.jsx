import React, { useState, useEffect } from 'react';
import CategoryNav from './CategoryNav';

const ProjectsView = ({ searchQuery, openInternally }) => {
  const [projects, setProjects] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        setProjects(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch projects:", err);
        setLoading(false);
        setProjects([]);
      });
  }, []);

  const filteredProjects = projects.filter(p => {
    let matchesSearch = true;
    let matchesCat = true;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (query.startsWith('cat:')) {
        const catQuery = query.replace('cat:', '').trim();
        matchesCat = p.category.toLowerCase().includes(catQuery);
        matchesSearch = true;
      } else {
        matchesSearch = p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query);
      }
    }

    if (!searchQuery || !searchQuery.toLowerCase().startsWith('cat:')) {
      if (activeCategory !== 'All') matchesCat = p.category === activeCategory;
    }

    return matchesSearch && matchesCat;
  });

  const grouped = {};
  filteredProjects.forEach(p => {
    (grouped[p.category] || (grouped[p.category] = [])).push(p);
  });

  const cats = Object.keys(grouped).sort();

  const stats = {};
  projects.forEach(p => {
    stats[p.category] = (stats[p.category] || 0) + 1;
  });
  const totalCount = projects.length;

  const [activeProjectId, setActiveProjectId] = useState(null);

  if (loading) return <div style={{textAlign:'center', padding:'3rem', opacity:0.5}}>Loading projects...</div>;

  if (activeProjectId) {
    const project = projects.find(p => p.id === activeProjectId);
    return (
      <div className="project-view">
        <div className="tool-view-header">
          <button className="icon-btn" onClick={() => setActiveProjectId(null)} title="Back to Projects">
            <span className="material-icons">arrow_back</span>
          </button>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            <span className="material-icons" style={{fontSize: '2rem', color: 'var(--primary)'}}>{project.icon || 'rocket_launch'}</span>
            <h2 style={{margin: 0, fontSize: '1.75rem'}}>{project.title}</h2>
          </div>
        </div>
        <div className="tool-container-inner" style={{height: 'calc(100vh - 250px)', maxWidth: 'none'}}>
          <iframe src={project.url} style={{width: '100%', height: '100%', border: 'none', borderRadius: '16px', background: 'white', boxShadow: 'var(--shadow-lg)'}} />
        </div>
      </div>
    );
  }

  const projectCategories = {};
  Object.keys(stats).forEach(cat => {
    projectCategories[cat] = 'folder';
  });

  return (
    <>
      <CategoryNav
        categories={projectCategories}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
        showStats={true}
        stats={stats}
        totalCount={totalCount}
      />

      <div className="toolbox-page-header">
        <h2>My Projects</h2>
        <p>A collection of my recent developments and experiments.</p>
      </div>

      {cats.length === 0 ? (
        <div style={{textAlign:'center', color:'#888', marginTop:'3rem'}}>No projects found</div>
      ) : (
        cats.map(cat => (
          <div key={cat} className="category-section">
            <div className="category-header">
              <div className="category-title">
                <span className="material-icons">folder</span>
                {cat}
                <span className="count">{grouped[cat].length}</span>
              </div>
              <span className="material-icons expand-icon">expand_more</span>
            </div>
            <div className="category-grid">
              {grouped[cat].map((p, idx) => (
                <div key={p.id} className="card" style={{'--delay': idx}} onClick={() => openInternally ? setActiveProjectId(p.id) : window.open(p.url, '_blank')}>
                  <div className="card-header">
                    <div className="card-icon" style={{display:'grid', placeItems:'center', background:'var(--bg)'}}>
                      <span className="material-icons">{p.icon || 'code'}</span>
                    </div>
                    <div className="card-title">{p.title}</div>
                  </div>
                  <p style={{padding: '0 1rem 1rem', fontSize: '0.9rem', opacity: 0.7}}>{p.description}</p>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </>
  );
};

export default ProjectsView;
