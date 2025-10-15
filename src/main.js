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
    //setupChartSelector(game);
}

initApp();

// function setupChartSelector(game) {
//     const btnSelectSong = document.getElementById('btnSelectSong');
//     const modalOverlay = document.getElementById('modalOverlay');
//     const btnCloseModal = document.getElementById('btnCloseModal');
//     const songList = document.getElementById('songList');

//     // Abrir modal de seleção
//     btnSelectSong?.addEventListener('click', () => {
//         populateSongList(game);
//         modalOverlay.style.display = 'flex';
//     });

//     // Fechar modal
//     btnCloseModal?.addEventListener('click', () => {
//         modalOverlay.style.display = 'none';
//     });

//     // Fechar modal clicando fora
//     modalOverlay?.addEventListener('click', (e) => {
//         if (e.target === modalOverlay) {
//             modalOverlay.style.display = 'none';
//         }
//     });
// }

// function populateSongList(game) {
//     const songList = document.getElementById('songList');
//     const availableCharts = game.getAvailableCharts();
    
//     songList.innerHTML = '';
    
//     availableCharts.forEach(chartPath => {
//         const songItem = document.createElement('div');
//         songItem.className = 'song-item';
//         songItem.dataset.chart = chartPath;
        
//         // Extrair nome do arquivo para exibição
//         const fileName = chartPath.split('/').pop().replace('.json', '');
//         const displayName = fileName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
//         songItem.innerHTML = `
//             <div class="song-item-info">
//                 <h3 class="song-title">${displayName}</h3>
//                 <p class="song-meta">Chart • Unknown BPM</p>
//             </div>
//             <div class="song-item-duration">--:--</div>
//         `;
        
//         songItem.addEventListener('click', async () => {
//             try {
//                 await game.loadChart(chartPath);
//                 document.getElementById('modalOverlay').style.display = 'none';
//                 console.log(`Chart loaded: ${displayName}`);
//             } catch (error) {
//                 console.error('Failed to load chart:', error);
//                 alert('Erro ao carregar chart: ' + error.message);
//             }
//         });
        
//         songList.appendChild(songItem);
//     });
// }

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
    

