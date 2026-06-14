export type GameMode = 'baby' | 'explorer';

export interface ModeSettings {
    minFallSpeed: number;
    maxFallSpeed: number;
    minSpawnDelay: number;
    maxSpawnDelay: number;
    objectScale: number;
    badObjectChance: number;
}

export interface GameSummary {
    mode: GameMode;
    collected: number;
    score: number;
}