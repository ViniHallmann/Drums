export default class Metronome {
    constructor(config) {
        this.bpm = config.timing.bpm || 120;
        this.beatsPerBar = config.timing.beatDivision || 4;
        
        this.currentBeat = 0;
        this.currentBar = 0;
        this.beatFraction = 0;
        
<<<<<<< Updated upstream
=======
        this.visualEnabled = true;
        this.audioEnabled = false;
        
>>>>>>> Stashed changes
        this.secondsPerBeat = 60 / this.bpm;
    }
    
    update(currentTime) {
<<<<<<< Updated upstream
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
=======

        const totalBeats = currentTime / this.secondsPerBeat;
        this.currentBeat = Math.floor(totalBeats) % this.beatsPerBar;
        this.currentBar = Math.floor(totalBeats / this.beatsPerBar);
        this.beatFraction = totalBeats % 1;
>>>>>>> Stashed changes
    }
    
    isDownbeat() {
        return this.currentBeat === 0;
    }
    
<<<<<<< Updated upstream
    getBPM() {
        return this.bpm;
=======
    getBeatFlashAlpha() {
        return Math.max(0, 1 - (this.beatFraction * 4));
    }
    
    drawVisual(renderer, hitLineX) {
        if (!this.visualEnabled) return;
        
        const flashAlpha = this.getBeatFlashAlpha();
        if (flashAlpha <= 0) return;
        
        // Pulso na hit line
        const color = this.isDownbeat() ? '#ffffff' : '#888888';
        const width = this.isDownbeat() ? 6 : 4;
        
        renderer.drawLine(
            hitLineX,
            0,
            hitLineX,
            renderer.height,
            color,
            width,
            flashAlpha * 0.5
        );
>>>>>>> Stashed changes
    }
}