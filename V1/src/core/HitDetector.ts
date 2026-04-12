import { HitType } from '../types/Score';

interface HitDetectorConfig {
    perfectWindowMs?: number;
    goodWindowMs?: number;
    earlyHitWindowMs?: number;
    lateHitWindowMs?: number;
}

export class HitDetector {
    public readonly earlyHitWindowMs: number;
    public readonly lateHitWindowMs: number;
    public readonly perfectWindowMs: number;
    public readonly goodWindowMs: number;

    constructor(config?: HitDetectorConfig) {
        this.perfectWindowMs = config?.perfectWindowMs || 50;
        this.goodWindowMs = config?.goodWindowMs || 100;
        this.earlyHitWindowMs = config?.earlyHitWindowMs || 150;
        this.lateHitWindowMs = config?.lateHitWindowMs || 250;
        
        console.log('HitDetector initialized with config:', {
            perfect: this.perfectWindowMs,
            good: this.goodWindowMs,
            early: this.earlyHitWindowMs,
            late: this.lateHitWindowMs
        });
    }

    /**
     * Calculates the accuracy type based on time difference (in milliseconds).
     * @param timeDiff The difference between current time and note time. 
     *                 Negative means early, positive means late.
     */
    public calculateAccuracy(timeDiffMs: number): HitType | null {
        const absDiff = Math.abs(timeDiffMs);
        
        if (absDiff <= this.perfectWindowMs) return 'PERFECT';
        if (absDiff <= this.goodWindowMs) return 'GOOD';
        
        // Asymmetric windows
        if (timeDiffMs < 0 && absDiff <= this.earlyHitWindowMs) return 'EARLY';
        if (timeDiffMs > 0 && absDiff <= this.lateHitWindowMs) return 'LATE';
        
        return null; // Out of bounds
    }

    /**
     * Helper to verify if a note was completely missed (passed the late window)
     */
    public isMissed(timeDiffMs: number): boolean {
        return timeDiffMs > this.lateHitWindowMs;
    }
}
