// // Identificação
// - time: number         // Quando deve ser acertada (segundos)
// - lane: number         // Qual lane (0-8)
// - midiNote: number     // Nota MIDI original (ex: 36 = kick)

// // Visual
// - x: number            // Posição horizontal (calculada)
// - y: number            // Posição vertical (fixa, baseada na lane)
// - width: number        // Largura da nota
// - height: number       // Altura da nota
// - color: string        // Cor (do instrumento)

// // Estado
// - isActive: boolean    // Ainda não foi acertada nem passou
// - wasHit: boolean      // Foi acertada pelo jogador
// - velocity: number     // Força do hit (0-127)

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

        
        this.x = 0;
        this.y = noteData.lane * laneHeight + (laneHeight - this.height) / 2;

        this.isActive = true;
        this.wasHit = false;

        const drumInfo = Object.values(config.input.midiMapping).find(d => d.lane === this.lane);
        this.color = drumInfo ? drumInfo.color : '#ffffff';
        this.originalColor = this.color;
    }

    update(currentTime, scrollSpeed) {

        if (this.timingFeedback) {
            this.feedbackElapsed += 0.016; 
            const progress = this.feedbackElapsed / this.feedbackDuration;
            
            const direction = this.timingFeedback === 'early' ? -1 : 1;
            this.x += direction * 100 * 0.016;
            this.feedbackAlpha = 1 - progress;
            
            if (progress >= 1) this.isActive = false;
            return;
        }
        const timeToHit = this.time - currentTime;
        const distanceToHit = timeToHit * scrollSpeed;
        this.x = this.config.visual.HIT_LINE_X + distanceToHit;

        if (this.x + this.width < 0) {
            this.isActive = false;
        }
    }

    render() {
        if (!this.isActive) return;

        const alpha = (this.timingFeedback ? this.feedbackAlpha : 1) * (0.7 + (this.velocity / 127) * 0.3);
        //const alpha = 0.7 + (this.velocity / 127) * 0.3;

        this.renderer.drawRect(
            this.x,
            this.y,
            this.width,
            this.height,
            this.color,
            {
                fill: true,
                alpha: alpha,
                borderRadius: 4
            }
        );

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
        this.wasHit = false;
        this.isActive = false;
    }


}