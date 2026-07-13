import React, { useMemo } from 'react';

const DataScienceHub = ({ data }) => {
    const stats = useMemo(() => {
        if (!data || data.length === 0) return null;
        const keys = Object.keys(data[0]);
        const res = {};
        keys.forEach(k => {
            const vals = data.map(row => parseFloat(row[k])).filter(v => !isNaN(v));
            if (vals.length > 0) {
                const sorted = [...vals].sort((a, b) => a - b);

                let min = Infinity;
                let max = -Infinity;
                let sum = 0;
                let sumSq = 0;

                for (let i = 0; i < vals.length; i++) {
                    const v = vals[i];
                    if (v < min) min = v;
                    if (v > max) max = v;
                    sum += v;
                    sumSq += v * v;
                }

                const n = vals.length;
                const avg = sum / n;
                const variance = Math.max(0, (sumSq / n) - (avg * avg));
                const std = Math.sqrt(variance);

                res[k] = {
                    min,
                    max,
                    avg: avg.toFixed(2),
                    median: sorted[Math.floor(n / 2)],
                    std: std.toFixed(2)
                };
            }
        });
        return res;
    }, [data]);

    if (!data) return <div className="p-30 opacity-6 text-center">No data uploaded in Viewer.</div>;

    return (
        <div className="card p-20 glass-card">
            <table className="w-full text-sm">
                <thead>
                    <tr className="smallest uppercase opacity-6">
                        <th className="p-10 text-left">Column</th>
                        <th className="p-10">Min</th>
                        <th className="p-10">Max</th>
                        <th className="p-10">Avg</th>
                        <th className="p-10">Med</th>
                        <th className="p-10">Std</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(stats || {}).map(([k, s]) => (
                        <tr key={k} className="border-top">
                            <td className="p-10 font-bold">{k}</td>
                            <td className="p-10 text-center">{s.min}</td>
                            <td className="p-10 text-center">{s.max}</td>
                            <td className="p-10 text-center">{s.avg}</td>
                            <td className="p-10 text-center">{s.median}</td>
                            <td className="p-10 text-center">{s.std}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default DataScienceHub;
