import React, { useState, useEffect } from 'react';

const CurrencyConverter = ({ onResultChange }) => {
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

  useEffect(() => {
    onResultChange({
      text: `${amount} ${fromCurrency} = ${convert()} ${toCurrency}`,
      filename: 'currency_result.txt'
    });
  }, [amount, fromCurrency, toCurrency, rates, onResultChange]);

  return (
    <div className="tool-form">
      <div className="settings-section">
        <label className="label-bold">Conversion</label>
        <div className="currency-main-row">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
            placeholder="Amount"
          />
          <select
            value={fromCurrency}
            onChange={(e) => setFromCurrency(e.target.value)}
          >
            {Object.keys(rates).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <span className="material-icons">sync_alt</span>
          <select
            value={toCurrency}
            onChange={(e) => setToCurrency(e.target.value)}
          >
            {Object.keys(rates).map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="result-area">
          <div className="result-label">EXCHANGED VALUE</div>
          <div className="result-value">
            {convert()}
          </div>
          <div className="result-subtext">
            {toCurrency}
          </div>
        </div>
      </div>

      <div className="settings-section mt-32">
        <label className="label-bold">Manual Rates (Offline)</label>
        <p className="settings-desc mb-16 opacity-60 size-sm">Update exchange rates against 1 USD manually.</p>
        <div className="rates-grid">
          {Object.keys(rates).map(c => (
            <div key={c} className="rate-item">
              <label>1 USD : {c}</label>
              <input
                type="number"
                value={rates[c]}
                onChange={(e) => handleRateChange(c, e.target.value)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="tool-footer-note">
        <p>Market rates are for reference. Nature Toolbox works fully offline.</p>
      </div>
    </div>
  );
};

export default CurrencyConverter;
