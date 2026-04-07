export interface ChartJSON {
    metadata: ChartMetadata;
    audio: AudioConfig;
    notes: NoteData[];
}

export interface ChartMetadata {
    title: string;
    artist: string | null;
    bpm: number;
    duration: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    genre?: string;
    tags?: string[];
}

export interface AudioConfig {
    backingTrack: string | null;
}

export interface NoteData {
    time: number;          // Ticks ou segundos
    lane: number;          // 1-9 (lanes visuais)
    midiNote: number;      // 36=kick, 38=snare, etc
    velocity: number;      // 0-127
}

export interface Chart {
    metadata: ChartMetadata;
    notes: Note[];
    audio: AudioConfig;
}

export interface Note extends NoteData {
    timeInSeconds: number;
    drumPiece: DrumPiece;
}

export type DrumPiece = 
    | 'kick' 
    | 'snare' 
    | 'hihat' 
    | 'hihat-open'
    | 'tom-high'
    | 'tom-mid'
    | 'tom-low'
    | 'crash'
    | 'ride'
    | 'unknown';