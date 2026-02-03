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

export interface PhaseDurations {
    germination: number;
    vegetative: number;
    flowering: number;
    drying: number;
    autoflower: number;
}

export const DEFAULT_PHASE_DURATIONS: PhaseDurations = {
    germination: 14,
    vegetative: 60,
    flowering: 70,
    drying: 10,
    autoflower: 90
};

export const calculatePlantProgress = (
    phase: string,
    plantType: string,
    startDate: string | Date | undefined,
    config: PhaseDurations = DEFAULT_PHASE_DURATIONS
): number => {
    if (!startDate) return 0;

    // Normalize startDate to Date object
    const start = new Date(startDate);
    const age = Math.floor((new Date().getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (phase === 'FINISHED' || phase === 'CURED') return PHASE_THRESHOLDS.FINISHED;
    if (phase === 'DRYING') return PHASE_THRESHOLDS.DRYING;

    // Autoflowers have a somewhat fixed lifecycle
    if (plantType === 'AUTOFLOWER') {
        return Math.min(100, Math.round((age / config.autoflower) * 100));
    }

    // Photoperiods depend heavily on the phase
    switch (phase) {
        case 'GERMINATION':
            // Starts at 0, goes to GERM threshold
            return Math.min(PHASE_THRESHOLDS.GERMINATION, Math.round((age / config.germination) * PHASE_THRESHOLDS.GERMINATION));
        case 'VEGETATIVE':
            // Starts at GERMINATION end, adds up to VEGETATIVE end
            // We assume age is total age. 
            // In vegetative phase, effective veg days = age - germination_days
            const vegDays = Math.max(0, age - config.germination);
            const vegRange = PHASE_THRESHOLDS.VEGETATIVE - PHASE_THRESHOLDS.GERMINATION;
            return Math.min(PHASE_THRESHOLDS.VEGETATIVE, PHASE_THRESHOLDS.GERMINATION + Math.round((vegDays / config.vegetative) * vegRange));
        case 'FLOWERING':
            // Starts at VEGETATIVE end, adds up to FLOWERING end
            // Effective flower days = age - germination_days - vegetative_days
            // NOTE: This assumes transitions happened exactly at those day counts, which might not be true if user manually changed phases.
            // Ideally we'd use `phase_started_at` for the current phase.
            // But preserving signature for now, we estimate based on total age minus previous phases.
            const flowerDays = Math.max(0, age - config.germination - config.vegetative);
            const flowerRange = PHASE_THRESHOLDS.FLOWERING - PHASE_THRESHOLDS.VEGETATIVE;
            return Math.min(PHASE_THRESHOLDS.FLOWERING, PHASE_THRESHOLDS.VEGETATIVE + Math.round((flowerDays / config.flowering) * flowerRange));
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
