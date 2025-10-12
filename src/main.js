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


const midiStatus = document.getElementById('midiStatus');

function configureEventBus(eventBus) {
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
    });
       
}
    
async function initApp() {
    const eventBus      = new EventBus();
    const midiManager   = new MIDIManager(eventBus, Config.input.midiMapping);
    const renderer      = new Renderer('gameCanvas', Config.visual);
    const game          = new Game(eventBus, renderer, midiManager, Config);

    configureEventBus(eventBus);

    const isConnected = await midiManager.init();
    isConnected ? console.log('Dispositivos MIDI acessíveis.') : console.error('Nenhum dispositivo MIDI encontrado ou permissão negada.');

    game.init();
    game.start();

    //renderer.drawDebugGrid();
    
}

initApp();
