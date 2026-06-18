import { describe, it, expect } from 'vitest';
import { ticksToSeconds, secondsPerBeat, beatsToSeconds } from './timing';

describe('timing', () => {
    it('secondsPerBeat', () => {
        expect(secondsPerBeat(120)).toBeCloseTo(0.5);
        expect(secondsPerBeat(60)).toBeCloseTo(1);
    });

    it('1 beat = secondsPerBeat, qualquer que seja o PPQ', () => {
        // Um beat a 120 bpm = 0.5s, independentemente da resolução.
        expect(ticksToSeconds(128, 120, 128)).toBeCloseTo(0.5);
        expect(ticksToSeconds(480, 120, 480)).toBeCloseTo(0.5);
        expect(ticksToSeconds(960, 120, 960)).toBeCloseTo(0.5);
    });

    it('PPQ errado quebra a conversão (regressão do bug #2)', () => {
        // 960 ticks de um arquivo PPQ 480 são 2 beats; tratá-los como PPQ 128 erra feio.
        const correto = ticksToSeconds(960, 120, 480); // 2 beats = 1.0s
        const erradoComoEra = ticksToSeconds(960, 120, 128);
        expect(correto).toBeCloseTo(1.0);
        expect(erradoComoEra).not.toBeCloseTo(correto);
    });

    it('ticksToSeconds com bpm e PPQ arbitrários', () => {
        // 105 bpm, 128 PPQ, 960 ticks = 7.5 beats.
        expect(ticksToSeconds(960, 105, 128)).toBeCloseTo(7.5 * (60 / 105));
    });

    it('beatsToSeconds', () => {
        expect(beatsToSeconds(4, 120)).toBeCloseTo(2);
    });
});
