import { describe, it, expect } from 'vitest';
import { validateChart, type ChartNote } from './chart';

const note = (over: Partial<ChartNote>): ChartNote => ({
    time: 0,
    lane: 0,
    midiNote: 51,
    velocity: 100,
    ...over,
});

describe('validateChart', () => {
    it('aceita um chart consistente', () => {
        const issues = validateChart({
            notes: [
                note({ lane: 8, midiNote: 36 }), // kick
                note({ lane: 7, midiNote: 38 }), // snare
                note({ lane: 6, midiNote: 42 }), // hi-hat fechado
            ],
        });
        expect(issues).toHaveLength(0);
    });

    it('reporta chart sem notas', () => {
        expect(validateChart({})).toEqual([{ index: -1, message: 'Chart sem array de notas.' }]);
    });

    it('detecta lane fora da faixa', () => {
        const issues = validateChart({ notes: [note({ lane: 99, midiNote: 36 })] });
        expect(issues.some((i) => i.message.includes('fora da faixa'))).toBe(true);
    });

    it('detecta divergência lane↔midiNote (bug #12)', () => {
        // snare (38) colocado na lane do hi-hat fechado (6).
        const issues = validateChart({ notes: [note({ lane: 6, midiNote: 38 })] });
        expect(issues.some((i) => i.message.includes('diverge'))).toBe(true);
    });

    it('detecta midiNote não mapeado', () => {
        const issues = validateChart({ notes: [note({ lane: 0, midiNote: 999 })] });
        expect(issues.some((i) => i.message.includes('não mapeado'))).toBe(true);
    });
});
