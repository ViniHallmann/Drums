import { describe, it, expect } from 'vitest';
import {
    INSTRUMENTS,
    lanes,
    drumByMidiNote,
    drumByName,
    keyMap,
    validateInstruments,
} from './instruments';

describe('instruments (fonte única)', () => {
    it('lanes são 0..8 sem buracos nem repetição', () => {
        const laneIndexes = INSTRUMENTS.map((i) => i.lane).sort((a, b) => a - b);
        expect(laneIndexes).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    });

    it('export `lanes` está ordenado por lane', () => {
        expect(lanes.map((i) => i.lane)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8]);
    });

    it('drumByName resolve pelo nome canônico', () => {
        expect(drumByName.get('kick')?.midiNote).toBe(36);
        expect(drumByName.get('snare')?.lane).toBe(7);
    });

    it('drumByMidiNote: nota primária vence alias em colisão (#4/#5)', () => {
        // 41 é primária de floorTom (e alias de hiHatClosed) → floorTom ganha.
        expect(drumByMidiNote.get(41)?.name).toBe('floorTom');
        // 45 é primária de midTom (e alias de hiHatOpen) → midTom ganha.
        expect(drumByMidiNote.get(45)?.name).toBe('midTom');
    });

    it('drumByMidiNote resolve aliases livres', () => {
        expect(drumByMidiNote.get(40)?.name).toBe('snare');
        expect(drumByMidiNote.get(35)?.name).toBe('kick');
        expect(drumByMidiNote.get(43)?.name).toBe('floorTom');
    });

    it('keyMap mapeia tecla → nome do instrumento', () => {
        expect(keyMap.get('A')).toBe('kick');
        expect(keyMap.get('S')).toBe('snare');
        expect(keyMap.get('D')).toBe('hiHatClosed');
    });

    it('validateInstruments aponta exatamente as 2 colisões de alias conhecidas', () => {
        const issues = validateInstruments();
        expect(issues.filter((i) => i.kind === 'duplicate-lane')).toHaveLength(0);
        expect(issues.filter((i) => i.kind === 'duplicate-midiNote')).toHaveLength(0);
        // alias 41 (hiHatClosed↔floorTom) e 45 (hiHatOpen↔midTom)
        expect(issues.filter((i) => i.kind === 'alias-collision')).toHaveLength(2);
    });
});
