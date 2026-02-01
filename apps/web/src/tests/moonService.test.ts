import { describe, it, expect } from 'vitest';
import { getMoonPhase } from '../lib/moon';

describe('Moon Service Integration', () => {
    it('returns valid moon phase data structure', async () => {
        const data = await getMoonPhase(new Date());

        expect(data).toHaveProperty('phase');
        expect(data).toHaveProperty('age');
        expect(data).toHaveProperty('illumination');
        expect(data).toHaveProperty('recommendationKey');

        expect(typeof data.phase).toBe('string');
        expect(typeof data.age).toBe('number');
        expect(typeof data.illumination).toBe('number');
    });

    it('calculates specific phase correctly for known dates', async () => {
        // Known New Moon: Jan 6, 2000 (Epoch used in algo)
        // Let's test a known Full Moon. 
        // Jan 21, 2000 should be Full. (approx 15 days after Jan 6)
        const fullMoonDate = new Date('2000-01-21T18:00:00');
        const data = await getMoonPhase(fullMoonDate);

        // Age should be around 14.8-15
        expect(data.age).toBeGreaterThan(13);
        expect(data.age).toBeLessThan(17);
        expect(data.phase).toBe('full');
        expect(data.recommendationKey).toBe('rec_full');
        expect(data.illumination).toBeGreaterThan(0.9);
    });

    it('returns recommendation keys that match translation structure', async () => {
        const data = await getMoonPhase();
        expect(data.recommendationKey.startsWith('rec_')).toBe(true);
    });
});
