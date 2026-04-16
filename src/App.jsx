import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container mt-5">
      <header className="mb-4">
        <h1>URL Hub (React + Python)</h1>
        <p className="text-muted">A modern dashboard powered by React and FastAPI.</p>
      </header>

      <main>
        {loading ? (
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        ) : data && data.items ? (
          <div className="row g-4">
            {data.items.map((item) => (
              <div key={item[0]} className="col-md-4">
                <div className="card h-100 shadow-sm">
                  <div className="card-body">
                    <h5 className="card-title">{item[1]}</h5>
                    <p className="card-text text-secondary">{item[2]}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="alert alert-warning">
            {data?.error || "No data available. Make sure to run the DB initialization script."}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
