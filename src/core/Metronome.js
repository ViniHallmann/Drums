export default class Metronome {
    constructor(config) {
        this.bpm = config.timing.bpm || 120;
        this.beatsPerBar = config.timing.beatDivision || 4;
        
        this.currentBeat = 0;
        this.currentBar = 0;
        this.beatFraction = 0;
        
        this.secondsPerBeat = 60 / this.bpm;
    }
    
    update(currentTime) {
        const totalBeats = currentTime / this.secondsPerBeat;
        const rawBeat = Math.floor(totalBeats) % this.beatsPerBar;
        
        this.currentBeat = ((rawBeat % this.beatsPerBar) + this.beatsPerBar) % this.beatsPerBar;
        this.currentBar = Math.floor(totalBeats / this.beatsPerBar);
        
        this.beatFraction = totalBeats - Math.floor(totalBeats);
        if (this.beatFraction < 0) {
            this.beatFraction += 1;
        }
    }
    
    reset() {
        this.currentBeat = 0;
        this.currentBar = 0;
        this.beatFraction = 0;
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
}