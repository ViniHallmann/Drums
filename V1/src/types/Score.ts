export type HitType = 'PERFECT' | 'GOOD' | 'EARLY' | 'LATE' | 'MISS';

export interface HitResult {
    type: HitType;
    timeDiff: number;
    score: number;
    combo: number;
}

export interface Score {
    totalScore: number;
    accuracy: number;
    maxCombo: number;
    hits: HitResult[];
    stars: number;
}