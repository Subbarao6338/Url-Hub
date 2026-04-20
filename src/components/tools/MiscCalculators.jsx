import React, { useState, useEffect } from 'react';

const MiscCalculators = ({ toolId }) => {
  const [activeTab, setActiveTab] = useState('tip');

  useEffect(() => {
    if (toolId) {
        if (toolId === 'tip-split') setActiveTab('tip');
        else if (toolId === 'weighted-avg') setActiveTab('weighted');
        else if (toolId === 'date-diff') setActiveTab('date-diff');
        else setActiveTab(toolId);
    }
  }, [toolId]);

  return (
    <div className="tool-form">
      <div className="pill-group" style={{ marginBottom: '20px', overflowX: 'auto', whiteSpace: 'nowrap', display: 'flex', flexWrap: 'nowrap' }}>
        <button className={`pill ${activeTab === 'tip' ? 'active' : ''}`} onClick={() => setActiveTab('tip')}>Tip & Split</button>
        <button className={`pill ${activeTab === 'weighted' ? 'active' : ''}`} onClick={() => setActiveTab('weighted')}>Weighted Average</button>
        <button className={`pill ${activeTab === 'date-diff' ? 'active' : ''}`} onClick={() => setActiveTab('date-diff')}>Date Difference</button>
      </div>

      {activeTab === 'tip' && <TipSplitCalculator />}
      {activeTab === 'weighted' && <WeightedAverageCalculator />}
      {activeTab === 'date-diff' && <DateDifferenceCalculator />}
    </div>
  );
};

const TipSplitCalculator = () => {
    const [bill, setBill] = useState('');
    const [tip, setTip] = useState(15);
    const [people, setPeople] = useState(1);
    const [res, setRes] = useState(null);

    const calc = () => {
        const b = parseFloat(bill);
        const t = b * (parseFloat(tip) / 100);
        const total = b + t;
        setRes({ tip: t, total, perPerson: total / people });
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <input type="number" value={bill} onChange={e => setBill(e.target.value)} placeholder="Bill Amount" className="pill" style={{ width: '100%', marginBottom: '10px' }} />
            <input type="number" value={tip} onChange={e => setTip(e.target.value)} placeholder="Tip %" className="pill" style={{ width: '100%', marginBottom: '10px' }} />
            <input type="number" value={people} onChange={e => setPeople(e.target.value)} placeholder="Number of People" className="pill" style={{ width: '100%', marginBottom: '10px' }} />
            <button className="btn-primary" onClick={calc} style={{ width: '100%' }}>Calculate</button>
            {res && (
                <div style={{ marginTop: '15px' }}>
                    <div>Tip: {res.tip.toFixed(2)}</div>
                    <div>Total: {res.total.toFixed(2)}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Per Person: {res.perPerson.toFixed(2)}</div>
                </div>
            )}
        </div>
    );
};

const WeightedAverageCalculator = () => {
    const [items, setItems] = useState([{ val: '', weight: '' }]);
    const [res, setRes] = useState(null);

    const calc = () => {
        let sumProduct = 0;
        let sumWeights = 0;
        items.forEach(i => {
            const v = parseFloat(i.val);
            const w = parseFloat(i.weight);
            if (!isNaN(v) && !isNaN(w)) {
                sumProduct += v * w;
                sumWeights += w;
            }
        });
        setRes(sumProduct / sumWeights);
    };

    return (
        <div style={{ textAlign: 'center' }}>
            {items.map((it, idx) => (
                <div key={idx} style={{ display: 'flex', gap: '5px', marginBottom: '5px' }}>
                    <input type="number" value={it.val} onChange={e => {
                        const newItems = [...items];
                        newItems[idx].val = e.target.value;
                        setItems(newItems);
                    }} placeholder="Value" className="pill" style={{ flex: 1 }} />
                    <input type="number" value={it.weight} onChange={e => {
                        const newItems = [...items];
                        newItems[idx].weight = e.target.value;
                        setItems(newItems);
                    }} placeholder="Weight" className="pill" style={{ flex: 1 }} />
                </div>
            ))}
            <button className="pill" onClick={() => setItems([...items, { val: '', weight: '' }])} style={{ marginBottom: '10px' }}>Add Item</button>
            <button className="btn-primary" onClick={calc} style={{ width: '100%' }}>Calculate Weighted Avg</button>
            {res !== null && <div style={{ marginTop: '15px', fontSize: '1.5rem' }}>Average: {res.toFixed(2)}</div>}
        </div>
    );
};

const DateDifferenceCalculator = () => {
    const [d1, setD1] = useState('');
    const [d2, setD2] = useState('');
    const [res, setRes] = useState(null);

    const calc = () => {
        const diffTime = Math.abs(new Date(d2) - new Date(d1));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setRes(diffDays);
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <input type="date" value={d1} onChange={e => setD1(e.target.value)} className="pill" style={{ width: '100%', marginBottom: '10px' }} />
            <input type="date" value={d2} onChange={e => setD2(e.target.value)} className="pill" style={{ width: '100%', marginBottom: '10px' }} />
            <button className="btn-primary" onClick={calc} style={{ width: '100%' }}>Calculate Difference</button>
            {res !== null && <div style={{ marginTop: '15px', fontSize: '1.5rem' }}>{res} Days</div>}
        </div>
    );
};

export default MiscCalculators;
