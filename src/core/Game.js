import Config from './Config.js';
import  NoteHighway  from '../gameplay/NoteHighway.js';
import HitDetector from '../gameplay/HitDetector.js';
import Logger from '../utils/Logger.js';
import GameClock from './GameClock.js';
import Metronome from './Metronome.js';
import AudioEngine from '../audio/AudioEngine.js';

// Game.js (orquestrador principal)
//   ├─ init()
//   ├─ start()
//   ├─ loop() ← requestAnimationFrame
//   │   ├─ update(deltaTime)
//   │   │   ├─ TimeSync.update()
//   │   │   ├─ NoteHighway.update()
//   │   │   ├─ HitDetector.update()
//   │   │   └─ AudioEngine.update()
//   │   └─ render()
//   │       └─ Renderer.draw()
//   ├─ pause()
//   └─ stop()

export default class Game {
    constructor(eventBus, renderer, midiManager, config) {
        this.eventBus = eventBus;
        this.renderer = renderer;
        this.midiManager = midiManager;
        this.config = config;

        this.isRunning = false;
        this.lastFrameTime = 0;
        this.deltaTime = 0;

        this.clock       = new GameClock();
        this.noteHighway = new NoteHighway(this.renderer, this.config);
        this.hitDetector = new HitDetector(this.eventBus, this.config.gameplay);
        this.metronome   = new Metronome(this.config);
        
        this.audioEngine = new AudioEngine(this.config.audio);
        

        // Componentes do jogo (a serem implementados)
        // this.timeSync = new TimeSync(config.timing);
        // this.noteHighway = new NoteHighway(renderer, config.gameplay);
        // this.hitDetector = new HitDetector(eventBus, config.gameplay);
        // this.audioEngine = new AudioEngine(config.audio);

        // Bind do loop para manter o contexto
        this.gameLoop = this.gameLoop.bind(this);
 
        this.isPlaying = false;
    }

    _loadMockChart() {
        const mockNotes = [
            { time: 0.5, lane: 0, midiNote: 36, velocity: 100 },
            { time: 0.5, lane: 2, midiNote: 42, velocity: 70 },

            { time: 1.0, lane: 2, midiNote: 42, velocity: 70 },

            { time: 2.0, lane: 0, midiNote: 36, velocity: 100 },
            { time: 3.0, lane: 0, midiNote: 36, velocity: 100 },


        
            { time: 1.5, lane: 1, midiNote: 38, velocity: 90 },
            { time: 4, lane: 1, midiNote: 38, velocity: 90 },
            
            
            
            { time: 1.5, lane: 2, midiNote: 42, velocity: 70 },
            { time: 2.0, lane: 2, midiNote: 42, velocity: 70 },
            { time: 2.5, lane: 2, midiNote: 42, velocity: 70 },
            { time: 3.0, lane: 2, midiNote: 42, velocity: 70 },
            { time: 3.5, lane: 2, midiNote: 42, velocity: 70 },
            { time: 4.0, lane: 2, midiNote: 42, velocity: 70 },
            { time: 4.5, lane: 2, midiNote: 42, velocity: 70 },
            { time: 5.0, lane: 2, midiNote: 42, velocity: 70 },
            { time: 5.0, lane: 0, midiNote: 36, velocity: 100 },
            
        ];
        
        this.noteHighway.loadChart(mockNotes);
        console.log('Mock chart loaded');
    }

    async init() {
        // Inicializar componentes do jogo
        // this.timeSync.init();

        
        this.noteHighway.init();
        this.hitDetector.init();
        this._loadMockChart();
        await this.audioEngine.init();
    }
    
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        requestAnimationFrame(this.gameLoop);
        //Logger.info('Game started');
    }

    pause() {
        if (!this.isRunning) return;
        this.isRunning = false;
        this.clock.pause();
    }

    stop() {
        this.isRunning = false;
        this.clock.reset();
    }

    gameLoop(currentTime) {
        if (!this.isRunning) return;

        this.deltaTime = (currentTime - this.lastFrameTime) / 1000;
        this.lastFrameTime = currentTime;
        
        this.update(this.deltaTime);
        this.render();

        requestAnimationFrame(this.gameLoop);
    }

    update(deltaTime) {
        const currentTime = this.clock.getCurrentTime();
        // Atualizar componentes do jogo
        this.metronome.update(currentTime);
        this.noteHighway.update(deltaTime, currentTime);
        this.hitDetector.update(deltaTime, currentTime, this.noteHighway.activeNotes);
        // this.audioEngine.update(deltaTime);
    }

    render() {
        this.renderer.clear();
        // Renderizar componentes do jogo
        this.noteHighway.render(this.renderer);
        this.metronome.drawVisual(this.renderer, this.config.visual.HIT_LINE_X);
        // this.hitEffects.render(this.renderer);
        // this.ui.render(this.renderer);
    }

    startMusic() {
        this.clock.start();
        this.isPlaying = true;
        this.noteHighway.currentNoteIndex = 0;  // Apenas reset o índice
        this.noteHighway.activeNotes = [];      // Limpa notas ativas
        
        // Recarregar chart do zero
        this._loadMockChart();
    }

}