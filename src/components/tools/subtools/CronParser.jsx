import React, { useState } from 'react';
import ToolResult from '../ToolResult';

const WEEKDAYS = {
    '0': 'Sunday', '7': 'Sunday', 'sun': 'Sunday',
    '1': 'Monday', 'mon': 'Monday',
    '2': 'Tuesday', 'tue': 'Tuesday',
    '3': 'Wednesday', 'wed': 'Wednesday',
    '4': 'Thursday', 'thu': 'Thursday',
    '5': 'Friday', 'fri': 'Friday',
    '6': 'Saturday', 'sat': 'Saturday'
};

const MONTHS = {
    '1': 'January', 'jan': 'January',
    '2': 'February', 'feb': 'February',
    '3': 'March', 'mar': 'March',
    '4': 'April', 'apr': 'April',
    '5': 'May', 'may': 'May',
    '6': 'June', 'jun': 'June',
    '7': 'July', 'jul': 'July',
    '8': 'August', 'aug': 'August',
    '9': 'September', 'sep': 'September',
    '10': 'October', 'oct': 'October',
    '11': 'November', 'nov': 'November',
    '12': 'December', 'dec': 'December'
};

const PRESETS = [
    { label: 'Every Minute', value: '* * * * *' },
    { label: 'Every Hour', value: '0 * * * *' },
    { label: 'Every Day at Midnight', value: '0 0 * * *' },
    { label: 'Every Weekday', value: '0 0 * * 1-5' },
    { label: 'Every Weekend', value: '0 0 * * 0,6' },
    { label: 'First Day of Month', value: '0 0 1 * *' }
];

const CronParser = () => {
    const [cron, setCron] = useState('* * * * *');
    const [result, setResult] = useState(null);

    const explainField = (val, name, namesMap = null) => {
        if (val === '*') return `every ${name}`;

        // Step step e.g., */15
        if (val.startsWith('*/')) {
            const step = val.split('*/')[1];
            return `every ${step} ${name}s`;
        }

        // Range with step e.g., 1-30/5
        if (val.includes('/')) {
            const [range, step] = val.split('/');
            return `every ${step} ${name}s within range [${range}]`;
        }

        // List of values e.g., 1,3,5
        if (val.includes(',')) {
            const parts = val.split(',').map(p => {
                const cleanPart = p.toLowerCase();
                if (namesMap && namesMap[cleanPart]) return namesMap[cleanPart];
                return p;
            });
            return `specific ${name}s: ${parts.join(', ')}`;
        }

        // Range e.g., 1-5
        if (val.includes('-')) {
            const [start, end] = val.split('-');
            const startLabel = namesMap && namesMap[start.toLowerCase()] ? namesMap[start.toLowerCase()] : start;
            const endLabel = namesMap && namesMap[end.toLowerCase()] ? namesMap[end.toLowerCase()] : end;
            return `${name}s from ${startLabel} through ${endLabel}`;
        }

        // Specific value
        const cleanVal = val.toLowerCase();
        if (namesMap && namesMap[cleanVal]) return namesMap[cleanVal];
        return `at ${name} ${val}`;
    };

    const matchesCronField = (val, expr, isDow = false) => {
        if (expr === '*') return true;

        if (expr.includes(',')) {
            return expr.split(',').some(p => matchesCronField(val, p, isDow));
        }

        if (expr.includes('/')) {
            const [range, stepStr] = expr.split('/');
            const step = parseInt(stepStr, 10);
            let start = 0;
            let end = 59;

            if (range !== '*') {
                if (range.includes('-')) {
                    const [s, e] = range.split('-');
                    start = parseInt(s, 10);
                    end = parseInt(e, 10);
                } else {
                    start = parseInt(range, 10);
                }
            }

            if (val < start || val > end) return false;
            return (val - start) % step === 0;
        }

        if (expr.includes('-')) {
            const [s, e] = expr.split('-');
            const start = parseInt(s, 10);
            const end = parseInt(e, 10);
            return val >= start && val <= end;
        }

        const num = parseInt(expr, 10);
        if (isDow) {
            const normalizedVal = val === 7 ? 0 : val;
            const normalizedNum = num === 7 ? 0 : num;
            return normalizedVal === normalizedNum;
        }
        return val === num;
    };

    const matchesCron = (date, parts) => {
        const min = date.getMinutes();
        const hour = date.getHours();
        const dom = date.getDate();
        const month = date.getMonth() + 1;
        const dow = date.getDay();

        return matchesCronField(min, parts[0]) &&
               matchesCronField(hour, parts[1]) &&
               matchesCronField(dom, parts[2]) &&
               matchesCronField(month, parts[3]) &&
               matchesCronField(dow, parts[4], true);
    };

    const getNextExecutions = (cronExpr, count = 5) => {
        const parts = cronExpr.trim().split(/\s+/);
        if (parts.length !== 5) return [];

        const list = [];
        let current = new Date();
        current.setSeconds(0);
        current.setMilliseconds(0);
        current.setMinutes(current.getMinutes() + 1);

        let iterations = 0;
        while (list.length < count && iterations < 100000) {
            if (matchesCron(current, parts)) {
                list.push(new Date(current));
            }
            current.setMinutes(current.getMinutes() + 1);
            iterations++;
        }
        return list;
    };

    const parseCron = () => {
        const cleaned = cron.trim().replace(/\s+/g, ' ');
        const parts = cleaned.split(' ');
        if (parts.length !== 5) {
            setResult({ error: 'Invalid Cron: Expected exactly 5 parts (minute, hour, day-of-month, month, day-of-week).' });
            return;
        }

        const mDesc = explainField(parts[0], 'minute');
        const hDesc = explainField(parts[1], 'hour');
        const domDesc = explainField(parts[2], 'day of month');
        const monDesc = explainField(parts[3], 'month', MONTHS);
        const dowDesc = explainField(parts[4], 'day of week', WEEKDAYS);

        // Generate next 5 schedules
        const nextRuns = getNextExecutions(cleaned, 5);
        let scheduleStr = '';
        if (nextRuns.length > 0) {
            scheduleStr = nextRuns.map((r, idx) => `${idx + 1}. 📅 **${r.toLocaleString()}**`).join('\n');
        } else {
            scheduleStr = '*No matching executions found within next ~70 days.*';
        }

        let output = `### Cron Expression Breakdown\n\n`;
        output += `⚙️ **Expression:** \`${cleaned}\`\n\n`;

        output += `| Field | Description |\n`;
        output += `| --- | --- |\n`;
        output += `| ⏱️ Minute | ${mDesc} |\n`;
        output += `| 🕒 Hour | ${hDesc} |\n`;
        output += `| 📅 Day of Month | ${domDesc} |\n`;
        output += `| 📊 Month | ${monDesc} |\n`;
        output += `| 🗓️ Day of Week | ${dowDesc} |\n\n`;

        output += `### 🚀 Next 5 Scheduled Executions\n${scheduleStr}`;

        setResult({ text: output });
    };

    const handleClear = () => {
        setCron('* * * * *');
        setResult(null);
    };

    const loadPreset = (val) => {
        setCron(val);
        setResult(null);
    };

    return (
        <div className="card p-30 glass-card grid gap-20">
            <h3 className="text-center">Cron Expression Parser</h3>
            <p className="smallest opacity-6 text-center mb-10">Deconstruct complex crontab syntax into standard human-readable English and simulate next run schedules.</p>

            <div className="flex gap-5 flex-wrap justify-center mb-5">
                {PRESETS.map(p => (
                    <button
                        key={p.label}
                        type="button"
                        className={`pill smallest ${cron === p.value ? 'active' : ''}`}
                        onClick={() => loadPreset(p.value)}
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            <div className="form-group text-left">
                <label className="smallest opacity-6 uppercase ml-10 font-bold">Cron Expression (5 Fields)</label>
                <input
                    className="pill w-full font-mono text-center mt-5"
                    value={cron}
                    onChange={e => {
                        setCron(e.target.value);
                        setResult(null);
                    }}
                    placeholder="* * * * *"
                />
                <div className="flex-between smallest opacity-5 mt-5 px-10">
                    <span>min</span>
                    <span>hour</span>
                    <span>dom</span>
                    <span>month</span>
                    <span>dow</span>
                </div>
            </div>

            <div className="flex gap-10">
                <button className="btn-primary flex-1" onClick={parseCron}>
                    Explain Cron Expression
                </button>
                {(cron !== '* * * * *' || result) && (
                    <button className="pill" onClick={handleClear} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-color)' }}>
                        Clear
                    </button>
                )}
            </div>

            <ToolResult result={result} />
        </div>
    );
};

export default CronParser;
