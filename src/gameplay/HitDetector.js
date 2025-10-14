import Logger from '../utils/Logger.js';

export default class HitDetector {
    constructor(eventBus, config) {
        this.eventBus = eventBus;
        this.config = config;
        
        this.hitWindow = config.hitWindow || 0.2;
        this.activeNotes = []; 

    }

    _calculateAccuracy(timeDiff) {
        const perfect = this.hitWindow * 0.3;
        const good    = this.hitWindow * 0.6;
        
        if (timeDiff <= perfect) return 'PERFECT';
        if (timeDiff <= good) return 'GOOD';
        return 'OK';
    }

    init() {
        console.log('HitDetector initialized with config:', this.config);
    }

    update(deltaTime, currentTime, activeNotes) {
        this.currentTime = currentTime;
        this.activeNotes = activeNotes;
    }

    checkHit(midiNote) {
        for (const note of this.activeNotes) {
            if (note.midiNote === midiNote && !note.wasHit) {
                const timeDiff = Math.abs(note.time - this.currentTime);
                
                if (timeDiff <= this.hitWindow) {
                    note.markAsHit();
                    
                    this.eventBus.emit('note:hit', { 
                        note: note, 
                        timeDiff: timeDiff,
                        accuracy: this._calculateAccuracy(timeDiff)
                    });
                    
                    return true;
                }
            }
        }
        this.eventBus.emit('note:miss', { midiNote: midiNote });
        return false;
    }
}