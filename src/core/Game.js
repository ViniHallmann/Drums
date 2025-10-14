import Config from './Config.js';
import  NoteHighway  from '../gameplay/NoteHighway.js';
import HitDetector from '../gameplay/HitDetector.js';
import Logger from '../utils/Logger.js';
import GameClock from './GameClock.js';
import Metronome from './Metronome.js';
import AudioEngine from '../audio/AudioEngine.js';
import ChartLoader from '../chart/ChartLoader.js';

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
        this.chartLoader = new ChartLoader(this.config);
        
        this.currentChart = null;
        

        // Componentes do jogo (a serem implementados)
        // this.timeSync = new TimeSync(config.timing);
        // this.noteHighway = new NoteHighway(renderer, config.gameplay);
        // this.hitDetector = new HitDetector(eventBus, config.gameplay);
        // this.audioEngine = new AudioEngine(config.audio);

        this.gameLoop = this.gameLoop.bind(this);
 
        this.isPlaying = false;
    }

    /**
     * Carrega um chart específico
     * @param {string} chartPath - Caminho para o arquivo JSON do chart
     */
    async loadChart(chartPath) {
        try {
            this.currentChart = await this.chartLoader.loadChart(chartPath);
            this.noteHighway.loadChart(this.currentChart.notes);
            //Logger.info(`Chart loaded: ${this.currentChart.metadata.title}`);
            return this.currentChart;
        } catch (error) {
            //Logger.error('Failed to load chart:', error);
            throw error;
        }
    }

    /**
     * Carrega o chart padrão (01-basic-rock-beat)
     */
    async loadDefaultChart() {
        return await this.loadChart('assets/charts/01-basic-rock-beat.json');
    }

    /**
     * Lista charts disponíveis
     */
    getAvailableCharts() {
        return this.chartLoader.getAvailableCharts();
    }

    async init() {
        // Inicializar componentes do jogo
        // this.timeSync.init();

        
        this.noteHighway.init();
        this.hitDetector.init();
        
        // Carrega o chart padrão
        await this.loadDefaultChart();
        
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
        this.checkChartLoop();

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
        this.resetChart();
    }

    pauseMusic() {
        this.clock.pause();
        this.isPlaying = false;
    }

    resumeMusic() {
        this.clock.resume();
        this.isPlaying = true;
    }

    stopMusic() {
        this.clock.reset();
        this.isPlaying = false;
        this.resetChart();
    }

    checkChartLoop() {
        if (!this.currentChart) return;
        
        const chartDuration = this.currentChart.metadata.duration || this.getChartDuration();
        const currentTime = this.clock.getCurrentTime();
        
        if (currentTime >= chartDuration) {
            this.resetChart();
            this.clock.reset();
            this.clock.start();
        }
    }

    resetChart() {
        this.noteHighway.currentNoteIndex = 0;
        this.noteHighway.activeNotes = [];
        
        if (this.currentChart) {
            this.noteHighway.loadChart(this.currentChart.notes);
        }
    }

    getChartDuration() {
        if (!this.currentChart || !this.currentChart.notes.length) return 0;
        
        const lastNote = this.currentChart.notes[this.currentChart.notes.length - 1];
        return this.convertTicksToSeconds(lastNote.time) + 2; // +2 segundos de buffer
    }

    convertTicksToSeconds(ticks) {
        const bpm = this.currentChart?.metadata?.bpm || 120;
        const ticksPerBeat = 128; // Baseado no seu chart (0, 32, 64, 96, 128...)
        const beatsPerSecond = bpm / 60;
        const ticksPerSecond = ticksPerBeat * beatsPerSecond;
        
        return ticks / ticksPerSecond;
    }

}