import React, { useState, useEffect } from 'react';

const FinanceCalculators = ({ toolId }) => {
  const [activeTab, setActiveTab] = useState('vat');

  useEffect(() => {
    if (toolId) {
        if (toolId === 'vat-calc') setActiveTab('vat');
        else if (toolId === 'loan-calc') setActiveTab('loan');
        else if (toolId === 'compound-int') setActiveTab('compound');
        else setActiveTab(toolId);
    }
  }, [toolId]);

  return (
    <div className="tool-form">
      {!toolId && (
        <div className="pill-group" style={{ marginBottom: '20px', overflowX: 'auto', whiteSpace: 'nowrap', display: 'flex', flexWrap: 'nowrap' }}>
          <button className={`pill ${activeTab === 'vat' ? 'active' : ''}`} onClick={() => setActiveTab('vat')}>VAT</button>
          <button className={`pill ${activeTab === 'inflation' ? 'active' : ''}`} onClick={() => setActiveTab('inflation')}>Inflation</button>
          <button className={`pill ${activeTab === 'loan' ? 'active' : ''}`} onClick={() => setActiveTab('loan')}>Loan</button>
          <button className={`pill ${activeTab === 'compound' ? 'active' : ''}`} onClick={() => setActiveTab('compound')}>Compound Interest</button>
          <button className={`pill ${activeTab === 'cagr' ? 'active' : ''}`} onClick={() => setActiveTab('cagr')}>CAGR</button>
          <button className={`pill ${activeTab === 'dcf' ? 'active' : ''}`} onClick={() => setActiveTab('dcf')}>DCF</button>
        </div>
      )}

      {activeTab === 'vat' && <VatCalculator />}
      {activeTab === 'inflation' && <InflationCalculator />}
      {activeTab === 'loan' && <LoanCalculator />}
      {activeTab === 'compound' && <CompoundInterestCalculator />}
      {activeTab === 'cagr' && <CagrCalculator />}
      {activeTab === 'dcf' && <DcfCalculator />}
    </div>
  );
};

const VatCalculator = () => {
    const [amount, setAmount] = useState('');
    const [rate, setRate] = useState(20);
    const [res, setRes] = useState(null);

    const calc = () => {
        const a = parseFloat(amount);
        const r = parseFloat(rate);
        const vat = a * (r / 100);
        setRes({ vat, total: a + vat });
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Amount" className="pill" style={{ width: '100%', marginBottom: '10px' }} />
            <input type="number" value={rate} onChange={e => setRate(e.target.value)} placeholder="VAT Rate (%)" className="pill" style={{ width: '100%', marginBottom: '10px' }} />
            <button className="btn-primary" onClick={calc} style={{ width: '100%' }}>Calculate</button>
            {res && (
                <div style={{ marginTop: '15px' }}>
                    <div>VAT: {res.vat.toFixed(2)}</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Total: {res.total.toFixed(2)}</div>
                </div>
            )}
        </div>
    );
};

const InflationCalculator = () => {
    const [amount, setAmount] = useState('');
    const [rate, setRate] = useState(3);
    const [years, setYears] = useState(1);
    const [res, setRes] = useState(null);

    const calc = () => {
        const a = parseFloat(amount);
        const r = parseFloat(rate) / 100;
        const y = parseInt(years);
        setRes(a * Math.pow(1 + r, y));
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Initial Amount" className="pill" style={{ width: '100%', marginBottom: '10px' }} />
            <input type="number" value={rate} onChange={e => setRate(e.target.value)} placeholder="Inflation Rate (%)" className="pill" style={{ width: '100%', marginBottom: '10px' }} />
            <input type="number" value={years} onChange={e => setYears(e.target.value)} placeholder="Years" className="pill" style={{ width: '100%', marginBottom: '10px' }} />
            <button className="btn-primary" onClick={calc} style={{ width: '100%' }}>Calculate Future Value</button>
            {res && <div style={{ marginTop: '15px', fontSize: '1.5rem' }}>Future Value: {res.toFixed(2)}</div>}
        </div>
    );
};

const LoanCalculator = () => {
    const [amount, setAmount] = useState('');
    const [rate, setRate] = useState(5);
    const [years, setYears] = useState(30);
    const [res, setRes] = useState(null);

    const calc = () => {
        const p = parseFloat(amount);
        const r = (parseFloat(rate) / 100) / 12;
        const n = parseInt(years) * 12;
        const m = p * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        setRes({ monthly: m, total: m * n });
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="Loan Amount" className="pill" style={{ width: '100%', marginBottom: '10px' }} />
            <input type="number" value={rate} onChange={e => setRate(e.target.value)} placeholder="Annual Interest (%)" className="pill" style={{ width: '100%', marginBottom: '10px' }} />
            <input type="number" value={years} onChange={e => setYears(e.target.value)} placeholder="Years" className="pill" style={{ width: '100%', marginBottom: '10px' }} />
            <button className="btn-primary" onClick={calc} style={{ width: '100%' }}>Calculate Payments</button>
            {res && (
                <div style={{ marginTop: '15px' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Monthly: {res.monthly.toFixed(2)}</div>
                    <div>Total Repayment: {res.total.toFixed(2)}</div>
                </div>
            )}
        </div>
    );
};

const CompoundInterestCalculator = () => {
    const [principal, setPrincipal] = useState('');
    const [rate, setRate] = useState(7);
    const [years, setYears] = useState(10);
    const [res, setRes] = useState(null);

    const calc = () => {
        const p = parseFloat(principal);
        const r = parseFloat(rate) / 100;
        const t = parseInt(years);
        setRes(p * Math.pow(1 + r, t));
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <input type="number" value={principal} onChange={e => setPrincipal(e.target.value)} placeholder="Principal Amount" className="pill" style={{ width: '100%', marginBottom: '10px' }} />
            <input type="number" value={rate} onChange={e => setRate(e.target.value)} placeholder="Annual Interest (%)" className="pill" style={{ width: '100%', marginBottom: '10px' }} />
            <input type="number" value={years} onChange={e => setYears(e.target.value)} placeholder="Years" className="pill" style={{ width: '100%', marginBottom: '10px' }} />
            <button className="btn-primary" onClick={calc} style={{ width: '100%' }}>Calculate</button>
            {res && <div style={{ marginTop: '15px', fontSize: '1.5rem' }}>Final Amount: {res.toFixed(2)}</div>}
        </div>
    );
};

const CagrCalculator = () => {
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [years, setYears] = useState(1);
    const [res, setRes] = useState(null);

    const calc = () => {
        const sv = parseFloat(start);
        const ev = parseFloat(end);
        const y = parseInt(years);
        setRes((Math.pow(ev / sv, 1 / y) - 1) * 100);
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <input type="number" value={start} onChange={e => setStart(e.target.value)} placeholder="Initial Value" className="pill" style={{ width: '100%', marginBottom: '10px' }} />
            <input type="number" value={end} onChange={e => setEnd(e.target.value)} placeholder="Final Value" className="pill" style={{ width: '100%', marginBottom: '10px' }} />
            <input type="number" value={years} onChange={e => setYears(e.target.value)} placeholder="Years" className="pill" style={{ width: '100%', marginBottom: '10px' }} />
            <button className="btn-primary" onClick={calc} style={{ width: '100%' }}>Calculate CAGR</button>
            {res && <div style={{ marginTop: '15px', fontSize: '1.5rem' }}>CAGR: {res.toFixed(2)}%</div>}
        </div>
    );
};

const DcfCalculator = () => {
    const [cashflow, setCashflow] = useState(''); // comma separated
    const [rate, setRate] = useState(10);
    const [res, setRes] = useState(null);

    const calc = () => {
        const cfs = cashflow.split(',').map(Number);
        const r = parseFloat(rate) / 100;
        let dcf = 0;
        cfs.forEach((cf, i) => {
            dcf += cf / Math.pow(1 + r, i + 1);
        });
        setRes(dcf);
    };

    return (
        <div style={{ textAlign: 'center' }}>
            <input value={cashflow} onChange={e => setCashflow(e.target.value)} placeholder="Cashflows (e.g. 100, 120, 150)" className="pill" style={{ width: '100%', marginBottom: '10px' }} />
            <input type="number" value={rate} onChange={e => setRate(e.target.value)} placeholder="Discount Rate (%)" className="pill" style={{ width: '100%', marginBottom: '10px' }} />
            <button className="btn-primary" onClick={calc} style={{ width: '100%' }}>Calculate NPV</button>
            {res && <div style={{ marginTop: '15px', fontSize: '1.5rem' }}>NPV: {res.toFixed(2)}</div>}
        </div>
    );
};

export default FinanceCalculators;
