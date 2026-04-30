import React, { useState, useEffect } from 'react';

const FinanceCalculators = ({ toolId }) => {
  const [activeTab, setActiveTab] = useState('vat');

  useEffect(() => {
    if (toolId) {
        if (toolId === 'vat-calc') setActiveTab('vat');
        else if (toolId === 'loan-calc') setActiveTab('loan');
        else if (toolId === 'compound-int') setActiveTab('compound');
        else if (toolId === 'inflation') setActiveTab('inflation');
        else if (toolId === 'cagr') setActiveTab('cagr');
        else if (toolId === 'dcf') setActiveTab('dcf');
    }
  }, [toolId]);

  return (
    <div className="tool-form">
      {!toolId && (
        <div className="pill-group mb-20 scrollable-x">
          <button className={`pill ${activeTab === 'vat' ? 'active' : ''}`} onClick={() => setActiveTab('vat')}>VAT</button>
          <button className={`pill ${activeTab === 'inflation' ? 'active' : ''}`} onClick={() => setActiveTab('inflation')}>Inflation</button>
          <button className={`pill ${activeTab === 'loan' ? 'active' : ''}`} onClick={() => setActiveTab('loan')}>Loan</button>
          <button className={`pill ${activeTab === 'compound' ? 'active' : ''}`} onClick={() => setActiveTab('compound')}>Compound Interest</button>
          <button className={`pill ${activeTab === 'cagr' ? 'active' : ''}`} onClick={() => setActiveTab('cagr')}>CAGR</button>
          <button className={`pill ${activeTab === 'dcf' ? 'active' : ''}`} onClick={() => setActiveTab('dcf')}>NPV (DCF)</button>
        </div>
      )}

      <div className="tool-container">
        {activeTab === 'vat' && <VatCalculator />}
        {activeTab === 'inflation' && <InflationCalculator />}
        {activeTab === 'loan' && <LoanCalculator />}
        {activeTab === 'compound' && <CompoundInterestCalculator />}
        {activeTab === 'cagr' && <CagrCalculator />}
        {activeTab === 'dcf' && <DcfCalculator />}
      </div>
    </div>
  );
};

const VatCalculator = () => {
    const [amount, setAmount] = useState('1000');
    const [rate, setRate] = useState('20');
    const [isInclusive, setIsInclusive] = useState(false);
    const [res, setRes] = useState(null);

    const calc = () => {
        const a = parseFloat(amount);
        const r = parseFloat(rate);
        if (isNaN(a) || isNaN(r)) return;

        let vat, net, total;
        if (isInclusive) {
            total = a;
            net = a / (1 + (r / 100));
            vat = total - net;
        } else {
            net = a;
            vat = a * (r / 100);
            total = net + vat;
        }
        setRes({ vat, net, total });
    };

    useEffect(calc, [amount, rate, isInclusive]);

    return (
        <div className="grid gap-15">
            <div className="form-group">
                <label className="uppercase tracking-wider opacity-6" style={{fontSize: '0.8rem'}}>Amount</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="pill w-full mt-5" />
            </div>
            <div className="form-group">
                <label className="uppercase tracking-wider opacity-6" style={{fontSize: '0.8rem'}}>VAT Rate (%)</label>
                <input type="number" value={rate} onChange={e => setRate(e.target.value)} className="pill w-full mt-5" />
            </div>
            <div className="flex-center gap-10">
                <button className={`pill flex-1 ${!isInclusive ? 'active' : ''}`} onClick={() => setIsInclusive(false)}>Excluding VAT</button>
                <button className={`pill flex-1 ${isInclusive ? 'active' : ''}`} onClick={() => setIsInclusive(true)}>Including VAT</button>
            </div>
            {res && (
                <div className="tool-result">
                    <div className="flex-between mb-5"><span>Net Amount:</span> <span className="font-bold">{res.net.toFixed(2)}</span></div>
                    <div className="flex-between mb-5"><span>VAT ({rate}%):</span> <span className="font-bold">{res.vat.toFixed(2)}</span></div>
                    <div className="flex-between mt-10 p-10 bg-nature-mist" style={{borderRadius: '8px', border: '1px solid var(--border)'}}>
                        <span className="font-bold">Total:</span>
                        <span className="font-bold" style={{fontSize: '1.25rem', color: 'var(--primary)'}}>{res.total.toFixed(2)}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

const InflationCalculator = () => {
    const [amount, setAmount] = useState('1000');
    const [rate, setRate] = useState('5');
    const [years, setYears] = useState('10');
    const [res, setRes] = useState(null);

    const calc = () => {
        const a = parseFloat(amount);
        const r = parseFloat(rate) / 100;
        const y = parseFloat(years);
        if (isNaN(a) || isNaN(r) || isNaN(y)) return;
        setRes(a * Math.pow(1 + r, y));
    };

    useEffect(calc, [amount, rate, years]);

    return (
        <div className="grid gap-15">
            <div className="form-group">
                <label className="uppercase tracking-wider opacity-6" style={{fontSize: '0.8rem'}}>Current Value</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="pill w-full mt-5" />
            </div>
            <div className="form-group">
                <label className="uppercase tracking-wider opacity-6" style={{fontSize: '0.8rem'}}>Annual Inflation (%)</label>
                <input type="number" value={rate} onChange={e => setRate(e.target.value)} className="pill w-full mt-5" />
            </div>
            <div className="form-group">
                <label className="uppercase tracking-wider opacity-6" style={{fontSize: '0.8rem'}}>Years</label>
                <input type="number" value={years} onChange={e => setYears(e.target.value)} className="pill w-full mt-5" />
            </div>
            {res && (
                <div className="tool-result text-center">
                    <div className="opacity-6 mb-5 uppercase tracking-wider" style={{fontSize: '0.75rem'}}>Future Value</div>
                    <div className="font-bold" style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>{res.toFixed(2)}</div>
                </div>
            )}
        </div>
    );
};

const LoanCalculator = () => {
    const [amount, setAmount] = useState('250000');
    const [rate, setRate] = useState('4.5');
    const [years, setYears] = useState('30');
    const [res, setRes] = useState(null);

    const calc = () => {
        const p = parseFloat(amount);
        const r = (parseFloat(rate) / 100) / 12;
        const n = parseInt(years) * 12;
        if (isNaN(p) || isNaN(r) || isNaN(n) || n === 0) return;

        const m = p * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        setRes({ monthly: m, total: m * n, interest: (m * n) - p });
    };

    useEffect(calc, [amount, rate, years]);

    return (
        <div className="grid gap-15">
            <div className="form-group">
                <label className="uppercase tracking-wider opacity-6" style={{fontSize: '0.8rem'}}>Loan Principal</label>
                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="pill w-full mt-5" />
            </div>
            <div className="grid grid-2 gap-10">
                <div className="form-group">
                    <label className="uppercase tracking-wider opacity-6" style={{fontSize: '0.8rem'}}>Interest (%)</label>
                    <input type="number" value={rate} onChange={e => setRate(e.target.value)} className="pill w-full mt-5" />
                </div>
                <div className="form-group">
                    <label className="uppercase tracking-wider opacity-6" style={{fontSize: '0.8rem'}}>Years</label>
                    <input type="number" value={years} onChange={e => setYears(e.target.value)} className="pill w-full mt-5" />
                </div>
            </div>
            {res && (
                <div className="tool-result">
                    <div className="text-center mb-15">
                        <div className="opacity-6 mb-5 uppercase tracking-wider" style={{fontSize: '0.75rem'}}>Monthly Payment</div>
                        <div className="font-bold" style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>{res.monthly.toFixed(2)}</div>
                    </div>
                    <div className="flex-between mb-5"><span>Total Repayment:</span> <span className="font-bold">{res.total.toFixed(2)}</span></div>
                    <div className="flex-between"><span>Total Interest:</span> <span className="font-bold">{res.interest.toFixed(2)}</span></div>
                </div>
            )}
        </div>
    );
};

const CompoundInterestCalculator = () => {
    const [principal, setPrincipal] = useState('5000');
    const [rate, setRate] = useState('7');
    const [years, setYears] = useState('10');
    const [contribution, setContribution] = useState('100');
    const [res, setRes] = useState(null);

    const calc = () => {
        const p = parseFloat(principal);
        const r = parseFloat(rate) / 100 / 12;
        const t = parseFloat(years) * 12;
        const c = parseFloat(contribution);
        if (isNaN(p) || isNaN(r) || isNaN(t)) return;

        const futureValue = p * Math.pow(1 + r, t) + c * ((Math.pow(1 + r, t) - 1) / r);
        setRes(futureValue);
    };

    useEffect(calc, [principal, rate, years, contribution]);

    return (
        <div className="grid gap-15">
            <div className="form-group">
                <label className="uppercase tracking-wider opacity-6" style={{fontSize: '0.8rem'}}>Initial Investment</label>
                <input type="number" value={principal} onChange={e => setPrincipal(e.target.value)} className="pill w-full mt-5" />
            </div>
            <div className="form-group">
                <label className="uppercase tracking-wider opacity-6" style={{fontSize: '0.8rem'}}>Monthly Contribution</label>
                <input type="number" value={contribution} onChange={e => setContribution(e.target.value)} className="pill w-full mt-5" />
            </div>
            <div className="grid grid-2 gap-10">
                <div className="form-group">
                    <label className="uppercase tracking-wider opacity-6" style={{fontSize: '0.8rem'}}>Annual Return (%)</label>
                    <input type="number" value={rate} onChange={e => setRate(e.target.value)} className="pill w-full mt-5" />
                </div>
                <div className="form-group">
                    <label className="uppercase tracking-wider opacity-6" style={{fontSize: '0.8rem'}}>Years</label>
                    <input type="number" value={years} onChange={e => setYears(e.target.value)} className="pill w-full mt-5" />
                </div>
            </div>
            {res && (
                <div className="tool-result text-center">
                    <div className="opacity-6 mb-5 uppercase tracking-wider" style={{fontSize: '0.75rem'}}>Final Balance</div>
                    <div className="font-bold" style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>{res.toFixed(2)}</div>
                </div>
            )}
        </div>
    );
};

const CagrCalculator = () => {
    const [start, setStart] = useState('1000');
    const [end, setEnd] = useState('2500');
    const [years, setYears] = useState('5');
    const [res, setRes] = useState(null);

    const calc = () => {
        const sv = parseFloat(start);
        const ev = parseFloat(end);
        const y = parseFloat(years);
        if (isNaN(sv) || isNaN(ev) || isNaN(y) || sv <= 0 || y <= 0) return;
        setRes((Math.pow(ev / sv, 1 / y) - 1) * 100);
    };

    useEffect(calc, [start, end, years]);

    return (
        <div className="grid gap-15">
            <div className="form-group">
                <label className="uppercase tracking-wider opacity-6" style={{fontSize: '0.8rem'}}>Initial Value</label>
                <input type="number" value={start} onChange={e => setStart(e.target.value)} className="pill w-full mt-5" />
            </div>
            <div className="form-group">
                <label className="uppercase tracking-wider opacity-6" style={{fontSize: '0.8rem'}}>Final Value</label>
                <input type="number" value={end} onChange={e => setEnd(e.target.value)} className="pill w-full mt-5" />
            </div>
            <div className="form-group">
                <label className="uppercase tracking-wider opacity-6" style={{fontSize: '0.8rem'}}>Years</label>
                <input type="number" value={years} onChange={e => setYears(e.target.value)} className="pill w-full mt-5" />
            </div>
            {res && (
                <div className="tool-result text-center">
                    <div className="opacity-6 mb-5 uppercase tracking-wider" style={{fontSize: '0.75rem'}}>CAGR (Annualized Return)</div>
                    <div className="font-bold" style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>{res.toFixed(2)}%</div>
                </div>
            )}
        </div>
    );
};

const DcfCalculator = () => {
    const [cashflow, setCashflow] = useState('1000, 1200, 1500, 1800, 2500');
    const [rate, setRate] = useState('10');
    const [res, setRes] = useState(null);

    const calc = () => {
        const cfs = cashflow.split(',').map(s => parseFloat(s.trim()));
        const r = parseFloat(rate) / 100;
        if (isNaN(r)) return;

        let npv = 0;
        cfs.forEach((cf, i) => {
            if (!isNaN(cf)) {
                npv += cf / Math.pow(1 + r, i + 1);
            }
        });
        setRes(npv);
    };

    useEffect(calc, [cashflow, rate]);

    return (
        <div className="grid gap-15">
            <div className="form-group">
                <label className="uppercase tracking-wider opacity-6" style={{fontSize: '0.8rem'}}>Cashflows (Comma Separated)</label>
                <textarea className="pill w-full mt-5" rows="3" value={cashflow} onChange={e => setCashflow(e.target.value)} placeholder="1000, 1100, 1250..." />
            </div>
            <div className="form-group">
                <label className="uppercase tracking-wider opacity-6" style={{fontSize: '0.8rem'}}>Discount Rate (%)</label>
                <input type="number" value={rate} onChange={e => setRate(e.target.value)} className="pill w-full mt-5" />
            </div>
            {res && (
                <div className="tool-result text-center">
                    <div className="opacity-6 mb-5 uppercase tracking-wider" style={{fontSize: '0.75rem'}}>Net Present Value (NPV)</div>
                    <div className="font-bold" style={{ fontSize: '1.75rem', color: 'var(--primary)' }}>{res.toFixed(2)}</div>
                </div>
            )}
        </div>
    );
};

export default FinanceCalculators;
