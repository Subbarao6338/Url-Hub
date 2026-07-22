import { calculatePanchangam, CITIES, SAMVATSARAS, TITHIS, NAKSHATRAS } from './panchangam';
import { describe, it, expect } from 'vitest';

describe('Panchangam Utilities', () => {
    it('should export correct constants', () => {
        expect(CITIES).toBeDefined();
        expect(CITIES.length).toBeGreaterThan(0);
        expect(SAMVATSARAS).toBeDefined();
        expect(SAMVATSARAS.length).toBe(60);
        expect(TITHIS).toBeDefined();
        expect(TITHIS.length).toBe(30);
        expect(NAKSHATRAS).toBeDefined();
        expect(NAKSHATRAS.length).toBe(27);
    });

    it('should calculate Panchangam for Hyderabad on a specific date', () => {
        const dateStr = '2026-07-22';
        const timeStr = '06:00:00';
        const hyd = CITIES.find(c => c.name === 'Hyderabad');

        const result = calculatePanchangam(dateStr, timeStr, hyd.lat, hyd.lng, hyd.tz);

        expect(result).toBeDefined();
        expect(result.samvatsara).toBeTypeOf('string');
        expect(result.tithi).toBeTypeOf('string');
        expect(result.nakshatra).toBeTypeOf('string');
        expect(result.pada).toBeGreaterThanOrEqual(1);
        expect(result.pada).toBeLessThanOrEqual(4);
        expect(result.rasi).toBeTypeOf('string');
        expect(result.yoga).toBeTypeOf('string');
        expect(result.karana).toBeTypeOf('string');
        expect(result.vara).toBeTypeOf('string');
        expect(result.sunrise).toBeDefined();
        expect(result.sunset).toBeDefined();
        expect(result.rahukalam).toBeDefined();
    });

    it('should handle negative timezone offsets like New York', () => {
        const dateStr = '2026-07-22';
        const timeStr = '12:00:00';
        const ny = CITIES.find(c => c.name === 'New York');

        const result = calculatePanchangam(dateStr, timeStr, ny.lat, ny.lng, ny.tz);

        expect(result).toBeDefined();
        expect(result.samvatsara).toBeTypeOf('string');
        expect(result.vara).toBeTypeOf('string');
    });

    it('should fall back gracefully or return expected object structure for all cities', () => {
        CITIES.forEach(city => {
            const result = calculatePanchangam('2026-10-05', '08:30:00', city.lat, city.lng, city.tz);
            expect(result).toHaveProperty('samvatsara');
            expect(result).toHaveProperty('tithi');
            expect(result).toHaveProperty('nakshatra');
            expect(result).toHaveProperty('pada');
            expect(result).toHaveProperty('rasi');
            expect(result).toHaveProperty('yoga');
            expect(result).toHaveProperty('karana');
            expect(result).toHaveProperty('vara');
            expect(result).toHaveProperty('sunrise');
            expect(result).toHaveProperty('sunset');
            expect(result).toHaveProperty('luckyColor');
            expect(result).toHaveProperty('luckyNumber');
            expect(result).toHaveProperty('luckyGem');
            expect(result).toHaveProperty('luckyDirection');
        });
    });
});
