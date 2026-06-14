export type GameMode = 'baby' | 'explorer';
export type HabitatKind = 'ice' | 'savanna' | 'aquarium' | 'forest' | 'desert';
export type AnimalKind =
    | 'penguin'
    | 'polarBear'
    | 'seal'
    | 'lion'
    | 'zebra'
    | 'giraffe'
    | 'elephant'
    | 'rhino'
    | 'hippo'
    | 'fish'
    | 'tropicalFish'
    | 'dolphin'
    | 'whale'
    | 'shark'
    | 'octopus'
    | 'monkey'
    | 'koala'
    | 'deer'
    | 'owl'
    | 'fox'
    | 'bear'
    | 'camel'
    | 'lizard'
    | 'snake'
    | 'scorpion';

export interface ModeSettings {
    rounds: number;
    thinkingTime: number;
    hintDelay: number;
    decoyChance: number;
}

export interface HabitatProfile {
    kind: HabitatKind;
    name: string;
    hint: string;
    color: number;
    accent: number;
    emoji: string;
}

export interface AnimalProfile {
    kind: AnimalKind;
    name: string;
    emoji: string;
    habitat: HabitatKind;
    clue: string;
}

export interface GameSummary {
    mode: GameMode;
    animalsPlaced: number;
    score: number;
}
