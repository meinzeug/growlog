
// Mocking an external API structure for Moon Data
// In the future, this can be replaced with a real fetch to api.astronomyapi.com

export type MoonPhase =
    | 'new'
    | 'waxing_crescent'
    | 'first_quarter'
    | 'waxing_gibbous'
    | 'full'
    | 'waning_gibbous'
    | 'last_quarter'
    | 'waning_crescent';

export interface MoonData {
    phase: MoonPhase;
    age: number; // days into cycle
    illumination: number; // 0.0 to 1.0
    recommendationKey: string;
}

export const getMoonPhase = async (date: Date = new Date()): Promise<MoonData> => {
    // Simulate API delay
    // await new Promise(resolve => setTimeout(resolve, 100));

    const synodic = 29.53058867;
    const knownNewMoon = new Date('2000-01-06T18:14:00').getTime();
    const diff = date.getTime() - knownNewMoon;
    const days = diff / (1000 * 60 * 60 * 24);
    const cycle = days % synodic;
    const age = cycle < 0 ? cycle + synodic : cycle;

    let phase: MoonPhase = 'new';
    let recommendationKey = 'rec_new';

    // Approximate segments (0-29.5 days)
    // New: 0-1.8
    // Wax Cres: 1.8-5.5
    // First Q: 5.5-9.2
    // Wax Gib: 9.2-12.9
    // Full: 12.9-16.6
    // Wan Gib: 16.6-20.3
    // Last Q: 20.3-24
    // Wan Cres: 24-27.7
    // New: >27.7

    // Refined thresholds for 8 phases
    if (age < 1 || age > 28.5) {
        phase = 'new';
        recommendationKey = 'rec_new';
    } else if (age < 6.4) {
        phase = 'waxing_crescent';
        recommendationKey = 'rec_waxing_crescent';
    } else if (age < 8.4) {
        phase = 'first_quarter';
        recommendationKey = 'rec_first_quarter';
    } else if (age < 13.8) {
        phase = 'waxing_gibbous';
        recommendationKey = 'rec_waxing_gibbous';
    } else if (age < 15.8) {
        phase = 'full';
        recommendationKey = 'rec_full';
    } else if (age < 21.1) {
        phase = 'waning_gibbous';
        recommendationKey = 'rec_waning_gibbous';
    } else if (age < 23.1) {
        phase = 'last_quarter';
        recommendationKey = 'rec_last_quarter';
    } else {
        phase = 'waning_crescent';
        recommendationKey = 'rec_waning_crescent';
    }

    // Illumination approximation (0 = new, 1 = full)
    // Cosine curve
    const illumination = 0.5 * (1 - Math.cos((age / synodic) * 2 * Math.PI));

    return {
        phase,
        age,
        illumination,
        recommendationKey
    };
};
