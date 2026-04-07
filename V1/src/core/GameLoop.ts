import { TimingEngine } from './TimingEngine';
import { ScoringEngine } from './ScoringEngine';
import { MIDIEngine } from './MIDIEngine';
import { Chart, Note } from '../types/Chart';
import { HitResult, Score } from '../types/Score';

// ─── Tipos públicos ──────────────────────────────────────────────────────────

export interface NoteRenderState {
  id: string;
  note: Note;
  isHit: boolean;
  isMissed: boolean;
}

export interface HitFeedback {
  id: string;
  type: 'PERFECT' | 'GOOD' | 'OK' | 'MISS';
  lane: number;
  createdAt: number; // Date.now()
}

export interface GameRenderData {
  currentTime: number;       // segundos
  notes: NoteRenderState[];
  hitFeedbacks: HitFeedback[];
}

export interface GameHUDState {
  score: number;
  combo: number;
  accuracy: number;  // 0-100
  progress: number;  // 0-1
}

export interface GameLoopCallbacks {
  onRender: (data: GameRenderData) => void;
  onHUDUpdate: (hud: GameHUDState) => void;
  onHit: (result: HitResult) => void;
  onSongEnd: (score: Score) => void;
}

// ─── Constantes ──────────────────────────────────────────────────────────────

// TimingEngine.getCurrentTime() → segundos
// ScoringEngine.evaluateHit() → ms
// Portanto sempre convertemos: currentTime * 1000 antes de passar ao ScoringEngine

const MISS_THRESHOLD_S = 0.200;   // 200ms após o beat = missed
const FEEDBACK_DURATION_MS = 600; // quanto tempo o feedback fica visível

// Mapeamento de teclado → MIDI note (fallback sem bateria física)
const KEYBOARD_MAP: Record<string, number> = {
  a: 36, // Kick
  s: 38, // Snare
  d: 42, // Hi-hat fechado
  f: 46, // Hi-hat aberto
  j: 48, // Tom alto
  k: 47, // Tom médio
  l: 45, // Tom baixo
  ';': 49, // Crash
  "'": 51, // Ride
};

// ─── GameLoop ────────────────────────────────────────────────────────────────

export class GameLoop {
  private timingEngine: TimingEngine;
  private scoringEngine: ScoringEngine;
  private midiEngine: MIDIEngine;
  private chart: Chart;
  private callbacks: GameLoopCallbacks;

  private rafId: number | null = null;
  private isRunning = false;
  private isPaused = false;
  private songEnded = false;

  // Estado de notas
  private noteStates = new Map<string, NoteRenderState>();
  private hitFeedbacks: HitFeedback[] = [];
  private feedbackCounter = 0;

  // HUD state (atualizado via hit results e misses)
  private currentScore = 0;
  private currentCombo = 0;

  // Referência do listener de teclado para cleanup
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor(chart: Chart, callbacks: GameLoopCallbacks) {
    this.chart = chart;
    this.callbacks = callbacks;
    this.timingEngine = new TimingEngine(chart.metadata.bpm);
    this.scoringEngine = new ScoringEngine();
    this.midiEngine = new MIDIEngine();

    // Inicializa estado de todas as notas
    chart.notes.forEach((note, index) => {
      const id = `note-${index}`;
      this.noteStates.set(id, { id, note, isHit: false, isMissed: false });
    });
  }

  // ─── Inicialização (async por causa do MIDI) ───────────────────────────────

  async initialize(): Promise<void> {
    try {
      await this.midiEngine.initialize();
      this.midiEngine.onNote(this.handleInput.bind(this));
      console.log('✅ MIDI inicializado');
    } catch {
      console.warn('⚠️ MIDI indisponível, usando teclado como fallback');
      this.setupKeyboardFallback();
    }
  }

  // ─── Ciclo de vida ────────────────────────────────────────────────────────

  start(): void {
    this.isRunning = true;
    this.isPaused = false;
    this.timingEngine.start();
    this.loop();
  }

  pause(): void {
    this.isPaused = true;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  resume(): void {
    if (!this.isPaused) return;
    this.isPaused = false;
    this.loop();
  }

  stop(): void {
    this.isRunning = false;
    this.isPaused = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.midiEngine.dispose();
    if (this.keydownHandler) {
      window.removeEventListener('keydown', this.keydownHandler);
    }
  }

  // ─── Loop principal (RAF) ─────────────────────────────────────────────────

  private loop = (): void => {
    if (!this.isRunning || this.isPaused) return;

    const currentTime = this.timingEngine.getCurrentTime();

    this.checkMisses(currentTime);
    this.cleanupFeedbacks();

    // Fim da música: 1s de buffer após a última nota
    if (!this.songEnded && currentTime >= this.chart.metadata.duration + 1.0) {
      this.songEnded = true;
      this.stop();
      this.callbacks.onSongEnd(this.scoringEngine.getFinalScore());
      return;
    }

    // Emite dados de render para o canvas (toda frame)
    this.callbacks.onRender({
      currentTime,
      notes: Array.from(this.noteStates.values()),
      hitFeedbacks: [...this.hitFeedbacks],
    });

    // Emite estado do HUD
    this.callbacks.onHUDUpdate({
      score: this.currentScore,
      combo: this.currentCombo,
      accuracy: this.scoringEngine.getAccuracy(),
      progress: Math.min(currentTime / this.chart.metadata.duration, 1),
    });

    this.rafId = requestAnimationFrame(this.loop);
  };

  // ─── Detecção de misses ───────────────────────────────────────────────────

  private checkMisses(currentTime: number): void {
    for (const state of this.noteStates.values()) {
      if (state.isHit || state.isMissed) continue;

      const noteTime = state.note.timeInSeconds;
      if (currentTime - noteTime < MISS_THRESHOLD_S) continue;

      state.isMissed = true;

      // Simula hit no ScoringEngine com diferença de 500ms (claramente MISS)
      const hitResult = this.scoringEngine.evaluateHit(
        noteTime * 1000,
        (noteTime + 0.5) * 1000,
      );

      this.currentCombo = hitResult.combo; // volta a 0 no miss
      this.currentScore += hitResult.score;

      this.addFeedback('MISS', state.note.lane);
      this.callbacks.onHit(hitResult);
    }
  }

  // ─── Processamento de input (MIDI ou teclado) ─────────────────────────────

  private handleInput(midiNote: number, _velocity: number): void {
    const currentTime = this.timingEngine.getCurrentTime();

    // Busca a melhor nota candidata para esse MIDI note
    let best: { state: NoteRenderState; timeDiff: number } | null = null;

    for (const state of this.noteStates.values()) {
      if (state.isHit || state.isMissed) continue;
      if (state.note.midiNote !== midiNote) continue;

      const timeDiff = Math.abs(currentTime - state.note.timeInSeconds);
      // Descarta se estiver muito fora da janela de timing
      if (timeDiff > 0.150) continue;

      if (!best || timeDiff < best.timeDiff) {
        best = { state, timeDiff };
      }
    }

    // Ghost note (tocou mas não havia nota correspondente na janela)
    if (!best) return;

    best.state.isHit = true;

    // ScoringEngine espera ms
    const hitResult = this.scoringEngine.evaluateHit(
      best.state.note.timeInSeconds * 1000,
      currentTime * 1000,
    );

    this.currentScore += hitResult.score;
    this.currentCombo = hitResult.combo;

    this.addFeedback(hitResult.type, best.state.note.lane);
    this.callbacks.onHit(hitResult);
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────

  private addFeedback(type: HitFeedback['type'], lane: number): void {
    this.hitFeedbacks.push({
      id: `fb-${this.feedbackCounter++}`,
      type,
      lane,
      createdAt: Date.now(),
    });
  }

  private cleanupFeedbacks(): void {
    const now = Date.now();
    this.hitFeedbacks = this.hitFeedbacks.filter(
      (f) => now - f.createdAt < FEEDBACK_DURATION_MS,
    );
  }

  private setupKeyboardFallback(): void {
    this.keydownHandler = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const midiNote = KEYBOARD_MAP[e.key.toLowerCase()];
      if (midiNote !== undefined) {
        this.handleInput(midiNote, 100);
      }
    };
    window.addEventListener('keydown', this.keydownHandler);
  }
}