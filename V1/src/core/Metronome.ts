export class Metronome {
    private bpm: number;
    private beatsPerBar: number;
    
    private currentBeat: number = 0;
    private currentBar: number = 0;
    private beatFraction: number = 0;
    private lastPlayedBeat: number = -1;

    public visualEnabled: boolean = true;
    public audioEnabled: boolean = true;
    
    private audioContext: AudioContext | null = null;

    constructor(bpm: number = 120, beatsPerBar: number = 4) {
        this.bpm = bpm;
        this.beatsPerBar = beatsPerBar;
    }

    setAudioContext(ctx: AudioContext) {
        this.audioContext = ctx;
    }

    update(currentTimeSec: number) {
        const secondsPerBeat = 60 / this.bpm;
        const totalBeats = currentTimeSec / secondsPerBeat;
        
        const rawBeat = Math.floor(totalBeats) % this.beatsPerBar;
        this.currentBeat = ((rawBeat % this.beatsPerBar) + this.beatsPerBar) % this.beatsPerBar;
        this.currentBar = Math.floor(totalBeats / this.beatsPerBar);
        
        let fraction = totalBeats - Math.floor(totalBeats);
        if (fraction < 0) {
            fraction += 1;
        }
        this.beatFraction = fraction;

        const absoluteBeat = Math.floor(totalBeats);
        if (absoluteBeat > this.lastPlayedBeat && currentTimeSec > 0) {
            this.lastPlayedBeat = absoluteBeat;
            this.playClick();
        }
    }

    reset() {
        this.currentBeat = 0;
        this.currentBar = 0;
        this.beatFraction = 0;
        this.lastPlayedBeat = -1;
    }

    getCurrentBeat() {
        return this.currentBeat;
    }

    getBeatFraction() {
        return this.beatFraction;
    }

    isDownbeat() {
        return this.currentBeat === 0;
    }

    getBPM() {
        return this.bpm;
    }

    private playClick() {
        if (!this.audioEnabled || !this.audioContext) return;

        const osc = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        osc.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Downbeat (first beat) gets a higher pitch
        osc.frequency.value = this.isDownbeat() ? 1000 : 800;
        
        // Very short percussive envelope
        gainNode.gain.setValueAtTime(0.5, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.1);

        osc.start(this.audioContext.currentTime);
        osc.stop(this.audioContext.currentTime + 0.1);
    }
}
