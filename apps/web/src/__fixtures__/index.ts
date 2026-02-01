
// Types (Mocking them here since they are often 'any' in the app, but providing structure)
export interface User {
    id: string;
    email: string;
    role: 'USER' | 'ADMIN';
    created_at: string;
}

export interface Plant {
    id: string;
    name: string;
    strain?: string;
    plant_type: 'PHOTOPERIOD' | 'AUTOFLOWER' | 'UNKNOWN';
    status: 'HEALTHY' | 'ISSUES' | 'SICK' | 'HARVESTED' | 'DEAD';
    phase: 'GERMINATION' | 'VEGETATIVE' | 'FLOWERING' | 'DRYING' | 'CURED' | 'FINISHED';
    start_date: string;
    created_at: string;
    grow_id?: string;
}

export interface Grow {
    id: string;
    name: string;
    location_type: 'INDOOR' | 'OUTDOOR';
    created_at: string;
    user_id: string;
}

export interface Task {
    id: string;
    title: string;
    status: 'OPEN' | 'DONE';
    due_at: string;
    plant_id: string;
    created_at: string;
}

export interface Metric {
    id: string;
    plant_id: string;
    height_cm?: number;
    ph?: number;
    ec?: number;
    temperature_c?: number;
    humidity_pct?: number;
    light_ppfd?: number;
    notes?: string;
    recorded_at: string;
}

// Factories
export const createUser = (overrides?: Partial<User>): User => ({
    id: `user_${Math.random().toString(36).substr(2, 9)}`,
    email: 'test@example.com',
    role: 'USER',
    created_at: new Date().toISOString(),
    ...overrides
});

export const createPlant = (overrides?: Partial<Plant>): Plant => ({
    id: `plant_${Math.random().toString(36).substr(2, 9)}`,
    name: 'Test Plant',
    strain: 'Northern Lights',
    plant_type: 'PHOTOPERIOD',
    status: 'HEALTHY',
    phase: 'VEGETATIVE',
    start_date: new Date().toISOString(),
    created_at: new Date().toISOString(),
    ...overrides
});

export const createGrow = (overrides?: Partial<Grow>): Grow => ({
    id: `grow_${Math.random().toString(36).substr(2, 9)}`,
    name: 'Main Tent',
    location_type: 'INDOOR',
    created_at: new Date().toISOString(),
    user_id: 'user_1',
    ...overrides
});

export const createTask = (overrides?: Partial<Task>): Task => ({
    id: `task_${Math.random().toString(36).substr(2, 9)}`,
    title: 'Water Plant',
    status: 'OPEN',
    due_at: new Date().toISOString(),
    plant_id: 'plant_1',
    created_at: new Date().toISOString(),
    ...overrides
});

export const createMetric = (overrides?: Partial<Metric>): Metric => ({
    id: `metric_${Math.random().toString(36).substr(2, 9)}`,
    plant_id: 'plant_1',
    height_cm: 10 + Math.floor(Math.random() * 50),
    ph: 6.0 + (Math.random() * 0.5),
    ec: 1.2,
    temperature_c: 24,
    humidity_pct: 60,
    recorded_at: new Date().toISOString(),
    ...overrides
});

// Arrays of fixtures
export const mockPlants: Plant[] = Array.from({ length: 5 }, (_, i) => createPlant({ name: `Plant ${i + 1}` }));
export const mockGrows: Grow[] = Array.from({ length: 2 }, (_, i) => createGrow({ name: `Grow ${i + 1}` }));
export const mockTasks: Task[] = Array.from({ length: 3 }, (_, i) => createTask({ title: `Task ${i + 1}` }));
