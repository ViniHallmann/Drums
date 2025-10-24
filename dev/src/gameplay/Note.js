import Logger from '../utils/Logger.js';
export class Note {
    constructor(renderer, noteData, config, laneHeight) {
        this.time = noteData.time;
        this.lane = noteData.lane;
        this.midiNote = noteData.midiNote;
        this.velocity = noteData.velocity || 100;
        this.config = config;
        this.renderer = renderer;
        
        
        this.width = config.visual.NOTE_WIDTH || 80;
        this.height = config.visual.NOTE_HEIGHT || 40;
        this.color = '#d4a574';

        this.timingFeedback = null;
        this.feedbackElapsed = 0;
        this.feedbackDuration = 0.5;
        this.feedbackAlpha = 1;

        
        this.x = noteData.time * config.gameplay.scrollSpeed;
        this.y = noteData.lane * laneHeight + (laneHeight - this.height) / 2;
        

        this.isActive = true;
        this.wasHit = false;
        this.wasMiss = false;

        const drumInfo = config.input.midiMapping.find(drum => drum.midiNote === this.midiNote);
        this.color = drumInfo ? drumInfo.color : '#ffffff';
        this.originalColor = this.color;
    }

    update(currentTime, scrollSpeed) {

    }

    render() {
        if (!this.isActive) return;

        const alpha = (this.timingFeedback ? this.feedbackAlpha : 1) * (0.7 + (this.velocity / 127) * 0.3);

        this.renderer.drawRect(this.x - this.width/2, this.y, this.width, this.height, this.color, { fill: true, alpha: alpha, borderRadius: 4 });

        if (this.timingFeedback) {
            const arrow = this.timingFeedback === 'early' ? '←' : '→';
            this.renderer.drawText(arrow, this.x + this.width/2, this.y + this.height/2, {
                font: 'bold 24px sans-serif',
                color: this.color,
                alpha: this.feedbackAlpha
            });
        }
    }

    isPastHitLine() {
        return this.x + this.width < 0;
    }
    
    isVisible(canvasWidth) {
        return this.x < canvasWidth && this.x + this.width > 0;
    }

    markAsHit() {
        this.wasHit = true;
        this.isActive = false;
    }

    markAsMiss() {
        this.wasMissed = true;
        //this.isActive = false;
        this.color = '#ff0000ff';
    }


}