import React, { useState, useEffect } from 'react';
import API_BASE from '../api';

const HighlightText = ({ text, query }) => {
  if (!query) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i}>{part}</mark>
        ) : (
          part
        )
      )}
    </>
  );
};

const ProjectsView = ({ searchQuery, openInNewTab }) => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/projects`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch projects");
        return res.json();
      })
      .then(data => {
        setProjects(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  const filteredProjects = projects.filter(p => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      p.title.toLowerCase().includes(query) ||
      (p.description && p.description.toLowerCase().includes(query)) ||
      (p.category && p.category.toLowerCase().includes(query))
    );
  });

  if (loading) return (
    <div style={{ padding: '2rem' }}>
        <div className="category-grid">
            {[1,2,3,4,5,6].map(i => (
                <div key={i} className="card skeleton" style={{ height: '180px' }}></div>
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

  if (error) return (
    <div style={{textAlign:'center', padding:'3rem'}}>
      <span className="material-icons" style={{fontSize: '3rem', color: 'var(--danger)', marginBottom: '1rem'}}>error_outline</span>
      <h3 style={{marginBottom: '0.5rem'}}>Failed to load projects</h3>
      <p style={{opacity: 0.7}}>{error}</p>
    </div>
  );

  return (
    <div className="projects-view">
      <div className="toolbox-page-header">
        <h2>Projects</h2>
        <p>A collection of my recent work and open-source contributions.</p>
      </div>

      {filteredProjects.length === 0 ? (
        <div style={{textAlign:'center', color:'#888', marginTop:'3rem'}}>No projects found</div>
      ) : (
        <div className="category-grid">
          {filteredProjects.map((project, idx) => (
            <div
              key={project.id}
              className="card"
              style={{'--delay': idx}}
              onClick={() => window.open(project.url, openInNewTab ? '_blank' : '_self')}
            >
              <div className="card-header">
                <div className="card-icon" style={{display:'grid', placeItems:'center', background:'var(--bg)'}}>
                  <span className="material-icons">{project.icon || 'code'}</span>
                </div>
                <div>
                  <div className="card-title">
                    <HighlightText text={project.title} query={searchQuery} />
                  </div>
                  {project.category && (
                    <span style={{fontSize: '0.75rem', opacity: 0.6, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em'}}>
                      {project.category}
                    </span>
                  )}
                </div>
              </div>
              <p style={{fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem', flex: 1, minHeight: '3em'}}>
                <HighlightText text={project.description || ''} query={searchQuery} />
              </p>
              <div className="card-url" style={{marginTop: 'auto'}}>
                {(() => {
                  try {
                    return project.url ? new URL(project.url).hostname : 'No Link';
                  } catch(e) {
                    return project.url || 'No Link';
                  }
                })()}
              </div>
              <div className="card-actions" onClick={e => e.stopPropagation()}>
                <button onClick={() => {
                   if (navigator.share) {
                     navigator.share({ title: project.title, url: project.url });
                   } else {
                     navigator.clipboard.writeText(project.url);
                     alert("Link copied!");
                   }
                }} title="Share Project">
                  <span className="material-icons">share</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectsView;
