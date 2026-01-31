export enum UserRole {
    ADMIN = 'ADMIN',
    USER = 'USER'
}

export enum GrowLocationType {
    INDOOR = 'INDOOR',
    OUTDOOR = 'OUTDOOR'
}

export enum EnvironmentMedium {
    SOIL = 'SOIL',
    COCO = 'COCO',
    HYDRO = 'HYDRO',
    OTHER = 'OTHER'
}

export enum PlantType {
    PHOTOPERIOD = 'PHOTOPERIOD',
    AUTOFLOWER = 'AUTOFLOWER',
    UNKNOWN = 'UNKNOWN'
}

export enum PlantSex {
    FEMINIZED = 'FEMINIZED',
    REGULAR = 'REGULAR',
    UNKNOWN = 'UNKNOWN'
}

export enum PlantPhase {
    GERMINATION = 'GERMINATION',
    VEGETATIVE = 'VEGETATIVE',
    FLOWERING = 'FLOWERING',
    DRYING = 'DRYING',
    CURED = 'CURED',
    FINISHED = 'FINISHED'
}

export enum PlantStatus {
    HEALTHY = 'HEALTHY',
    ISSUES = 'ISSUES',
    SICK = 'SICK',
    HARVESTED = 'HARVESTED',
    DEAD = 'DEAD'
}

export enum LogType {
    NOTE = 'NOTE',
    WATER = 'WATER',
    FEED = 'FEED',
    TRAINING = 'TRAINING',
    DEFOLIATION = 'DEFOLIATION',
    TRANSPLANT = 'TRANSPLANT',
    PEST = 'PEST',
    PH_ADJUST = 'PH_ADJUST',
    LIGHT_CHANGE = 'LIGHT_CHANGE',
    OTHER = 'OTHER'
}

export enum TaskStatus {
    OPEN = 'OPEN',
    DONE = 'DONE',
    SKIPPED = 'SKIPPED'
}
