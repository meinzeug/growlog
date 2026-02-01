import { describe, it, expect } from 'vitest';
import { calculatePlantProgress } from '../lib/plantUtils';
import { createPlant } from '../__fixtures__/index';

const mockPlants = [
    createPlant({
        id: '1',
        name: 'Auto Blue',
        plant_type: 'AUTOFLOWER',
        phase: 'VEGETATIVE',
        start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days old
    }),
    createPlant({
        id: '2',
        name: 'Photo Kush',
        plant_type: 'PHOTOPERIOD',
        phase: 'FLOWERING',
        start_date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days old
    }),
    createPlant({
        id: '3',
        name: 'Dead Plant',
        plant_type: 'PHOTOPERIOD',
        phase: 'FINISHED',
        start_date: new Date().toISOString()
    })
];

describe('Data Flow Logic Integration', () => {
    it('correctly transforms API plant data into progress percentages', () => {
        const results = mockPlants.map(plant => ({
            id: plant.id,
            progress: calculatePlantProgress(plant.phase, plant.plant_type, plant.start_date)
        }));

        // Auto Blue: 30 days / 90 days approx 33%
        expect(results[0].progress).toBeGreaterThan(30);
        expect(results[0].progress).toBeLessThan(40);

        // Photo Kush: Flowering logic
        // Flowering starts at 50% + progress within flowering
        // 90 days total. If flowering started recently? 
        // Logic assumes age based on total age which is imperfect but is what we have.
        // Flowering case: 50 + ((age - 74) / 70) * 40
        // Age 90. 90-74 = 16. 16/70 = 0.22. 0.22*40 = 9. 50+9 = 59.
        expect(results[1].progress).toBeGreaterThan(50);
        expect(results[1].progress).toBeLessThan(70);

        // Dead Plant: Finished = 100
        expect(results[2].progress).toBe(100);
    });
});
