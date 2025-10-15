import Logger from '../utils/Logger.js';

export default class HitDetector {
    constructor(eventBus, config) {
        this.eventBus = eventBus;
        this.config = config;
        
        //this.hitWindow = config.hitWindow || 0.2;
        this.earlyHitWindow = config.earlyHitWindow || 0.15;
        this.lateHitWindow = config.lateHitWindow || 0.25;
        this.activeNotes = []; 

    }

    _calculateAccuracy(timeDiff) {
        const absTimeDiff = Math.abs(timeDiff);
        const perfect = 0.05
        const good    = 0.10
        const early  = 0.15
        const late   = 0.25
        //const ok = Math.max(this.earlyHitWindow, this.lateHitWindow);
        
        if (absTimeDiff <= perfect) return 'PERFECT';
        if (absTimeDiff <= good) return 'GOOD';
        if (absTimeDiff <= early) return 'EARLY';
        if (absTimeDiff <= late) return 'LATE';
        //if (absTimeDiff <= ok) return 'OK';
        else return 'MISS';
    }

    init() {
        console.log('HitDetector initialized with config:', this.config);
    }

    update(deltaTime, currentTime, activeNotes) {
        this.currentTime = currentTime;
        this.activeNotes = activeNotes;

        // for (const note of this.activeNotes) {
        //     if (this.currentTime > note.time + this.lateHitWindow && !note.wasHit && !note.wasMissed) {
        //         //2note.markAsMiss(); // Marca para não verificar de novo.
        //         //this.eventBus.emit('note:miss', { note: note });
        //     }
        // }
    }

    checkHit(midiNote) {
        for (const note of this.activeNotes) {
            if (note.midiNote === midiNote && !note.wasHit) {
                const timeDiff = this.currentTime - note.time;
                
                if (timeDiff >= -this.earlyHitWindow && timeDiff <= this.lateHitWindow) {
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