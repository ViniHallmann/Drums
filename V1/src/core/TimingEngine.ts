import { Note } from '../types/Chart';

export class TimingEngine {
    private audioContext: AudioContext;
    private startTime: number = 0;
    private bpm: number;
    private isPlaying: boolean = false;

    constructor(bpm: number, audioContext?: AudioContext) {
        this.audioContext = audioContext || new (window.AudioContext || (window as any).webkitAudioContext)();
        this.bpm = bpm;
    }

    start(): void {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }
        this.startTime = this.audioContext.currentTime;
        this.isPlaying = true;
    }

    getCurrentTime(): number {
        if (!this.isPlaying) return 0;
        return this.audioContext.currentTime - this.startTime;
    }

    getCurrentBeat(): number {
        const time = this.getCurrentTime();
        return (time / 60) * this.bpm;
    }

    getBpm(): number {
        return this.bpm;
    }

    ticksToSeconds(ticks: number, ticksPerBeat: number = 256): number {
        const beats = ticks / ticksPerBeat;
        return (beats / this.bpm) * 60;
    }

    getAudioContext(): AudioContext {
        return this.audioContext;
    }
}