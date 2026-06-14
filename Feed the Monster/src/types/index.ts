export type GameMode = 'baby' | 'explorer';
export type FoodKind = 'apple' | 'banana' | 'cupcake' | 'carrot' | 'rock';
export type MonsterAccessory = 'none' | 'party-hat' | 'bow' | 'crown';

export interface ModeSettings {
    minFallSpeed: number;
    maxFallSpeed: number;
    minSpawnDelay: number;
    maxSpawnDelay: number;
    wrongFoodChance: number;
    rockChance: number;
    itemScale: number;
}

export interface MonsterProfile {
    name: string;
    bodyColor: number;
    bellyColor: number;
    hornColor: number;
    wantedFood: Exclude<FoodKind, 'rock'>;
    targetMeals: number;
    accessory: MonsterAccessory;
}

export interface GameSummary {
    mode: GameMode;
    mealsFed: number;
    score: number;
    unlockedAccessories: MonsterAccessory[];
}
