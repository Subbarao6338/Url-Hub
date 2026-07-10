import React, { useState, useEffect } from 'react';
import ToolResult from '../ToolResult';

const TIMEZONES = [
    { code: 'UTC', name: 'Coordinated Universal Time (UTC)', tz: 'UTC' },
    { code: 'EST', name: 'Eastern Standard Time (EST/EDT)', tz: 'America/New_York' },
    { code: 'CST', name: 'Central Standard Time (CST/CDT)', tz: 'America/Chicago' },
    { code: 'MST', name: 'Mountain Standard Time (MST/MDT)', tz: 'America/Denver' },
    { code: 'PST', name: 'Pacific Standard Time (PST/PDT)', tz: 'America/Los_Angeles' },
    { code: 'GMT', name: 'Greenwich Mean Time (GMT)', tz: 'Europe/London' },
    { code: 'CET', name: 'Central European Time (CET/CEST)', tz: 'Europe/Paris' },
    { code: 'IST', name: 'Indian Standard Time (IST)', tz: 'Asia/Kolkata' },
    { code: 'JST', name: 'Japan Standard Time (JST)', tz: 'Asia/Tokyo' },
    { code: 'AEST', name: 'Australian Eastern Standard Time (AEST)', tz: 'Australia/Sydney' },
    { code: 'NZST', name: 'New Zealand Standard Time (NZST)', tz: 'Pacific/Auckland' },
    { code: 'SGT', name: 'Singapore Time (SGT)', tz: 'Asia/Singapore' }
];

const TimezoneConverter = () => {
    // Current local datetime in YYYY-MM-DDTHH:MM format
    const getInitialDateTime = () => {
        const now = new Date();
        const tzOffset = now.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(now - tzOffset)).toISOString().slice(0, 16);
        return localISOTime;
    };

    const [dateTimeStr, setDateTimeStr] = useState(getInitialDateTime());
    const [fromTz, setFromCurTz] = useState('UTC');
    const [toTz, setToCurTz] = useState('IST');
    const [hourSlider, setHourSlider] = useState(12);
    const [useSlider, setUseSlider] = useState(false);
    const [result, setResult] = useState(null);

    // Calculate timezone offset relative to UTC in milliseconds
    const getTzOffset = (date, timeZone) => {
        try {
            const tzDate = new Date(date.toLocaleString('en-US', { timeZone }));
            const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
            return tzDate.getTime() - utcDate.getTime();
        } catch (e) {
            return 0;
        }
    };

    const convertTime = () => {
        if (!dateTimeStr) return;

        try {
            // Treat input date-time string as raw input
            let [datePart, timePart] = dateTimeStr.split('T');
            if (useSlider) {
                const hourFormatted = String(hourSlider).padStart(2, '0');
                timePart = `${hourFormatted}:00`;
            }

            // Parse raw input as a UTC-aligned base date first
            const baseDate = new Date(`${datePart}T${timePart}:00Z`);
            if (isNaN(baseDate.getTime())) throw new Error("Invalid base date");

            const fromTzObj = TIMEZONES.find(t => t.code === fromTz);
            const toTzObj = TIMEZONES.find(t => t.code === toTz);

            // Compute exact offset for fromTz and target actual UTC time
            const fromOffset = getTzOffset(baseDate, fromTzObj.tz);
            const actualUtcTime = new Date(baseDate.getTime() - fromOffset);

            // Format to target timezone representation
            const targetFormatter = new Intl.DateTimeFormat('en-US', {
                timeZone: toTzObj.tz,
                dateStyle: 'full',
                timeStyle: 'medium'
            });
            const targetTimeStr = targetFormatter.format(actualUtcTime);

            // Format source representation for clean display
            const sourceFormatter = new Intl.DateTimeFormat('en-US', {
                timeZone: fromTzObj.tz,
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
            const sourceTimeStr = sourceFormatter.format(actualUtcTime);

            // Calculate conversions for ALL common timezones for the dashboard
            const dashboardConversions = TIMEZONES.map(tz => {
                const formatter = new Intl.DateTimeFormat('en-US', {
                    timeZone: tz.tz,
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                });
                return {
                    code: tz.code,
                    name: tz.name,
                    time: formatter.format(actualUtcTime)
                };
            });

            setResult({
                text: `${fromTzObj.code} Time: ${sourceTimeStr}\nConverts to ${toTzObj.code}: ${targetTimeStr}`,
                meta: {
                    dashboard: dashboardConversions,
                    title: `Conversions for ${actualUtcTime.toLocaleDateString()}`
                }
            });
        } catch (e) {
            setResult({ error: `Conversion error: ${e.message}` });
        }
    };

    useEffect(() => {
        convertTime();
    }, [dateTimeStr, fromTz, toTz, hourSlider, useSlider]);

    const handleSwap = () => {
        const temp = fromTz;
        setFromCurTz(toTz);
        setToCurTz(temp);
    };

    return (
        <div className="card p-30 glass-card text-center grid gap-15">
            <h3>Time Zone & Time Conversion</h3>
            <p className="smallest opacity-6">Convert any custom date and time across international zones. Use the interactive hour slider to plan global meetings.</p>

            <div className="grid grid-2-cols gap-10 text-left">
                <div className="form-group">
                    <label className="smallest opacity-6 uppercase ml-10">Target Date</label>
                    <input
                        type="datetime-local"
                        className="pill w-full"
                        value={dateTimeStr}
                        onChange={e => {
                            setDateTimeStr(e.target.value);
                            setUseSlider(false);
                        }}
                    />
                </div>
                <div className="form-group">
                    <label className="smallest opacity-6 uppercase ml-10 flex-between">
                        <span>Hour Slider</span>
                        <input
                            type="checkbox"
                            checked={useSlider}
                            onChange={e => setUseSlider(e.target.checked)}
                            style={{ margin: 0 }}
                        />
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="23"
                        value={hourSlider}
                        disabled={!useSlider}
                        onChange={e => {
                            setHourSlider(parseInt(e.target.value));
                            setUseSlider(true);
                        }}
                        className="w-full"
                    />
                    <div className="flex-between smallest opacity-6 px-10">
                        <span>12 AM</span>
                        <span className="font-bold">{hourSlider % 12 === 0 ? 12 : hourSlider % 12} {hourSlider >= 12 ? 'PM' : 'AM'} {useSlider && '(Active)'}</span>
                        <span>11 PM</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-3-cols gap-10 items-center text-left">
                <div className="form-group">
                    <label className="smallest opacity-6 uppercase ml-10">From Timezone</label>
                    <select className="pill w-full" value={fromTz} onChange={e => setFromCurTz(e.target.value)}>
                        {TIMEZONES.map(t => (
                            <option key={`from-${t.code}`} value={t.code}>{t.code} - {t.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex-center mt-20">
                    <button className="pill" onClick={handleSwap} style={{ padding: '10px' }} title="Swap Timezones">
                        <span className="material-icons">swap_horiz</span>
                    </button>
                </div>

                <div className="form-group">
                    <label className="smallest opacity-6 uppercase ml-10">To Timezone</label>
                    <select className="pill w-full" value={toTz} onChange={e => setToCurTz(e.target.value)}>
                        {TIMEZONES.map(t => (
                            <option key={`to-${t.code}`} value={t.code}>{t.code} - {t.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <ToolResult result={result} />

            {result && result.meta && result.meta.dashboard && (
                <div className="mt-10 p-15 bg-surface rounded-lg border text-left animate-fadeIn">
                    <span className="smallest uppercase opacity-6 block mb-15 font-bold flex-between">
                        <span>Multi-Zone Overview</span>
                        <span className="font-mono">{result.meta.title}</span>
                    </span>
                    <div className="grid grid-2-cols gap-10">
                        {result.meta.dashboard.map(item => (
                            <div key={item.code} className="flex-between border-b pb-5">
                                <span className="small font-bold" title={item.name}>{item.code}</span>
                                <span className="small font-mono bg-surface p-2-10 rounded">{item.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TimezoneConverter;
