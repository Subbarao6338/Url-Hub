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
        } else if (activeCalc === 'vat') {
            const netAmount = amt;
            const vatRate = rate;
            const vatAmount = netAmount * (vatRate / 100);
            const totalAmount = netAmount + vatAmount;
            setResult({ text: `VAT Amount: ${vatAmount.toFixed(2)}\nTotal Amount: ${totalAmount.toFixed(2)}` });
        } else if (activeCalc === 'inflation') {
            const currentAmount = amt;
            const inflationRate = rate / 100;
            const futureValue = currentAmount * Math.pow(1 + inflationRate, yrs);
            setResult({ text: `Future Value: ${futureValue.toFixed(2)}\nBuying Power Decrease: ${(futureValue - currentAmount).toFixed(2)}` });
        }
    };

    const CALC_CONFIG = {
        emi: { label: 'EMI', principal: 'Principal Amount', rate: 'Interest Rate (%)' },
        compound: { label: 'Compound Interest', principal: 'Principal Amount', rate: 'Interest Rate (%)' },
        mortgage: { label: 'Mortgage', principal: 'Principal Amount', rate: 'Interest Rate (%)' },
        cagr: { label: 'CAGR', principal: 'Final Value', rate: 'Initial Value' },
        vat: { label: 'VAT', principal: 'Net Amount', rate: 'VAT Rate (%)' },
        inflation: { label: 'Inflation', principal: 'Current Amount', rate: 'Inflation Rate (%)' }
    };

    return (
        <div className="card p-30 glass-card grid gap-15">
            <div className="pill-group scrollable-x">
                {Object.keys(CALC_CONFIG).map(id => (
                    <button
                        key={id}
                        className={`pill ${activeCalc === id ? 'active' : ''}`}
                        onClick={() => setActiveCalc(id)}
                    >
                        {CALC_CONFIG[id].label}
                    </button>
                ))}
            </div>
            <div className="grid gap-10">
                <div className="form-group">
                    <label>{CALC_CONFIG[activeCalc].principal}</label>
                    <input type="number" className="pill w-full" value={amt} onChange={e => setAmt(parseFloat(e.target.value) || 0)} />
                </div>
                <div className="form-group">
                    <label>{CALC_CONFIG[activeCalc].rate}</label>
                    <input type="number" className="pill w-full" value={rate} onChange={e => setRate(parseFloat(e.target.value) || 0)} />
                </div>
                {activeCalc !== 'vat' && (
                    <div className="form-group">
                        <label>Period (Years)</label>
                        <input type="number" className="pill w-full" value={yrs} onChange={e => setYrs(parseFloat(e.target.value) || 0)} />
                    </div>
                )}
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
