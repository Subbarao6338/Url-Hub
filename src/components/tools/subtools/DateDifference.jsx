import React, { useState } from 'react';
import ToolResult from '../ToolResult';

const DateDifference = () => {
    const [d1, setD1] = useState('');
    const [d2, setD2] = useState('');
    const [includeWeekends, setIncludeWeekends] = useState(true);
    const [result, setResult] = useState(null);

    const getFormattedDateString = (dateObj) => {
        if (!dateObj) return '';
        const y = dateObj.getFullYear();
        const m = String(dateObj.getMonth() + 1).padStart(2, '0');
        const d = String(dateObj.getDate()).padStart(2, '0');
        return `${y}-${m}-${m === '02' && d === '29' ? '28' : d}`; // safe format
    };

    const getPredefinedDate = (type) => {
        const now = new Date();
        switch (type) {
            case 'today':
                return getFormattedDateString(now);
            case 'yesterday': {
                const yes = new Date();
                yes.setDate(now.getDate() - 1);
                return getFormattedDateString(yes);
            }
            case 'startOfYear':
                return `${now.getFullYear()}-01-01`;
            case 'endOfYear':
                return `${now.getFullYear()}-12-31`;
            default:
                return '';
        }
    };

    const handlePresetFill = (target, type) => {
        const dateStr = getPredefinedDate(type);
        if (target === 'd1') {
            setD1(dateStr);
        } else {
            setD2(dateStr);
        }
    };

    const getExactYMD = (date1, date2) => {
        let start = new Date(date1);
        let end = new Date(date2);
        if (start > end) {
            const temp = start;
            start = end;
            end = temp;
        }

        let years = end.getFullYear() - start.getFullYear();
        let months = end.getMonth() - start.getMonth();
        let days = end.getDate() - start.getDate();

        if (days < 0) {
            months -= 1;
            const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
            days += prevMonth.getDate();
        }

        if (months < 0) {
            years -= 1;
            months += 12;
        }

        return { years, months, days };
    };

    const calculateBusinessDays = (date1, date2) => {
        let start = new Date(date1);
        let end = new Date(date2);
        if (start > end) {
            const temp = start;
            start = end;
            end = temp;
        }

        let count = 0;
        let cur = new Date(start);
        while (cur <= end) {
            const day = cur.getDay();
            if (day !== 0 && day !== 6) { // 0 = Sunday, 6 = Saturday
                count++;
            }
            cur.setDate(cur.getDate() + 1);
        }
        return count;
    };

    const calc = () => {
        if (!d1 || !d2) {
            setResult({ error: 'Please select both start and end dates.' });
            return;
        }

        const date1 = new Date(d1);
        const date2 = new Date(d2);

        if (isNaN(date1.getTime()) || isNaN(date2.getTime())) {
            setResult({ error: 'Invalid date format selected.' });
            return;
        }

        const msDiff = date2.getTime() - date1.getTime();
        const absMsDiff = Math.abs(msDiff);
        const totalDays = Math.ceil(absMsDiff / (1000 * 60 * 60 * 24));

        // Chronological relationship
        let relation = '';
        if (msDiff === 0) {
            relation = 'Date 1 is the same as Date 2.';
        } else if (msDiff < 0) {
            relation = `Date 1 is ${totalDays} days after Date 2.`;
        } else {
            relation = `Date 1 is ${totalDays} days before Date 2.`;
        }

        // Exact YMD
        const { years, months, days } = getExactYMD(date1, date2);
        const exactParts = [];
        if (years > 0) exactParts.push(`${years} year${years > 1 ? 's' : ''}`);
        if (months > 0) exactParts.push(`${months} month${months > 1 ? 's' : ''}`);
        if (days > 0 || exactParts.length === 0) exactParts.push(`${days} day${days !== 1 ? 's' : ''}`);
        const exactStr = exactParts.join(', ');

        // Business days
        const businessDaysCount = calculateBusinessDays(date1, date2);

        // Advanced breakdowns
        const totalWeeks = Math.floor(totalDays / 7);
        const remainingDays = totalDays % 7;
        const totalMonths = (years * 12) + months;
        const totalHours = totalDays * 24;
        const totalMinutes = totalHours * 60;
        const totalSeconds = totalMinutes * 60;

        let outputText = `### Date Difference Analysis\n\n`;
        outputText += `🗓️ **Chronology:** ${relation}\n`;
        outputText += `✨ **Exact Span:** ${exactStr}\n\n`;
        outputText += `| Interval | Value |\n`;
        outputText += `| --- | --- |\n`;
        outputText += `| 📅 Total Days | **${totalDays.toLocaleString()}** days |\n`;
        if (!includeWeekends) {
            outputText += `| 💼 Working Days | **${businessDaysCount.toLocaleString()}** days (excl. weekends) |\n`;
        }
        outputText += `| 🗓️ Weeks | **${totalWeeks}** weeks, **${remainingDays}** days |\n`;
        if (totalMonths > 0) {
            outputText += `| 📊 Months | **${totalMonths}** months, **${days}** days |\n`;
        }
        outputText += `| 🕒 Total Hours | **${totalHours.toLocaleString()}** hours |\n`;
        outputText += `| ⏱️ Total Minutes | **${totalMinutes.toLocaleString()}** minutes |\n`;
        outputText += `| ⚡ Total Seconds | **${totalSeconds.toLocaleString()}** seconds |\n`;

        setResult({ text: outputText });
    };

    const handleClear = () => {
        setD1('');
        setD2('');
        setResult(null);
    };

    return (
        <div className="card p-30 glass-card grid gap-20">
            <h3 className="text-center">Advanced Date Difference</h3>
            <p className="smallest opacity-6 text-center mb-10">Calculate precise differences in calendar days, business days, and time breakdowns between any two dates.</p>

            <div className="grid cols-2 gap-15" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                <div className="form-group text-left card p-15 bg-surface" style={{ border: '1px solid var(--border-color)' }}>
                    <label className="smallest opacity-6 uppercase ml-10 font-bold">Start Date (Date 1)</label>
                    <input
                        type="date"
                        className="pill w-full mt-5"
                        value={d1}
                        onChange={e => setD1(e.target.value)}
                    />
                    <div className="flex gap-5 mt-10 scrollable-x" style={{ flexWrap: 'wrap' }}>
                        <button type="button" className="pill smallest" onClick={() => handlePresetFill('d1', 'today')}>Today</button>
                        <button type="button" className="pill smallest" onClick={() => handlePresetFill('d1', 'yesterday')}>Yesterday</button>
                        <button type="button" className="pill smallest" onClick={() => handlePresetFill('d1', 'startOfYear')}>Start of Year</button>
                    </div>
                </div>

                <div className="form-group text-left card p-15 bg-surface" style={{ border: '1px solid var(--border-color)' }}>
                    <label className="smallest opacity-6 uppercase ml-10 font-bold">End Date (Date 2)</label>
                    <input
                        type="date"
                        className="pill w-full mt-5"
                        value={d2}
                        onChange={e => setD2(e.target.value)}
                    />
                    <div className="flex gap-5 mt-10 scrollable-x" style={{ flexWrap: 'wrap' }}>
                        <button type="button" className="pill smallest" onClick={() => handlePresetFill('d2', 'today')}>Today</button>
                        <button type="button" className="pill smallest" onClick={() => handlePresetFill('d2', 'endOfYear')}>End of Year</button>
                    </div>
                </div>
            </div>

            <div className="form-group flex align-center gap-10 mt-10 justify-center">
                <input
                    type="checkbox"
                    id="calc-working-days"
                    checked={!includeWeekends}
                    onChange={e => setIncludeWeekends(!e.target.checked)}
                    style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                />
                <label htmlFor="calc-working-days" className="small cursor-pointer select-none">
                    Include Business Days count (excluding Saturday/Sunday)
                </label>
            </div>

            <div className="flex gap-10">
                <button className="btn-primary flex-1" onClick={calc}>
                    Calculate Difference
                </button>
                {(d1 || d2 || result) && (
                    <button className="pill" onClick={handleClear} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                        Clear
                    </button>
                )}
            </div>

            <ToolResult result={result} />
        </div>
    );
};

export default DateDifference;
