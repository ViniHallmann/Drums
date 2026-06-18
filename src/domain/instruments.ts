/**
 * Fonte única de verdade dos instrumentos da bateria.
 *
 * Toda a tríade `name` ↔ `lane` ↔ `midiNote` (+ aliases, cor, tecla de debug) vive AQUI.
 * Tudo o mais (raias ordenadas, índice por nota MIDI, mapa de teclas) é DERIVADO deste
 * módulo — não duplique esses dados em Config, no NoteHighway nem no conversor de charts.
 */

export interface Instrument {
    /** Chave canônica usada no código e para tocar o sample (ex.: 'kick'). */
    name: string;
    /** Índice da raia na highway (0 = topo). */
    lane: number;
    /** Nota MIDI primária (General MIDI percussion). */
    midiNote: number;
    /** Notas MIDI alternativas que também disparam este instrumento. */
    aliases: number[];
    /** Cor de render da nota/raia. */
    color: string;
    /** Tecla de debug (teclado) que dispara este instrumento. */
    key: string;
    /** Arquivo de sample associado (referência; o áudio carrega por `name`). */
    sample: string;
}

/**
 * Tabela canônica, ordenada por lane (0 = topo, 8 = base/kick).
 * ⚠️ Esta é a ÚNICA definição do mapeamento. Charts e conversor devem segui-la.
 */
// prettier-ignore
export const INSTRUMENTS: readonly Instrument[] = [
    { name: 'rideCymbal',  lane: 0, midiNote: 51, aliases: [],       color: '#ffcc00', key: 'H', sample: 'ride.wav' },
    { name: 'floorTom',    lane: 1, midiNote: 41, aliases: [43, 44], color: '#ff3333', key: 'K', sample: 'floortom.wav' },
    { name: 'highTom',     lane: 2, midiNote: 48, aliases: [],       color: '#ff6666', key: 'I', sample: 'hightom.wav' },
    { name: 'midTom',      lane: 3, midiNote: 45, aliases: [],       color: '#ff9966', key: 'J', sample: 'midtom.wav' },
    { name: 'crashCymbal', lane: 4, midiNote: 49, aliases: [],       color: '#ffcc00', key: 'G', sample: 'crash.wav' },
    { name: 'hiHatOpen',   lane: 5, midiNote: 46, aliases: [45],     color: '#cccccc', key: 'F', sample: 'hihat_open.wav' },
    { name: 'hiHatClosed', lane: 6, midiNote: 42, aliases: [41],     color: '#cccccc', key: 'D', sample: 'hihat_closed.wav' },
    { name: 'snare',       lane: 7, midiNote: 38, aliases: [40],     color: '#ffffff', key: 'S', sample: 'snare.wav' },
    { name: 'kick',        lane: 8, midiNote: 36, aliases: [35],     color: '#d4a574', key: 'A', sample: 'kick.wav' },
];

/** Instrumentos ordenados por lane (0 → topo). Usado pela NoteHighway. */
export const lanes: readonly Instrument[] = [...INSTRUMENTS].sort((a, b) => a.lane - b.lane);

/** Índice nome → instrumento. */
export const drumByName: ReadonlyMap<string, Instrument> = new Map(
    INSTRUMENTS.map((instrument) => [instrument.name, instrument]),
);

/**
 * Índice nota MIDI → instrumento, incluindo aliases.
 * Notas primárias têm precedência sobre aliases em caso de colisão.
 */
export const drumByMidiNote: ReadonlyMap<number, Instrument> = buildMidiIndex();

function buildMidiIndex(): Map<number, Instrument> {
    const map = new Map<number, Instrument>();
    // Primárias primeiro (vencem colisões).
    for (const instrument of INSTRUMENTS) {
        map.set(instrument.midiNote, instrument);
    }
    // Aliases só preenchem notas ainda livres.
    for (const instrument of INSTRUMENTS) {
        for (const alias of instrument.aliases) {
            if (!map.has(alias)) {
                map.set(alias, instrument);
            }
        }
    }
    return map;
}

/** Mapa tecla (maiúscula) → nome do instrumento (teclado de debug). */
export const keyMap: ReadonlyMap<string, string> = new Map(
    INSTRUMENTS.map((instrument) => [instrument.key.toUpperCase(), instrument.name]),
);

export type InstrumentIssueKind = 'duplicate-lane' | 'duplicate-midiNote' | 'alias-collision';

export interface InstrumentIssue {
    kind: InstrumentIssueKind;
    message: string;
}

/**
 * Verifica a integridade da tabela de instrumentos: lanes/notas primárias duplicadas e
 * aliases que colidem com uma nota primária (e portanto são ignorados). Não lança —
 * retorna a lista de problemas para ser logada no boot e coberta por testes.
 */
export function validateInstruments(): InstrumentIssue[] {
    const issues: InstrumentIssue[] = [];
    const laneOwner = new Map<number, string>();
    const noteOwner = new Map<number, string>();

    for (const instrument of INSTRUMENTS) {
        const prevLane = laneOwner.get(instrument.lane);
        if (prevLane) {
            issues.push({
                kind: 'duplicate-lane',
                message: `Lane ${instrument.lane} usada por '${prevLane}' e '${instrument.name}'.`,
            });
        } else {
            laneOwner.set(instrument.lane, instrument.name);
        }

        const prevNote = noteOwner.get(instrument.midiNote);
        if (prevNote) {
            issues.push({
                kind: 'duplicate-midiNote',
                message: `Nota MIDI ${instrument.midiNote} é primária de '${prevNote}' e '${instrument.name}'.`,
            });
        } else {
            noteOwner.set(instrument.midiNote, instrument.name);
        }
    }

    for (const instrument of INSTRUMENTS) {
        for (const alias of instrument.aliases) {
            const owner = noteOwner.get(alias);
            if (owner && owner !== instrument.name) {
                issues.push({
                    kind: 'alias-collision',
                    message: `Alias ${alias} de '${instrument.name}' colide com a nota primária de '${owner}' (alias ignorado).`,
                });
            }
        }
    }

    return issues;
}
