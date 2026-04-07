export type HitType = 'PERFECT' | 'GOOD' | 'OK' | 'MISS';

export interface HitResult {
    type: HitType;
    timeDiff: number;      // Em ms
    score: number;
    combo: number;
}

export interface Score {
    totalScore: number;
    accuracy: number;      // 0-100%
    maxCombo: number;
    hits: HitResult[];
    stars: number;         // 0-5
}