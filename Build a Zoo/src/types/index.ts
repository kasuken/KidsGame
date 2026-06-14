export type GameMode = 'little' | 'big';
export type HabitatKey = 'ice' | 'savanna' | 'aquarium' | 'forest';

export interface AnimalProfile {
    name: string;
    emoji: string;
    habitat: HabitatKey;
    clue: string;
}

export interface HabitatProfile {
    key: HabitatKey;
    name: string;
    label: string;
    color: number;
    accent: number;
}

export interface GameSummary {
    mode: GameMode;
    placed: number;
    score: number;
}
