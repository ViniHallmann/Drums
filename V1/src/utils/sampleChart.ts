import { ChartJSON } from '../types/Chart';

/**
 * "Basic Rock Beat" — chart de exemplo para testar o gameplay.
 *
 * BPM: 120 → 1 beat = 0.5s
 * 8 compassos de 4/4 = 16 beats = 8 segundos de música
 *
 * Padrão:
 *  - Kick   (MIDI 36, lane 1): beats 1 e 3 de cada compasso
 *  - Snare  (MIDI 38, lane 3): beats 2 e 4 de cada compasso
 *  - Hi-hat (MIDI 42, lane 2): todos os colcheias (a cada 0.25s)
 */

const BPM = 120;
const BEAT = 60 / BPM; // 0.5s
const EIGHTH = BEAT / 2; // 0.25s
const BARS = 8;
const BEATS_PER_BAR = 4;
const DURATION = BARS * BEATS_PER_BAR * BEAT + 2; // +2s de buffer final

type RawNote = { time: number; lane: number; midiNote: number; velocity: number };
const notes: RawNote[] = [];

for (let bar = 0; bar < BARS; bar++) {
  const barStart = bar * BEATS_PER_BAR * BEAT;

  for (let beat = 0; beat < BEATS_PER_BAR; beat++) {
    const beatTime = barStart + beat * BEAT;

    // Hi-hat em cada colcheia
    for (let eighth = 0; eighth < 2; eighth++) {
      notes.push({ time: beatTime + eighth * EIGHTH, lane: 2, midiNote: 42, velocity: 80 });
    }

    // Kick nos beats 1 e 3 (index 0 e 2)
    if (beat === 0 || beat === 2) {
      notes.push({ time: beatTime, lane: 1, midiNote: 36, velocity: 100 });
    }

    // Snare nos beats 2 e 4 (index 1 e 3)
    if (beat === 1 || beat === 3) {
      notes.push({ time: beatTime, lane: 3, midiNote: 38, velocity: 90 });
    }
  }
}

// Ordena por tempo (importante para o ChartParser e o rendering)
notes.sort((a, b) => a.time - b.time);

export const SAMPLE_CHART_JSON: ChartJSON = {
  metadata: {
    title: 'Basic Rock Beat',
    artist: null,
    bpm: BPM,
    duration: DURATION,
    difficulty: 'beginner',
    genre: 'Rock',
    tags: ['tutorial', 'beginner', 'rock'],
  },
  audio: {
    backingTrack: null, // sem áudio por enquanto
  },
  notes,
};