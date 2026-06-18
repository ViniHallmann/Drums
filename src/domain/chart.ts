/**
 * Schema tipado do chart + validação. O `time` das notas pode estar em ticks, segundos
 * ou beats (ver `timeUnit`); o ChartLoader normaliza para segundos ao carregar.
 */
import { drumByMidiNote, lanes } from './instruments';

/** Unidade do campo `time` das notas no arquivo do chart. */
export type TimeUnit = 'ticks' | 'seconds' | 'beats';

/** Default de PPQ para charts em ticks que não declaram `ticksPerBeat`. */
export const DEFAULT_TICKS_PER_BEAT = 128;

export interface ChartMetadata {
    title: string;
    artist: string | null;
    bpm: number;
    /** Duração em segundos. Recalculada pelo ChartLoader a partir da última nota. */
    duration: number;
    difficulty: string;
    /** Unidade de `time` das notas. Ausente = 'ticks' (retrocompat). */
    timeUnit?: TimeUnit;
    /** Resolução (PPQ) quando `timeUnit === 'ticks'`. Ausente = 128. */
    ticksPerBeat?: number;
}

export interface ChartNote {
    /** Instante no arquivo (ticks/segundos/beats); convertido para segundos ao carregar. */
    time: number;
    lane: number;
    midiNote: number;
    velocity: number;
}

export interface Chart {
    metadata: ChartMetadata;
    audio: { backingTrack: string | null };
    notes: ChartNote[];
}

export interface ChartIssue {
    /** Índice da nota com problema, ou -1 para problemas estruturais. */
    index: number;
    message: string;
}

/**
 * Valida um chart cru. Detecta: ausência de notas, `time` não-numérico, lane fora da
 * faixa, nota MIDI não mapeada e divergência lane↔midiNote (bug #12). Não lança —
 * retorna a lista de problemas para o ChartLoader logar.
 */
export function validateChart(chart: { notes?: ChartNote[] }): ChartIssue[] {
    if (!chart || !Array.isArray(chart.notes)) {
        return [{ index: -1, message: 'Chart sem array de notas.' }];
    }

    const issues: ChartIssue[] = [];
    const laneCount = lanes.length;

    chart.notes.forEach((note, index) => {
        if (typeof note.time !== 'number' || !Number.isFinite(note.time)) {
            issues.push({ index, message: `time inválido: ${note.time}` });
        }
        if (note.lane < 0 || note.lane >= laneCount) {
            issues.push({ index, message: `lane ${note.lane} fora da faixa 0..${laneCount - 1}` });
        }

        const instrument = drumByMidiNote.get(note.midiNote);
        if (!instrument) {
            issues.push({
                index,
                message: `midiNote ${note.midiNote} não mapeado a nenhum instrumento`,
            });
        } else if (instrument.lane !== note.lane) {
            issues.push({
                index,
                message: `lane ${note.lane} diverge do instrumento da nota ${note.midiNote} ('${instrument.name}', lane ${instrument.lane})`,
            });
        }
    });

    return issues;
}
