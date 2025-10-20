import { Note } from './Note.js';
import Logger from '../utils/Logger.js';
import Renderer from '../rendering/Renderer.js';
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
        this.scrollPosition = 0;
        this.staticLayerCanvas = document.createElement('canvas');
        this.staticLayerCanvas.width = this.renderer.width;
        this.staticLayerCanvas.height = this.renderer.height;
        //this._preRenderStaticLayers();
    }

    _preRenderStaticLayers() {
        const tempRenderer = new Renderer('gameCanvas', this.config.visual); 
        tempRenderer.ctx = this.staticLayerCanvas.getContext('2d');
        tempRenderer.clear();
        this._drawLaneBackgrounds(tempRenderer);
        this._drawLabelArea(tempRenderer);
        this._drawLaneLabels(tempRenderer);
        this._drawHitLine(tempRenderer);
        this._drawBeatGrid(tempRenderer);
    }

    _drawStaticElements() {
        this._drawLaneBackgrounds(this.renderer);
        this._drawLabelArea(this.renderer);
        this._drawLaneLabels(this.renderer);
        this._drawHitWindows(this.renderer);
        this._drawHitLine(this.renderer);
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
        const lookAheadTime = this.config.gameplay.lookAheadTime || 2;
        
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

        //Logger.info('NoteHighway initialized with config:', this.config);
    }

    update(deltaTime, currentTime) {
        //const leadTime = this.config.gameplay.LEAD_TIME || 4.0;
        this.currentTime = currentTime;
        this.scrollPosition = this.currentTime * this.scrollSpeed;
    
        this._spawnNotes();
        
        // for (const note of this.activeNotes) {
        //     note.update(currentTime, this.scrollSpeed);
        // }
        
        //this._cullNotes();
    }

    //POR ENQUANTO NAO FAZ O BUILD BASEADO NA DIFICULDADE
    _buildLaneConfig() {
        const lanes = [];
    
        for (const [midiNote, drumInfo] of Object.entries(this.config.input.midiMapping)) {
            lanes.push({
                lane:  drumInfo.lane,
                name:  drumInfo.name.toUpperCase(),
                color: drumInfo.color,
                y:     drumInfo.lane * this.laneHeight,
                midiNote: parseInt(midiNote)
            });
        }

        lanes.sort((a, b) => a.lane - b.lane);
        
        return lanes;
    }

    _drawLaneBackgrounds(renderer) {
        for (let i = 0; i < this.numLanes; i++) {
            const y = i * this.laneHeight;
            const color = i % 2 === 0 ? '#0f0f0f' : '#0a0a0a';
            renderer.drawRect(0, y, renderer.width, this.laneHeight, color);
        }
    }

    _drawLabelArea(renderer) {
        renderer.drawRect(0, 0, this.labelAreaWidth, renderer.height, '#1a1a1a', { alpha: 0.95 });
        renderer.drawLine(this.labelAreaWidth, 0, this.labelAreaWidth, renderer.height, '#2a2a2a', 1, 0.5);
    }

    _drawLaneLabels(renderer) {
        for (const lane of this.lanes) {
            const centerY = lane.y + (this.laneHeight / 2);
            renderer.drawCircle(25, centerY, 6, lane.color, { alpha: 0.8 });
            renderer.drawText(lane.name, 45, centerY, { font: '12px sans-serif', color: '#9a9a9a', align: 'left', baseline: 'middle'});
        }
    }

    _drawHitLine(renderer) {
        renderer.drawLine(this.hitLineX, 0, this.hitLineX, renderer.height, '#cfcf25', 3, 0.5);
    }

    _drawHitWindows(renderer) {
        const hitLineX = this.config.visual.HIT_LINE_X;
        const scrollSpeed = this.config.gameplay.scrollSpeed;

        
        const earlyWidth = this.config.gameplay.earlyHitWindow * scrollSpeed;
        const earlyX = hitLineX - earlyWidth;
        renderer.drawRect(earlyX, 0, earlyWidth, renderer.height, '#a051ca', { alpha: 0.15 });

        const lateWidth = this.config.gameplay.lateHitWindow * scrollSpeed;
        renderer.drawRect(hitLineX, 0, lateWidth, renderer.height, '#b87474', { alpha: 0.15 });


    }

    _drawBeatGrid(renderer){
        for (let x = this.hitLineX; x < renderer.width; x += 100) {
            renderer.drawLine(x, 0, x, renderer.height, '#555', 1, 0.3);
        }
    }

    render() {
        const ctx = this.renderer.getContext();
        ctx.save();

        this._drawStaticElements();
        //ctx.drawImage(this.staticLayerCanvas, 0, 0);
        ctx.translate(-this.scrollPosition + this.hitLineX, 0);

        this._drawBeatGrid(this.renderer);

        for (const note of this.activeNotes) {
            note.render(this.renderer);
        }

        ctx.restore(); 
        

        //ctx.drawImage(this.staticLayerCanvas, 0, 0);
    }

}