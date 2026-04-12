import { TimingEngine } from './TimingEngine';
import { ScoringEngine } from './ScoringEngine';
import { MIDIEngine } from './MIDIEngine';
import { Chart, Note } from '../types/Chart';
import { HitResult, Score, HitType } from '../types/Score';
import { HitDetector } from './HitDetector';
import { Metronome } from './Metronome';
import { KEYBOARD_MAP } from '../constants/game';

export interface NoteRenderState {
  id: string;
  note: Note;
  isHit: boolean;
  isMissed: boolean;
}

export interface HitFeedback {
  id: string;
  type: HitType;
  lane: number;
  createdAt: number;
}

export interface GameRenderData {
  currentTime: number;
  notes: NoteRenderState[];
  hitFeedbacks: HitFeedback[];
  beatFraction: number;
  isDownbeat: boolean;
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


const FEEDBACK_DURATION_MS = 600;

// const KEYBOARD_MAP: Record<string, number> = {
//   a: 36, // Kick
//   s: 38, // Snare
//   d: 42, // Hi-hat fechado
//   f: 46, // Hi-hat aberto
//   j: 48, // Tom alto
//   k: 47, // Tom médio
//   l: 45, // Tom baixo
//   ';': 49, // Crash
//   "'": 51, // Ride
// };

// ─── GameLoop ────────────────────────────────────────────────────────────────

export class GameLoop {
  private timingEngine: TimingEngine;
  private scoringEngine: ScoringEngine;
  private hitDetector: HitDetector;
  private metronome: Metronome;
  private midiEngine: MIDIEngine;
  private chart: Chart;
  private callbacks: GameLoopCallbacks;

  private rafId: number | null = null;
  private isRunning = false;
  private isPaused = false;
  private songEnded = false;

  private noteStates = new Map<string, NoteRenderState>();
  private hitFeedbacks: HitFeedback[] = [];
  private feedbackCounter = 0;

  private currentScore = 0;
  private currentCombo = 0;

  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;

  constructor(chart: Chart, callbacks: GameLoopCallbacks) {
    this.chart          = chart;
    this.callbacks      = callbacks;
    this.timingEngine   = new TimingEngine(chart.metadata.bpm);
    this.scoringEngine  = new ScoringEngine();
    this.hitDetector    = new HitDetector();
    this.metronome      = new Metronome(chart.metadata.bpm);
    this.metronome.setAudioContext(this.timingEngine.getAudioContext());
    this.midiEngine = new MIDIEngine();

    chart.notes.forEach((note, index) => {
      const id = `note-${index}`;
      this.noteStates.set(id, { id, note, isHit: false, isMissed: false });
    });
  }

  //Inicialização
  async initialize(): Promise<void> {
    try {
      await this.midiEngine.initialize();
      this.midiEngine.onNote(this.handleInput.bind(this));
      console.log('MIDI inicializado');
    } catch (e) {
      console.warn('MIDI indisponível', e);
    } finally {
      this.setupKeyboardFallback();
      console.log('Teclado configurado como fallback/complemento');
    }
  }

  //Ciclo de vida
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

  restart(): void {
    this.isRunning = false;
    this.isPaused = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    
    this.songEnded = false;
    this.currentScore = 0;
    this.currentCombo = 0;
    this.hitFeedbacks = [];
    this.feedbackCounter = 0;

    for (const state of this.noteStates.values()) {
      state.isHit = false;
      state.isMissed = false;
    }

    this.scoringEngine = new ScoringEngine();
    
    this.timingEngine.start();
    this.metronome.setAudioContext(this.timingEngine.getAudioContext());
    this.start();
  }

  //Loop principal
  private loop = (): void => {
    if (!this.isRunning || this.isPaused) return;

    const currentTime = this.timingEngine.getCurrentTime();
    
    this.metronome.update(currentTime);
    this.checkMisses(currentTime);
    this.cleanupFeedbacks();

    if (!this.songEnded && currentTime >= this.chart.metadata.duration + 1.0) {
      this.songEnded = true;
      this.callbacks.onSongEnd(this.scoringEngine.getFinalScore());
      //this.restart();
      return;
    }

    // Emite dados de render para o canvas
    this.callbacks.onRender({
      currentTime,
      notes: Array.from(this.noteStates.values()),
      hitFeedbacks: [...this.hitFeedbacks],
      beatFraction: this.metronome.getBeatFraction(),
      isDownbeat: this.metronome.isDownbeat()
    });

    this.callbacks.onHUDUpdate({
      score: this.currentScore,
      combo: this.currentCombo,
      accuracy: this.scoringEngine.getAccuracy(),
      progress: Math.min(currentTime / this.chart.metadata.duration, 1),
    });

    this.rafId = requestAnimationFrame(this.loop);
  };

  private checkMisses(currentTime: number): void {
    for (const state of this.noteStates.values()) {
      if (state.isHit || state.isMissed) continue;

      const timeDiffMs = (currentTime - state.note.timeInSeconds) * 1000;
      if (!this.hitDetector.isMissed(timeDiffMs)) continue;

      state.isMissed = true;

      const hitResult = this.scoringEngine.recordHit('MISS', timeDiffMs);

      this.currentCombo = hitResult.combo;
      this.currentScore += hitResult.score;

      this.addFeedback('MISS', state.note.lane);
      this.callbacks.onHit(hitResult);
    }
  }

  // ─── Processamento de input ─────────────────────────────

  private handleInput(midiNote: number, _velocity: number): void {
    const currentTime = this.timingEngine.getCurrentTime();

    let best: { state: NoteRenderState; timeDiffMs: number; accuracy: HitType } | null = null;

    for (const state of this.noteStates.values()) {
      if (state.isHit || state.isMissed) continue;
      if (state.note.midiNote !== midiNote) continue;

      const timeDiffMs = (currentTime - state.note.timeInSeconds) * 1000;
      const accuracy = this.hitDetector.calculateAccuracy(timeDiffMs);
      
      if (!accuracy) continue;

      if (!best || Math.abs(timeDiffMs) < Math.abs(best.timeDiffMs)) {
        best = { state, timeDiffMs, accuracy };
      }
    }

    // Ghost note (tocou mas não havia nota correspondente na janela)
    if (!best) return;

    best.state.isHit = true;

    const hitResult = this.scoringEngine.recordHit(best.accuracy, best.timeDiffMs);

    this.currentScore += hitResult.score;
    this.currentCombo = hitResult.combo;

    this.addFeedback(hitResult.type, best.state.note.lane);
    this.callbacks.onHit(hitResult);
  }

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
        this.handleInput(midiNote, 127);
      }
    };
    window.addEventListener('keydown', this.keydownHandler);
  }
}