import { detectMultivariateAnomalies, runDataQualitySuite, generateSyntheticData } from './dataAnalysis';

describe('Data Analysis Utilities', () => {
    const sampleData = [
        { id: 1, val: 10, score: 5 },
        { id: 2, val: 12, score: 6 },
        { id: 3, val: 11, score: 5.5 },
        { id: 4, val: 100, score: 50 }, // Anomaly
        { id: 5, val: 9, score: 4.5 }
    ];

    describe('detectMultivariateAnomalies', () => {
        it('should identify outliers in multivariate data', () => {
            const anomalies = detectMultivariateAnomalies(sampleData, 0.2);
            expect(anomalies.length).toBeGreaterThan(0);
            expect(anomalies[0].row).toBe(3); // Index of the anomaly
        });

        it('should return empty for empty data', () => {
            expect(detectMultivariateAnomalies([])).toEqual([]);
        });
    });

    describe('runDataQualitySuite', () => {
        it('should detect nulls and outliers', () => {
            const messyData = [
                { a: 1, b: 'ok' },
                { a: null, b: 'ok' },
                { a: 100, b: 'ok' },
                { a: 1, b: '' }
            ];
            const report = runDataQualitySuite(messyData);
            const nullExpectation = report.find(r => r.column === 'a' && r.expectation === 'not_null');
            expect(nullExpectation.success).toBe(false);
            expect(nullExpectation.unexpected_count).toBe(1);
        });
    });

    describe('generateSyntheticData', () => {
        it('should generate requested number of rows', () => {
            const synthetic = generateSyntheticData(sampleData, 10);
            expect(synthetic.length).toBe(10);
            expect(Object.keys(synthetic[0])).toEqual(Object.keys(sampleData[0]));
        });
    });
});
