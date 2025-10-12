import Config from './Config.js';
import { NoteHighway } from '../gameplay/NoteHighway.js';

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

        // Componentes do jogo (a serem implementados)
        // this.timeSync = new TimeSync(config.timing);
        // this.noteHighway = new NoteHighway(renderer, config.gameplay);
        // this.hitDetector = new HitDetector(eventBus, config.gameplay);
        // this.audioEngine = new AudioEngine(config.audio);

        // Bind do loop para manter o contexto
        this.gameLoop = this.gameLoop.bind(this);
    }

    init() {
        // Inicializar componentes do jogo
        // this.timeSync.init();
        // this.noteHighway.init();
        // this.hitDetector.init();
        // this.audioEngine.init();

        this.noteHighway = new NoteHighway(this.renderer, this.config);
        this.noteHighway.init();
    }
    
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        requestAnimationFrame(this.gameLoop);
        console.log('Game started');
    }

    pause() {
        this.isRunning = false;
        console.log('Game paused');
    }

    stop() {
        this.isRunning = false;
        // Resetar estado do jogo se necessário
        console.log('Game stopped');
    }

    gameLoop(currentTime) {
        if (!this.isRunning) return;

        this.deltaTime = (currentTime - this.lastFrameTime) / 1000; // em segundos
        this.lastFrameTime = currentTime;

        this.update(this.deltaTime);
        this.render();

        requestAnimationFrame(this.gameLoop);
    }

    update(deltaTime) {
        return;
        // Atualizar componentes do jogo
        // this.timeSync.update(deltaTime);
        //this.noteHighway.update(deltaTime);
        // this.hitDetector.update(deltaTime);
        // this.audioEngine.update(deltaTime);
    }

    render() {
        this.renderer.clear();
        // Renderizar componentes do jogo
        this.noteHighway.render(this.renderer);
        // this.hitEffects.render(this.renderer);
        // this.ui.render(this.renderer);
    }
}