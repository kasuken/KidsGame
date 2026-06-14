export type GameMode = 'baby' | 'explorer';
export type TreasureKind = 'shell' | 'coin' | 'pirate' | 'crab';

export interface ModeSettings {
    piles: number;
    bonusTarget: number;
}

export interface TreasureProfile {
    kind: TreasureKind;
    name: string;
    plural: string;
    emoji: string;
    color: number;
    sparkle: number;
    message: string;
}

export interface GameSummary {
    mode: GameMode;
    treasuresFound: number;
    score: number;
}
