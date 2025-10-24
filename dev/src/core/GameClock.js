export default class GameClock {
    constructor() {
        this.startTime = 0;
        this.pausedTime = 0;
        this.lastPauseTime = 0;
        this.offset = 0;
        this.isRunning = false;
    }
    
    start(offset = 0) {
        this.startTime = performance.now();
        this.pausedTime = 0;
        this.isRunning = true;
    }
    
    pause() {
        if (!this.isRunning) return;
        this.lastPauseTime = performance.now();
        this.isRunning = false;
    }
    
    resume() {
        if (this.isRunning) return;
        const pauseDuration = performance.now() - this.lastPauseTime;
        this.pausedTime += pauseDuration;
        this.isRunning = true;
    }
    
    reset() {
        this.startTime = 0;
        this.pausedTime = 0;
        this.lastPauseTime = 0;
        this.offset = 0;
        this.isRunning = false;
    }
    
    getCurrentTime() {
        if (!this.isRunning) {
            return (this.lastPauseTime - this.startTime - this.pausedTime) / 1000 + this.offset;
        }
        return (performance.now() - this.startTime - this.pausedTime) / 1000 + this.offset;
    }
    
    setOffset(offsetInSeconds) {
        this.offset = offsetInSeconds;
    }
}