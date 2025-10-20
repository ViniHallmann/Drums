import  NoteHighway  from '../gameplay/NoteHighway.js';
import HitDetector from '../gameplay/HitDetector.js';
import Logger from '../utils/Logger.js';
import GameClock from './GameClock.js';
import Metronome from './Metronome.js';
import AudioEngine from '../audio/AudioEngine.js';
import ChartLoader from '../chart/ChartLoader.js';
import MetronomeVisual from '../ui/MetronomeVisual.js';

export default class Game {
    constructor(eventBus, renderer, midiManager, config) {
        this.eventBus    = eventBus;
        this.renderer    = renderer;
        this.midiManager = midiManager;
        this.config      = config;

        this.isRunning     = false;
        this.isPlaying     = false;
        this.currentChart  = null;
        this.lastFrameTime = 0;
        this.deltaTime     = 0;

        this.clock           = new GameClock();
        this.noteHighway     = new NoteHighway(this.renderer, this.config);
        this.hitDetector     = new HitDetector(this.eventBus, this.config.gameplay);
        this.metronome       = new Metronome(this.config);
        this.metronomeVisual = new MetronomeVisual(this.metronome, this.config); 
        this.audioEngine     = new AudioEngine(this.config.audio);
        this.chartLoader     = new ChartLoader(this.config);

        this.gameLoop = this.gameLoop.bind(this);
    }

    async loadChart(chartPath) {
        try {
            this.currentChart = await this.chartLoader.loadChart(chartPath);
            this.noteHighway.loadChart(this.currentChart.notes);
            Logger.info(`Chart loaded: ${this.currentChart.metadata.title}`);
            return this.currentChart;
        } catch (error) {
            Logger.error('Failed to load chart:', error);
            throw error;
        }
    }

    async loadDefaultChart() {
        //return await this.loadChart('01-basic-rock-beat.json');
        return await this.loadChart('assets/charts/rock-groove-easy.json');
    }

    getAvailableCharts() {
        return this.chartLoader.getAvailableCharts();
    }

    async init() {
        this.noteHighway.init();
        this.hitDetector.init();

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
    
        if (this.isPlaying) {
            this.checkChartLoop();
            this.metronome.update(currentTime);
            this.noteHighway.update(deltaTime, currentTime);
            this.hitDetector.update(deltaTime, currentTime, this.noteHighway.activeNotes);
        }
    }

    render() {
        this.renderer.clear();
        this.noteHighway.render(this.renderer);
        if (this.isPlaying) {
            this.metronomeVisual.render(this.renderer);
        }
    }

    startMusic() {
        this.restartChart();
        this.isPlaying = true;
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
        
        if (currentTime >= chartDuration && !this.isLooping) {
            this.isLooping = true;
            this.restartChart();
        }
    }

    restartChart() {
        this.resetChart();
        this.clock.reset();
        this.clock.setOffset(-this.config.gameplay.CHART_START_DELAY);
        this.clock.start();

        this.metronome.reset();
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
        return this.convertTicksToSeconds(lastNote.time) + 2;
    }

    convertTicksToSeconds(ticks) {
        const bpm = this.currentChart?.metadata?.bpm || 120;
        const ticksPerBeat = 128;
        const beatsPerSecond = bpm / 60;
        const ticksPerSecond = ticksPerBeat * beatsPerSecond;
        
        return ticks / ticksPerSecond;
    }

}