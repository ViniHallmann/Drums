export class NoteHighway {
    constructor(renderer, config) {
        this.renderer = renderer;
        this.config = config;
        
        // Configurações visuais
        this.numLanes = 9;
        this.laneHeight = renderer.height / this.numLanes;
        this.hitLineX = this.config.visual.HIT_LINE_POSITION[0];
        this.labelAreaWidth = 150;
        
        // Dados das lanes
        this.lanes = this._buildLaneConfig();
        
        // Notas (próximo passo)
        this.notes = [];
        this.activeNotes = []; // Notas visíveis na tela
    }

    

    createLane(laneConfig) {

    }
    

    init() {
        // Inicializar a pista de notas, carregar assets, etc.
        console.log('NoteHighway initialized with config:', this.config);
    }

    update(deltaTime) {
        // Atualizar posição das notas com base no tempo e velocidade de scroll
        console.log('NoteHighway update with deltaTime:', deltaTime);
    }

    render() {
        const ctx = this.renderer.getContext();
        ctx.save();
    }

    _drawNote(note) {
        // Desenhar uma nota individual na pista
    }

    //POR ENQUANTO NAO FAZ O BUILD BASEADO NA DIFICULDADE
    _buildLaneConfig() {
        return [
            { lane: 0, name: 'KICK',         color: '#222',         y: 0 },
            { lane: 1, name: 'SNARE',        color: this.config.visual.CRASH_COLOR,        y: 80 },
            { lane: 2, name: 'HIHAT_CLOSED', color: '#222', y: 160 },
            { lane: 3, name: 'HIHAT_OPEN',   color: this.config.visual.CRASH_COLOR,   y: 240 },
            { lane: 4, name: 'TOM_LOW',      color: '#222',      y: 320 },
            { lane: 5, name: 'TOM_MID',      color: this.config.visual.CRASH_COLOR,      y: 400 },
            { lane: 6, name: 'TOM_HIGH',     color: '#222',     y: 480 },
            { lane: 7, name: 'CRASH',        color: this.config.visual.CRASH_COLOR,        y: 560 },
            { lane: 8, name: 'RIDE',         color: '#222',         y: 640 }
        ];
    }
    _drawLaneBackgrounds(){
        
        for (const lane of this.lanes) {
            this.renderer.drawRect(
                0, 
                lane.y, 
                this.renderer.width, 
                this.laneHeight, 
                lane.color, 
                { alpha: 0.1 }
            );
        }
        
    }
    _drawLabelArea() {
        
        for (const lane of this.lanes) {
            this.renderer.drawRect(
                0, 
                lane.y, 
                this.labelAreaWidth, 
                this.laneHeight, 
                '#222', 
                { alpha: 0.8 }
            );
        }
    }
    _drawLaneLabels() {
        
        for (const lane of this.lanes) {
            this.renderer.drawText(
                lane.name, 
                this.labelAreaWidth / 10, 
                lane.y + this.laneHeight / 2, 
                { font: '16px Arial', color: '#fff' }
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
            this._drawNote(note);
        }

        ctx.restore(); 
    }

}