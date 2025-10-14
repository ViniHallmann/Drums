import { Note } from './Note.js';
import Logger from '../utils/Logger.js';
export default class NoteHighway {
    constructor(renderer, config) {
        this.renderer = renderer;
        this.config = config;
        
        this.numLanes = this.config.visual.NUM_LANES || 6;
        this.laneHeight = renderer.height / this.numLanes;
        this.hitLineX = this.config.visual.HIT_LINE_X;
        this.labelAreaWidth = 150;
        
        this.lanes = this._buildLaneConfig();

        this.allNotes = [];
        this.activeNotes = []; 
        this.currentNoteIndex = 0;

        this.currentTime = 0;
        this.scrollSpeed = this.config.gameplay.scrollSpeed; 
    }

    loadChart(notes) {

        
        this.allNotes = notes.map(noteData => {
            return new Note(this.renderer, noteData, this.config, this.laneHeight);
        });
        
        this.allNotes.sort((a, b) => a.time - b.time);
        
        this.activeNotes = [];
        this.currentNoteIndex = 0;
        
        //Logger.info(`Chart loaded: ${this.allNotes.length} notes`);
    }

    _spawnNotes() {
        const lookAheadTime = this.config.gameplay.lookAheadTime || 4;
        
        while (this.currentNoteIndex < this.allNotes.length) {
            const note = this.allNotes[this.currentNoteIndex];
            
            const timeUntilNote = note.time - this.currentTime;
            
            if (timeUntilNote <= lookAheadTime) {
                this.activeNotes.push(note);
                this.currentNoteIndex++;
            } else {
                break;
            }
        }
    }

    _cullNotes() {
        this.activeNotes = this.activeNotes.filter(note => {
            return note.isVisible(this.renderer.width);
        });
    }

    init() {
        console.log();
        //Logger.info('NoteHighway initialized with config:', this.config);
    }

    update(deltaTime, currentTime) {
        const leadTime = this.config.gameplay.LEAD_TIME || 4.0;
        this.currentTime = currentTime;
    
        this._spawnNotes();
        
        for (const note of this.activeNotes) {
            note.update(currentTime, this.scrollSpeed);
        }
        
        //this._cullNotes();
    }

    //POR ENQUANTO NAO FAZ O BUILD BASEADO NA DIFICULDADE
    _buildLaneConfig() {
        const lanes = [];
    
        for (const [midiNote, drumInfo] of Object.entries(this.config.input.midiMapping)) {
            lanes.push({
                lane: drumInfo.lane,
                name: drumInfo.name.toUpperCase(),
                color: drumInfo.color,
                y: drumInfo.lane * this.laneHeight,
                midiNote: parseInt(midiNote)
            });
        }

        lanes.sort((a, b) => a.lane - b.lane);
        
        return lanes;
    }

    _drawLaneBackgrounds() {
        for (let i = 0; i < this.numLanes; i++) {
            const y = i * this.laneHeight;
            const color = i % 2 === 0 ? '#0f0f0f' : '#0a0a0a';
            
            this.renderer.drawRect(
                0, 
                y, 
                this.renderer.width, 
                this.laneHeight, 
                color
            );
        }
    }

    _drawLabelArea() {
        this.renderer.drawRect(
            0, 
            0, 
            this.labelAreaWidth, 
            this.renderer.height, 
            '#1a1a1a',
            { alpha: 0.95 }
        );
        
        this.renderer.drawLine(
            this.labelAreaWidth,
            0,
            this.labelAreaWidth,
            this.renderer.height,
            '#2a2a2a',
            1,
            0.5
        );
    }

    _drawLaneLabels() {
        for (const lane of this.lanes) {
            const centerY = lane.y + (this.laneHeight / 2);
            
            this.renderer.drawCircle(
                25,
                centerY,
                6,
                lane.color,
                { alpha: 0.8 }
            );
            

            this.renderer.drawText(
                lane.name, 
                45,  
                centerY, 
                { 
                    font: '12px sans-serif', 
                    color: '#9a9a9a', 
                    align: 'left',
                    baseline: 'middle'
                }
            );
        }
    }

    _drawHitLine() {
        
        this.renderer.drawLine(
            this.hitLineX, 
            0, 
            this.hitLineX, 
            this.renderer.height, 
            '#FFF', 
            2, 
            0.5
        );
    }

    _drawBeatGrid(){
        for (let x = this.hitLineX; x < this.renderer.width; x += 100) {
            this.renderer.drawLine(
                x, 
                0, 
                x, 
                this.renderer.height, 
                '#555', 
                1, 
                0.3
            );
        }

    }

    render() {
        const ctx = this.renderer.getContext();
        ctx.save();

        this._drawLaneBackgrounds();

        this._drawLabelArea();

        this._drawLaneLabels();

        this._drawHitLine();

        this._drawBeatGrid();

        for (const note of this.activeNotes) {
            note.render(this.renderer);
        }

        ctx.restore(); 
    }

}