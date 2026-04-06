import Logger from '../utils/Logger.js';

export default class HitDetector {
    constructor(eventBus, config) {
        this.eventBus = eventBus;
        this.config = config;
        
<<<<<<< Updated upstream
        //this.hitWindow = config.hitWindow || 0.2;
        this.earlyHitWindow = config.earlyHitWindow || 0.15;
        this.lateHitWindow = config.lateHitWindow || 0.25;
=======
        this.hitWindow = config.hitWindow || 0.2;
>>>>>>> Stashed changes
        this.activeNotes = []; 

    }

    _calculateAccuracy(timeDiff) {
<<<<<<< Updated upstream
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

        else return 'MISS';
=======
        const perfect = this.hitWindow * 0.3;
        const good    = this.hitWindow * 0.6;
        
        if (timeDiff <= perfect) return 'PERFECT';
        if (timeDiff <= good) return 'GOOD';
        return 'OK';
>>>>>>> Stashed changes
    }

    init() {
        console.log('HitDetector initialized with config:', this.config);
    }

    update(deltaTime, currentTime, activeNotes) {
        this.currentTime = currentTime;
        this.activeNotes = activeNotes;
<<<<<<< Updated upstream

        for (const note of this.activeNotes) {
            if (this.currentTime > note.time + this.lateHitWindow && !note.wasHit && !note.wasMissed) {
                note.markAsMiss();
                this.eventBus.emit('note:miss', { note: note });
            }
        }
=======
>>>>>>> Stashed changes
    }

    checkHit(midiNote) {
        for (const note of this.activeNotes) {
            if (note.midiNote === midiNote && !note.wasHit) {
<<<<<<< Updated upstream
                const timeDiff = this.currentTime - note.time;
                
                if (timeDiff >= -this.earlyHitWindow && timeDiff <= this.lateHitWindow) {
                    const accuracy = this._calculateAccuracy(timeDiff);
                
                    if (accuracy === 'EARLY') {
                        note.timingFeedback = 'early';
                        note.color = '#a051caff';
                    } else if (accuracy === 'LATE') {
                        note.timingFeedback = 'late';
                        note.color = '#b87474';
                    } else {
                        note.markAsHit();
                    }
=======
                const timeDiff = Math.abs(note.time - this.currentTime);
                
                if (timeDiff <= this.hitWindow) {
                    note.markAsHit();
>>>>>>> Stashed changes
                    
                    this.eventBus.emit('note:hit', { 
                        note: note, 
                        timeDiff: timeDiff,
                        accuracy: this._calculateAccuracy(timeDiff)
                    });
                    
                    return true;
                }
            }
        }
<<<<<<< Updated upstream
=======
        
>>>>>>> Stashed changes
        this.eventBus.emit('note:miss', { midiNote: midiNote });
        return false;
    }
}