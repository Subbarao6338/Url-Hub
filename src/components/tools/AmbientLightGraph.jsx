import React, { useEffect } from 'react';
import { useAmbientLight } from './useAmbientLight';
import { STRINGS } from '../../strings';
import { NATURE_THEME } from '../../constants';

const AmbientLightGraph = ({ onResultChange }) => {
  const { lux, history, error, isSupported } = useAmbientLight();

  useEffect(() => {
    if (lux !== null) {
      onResultChange({
        text: `Sunlight Intensity: ${lux} lx\nRecorded at: ${new Date().toLocaleTimeString()}`,
        filename: 'light_reading.txt'
      });
    }
  }, [lux, onResultChange]);

  const getSunlightCategory = (val) => {
    if (val < 100) return STRINGS.tools.sunlight.low;
    if (val < 1000) return STRINGS.tools.sunlight.medium;
    return STRINGS.tools.sunlight.high;
  };

  const renderHistory = () => {
    if (history.length < 2) return null;
    const maxVal = Math.max(...history, 1000);
    const width = 300;
    const height = 120;
    const points = history.map((val, i) => {
      const x = (i / (history.length - 1)) * width;
      const y = height - (val / maxVal) * height;
      return `${x},${y}`;
    }).join(' ');

    return (
      <div style={{ marginTop: '2rem' }}>
        <h4 style={{ fontSize: '0.85rem', opacity: 0.6, marginBottom: '1rem', textTransform: 'uppercase' }}>
          {STRINGS.tools.sunlight.history}
        </h4>
        <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', overflow: 'visible' }}>
          <defs>
            <linearGradient id="sunlightGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={NATURE_THEME.palette.sunlight} stopOpacity="0.8" />
              <stop offset="100%" stopColor={NATURE_THEME.palette.sunlight} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path
            d={`M 0,${height} L ${points} L ${width},${height} Z`}
            fill="url(#sunlightGradient)"
          />
          <polyline
            fill="none"
            stroke={NATURE_THEME.palette.sunlight}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />
        </svg>
      </div>
    );
  };

  return (
    <div className="tool-form" style={{ textAlign: 'center' }}>
      {!isSupported && (
        <div className="card" style={{ background: 'rgba(244, 162, 97, 0.1)', border: '1px solid var(--nature-gold)', marginBottom: '1.5rem', padding: '1rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--nature-earth)', margin: 0 }}>
             🌿 {STRINGS.tools.sunlight.notSupported} (Using simulated forest data)
          </p>
        </div>
      )}

      {error && (
         <div className="card" style={{ background: '#FFF1F0', borderColor: '#FFA39E', marginBottom: '1.5rem' }}>
            <p style={{ color: '#CF1322', fontSize: '0.85rem' }}>{error}</p>
         </div>
      )}

      <div className="card" style={{ padding: '2.5rem 1.5rem' }}>
        <div style={{
          width: '120px',
          height: '120px',
          borderRadius: '50%',
          background: 'rgba(244, 162, 97, 0.1)',
          display: 'grid',
          placeItems: 'center',
          margin: '0 auto 1.5rem',
          border: `2px solid ${NATURE_THEME.palette.sunlight}`,
          boxShadow: `0 0 20px ${NATURE_THEME.palette.sunlight}33`
        }}>
          <span className="material-icons" style={{ fontSize: '3rem', color: NATURE_THEME.palette.sunlight }}>
            wb_sunny
          </span>
        </div>

        <h2 style={{ fontSize: '2.5rem', margin: '0 0 0.5rem', color: 'var(--nature-primary)' }}>
          {lux !== null ? Math.round(lux) : '---'}
          <span style={{ fontSize: '1rem', fontWeight: '400', marginLeft: '4px', opacity: 0.6 }}>
            {STRINGS.tools.sunlight.unit}
          </span>
        </h2>

        <div className="pill active" style={{
          background: 'var(--nature-mist)',
          color: 'var(--nature-primary)',
          padding: '6px 16px',
          fontSize: '0.9rem'
        }}>
          {lux !== null ? getSunlightCategory(lux) : '---'}
        </div>

        {renderHistory()}
      </div>

      <p style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: '2rem' }}>
        Place your device in direct light to monitor photosynthesis levels 🌻
      </p>
    </div>
  );
};

export default AmbientLightGraph;
