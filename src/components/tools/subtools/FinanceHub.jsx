import React, { useState } from 'react';
import ToolResult from '../ToolResult';

const FinanceHub = () => {
    const [activeCalc, setActiveCalc] = useState('emi');
    const [amt, setAmt] = useState(100000);
    const [rate, setRate] = useState(7.5);
    const [yrs, setYrs] = useState(15);
    const [compounding, setCompounding] = useState(12); // Monthly by default
    const [result, setResult] = useState(null);

    const calculate = () => {
        if (activeCalc === 'emi') {
            const r = rate / 1200, n = yrs * 12;
            const emi = (amt * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
            setResult({ text: `Monthly EMI: ${emi.toFixed(2)}\nTotal Payment: ${(emi * n).toFixed(2)}\nTotal Interest: ${(emi * n - amt).toFixed(2)}` });
        } else if (activeCalc === 'cagr') {
            const initial = rate, final = amt;
            const cagr = (Math.pow(final / initial, 1 / yrs) - 1) * 100;
            setResult({ text: `CAGR: ${cagr.toFixed(2)}%` });
        } else if (activeCalc === 'mortgage') {
            const r = rate / 1200, n = yrs * 12;
            const monthly = (amt * r) / (1 - Math.pow(1 + r, -n));
            setResult({ text: `Monthly Mortgage: ${monthly.toFixed(2)}\nTotal Payment: ${(monthly * n).toFixed(2)}` });
        } else if (activeCalc === 'compound') {
            const P = amt, r = rate / 100, t = yrs, n = compounding;
            const A = P * Math.pow(1 + r/n, n * t);
            const interest = A - P;
            setResult({ text: `Final Amount: ${A.toFixed(2)}\nTotal Interest: ${interest.toFixed(2)}` });
        }
    };

    return (
        <div className="card p-30 glass-card grid gap-15">
            <div className="pill-group scrollable-x">
                <button className={`pill ${activeCalc === 'emi' ? 'active' : ''}`} onClick={() => setActiveCalc('emi')}>EMI</button>
                <button className={`pill ${activeCalc === 'compound' ? 'active' : ''}`} onClick={() => setActiveCalc('compound')}>Compound Interest</button>
                <button className={`pill ${activeCalc === 'mortgage' ? 'active' : ''}`} onClick={() => setActiveCalc('mortgage')}>Mortgage</button>
                <button className={`pill ${activeCalc === 'cagr' ? 'active' : ''}`} onClick={() => setActiveCalc('cagr')}>CAGR</button>
            </div>
            <div className="grid gap-10">
                <div className="form-group">
                    <label>{activeCalc === 'cagr' ? 'Final Value' : 'Principal Amount'}</label>
                    <input type="number" className="pill w-full" value={amt} onChange={e => setAmt(parseFloat(e.target.value) || 0)} />
                </div>
                <div className="form-group">
                    <label>{activeCalc === 'cagr' ? 'Initial Value' : 'Interest Rate (%)'}</label>
                    <input type="number" className="pill w-full" value={rate} onChange={e => setRate(parseFloat(e.target.value) || 0)} />
                </div>
                <div className="form-group">
                    <label>Period (Years)</label>
                    <input type="number" className="pill w-full" value={yrs} onChange={e => setYrs(parseFloat(e.target.value) || 0)} />
                </div>
                {activeCalc === 'compound' && (
                    <div className="form-group">
                        <label>Compounding Frequency</label>
                        <select className="pill w-full" value={compounding} onChange={e => setCompounding(parseInt(e.target.value))}>
                            <option value={1}>Annually</option>
                            <option value={2}>Semi-Annually</option>
                            <option value={4}>Quarterly</option>
                            <option value={12}>Monthly</option>
                            <option value={365}>Daily</option>
                        </select>
                    </div>
                )}
                <button className="btn-primary" onClick={calculate}>Calculate</button>
            </div>
            <ToolResult result={result} />
        </div>
    );
};

export default FinanceHub;
