// Integração com main.js:
// O main.js deve:

// Criar instância do EventBus
// Criar instância do MIDIManager passando EventBus e Config.drumMap
// Chamar await midiManager.init()
// Atualizar UI com status de conexão
// Passar eventBus para o Game.js quando iniciar


import EventBus from './core/eventBus.js';
import MIDIManager from './midi/MIDIManager.js';
import Config from './core/Config.js';
import Game from './core/Game.js';
import Renderer from './rendering/Renderer.js';
import Logger from './utils/Logger.js';


const midiStatus = document.getElementById('midiStatus');

function configureEventBus(eventBus, hitDetector, audioEngine) {
    eventBus.on('midi:connected', () => {
        console.log('Evento: MIDI conectado');
        midiStatus.classList.add('connected');
        midiStatus.classList.remove('disconnected');
    });

    eventBus.on('midi:connection_failed', () => {
        console.log('Evento: Falha na conexão MIDI');
        midiStatus.classList.add('disconnected');
        midiStatus.classList.remove('connected');
    });

    eventBus.on('midi:disconnected', (data) => {
        console.log('Evento: MIDI desconectado', data);
        midiStatus.classList.add('disconnected');
        midiStatus.classList.remove('connected');
    });

    eventBus.on('midi:hit', (data) => {
        console.log(`Evento: MIDI hit ${data.name} (note: ${data.note})`);
        hitDetector.checkHit(data.note);
    });

    eventBus.on('note:hit', (data) => {
        console.log(`Evento: Nota acertada! Time diff: ${data.timeDiff.toFixed(3)}s`, data.note);
        const instrumentName = data.note.config.input.midiMapping[data.note.midiNote].name;
        audioEngine.playSample(instrumentName, data.note.velocity);
    });

    eventBus.on('note:miss', (data) => {
        console.log(`Evento: Nota perdida! (note: ${data.midiNote})`);

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

// class App {
//     constructor() {
//         this.eventBus      = new EventBus();
//         this.midiManager   = new MIDIManager(this.eventBus, Config.input.midiMapping);
//         this.renderer      = new Renderer('gameCanvas', Config.visual);
//         this.game          = new Game(this.eventBus, this.renderer, this.midiManager, Config);
//     }
    
//     async init() {
//         configureEventBus(this.eventBus);
//         const isConnected = await this.midiManager.init();
//         isConnected ? console.log('Dispositivos MIDI acessíveis.') : console.error('Nenhum dispositivo MIDI encontrado ou permissão negada.');
//         this.game.init();
//     }
    
//     start() {
//         this.game.start();
//     }
// }
    
async function initApp() {
    const eventBus      = new EventBus();
    const midiManager   = new MIDIManager(eventBus, Config.input.midiMapping);
    const renderer      = new Renderer('gameCanvas', Config.visual);
    const game          = new Game(eventBus, renderer, midiManager, Config);

    

    const isConnected = await midiManager.init();

    await game.init();
    configureEventBus(eventBus, game.hitDetector, game.audioEngine);
    game.start();

    setupKeyboardControls(game, eventBus);


    
}

initApp();
