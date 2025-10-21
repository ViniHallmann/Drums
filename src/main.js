import EventBus from './core/eventBus.js';
import MIDIManager from './midi/MIDIManager.js';
import Config from './core/Config.js';
import Game from './core/Game.js';
import Renderer from './rendering/Renderer.js';
import Logger from './utils/Logger.js';

const midiStatus = document.getElementById('midiStatus');
const canvas = document.getElementById('gameCanvas');
//Logger.setLevel('DEBUG');
//Logger.enableTimestamp = true;

function configureButtons() {
    const playButton = document.getElementById('btnPlayPause');
    const stopButton = document.getElementById('btnStop');
    const resetButton = document.getElementById('btnRestart');

    playButton.addEventListener('click', () => {
        const event = new KeyboardEvent('keydown', { code: 'Space' });
        document.dispatchEvent(event);
    });

    stopButton.addEventListener('click', () => {
        const event = new KeyboardEvent('keydown', { code: 'Space' });
        document.dispatchEvent(event);
    });

    resetButton.addEventListener('click', () => {
        const event = new KeyboardEvent('keydown', { code: 'KeyR' });
        document.dispatchEvent(event);
    });


}

function configureEventBus(eventBus, hitDetector, audioEngine) {
    eventBus.on('midi:connected', () => {
        Logger.info('Evento: MIDI conectado');
        midiStatus.classList.add('connected');
        midiStatus.classList.remove('disconnected');
    });

    eventBus.on('midi:connection_failed', () => {
        Logger.error('Evento: Falha na conexão MIDI');
        midiStatus.classList.add('disconnected');
        midiStatus.classList.remove('connected');
    });

    eventBus.on('midi:disconnected', (data) => {
        Logger.info('Evento: MIDI desconectado', data);
        midiStatus.classList.add('disconnected');
        midiStatus.classList.remove('connected');
    });

    eventBus.on('midi:hit', (data) => {
        Logger.info(`Evento: MIDI hit ${data.name} (note: ${data.note})`);
        hitDetector.checkHit(data.note);
    });

    eventBus.on('note:hit', (data) => {
        Logger.info(`Evento: Nota acertada! Time diff: ${data.timeDiff.toFixed(3)}s`, data.note);
        const instrumentName = data.note.config.input.midiMapping[data.note.midiNote].name;
        audioEngine.playSample(instrumentName, data.note.velocity);
        Logger.info(`Evento: Nota acertada! (note: ${data.note.midiNote})`);
    });

    eventBus.on('note:miss', (data) => {
        Logger.info(`Evento: Nota perdida! (note: ${data.midiNote})`);

    });
       
}

function setupKeyboardControls(game, eventBus) {
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            game.audioEngine.resume();
            if (game.clock.isRunning) {
                game.pauseMusic();
            } else {
                game.clock.getCurrentTime() === 0 ? game.startMusic() : game.resumeMusic();
            }
        }
        
        if (e.code === 'KeyR') {
            game.clock.reset();
            game.noteHighway.currentNoteIndex = 0;
            game.noteHighway.activeNotes = [];
            game.startMusic();
        }
        
        if (e.code === 'KeyK') {
            eventBus.emit('midi:hit', { note: 36, name: 'KICK', lane: 0, velocity: 100 });
        }
        if (e.code === 'KeyS') {
            eventBus.emit('midi:hit', { note: 38, name: 'SNARE', lane: 1, velocity: 100 });
        }
        if (e.code === 'KeyH') {
            eventBus.emit('midi:hit', { note: 42, name: 'HIHAT CLOSED', lane: 2, velocity: 100 });
        }
        
    });
}

async function initApp() {
    const eventBus      = new EventBus();
    const midiManager   = new MIDIManager(eventBus, Config.input.midiMapping);
    const renderer      = new Renderer(canvas, Config.visual);
    const game          = new Game(eventBus, renderer, midiManager, Config);

    //const isConnected = await midiManager.init();

    await game.init();
    configureEventBus(eventBus, game.hitDetector, game.audioEngine);
    game.start();

    setupKeyboardControls(game, eventBus);
}

configureButtons();
initApp();
    

