import { ChartJSON, Chart, DrumPiece } from '../types/Chart';

export class ChartParser {
    parse(json: ChartJSON): Chart {
        this.validate(json);
        
        const notes = json.notes.map(noteData => {
            const timeInSeconds = this.convertToSeconds(
                noteData.time,
                json.metadata.bpm
            );
            
            return {
                ...noteData,
                timeInSeconds,
                drumPiece: this.midiToDrumPiece(noteData.midiNote),
            };
        });

        return {
            metadata: json.metadata,
            notes: notes.sort((a, b) => a.timeInSeconds - b.timeInSeconds),
            audio: json.audio,
        };
    }

    private validate(json: ChartJSON): void {
        if (!json.metadata?.bpm) { throw new Error('Chart must have BPM'); }
        if (!Array.isArray(json.notes)) { throw new Error('Chart must have notes array'); }
    }

    private convertToSeconds(time: number, bpm: number): number {
        if (time > 100) {
            const TICKS_PER_BEAT = 256;
            const beats = time / TICKS_PER_BEAT;
            return (beats / bpm) * 60;
        }
        return time;
    }

    private midiToDrumPiece(midiNote: number): DrumPiece {
        const mapping: Record<number, DrumPiece> = {
            36: 'kick',
            38: 'snare',
            42: 'hihat',
            46: 'hihat-open',
            48: 'tom-high',
            47: 'tom-mid',
            45: 'tom-low',
            49: 'crash',
            51: 'ride',
        };
        return mapping[midiNote] || 'unknown';
    }
}
