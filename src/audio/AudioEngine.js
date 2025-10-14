import Logger from '../utils/Logger.js';

// - audioContext: AudioContext        // Motor de áudio
// - sampleBuffers: Map<string, AudioBuffer>  // Samples carregados
// - masterVolume: GainNode            // Controle de volume global
// - isLoaded: boolean                 // Samples estão carregados?
// - loadProgress: number              // 0-100% (para loading screen)

// async init()
//   - Cria AudioContext
//   - Cria GainNode para volume
//   - Chama loadSamples()

// async loadSamples()
//   - Lista de paths dos samples (do Config)
//   - Carrega cada sample (fetch + decode)
//   - Armazena em sampleBuffers Map

// playSample(instrumentName, velocity = 100)
//   - Busca buffer do sample
//   - Cria source node
//   - Aplica volume baseado em velocity
//   - Conecta: source → gain → destination
//   - Toca (start(0))

// setMasterVolume(volume: 0-1)
//   - Atualiza gainNode.gain.value

// resume()
//   - audioContext.resume() (necessário após user interaction)


export default class AudioEngine {
    constructor(config) {
        this.config = config;
        this.isLoaded = false;
        this.loadProgress = 0;
    }

    

//     const AudioSamples = {
//     kick: 'assets/sounds/kick.wav',
//     snare: 'assets/sounds/snare.wav',
//     hiHatClosed: 'assets/sounds/hihat_closed.wav',
//     hiHatOpen: 'assets/sounds/hihat_open.wav',
//     crashCymbal: 'assets/sounds/crash.wav',
//     rideCymbal: 'assets/sounds/ride.wav',
//     highTom: 'assets/sounds/hightom.wav',
//     midTom: 'assets/sounds/midtom.wav',
//     floorTom: 'assets/sounds/floortom.wav',
// }

    async init(){
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.masterVolume = this.audioContext.createGain();
        this.masterVolume.gain.value = this.config.masterVolume || 0.8;
        this.masterVolume.connect(this.audioContext.destination);
        //Logger.info('AudioEngine initialized');
        await this.loadSamples();
        this.isLoaded = true;
        //Logger.info('All audio samples loaded');
    }

    async loadSamples() {
        this.sampleBuffers = new Map();
        

        const sampleEntries = Object.entries(this.config.samplePaths);
        const totalSamples = sampleEntries.length;
        let loadedSamples = 0;

        for (const [name, path] of sampleEntries) {  
            try {
                const response = await fetch(path);
                const arrayBuffer = await response.arrayBuffer();
                const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                
                this.sampleBuffers.set(name, audioBuffer); 
                
                loadedSamples++;
                this.loadProgress = Math.floor((loadedSamples / totalSamples) * 100);
                console.log(`Loaded: ${name} (${this.loadProgress}%)`);
            } catch (error) {
                console.error(`Failed to load ${name}:`, error);
            }
        }
    }

    playSample(name, velocity = 100) {
        if (!this.isLoaded) {
            //Logger.warn('Samples not loaded yet');
            console.warn('Samples not loaded yet');
            return;
        }
        const buffer = this.sampleBuffers.get(name);
        if (!buffer) {
            //Logger.error(`Sample not found: ${name}`);
            console.warn(`Sample not found: ${name}`);
            return;
        }
        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        
        const gain = this.audioContext.createGain();
        gain.gain.value = (velocity / 127) * this.masterVolume.gain.value;
        source.connect(gain);
        gain.connect(this.audioContext.destination);
        source.start(0);

    }

    setMasterVolume(volume) {
       this.masterVolume.gain.value = volume;
    }

    resume() {
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
            //Logger.info('AudioContext resumed');
        }
    }
}