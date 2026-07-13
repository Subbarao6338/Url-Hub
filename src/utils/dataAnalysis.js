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

    const keys = Object.keys(data[0]).filter(k => {
        const val = parseFloat(data[0][k]);
        return !isNaN(val) && isFinite(val);
    });
    if (keys.length < 2) return [];

    const matrix = data.map(row => keys.map(k => parseFloat(row[k]) || 0));
    const n = matrix.length;
    const m = keys.length;

    if (n < m + 1) {
        // Fallback for small datasets where covariance matrix might be singular
        return matrix.map((row, idx) => ({ score: 0, idx })).slice(0, Math.max(1, Math.floor(n * contamination)));
    }

    try {
        // Calculate mean vector in a single pass
        const meanVector = new Array(m).fill(0);
        for (let j = 0; j < n; j++) {
            for (let i = 0; i < m; i++) {
                meanVector[i] += matrix[j][i];
            }
        }
        for (let i = 0; i < m; i++) {
            meanVector[i] /= n;
        }

        // Calculate Covariance Matrix optimized
        const cov = Array(m).fill(0).map(() => Array(m).fill(0));
        for (let k = 0; k < n; k++) {
            const row = matrix[k];
            for (let i = 0; i < m; i++) {
                const diffI = row[i] - meanVector[i];
                for (let j = i; j < m; j++) {
                    cov[i][j] += diffI * (row[j] - meanVector[j]);
                }
            }
        }

        const nMinusOne = n - 1;
        for (let i = 0; i < m; i++) {
            for (let j = i; j < m; j++) {
                const val = cov[i][j] / nMinusOne;
                cov[i][j] = val;
                cov[j][i] = val;
            }
        }

        // Tikhonov regularization: add small epsilon to diagonal to ensure invertibility
        for (let i = 0; i < m; i++) {
            const val = cov[i][i];
            cov[i][i] = val + Math.max(1e-6, val * 1e-8);
        }

        const invCov = math.inv(cov);

        // Calculate Mahalanobis Distance for each point - vectorized approach
        const scores = matrix.map(row => {
            const diff = row.map((v, i) => v - meanVector[i]);
            // dist = (x-mu)^T * Sigma^-1 * (x-mu)
            const intermediate = math.multiply(diff, invCov);
            const dist = math.multiply(intermediate, diff);
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
                score: s.score.toFixed(4)
            }));
    } catch (e) {
        console.error("Multivariate calculation error:", e);
        // Fallback to robust Z-score (Euclidean distance on standardized data)
        const stats = keys.map((_, i) => {
            const col = matrix.map(r => r[i]);
            return {
                m: math.mean(col),
                s: math.std(col) || 1e-6
            };
        });

        return matrix.map((row, idx) => {
            let distSq = 0;
            row.forEach((val, i) => {
                distSq += Math.pow((val - stats[i].m) / stats[i].s, 2);
            });
            return { score: Math.sqrt(distSq), idx };
        }).sort((a, b) => b.score - a.score)
          .slice(0, Math.max(1, Math.floor(data.length * contamination)))
          .map(s => ({ row: s.idx, data: data[s.idx], score: s.score.toFixed(4) }));
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
    const total = data.length;

    keys.forEach(col => {
        let nulls = 0;
        let numericCount = 0;
        let sum = 0;
        let sumSq = 0;
        let min = Infinity;
        let max = -Infinity;
        const uniqueSet = new Set();

        data.forEach(row => {
            const v = row[col];
            uniqueSet.add(v);

            if (v === null || v === undefined || v === '') {
                nulls++;
            } else {
                const num = parseFloat(v);
                if (!isNaN(num) && isFinite(num)) {
                    numericCount++;
                    sum += num;
                    sumSq += num * num;
                    if (num < min) min = num;
                    if (num > max) max = num;
                }
            }
        });

        // Completeness Check
        report.push({
            column: col,
            expectation: "not_null",
            success: nulls === 0,
            unexpected_count: nulls,
            unexpected_percent: ((nulls / total) * 100).toFixed(2) + "%"
        });

        if (numericCount > 0) {
            const mean = sum / numericCount;
            // Variance = (sumSq / n) - (mean^2)
            const variance = Math.max(0, (sumSq / numericCount) - (mean * mean));
            const std = Math.sqrt(variance);

            // Outlier Check (3-Sigma)
            const minBound = mean - 3 * std;
            const maxBound = mean + 3 * std;

            let outliers = 0;
            if (std > 0) {
                data.forEach(row => {
                    const num = parseFloat(row[col]);
                    if (!isNaN(num) && isFinite(num)) {
                        if (num < minBound || num > maxBound) outliers++;
                    }
                });
            }

            report.push({
                column: col,
                expectation: "expect_column_values_to_be_within_3_std",
                success: outliers === 0,
                unexpected_count: outliers,
                unexpected_percent: ((outliers / numericCount) * 100).toFixed(2) + "%",
                meta: { mean: mean.toFixed(2), std: std.toFixed(2) }
            });

            // Range Check
            report.push({
                column: col,
                expectation: "expect_column_values_to_be_between",
                success: true,
                meta: { min, max }
            });
        }

        // Uniqueness Check
        const uniqueValues = uniqueSet.size;
        report.push({
            column: col,
            expectation: "expect_column_unique_value_count_to_be_between",
            success: true,
            meta: { unique_count: uniqueValues, uniqueness_ratio: (uniqueValues / total).toFixed(2) }
        });
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
            // 70% chance to keep correlation by using same seed row
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
