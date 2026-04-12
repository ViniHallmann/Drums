import { HitResult, HitType, Score } from '../types/Score';

export class ScoringEngine {
	private readonly SCORE_VALUES: Record<HitType, number> = {
		PERFECT: 100,
		GOOD: 75,
		EARLY: 25,
		LATE: 25,
		MISS: 0,
	};

	private combo: number = 0;
	private maxCombo: number = 0;
	private totalScore: number = 0;
	private hits: HitResult[] = [];

	recordHit(resultType: HitType, timeDiff: number): HitResult {
		if (resultType === 'MISS') {
			this.combo = 0;
		} else {
			this.combo++;
		}

		this.maxCombo = Math.max(this.maxCombo, this.combo);
		
		const baseScore = this.SCORE_VALUES[resultType];
		const multiplier = this.getComboMultiplier(this.combo);
		const finalScore = baseScore * multiplier;

		this.totalScore += finalScore;

		const hitResult: HitResult = {
			type: resultType,
			timeDiff,
			score: finalScore,
			combo: this.combo,
		};

		this.hits.push(hitResult);
		return hitResult;
	}

	private getComboMultiplier(combo: number): number {
		if (combo >= 50) return 4;
		if (combo >= 30) return 3;
		if (combo >= 10) return 2;
		return 1;
	}

	getAccuracy(): number {
		if (this.hits.length === 0) return 0;
		
		const perfectHits = this.hits.filter(h => h.type === 'PERFECT').length;
		const goodHits    = this.hits.filter(h => h.type === 'GOOD').length;
		const earlyHits   = this.hits.filter(h => h.type === 'EARLY').length;
		const lateHits    = this.hits.filter(h => h.type === 'LATE').length;
		
		const weighted = (perfectHits * 100) + (goodHits * 75) + (earlyHits * 25) + (lateHits * 25);
		return (weighted / (this.hits.length * 100)) * 100;
	}

	getFinalScore(): Score {
		return {
			totalScore: this.totalScore,
			accuracy: this.getAccuracy(),
			maxCombo: this.maxCombo,
			hits: this.hits,
			stars: this.calculateStars(),
		};
	}

	private calculateStars(): number {
		const accuracy = this.getAccuracy();
		if (accuracy >= 95) return 5;
		if (accuracy >= 90) return 4;
		if (accuracy >= 80) return 3;
		if (accuracy >= 70) return 2;
		if (accuracy >= 60) return 1;
		return 0;
	}

	reset(): void {
		this.combo = 0;
		this.maxCombo = 0;
		this.totalScore = 0;
		this.hits = [];
	}
}