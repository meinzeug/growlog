/**
 * Calculates the progress percentage of a plant based on its phase, type, and age.
 * 
 * Methodology:
 * - FINISHED/CURED: 100%
 * - DRYING: 95%
 * - AUTOFLOWER: Linear progress over 90 days (age / 90 * 100)
 * - PHOTOPERIOD:
 *   - GERMINATION: 0-10% over 14 days
 *   - VEGETATIVE: 10-50% over approx 60 days
 *   - FLOWERING: 50-90% over approx 70 days
 * 
 * @param phase The current growth phase (e.g., 'GERMINATION', 'VEGETATIVE')
 * @param plantType The type of plant ('AUTOFLOWER', 'PHOTOPERIOD')
 * @param startDate The date the plant was started
 * @returns A number between 0 and 100 representing the progress percentage
 */
export const PHASE_THRESHOLDS = {
    GERMINATION: 10,
    VEGETATIVE: 50,
    FLOWERING: 90,
    DRYING: 95,
    FINISHED: 100
};

export const calculatePlantProgress = (
    phase: string,
    plantType: string,
    startDate: string | Date | undefined
): number => {
    if (!startDate) return 0;

    // Normalize startDate to Date object if string, though usually passed as timestamp or ISO string depending on backend
    const start = new Date(startDate);
    const age = Math.floor((new Date().getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (phase === 'FINISHED' || phase === 'CURED') return PHASE_THRESHOLDS.FINISHED;
    if (phase === 'DRYING') return PHASE_THRESHOLDS.DRYING;

    // Autoflowers have a somewhat fixed lifecycle (approx 90-100 days)
    if (plantType === 'AUTOFLOWER') {
        return Math.min(100, Math.round((age / 90) * 100)); // Assumes 90 day cycle
    }

    // Photoperiods depend heavily on the phase
    switch (phase) {
        case 'GERMINATION':
            // Assumes 2 weeks max for germination phase
            return Math.min(PHASE_THRESHOLDS.GERMINATION, Math.round((age / 14) * PHASE_THRESHOLDS.GERMINATION));
        case 'VEGETATIVE':
            // Assumes approx 2 months veg (very variable, but good baseline)
            // Starts at GERMINATION end (10%), adds up to VEGETATIVE end (50%)
            const vegRange = PHASE_THRESHOLDS.VEGETATIVE - PHASE_THRESHOLDS.GERMINATION;
            return Math.min(PHASE_THRESHOLDS.VEGETATIVE, PHASE_THRESHOLDS.GERMINATION + Math.round(((age - 14) / 60) * vegRange));
        case 'FLOWERING':
            // Starts at VEGETATIVE end (50%), adds up to FLOWERING end (90%)
            const flowerRange = PHASE_THRESHOLDS.FLOWERING - PHASE_THRESHOLDS.VEGETATIVE;
            return Math.min(PHASE_THRESHOLDS.FLOWERING, PHASE_THRESHOLDS.VEGETATIVE + Math.round(((age - 74) / 70) * flowerRange));
        default:
            return 0;
    }
};

/**
 * Estimates the yield of a plant in grams.
 * 
 * If the plant has a manually set estimated_yield_grams, it uses that.
 * Otherwise, it estimates based on plant type and status.
 * 
 * Baselines:
 * - AUTOFLOWER: 50g
 * - PHOTOPERIOD: 100g
 * 
 * Adjustments:
 * - ISSUES: -20%
 * - SICK: -50%
 * - DEAD: 0g
 * 
 * @param plant The plant object
 * @returns Estimated yield in grams
 */
export const calculateYieldEstimate = (plant: any): number => {
    if (plant.estimated_yield_grams) {
        return plant.estimated_yield_grams;
    }

    if (plant.status === 'DEAD') return 0;

    let baseYield = 0;
    if (plant.plant_type === 'AUTOFLOWER') {
        baseYield = 50;
    } else {
        baseYield = 100; // Conservative estimate for photoperiods or unknown
    }

    if (plant.status === 'ISSUES') {
        baseYield *= 0.8;
    } else if (plant.status === 'SICK') {
        baseYield *= 0.5;
    }

    return Math.round(baseYield);
};

export const formatYield = (grams: number): string => {
    if (grams >= 1000) {
        return `${(grams / 1000).toFixed(2)} kg`;
    }
    return `${Math.round(grams)} g`;
};
