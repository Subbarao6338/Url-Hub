import React, { useState, useEffect } from 'react';

const OutdoorTools = ({ onResultChange }) => {
  const [coords, setCoords] = useState(null);
  const [altitude, setAltitude] = useState(null);

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setCoords(pos.coords);
        setAltitude(pos.coords.altitude);
      },
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    if (coords) {
      onResultChange({
        text: `Lat: ${coords.latitude}, Lon: ${coords.longitude}\nAlt: ${altitude}m`,
        filename: 'gps_coords.txt'
      });
    }
  }, [coords, altitude, onResultChange]);

  return (
    <div className="tool-form">
      <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
        <span className="material-icons" style={{ fontSize: '3rem', color: 'var(--nature-primary)' }}>location_on</span>
        <h3 style={{ margin: '1rem 0' }}>GPS & Altitude</h3>

        {coords ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="card" style={{ background: 'var(--nature-mist)', padding: '15px' }}>
              <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>LATITUDE</div>
              <div style={{ fontWeight: 'bold' }}>{coords.latitude.toFixed(6)}</div>
            </div>
            <div className="card" style={{ background: 'var(--nature-mist)', padding: '15px' }}>
              <div style={{ fontSize: '0.7rem', opacity: 0.6 }}>LONGITUDE</div>
              <div style={{ fontWeight: 'bold' }}>{coords.longitude.toFixed(6)}</div>
            </div>
            <div className="card" style={{ background: 'var(--nature-gold)', padding: '15px', gridColumn: 'span 2', color: 'white' }}>
              <div style={{ fontSize: '0.7rem', opacity: 0.8 }}>ALTITUDE</div>
              <div style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>{altitude ? `${altitude.toFixed(1)} m` : 'N/A'}</div>
            </div>
          </div>
        ) : (
          <div className="loading-seed">
             <span className="material-icons seed-icon">searching</span>
             <p>Acquiring satellites...</p>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: '1.5rem', padding: '1.5rem' }}>
         <h4 style={{ color: 'var(--nature-primary)', marginBottom: '1rem' }}>Safety Tools</h4>
         <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-primary" style={{ flex: 1, background: '#BA1A1A' }}>
               <span className="material-icons">warning</span> SOS
            </button>
            <button className="btn-primary" style={{ flex: 1, background: 'var(--nature-gold)' }}>
               <span className="material-icons">flash_on</span> Strobe
            </button>
         </div>
      </div>
    </div>
  );
};

export default OutdoorTools;
