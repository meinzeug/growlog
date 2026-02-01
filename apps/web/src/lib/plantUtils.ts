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
export const calculatePlantProgress = (
    phase: string,
    plantType: string,
    startDate: string | Date | undefined
): number => {
    if (!startDate) return 0;

    // Normalize startDate to Date object if string, though usually passed as timestamp or ISO string depending on backend
    const start = new Date(startDate);
    const age = Math.floor((new Date().getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (phase === 'FINISHED' || phase === 'CURED') return 100;
    if (phase === 'DRYING') return 95;

    // Autoflowers have a somewhat fixed lifecycle (approx 90-100 days)
    if (plantType === 'AUTOFLOWER') {
        return Math.min(100, Math.round((age / 90) * 100)); // Assumes 90 day cycle
    }

    // Photoperiods depend heavily on the phase
    switch (phase) {
        case 'GERMINATION':
            // Assumes 2 weeks max for germination phase
            return Math.min(10, Math.round((age / 14) * 10));
        case 'VEGETATIVE':
            // Assumes approx 2 months veg (very variable, but good baseline)
            // Starts at 10%, adds up to 40% more
            return Math.min(50, 10 + Math.round(((age - 14) / 60) * 40));
        case 'FLOWERING':
            // Starts at 50%, adds up to 40% more over approx 9-10 weeks
            return Math.min(90, 50 + Math.round(((age - 74) / 70) * 40));
        default:
            return 0;
    }
};
