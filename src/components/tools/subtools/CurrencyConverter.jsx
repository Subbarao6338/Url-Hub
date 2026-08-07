import React, { useState, useEffect } from 'react';
import ToolResult from '../ToolResult';

const CURRENCIES = [
    { code: 'USD', name: 'US Dollar ($)' },
    { code: 'EUR', name: 'Euro (€)' },
    { code: 'GBP', name: 'British Pound (£)' },
    { code: 'JPY', name: 'Japanese Yen (¥)' },
    { code: 'INR', name: 'Indian Rupee (₹)' },
    { code: 'CAD', name: 'Canadian Dollar (C$)' },
    { code: 'AUD', name: 'Australian Dollar (A$)' },
    { code: 'CHF', name: 'Swiss Franc (CHF)' },
    { code: 'CNY', name: 'Chinese Yuan (¥)' },
    { code: 'NZD', name: 'New Zealand Dollar (NZ$)' },
    { code: 'SGD', name: 'Singapore Dollar (S$)' },
    { code: 'ZAR', name: 'South African Rand (R)' }
];

// Robust static fallback exchange rates (relative to USD) if the live API fails or is offline
const FALLBACK_RATES = {
    USD: 1.0,
    EUR: 0.92,
    GBP: 0.79,
    JPY: 155.5,
    INR: 83.5,
    CAD: 1.37,
    AUD: 1.51,
    CHF: 0.90,
    CNY: 7.25,
    NZD: 1.63,
    SGD: 1.35,
    ZAR: 18.2
};

const CurrencyConverter = () => {
    const [amount, setAmount] = useState('100');
    const [fromCur, setFromCur] = useState('USD');
    const [toCur, setToCur] = useState('INR');
    const [rates, setRates] = useState(null);
    const [isFallback, setIsFallback] = useState(false);
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const fetchRates = async () => {
        setLoading(true);
        setResult(null);
        try {
            const response = await fetch('https://open.er-api.com/v6/latest/USD');
            if (!response.ok) throw new Error('Failed to fetch exchange rates.');
            const data = await response.json();
            if (data.rates) {
                setRates(data.rates);
                setIsFallback(false);
                calculateConversion(data.rates, false);
            } else {
                throw new Error('Invalid rate response format.');
            }
        } catch (e) {
            console.warn("Live currency rates API down. Using enterprise offline fallback rates.", e.message);
            setRates(FALLBACK_RATES);
            setIsFallback(true);
            calculateConversion(FALLBACK_RATES, true);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRates();
    }, []);

    const calculateConversion = (activeRates = rates, activeFallback = isFallback) => {
        if (!activeRates) return;
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            setResult({ error: 'Please enter a valid amount.' });
            return;
        }

        const usdAmount = fromCur === 'USD' ? parsedAmount : parsedAmount / activeRates[fromCur];
        const targetAmount = toCur === 'USD' ? usdAmount : usdAmount * activeRates[toCur];

        setResult({
            text: `${parsedAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${fromCur} = ${targetAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${toCur}`,
            meta: {
                rate: `1 ${fromCur} = ${(targetAmount / parsedAmount).toFixed(4)} ${toCur}`,
                source: activeFallback ? 'Local Offline Dictionary (Fallback Rates)' : 'Live Exchange Rates API (Online)'
            }
        });
    };

    const handleSwap = () => {
        const temp = fromCur;
        setFromCur(toCur);
        setToCur(temp);
    };

    useEffect(() => {
        if (rates) {
            calculateConversion();
        }
    }, [amount, fromCur, toCur, rates, isFallback]);

    return (
        <div className="card p-30 glass-card text-center grid gap-15">
            <h3>Currency Exchange & Converter</h3>
            <p className="smallest opacity-6">Real-time currency exchange rates and calculator powered by the Open Exchange Rate API.</p>

            {isFallback && (
                <div className="alert-info smallest p-10 rounded-lg opacity-8 flex-center gap-10 animate-fadeIn">
                    <span className="material-icons color-info" style={{ fontSize: '1rem' }}>cloud_off</span>
                    <span>Offline Mode: Using cached standard fallback exchange rates.</span>
                </div>
            )}

            <div className="form-group text-left">
                <label className="smallest opacity-6 uppercase ml-10">Amount</label>
                <input
                    type="number"
                    className="pill w-full"
                    placeholder="Enter amount..."
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                />
            </div>

            <div className="grid grid-3-cols gap-10 items-center text-left">
                <div className="form-group">
                    <label className="smallest opacity-6 uppercase ml-10">From</label>
                    <select className="pill w-full" value={fromCur} onChange={e => setFromCur(e.target.value)}>
                        {CURRENCIES.map(c => (
                            <option key={`from-${c.code}`} value={c.code}>{c.code} - {c.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex-center mt-20">
                    <button className="pill" onClick={handleSwap} style={{ padding: '10px' }} title="Swap Currencies">
                        <span className="material-icons">swap_horiz</span>
                    </button>
                </div>

                <div className="form-group">
                    <label className="smallest opacity-6 uppercase ml-10">To</label>
                    <select className="pill w-full" value={toCur} onChange={e => setToCur(e.target.value)}>
                        {CURRENCIES.map(c => (
                            <option key={`to-${c.code}`} value={c.code}>{c.code} - {c.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="flex-center mt-10">
                <button className="btn-primary" onClick={() => fetchRates()} disabled={loading}>
                    <span className="material-icons mr-10">refresh</span>
                    {loading ? 'Refreshing Rates...' : 'Refresh Rates'}
                </button>
            </div>

            <ToolResult result={result} />
        </div>
    );
};

export default CurrencyConverter;
