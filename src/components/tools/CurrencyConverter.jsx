import React, { useState, useEffect } from 'react';

const CurrencyConverter = () => {
  const [amount, setAmount] = useState(1);
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('EUR');
  const [rates, setRates] = useState({
    USD: 1,
    EUR: 0.92,
    GBP: 0.79,
    INR: 83.12,
    JPY: 151.23,
    AUD: 1.52,
    CAD: 1.35,
    CHF: 0.90,
    CNY: 7.23,
    SGD: 1.35
  });

  const convert = () => {
    const fromRate = rates[fromCurrency];
    const toRate = rates[toCurrency];
    return (amount * (toRate / fromRate)).toFixed(2);
  };

  const handleRateChange = (currency, value) => {
    setRates(prev => ({ ...prev, [currency]: parseFloat(value) || 0 }));
  };

  return (
    <div className="tool-form">
      <div className="settings-section">
        <h3>Conversion</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '15px' }}>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            placeholder="Amount"
            style={{ flex: 1, padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--on-surface)' }}
          />
          <select
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
            style={{ padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--on-surface)' }}
          >
            {Object.keys(rates).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <span className="material-icons">arrow_forward</span>
          <select
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
            style={{ padding: '12px', borderRadius: '12px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--on-surface)' }}
          >
            {Object.keys(rates).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="tool-result" style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary)' }}>
          {amount} {fromCurrency} = {convert()} {toCurrency}
        </div>
      </div>

      <div className="settings-section">
        <h3>Manual Rates (Offline)</h3>
        <p className="settings-desc">Update rates manually if needed.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }}>
          {Object.keys(rates).map(c => (
            <div key={c} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.7rem', fontWeight: 'bold' }}>1 USD to {c}</label>
              <input
                type="number"
                value={rates[c]}
                onChange={(e) => handleRateChange(c, e.target.value)}
                style={{ padding: '8px', borderRadius: '8px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--on-surface)', fontSize: '0.9rem' }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CurrencyConverter;
