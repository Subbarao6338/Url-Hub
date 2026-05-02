import React, { useState, useEffect } from 'react';

const EducationTools = ({ toolId }) => {
  const [activeTab, setActiveTab] = useState('periodic');

  useEffect(() => {
    if (toolId) {
      if (toolId === 'periodic-table') setActiveTab('periodic');
      else if (toolId === 'unit-circle') setActiveTab('unit-circle');
      else setActiveTab(toolId);
    }
  }, [toolId]);

  return (
    <div className="tool-form">
      {!toolId && (
        <div className="pill-group mb-20 scrollable-x">
          <button className={`pill ${activeTab === 'periodic' ? 'active' : ''}`} onClick={() => setActiveTab('periodic')}>Periodic Table</button>
          <button className={`pill ${activeTab === 'unit-circle' ? 'active' : ''}`} onClick={() => setActiveTab('unit-circle')}>Unit Circle</button>
        </div>
      )}

      {activeTab === 'periodic' && <PeriodicTable />}
      {activeTab === 'unit-circle' && <UnitCircle />}
    </div>
  );
};

const PeriodicTable = () => {
    const elements = [
        { symbol: 'H', name: 'Hydrogen', number: 1, category: 'nonmetal', x: 1, y: 1 },
        { symbol: 'He', name: 'Helium', number: 2, category: 'noble', x: 18, y: 1 },
        { symbol: 'Li', name: 'Lithium', number: 3, category: 'alkali', x: 1, y: 2 },
        { symbol: 'Be', name: 'Beryllium', number: 4, category: 'alkaline', x: 2, y: 2 },
        { symbol: 'B', name: 'Boron', number: 5, category: 'metalloid', x: 13, y: 2 },
        { symbol: 'C', name: 'Carbon', number: 6, category: 'nonmetal', x: 14, y: 2 },
        { symbol: 'N', name: 'Nitrogen', number: 7, category: 'nonmetal', x: 15, y: 2 },
        { symbol: 'O', name: 'Oxygen', number: 8, category: 'nonmetal', x: 16, y: 2 },
        { symbol: 'F', name: 'Fluorine', number: 9, category: 'halogen', x: 17, y: 2 },
        { symbol: 'Ne', name: 'Neon', number: 10, category: 'noble', x: 18, y: 2 },
        { symbol: 'Na', name: 'Sodium', number: 11, category: 'alkali', x: 1, y: 3 },
        { symbol: 'Mg', name: 'Magnesium', number: 12, category: 'alkaline', x: 2, y: 3 },
        { symbol: 'Al', name: 'Aluminium', number: 13, category: 'post-transition', x: 13, y: 3 },
        { symbol: 'Si', name: 'Silicon', number: 14, category: 'metalloid', x: 14, y: 3 },
        { symbol: 'P', name: 'Phosphorus', number: 15, category: 'nonmetal', x: 15, y: 3 },
        { symbol: 'S', name: 'Sulfur', number: 16, category: 'nonmetal', x: 16, y: 3 },
        { symbol: 'Cl', name: 'Chlorine', number: 17, category: 'halogen', x: 17, y: 3 },
        { symbol: 'Ar', name: 'Argon', number: 18, category: 'noble', x: 18, y: 3 },
        { symbol: 'K', name: 'Potassium', number: 19, category: 'alkali', x: 1, y: 4 },
        { symbol: 'Ca', name: 'Calcium', number: 20, category: 'alkaline', x: 2, y: 4 },
        { symbol: 'Fe', name: 'Iron', number: 26, category: 'transition', x: 8, y: 4 },
        { symbol: 'Cu', name: 'Copper', number: 29, category: 'transition', x: 11, y: 4 },
        { symbol: 'Ag', name: 'Silver', number: 47, category: 'transition', x: 11, y: 5 },
        { symbol: 'Au', name: 'Gold', number: 79, category: 'transition', x: 11, y: 6 },
    ];

    const [selected, setSelected] = useState(null);

    const colors = {
        'nonmetal': '#ec4899',
        'noble': '#8b5cf6',
        'alkali': '#ef4444',
        'alkaline': '#f59e0b',
        'metalloid': '#10b981',
        'halogen': '#06b6d4',
        'post-transition': '#3b82f6',
        'transition': '#64748b'
    };

    return (
        <div className="periodic-table-container scrollable-x p-10">
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(18, 45px)',
                gridTemplateRows: 'repeat(7, 60px)',
                gap: '4px',
                margin: '0 auto'
            }}>
                {elements.map(el => (
                    <div
                        key={el.symbol}
                        onClick={() => setSelected(el)}
                        style={{
                            gridColumn: el.x,
                            gridRow: el.y,
                            background: colors[el.category] || 'var(--surface)',
                            color: 'white',
                            borderRadius: '8px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            fontSize: '0.7rem',
                            border: selected?.symbol === el.symbol ? '3px solid white' : 'none',
                            boxShadow: 'var(--shadow-sm)'
                        }}
                    >
                        <span style={{ fontSize: '0.5rem', opacity: 0.8 }}>{el.number}</span>
                        <b style={{ fontSize: '1.1rem' }}>{el.symbol}</b>
                    </div>
                ))}
            </div>
            {selected && (
                <div className="tool-result mt-20 text-center" style={{ borderLeftColor: colors[selected.category] }}>
                    <h3 className="m-0" style={{ color: colors[selected.category] }}>{selected.name}</h3>
                    <p className="opacity-6 uppercase tracking-wider mb-5" style={{ fontSize: '0.7rem' }}>{selected.category}</p>
                    <div className="font-bold" style={{ fontSize: '1.2rem' }}>Atomic Number: {selected.number}</div>
                </div>
            )}
        </div>
    );
};

const UnitCircle = () => {
    const [angle, setAngle] = useState(45);

    const rad = (angle * Math.PI) / 180;
    const x = Math.cos(rad);
    const y = Math.sin(rad);

    return (
        <div className="text-center">
            <div style={{ position: 'relative', width: '260px', height: '260px', margin: '20px auto' }}>
                <svg width="260" height="260" viewBox="-1.2 -1.2 2.4 2.4">
                    <circle cx="0" cy="0" r="1" fill="none" stroke="var(--border)" strokeWidth="0.02" />
                    <line x1="-1.2" y1="0" x2="1.2" y2="0" stroke="var(--border)" strokeWidth="0.01" />
                    <line x1="0" y1="-1.2" x2="0" y2="1.2" stroke="var(--border)" strokeWidth="0.01" />

                    {/* Triangle */}
                    <path d={`M 0 0 L ${x} 0 L ${x} ${-y} Z`} fill="rgba(var(--primary-rgb), 0.1)" stroke="var(--primary)" strokeWidth="0.02" />

                    {/* Point */}
                    <circle cx={x} cy={-y} r="0.05" fill="var(--primary)" />

                    {/* Angle arc */}
                    <path d={`M 0.3 0 A 0.3 0.3 0 0 0 ${0.3 * x} ${-0.3 * y}`} fill="none" stroke="var(--nature-gold)" strokeWidth="0.03" />
                </svg>
            </div>

            <div className="grid gap-10">
                <input type="range" min="0" max="360" value={angle} onChange={e => setAngle(parseInt(e.target.value))} className="pill w-full" />
                <div className="tool-result">
                    <div className="flex-between"><span>Angle:</span> <b>{angle}°</b></div>
                    <div className="flex-between"><span>Radians:</span> <b>{(rad).toFixed(3)} rad</b></div>
                    <div className="flex-between" style={{ color: 'var(--primary)' }}><span>cos(θ):</span> <b>{x.toFixed(3)}</b></div>
                    <div className="flex-between" style={{ color: 'var(--primary)' }}><span>sin(θ):</span> <b>{y.toFixed(3)}</b></div>
                    <div className="flex-between"><span>tan(θ):</span> <b>{Math.abs(x) < 0.001 ? '∞' : (y/x).toFixed(3)}</b></div>
                </div>
            </div>
        </div>
    );
};

export default EducationTools;
