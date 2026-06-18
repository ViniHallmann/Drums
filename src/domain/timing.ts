/**
 * Conversões de tempo do jogo. Funções puras (sem estado) — fáceis de testar.
 * São a fonte de verdade da matemática de timing usada pelo ChartLoader e pelo engine.
 */

/** Segundos por batida (beat) para um dado BPM. */
export function secondsPerBeat(bpm: number): number {
    return 60 / bpm;
}

/**
 * Converte um instante em ticks MIDI para segundos.
 *
 * @param ticks        instante em ticks
 * @param bpm          batidas por minuto do chart
 * @param ticksPerBeat resolução do chart (PPQ). MIDI nativo costuma ser 480 ou 960;
 *                     charts antigos deste projeto usam 128.
 */
export function ticksToSeconds(ticks: number, bpm: number, ticksPerBeat: number): number {
    const ticksPerSecond = ticksPerBeat * (bpm / 60);
    return ticks / ticksPerSecond;
}

/** Converte um instante em beats para segundos. */
export function beatsToSeconds(beats: number, bpm: number): number {
    return beats * secondsPerBeat(bpm);
}
