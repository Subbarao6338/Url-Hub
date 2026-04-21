import React, { useState, useEffect } from 'react';

const FinanceCalculators = ({ onResultChange, toolId }) => {
  const [activeTab, setActiveTab] = useState('loan');
  const [inputs, setInputs] = useState({
    amount: 10000,
    rate: 5,
    term: 12,
    downPayment: 0,
    frequency: 12 // Monthly
  });

  useEffect(() => {
    if (toolId === 'loan-calc') setActiveTab('loan');
    else if (toolId === 'compound-int') setActiveTab('compound');
    else if (toolId === 'cagr') setActiveTab('cagr');
    else if (toolId === 'vat-calc') setActiveTab('vat');
  }, [toolId]);

  const calculateLoan = () => {
    const P = inputs.amount - inputs.downPayment;
    const r = (inputs.rate / 100) / 12;
    const n = inputs.term;
    if (r === 0) return P / n;
    return (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  };

  const calculateCompound = () => {
    const P = inputs.amount;
    const r = inputs.rate / 100;
    const t = inputs.term / 12;
    const n = inputs.frequency;
    return P * Math.pow(1 + r/n, n * t);
  };

  const calculateCAGR = () => {
    const EV = inputs.amount; // End Value
    const BV = inputs.downPayment || 1; // Beginning Value (reusing downPayment field)
    const t = inputs.term / 12;
    return (Math.pow(EV / BV, 1 / t) - 1) * 100;
  };

  const results = {
    loan: calculateLoan(),
    compound: calculateCompound(),
    cagr: calculateCAGR()
  };

  useEffect(() => {
    onResultChange({
      text: `Finance Result (${activeTab}): ${results[activeTab]?.toFixed(2)}`,
      filename: `finance_${activeTab}.txt`
    });
  }, [activeTab, inputs, onResultChange]);

  return (
    <div className="tool-form">
      {!toolId && (
        <div className="main-category-nav" style={{ padding: '0 0 1.5rem 0' }}>
          <button className={`pill ${activeTab === 'loan' ? 'active' : ''}`} onClick={() => setActiveTab('loan')}>Loan</button>
          <button className={`pill ${activeTab === 'compound' ? 'active' : ''}`} onClick={() => setActiveTab('compound')}>Compound</button>
          <button className={`pill ${activeTab === 'cagr' ? 'active' : ''}`} onClick={() => setActiveTab('cagr')}>CAGR</button>
        </div>
      )}

      <div className="form-group">
        <label>{activeTab === 'cagr' ? 'Ending Value' : 'Principal Amount'}</label>
        <input type="number" className="form-control" value={inputs.amount} onChange={e => setInputs({...inputs, amount: parseFloat(e.target.value)})}/>
      </div>

      <div className="form-group">
        <label>{activeTab === 'cagr' ? 'Beginning Value' : 'Interest Rate (%)'}</label>
        <input type="number" className="form-control" value={activeTab === 'cagr' ? inputs.downPayment : inputs.rate} onChange={e => setInputs({...inputs, [activeTab === 'cagr' ? 'downPayment' : 'rate']: parseFloat(e.target.value)})}/>
      </div>

      <div className="form-group">
        <label>Term (Months)</label>
        <input type="number" className="form-control" value={inputs.term} onChange={e => setInputs({...inputs, term: parseFloat(e.target.value)})}/>
      </div>

      <div className="card" style={{ padding: '2rem', textAlign: 'center', background: 'var(--nature-mist)', border: 'none' }}>
        <div style={{ fontSize: '0.8rem', opacity: 0.6, fontWeight: 'bold' }}>
          {activeTab === 'loan' && 'ESTIMATED MONTHLY PAYMENT'}
          {activeTab === 'compound' && 'FUTURE VALUE'}
          {activeTab === 'cagr' && 'ANNUAL GROWTH RATE'}
        </div>
        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--nature-primary)' }}>
          {activeTab === 'cagr' ? results.cagr.toFixed(2) + '%' : '$' + results[activeTab].toLocaleString(undefined, { maximumFractionDigits: 2 })}
        </div>
      </div>
    </div>
  );
};

export default FinanceCalculators;
