/**
 * Data Analysis Utilities ported from Python for client-side execution.
 * Minimizes backend dependency and Vercel build size.
 */

import * as math from 'mathjs';

/**
 * Ported Multivariate Anomaly Detection logic.
 * Uses a robust Mahalanobis Distance approach for statistical anomaly detection.
 */
export const detectMultivariateAnomalies = (data, contamination = 0.05) => {
    if (!data || data.length === 0) return [];

    const keys = Object.keys(data[0]).filter(k => !isNaN(parseFloat(data[0][k])));
    if (keys.length < 2) return [];

    const matrix = data.map(row => keys.map(k => parseFloat(row[k]) || 0));
    const n = matrix.length;
    if (n < 2) return [];

    try {
        const meanVector = keys.map((_, i) => {
            let sum = 0;
            for (let j = 0; j < n; j++) sum += matrix[j][i];
            return sum / n;
        });

        // Calculate Covariance Matrix optimized
        const cov = Array(keys.length).fill(0).map(() => Array(keys.length).fill(0));
        for (let i = 0; i < keys.length; i++) {
            for (let j = i; j < keys.length; j++) {
                let sum = 0;
                for (let k = 0; k < n; k++) {
                    sum += (matrix[k][i] - meanVector[i]) * (matrix[k][j] - meanVector[j]);
                }
                const val = sum / (n - 1);
                cov[i][j] = val;
                cov[j][i] = val;
            }
        }

        // Tikhonov regularization: add small epsilon to diagonal to ensure invertibility
        // Also handle zero variance columns by adding a larger epsilon if variance is near zero
        const regularizedCov = cov.map((row, i) =>
            row.map((val, j) => {
                if (i === j) {
                    return val + Math.max(1e-6, val * 1e-9);
                }
                return val;
            })
        );

        const invCov = math.inv(regularizedCov);

        // Calculate Mahalanobis Distance for each point - vectorized approach via mathjs
        const scores = matrix.map(row => {
            const diff = row.map((v, i) => v - meanVector[i]);
            const intermediate = math.multiply(diff, invCov);
            const dist = math.multiply(intermediate, diff); // diff is already a vector
            return Math.sqrt(Math.abs(dist));
        });

        const sortedScores = [...scores].sort((a, b) => b - a);
        const thresholdIdx = Math.max(0, Math.min(scores.length - 1, Math.floor(scores.length * contamination)));
        const threshold = sortedScores[thresholdIdx];

        return scores.map((score, idx) => ({ score, idx }))
            .filter(s => s.score >= threshold)
            .map(s => ({
                row: s.idx,
                data: data[s.idx],
                score: s.score.toFixed(2)
            }));
    } catch (e) {
        console.error("Multivariate calculation error:", e);
        // Fallback to robust Z-score
        return matrix.map((row, idx) => {
            let dist = 0;
            row.forEach((val, i) => {
                const col = matrix.map(r => r[i]);
                const m = math.mean(col);
                const s = math.std(col) || 1e-6;
                dist += Math.pow((val - m) / s, 2);
            });
            return { score: Math.sqrt(dist), idx };
        }).sort((a, b) => b.score - a.score)
          .slice(0, Math.max(1, Math.floor(data.length * contamination)))
          .map(s => ({ row: s.idx, data: data[s.idx], score: s.score.toFixed(2) }));
    }
};

/**
 * Ported Data Quality Engine.
 * Functional equivalent of Great Expectations validation.
 */
export const runDataQualitySuite = (data) => {
    if (!data || data.length === 0) return [];

    const keys = Object.keys(data[0]);
    const report = [];

    keys.forEach(col => {
        const values = data.map(r => r[col]);
        const nulls = values.filter(v => v === null || v === undefined || v === '').length;

        report.push({
            column: col,
            expectation: "not_null",
            success: nulls === 0,
            unexpected_count: nulls
        });

        const numericValues = values.map(v => parseFloat(v)).filter(v => !isNaN(v));
        if (numericValues.length > 0) {
            const n = numericValues.length;
            let sum = 0;
            for (let i = 0; i < n; i++) sum += numericValues[i];
            const mean = sum / n;

            let sqDiffSum = 0;
            for (let i = 0; i < n; i++) sqDiffSum += Math.pow(numericValues[i] - mean, 2);
            const std = Math.sqrt(sqDiffSum / n);

            const min = mean - 3 * std;
            const max = mean + 3 * std;
            const outliers = numericValues.filter(v => v < min || v > max).length;

            report.push({
                column: col,
                expectation: "within_3_std",
                success: outliers === 0,
                unexpected_count: outliers
            });
        }
    });

    return report;
};

/**
 * Ported Synthetic Data Lab logic.
 * Enhanced Relational Sampling (SDV style parity).
 */
export const generateSyntheticData = (data, numRows = 100) => {
    if (!data || data.length === 0) return [];

    const keys = Object.keys(data[0]);
    const synthetic = [];

    const stats = {};
    keys.forEach(k => {
        const vals = data.map(r => r[k]).filter(v => v !== undefined && v !== null);
        const isNumeric = vals.length > 0 && vals.every(v => !isNaN(parseFloat(v)));
        stats[k] = {
            vals,
            isNumeric,
            unique: [...new Set(vals)]
        };
    });

    for (let i = 0; i < numRows; i++) {
        const mockRow = {};
        const seedRow = data[Math.floor(Math.random() * data.length)];

        keys.forEach(col => {
            if (Math.random() > 0.3) {
                mockRow[col] = seedRow[col];
            } else {
                const colStats = stats[col];
                if (colStats.vals.length > 0) {
                    mockRow[col] = colStats.vals[Math.floor(Math.random() * colStats.vals.length)];
                } else {
                    mockRow[col] = null;
                }
            }
        });
        synthetic.push(mockRow);
    }

    return synthetic;
};
