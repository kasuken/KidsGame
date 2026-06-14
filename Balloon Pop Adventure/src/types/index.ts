export type GameMode = 'all' | 'red' | 'numbers' | 'letters';

export interface ModeSettings {
    label: string;
    instruction: string;
    targetCount: number;
    minRiseSpeed: number;
    maxRiseSpeed: number;
    minSpawnDelay: number;
    maxSpawnDelay: number;
    objectScale: number;
    distractorChance: number;
}

export interface BalloonData {
    kind: 'color' | 'number' | 'letter';
    colorName: 'red' | 'yellow' | 'blue' | 'green';
    value: string;
    isTarget: boolean;
}

export interface GameSummary {
    mode: GameMode;
    level: number;
    popped: number;
    score: number;
}
