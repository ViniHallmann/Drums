export class TimingEngine {
    private audioContext: AudioContext;
    private startTime: number = 0;
    private bpm: number;
    private isPlaying: boolean = false;

    constructor(bpm: number) {
        this.audioContext = new AudioContext();
        this.bpm = bpm;
    }

    start(): void {
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

    ticksToSeconds(ticks: number, ticksPerBeat: number = 256): number {
        const beats = ticks / ticksPerBeat;
        return (beats / this.bpm) * 60;
    }

    scheduleNote(note: Note, callback: () => void): void {
        const playTime = this.startTime + note.timeInSeconds;
        const currentTime = this.audioContext.currentTime;
        
        if (playTime > currentTime) {
        setTimeout(() => callback(), (playTime - currentTime) * 1000);
        }
    }
}