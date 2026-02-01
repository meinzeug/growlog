import { describe, it, expect } from 'vitest';
import { calculatePlantProgress } from './plantUtils';

describe('calculatePlantProgress', () => {
    const today = new Date();

    it('returns 0 if start date is missing', () => {
        expect(calculatePlantProgress('VEGETATIVE', 'PHOTOPERIOD', undefined)).toBe(0);
    });

    it('returns 100 if phase is FINISHED or CURED', () => {
        expect(calculatePlantProgress('FINISHED', 'PHOTOPERIOD', '2023-01-01')).toBe(100);
        expect(calculatePlantProgress('CURED', 'PHOTOPERIOD', '2023-01-01')).toBe(100);
    });

    it('returns 95 if phase is DRYING', () => {
        expect(calculatePlantProgress('DRYING', 'PHOTOPERIOD', '2023-01-01')).toBe(95);
    });

    describe('AUTOFLOWER', () => {
        it('calculates progress based on 90 day cycle', () => {
            // 45 days old = 50%
            const start = new Date(today);
            start.setDate(today.getDate() - 45);
            expect(calculatePlantProgress('VEGETATIVE', 'AUTOFLOWER', start.toISOString())).toBe(50);
        });

        it('capped at 100%', () => {
            const start = new Date(today);
            start.setDate(today.getDate() - 100);
            expect(calculatePlantProgress('FLOWERING', 'AUTOFLOWER', start.toISOString())).toBe(100);
        });
    });

    describe('PHOTOPERIOD', () => {
        it('calculates GERMINATION progress correctly', () => {
            // 7 days = 50% of 10% max = 5%
            const start = new Date(today);
            start.setDate(today.getDate() - 7);
            // formula: Math.min(10, Math.round((age / 14) * 10))
            // 7/14 = 0.5 * 10 = 5
            expect(calculatePlantProgress('GERMINATION', 'PHOTOPERIOD', start.toISOString())).toBe(5);
        });

        it('calculates VEGETATIVE progress correctly', () => {
            // 14 days + 15 days = 29 days old.
            // Formula: Math.min(50, 10 + Math.round(((age - 14) / 60) * 40));
            // age - 14 = 15. 15/60 = 0.25. 0.25 * 40 = 10. 10+10 = 20.
            const start = new Date(today);
            start.setDate(today.getDate() - 29);
            expect(calculatePlantProgress('VEGETATIVE', 'PHOTOPERIOD', start.toISOString())).toBe(20);
        });

        it('calculates FLOWERING progress correctly', () => {
            // 74 days + 35 days = 109 days old.
            // Formula: Math.min(90, 50 + Math.round(((age - 74) / 70) * 40));
            // age - 74 = 35. 35/70 = 0.5. 0.5 * 40 = 20. 50+20 = 70.
            const start = new Date(today);
            start.setDate(today.getDate() - 109);
            expect(calculatePlantProgress('FLOWERING', 'PHOTOPERIOD', start.toISOString())).toBe(70);
        });
    });
});
