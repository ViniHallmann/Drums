import Logger from '../utils/Logger.js';
export default class AudioEngine {
    constructor(config) {
        this.config = config;
        this.isLoaded = false;
        this.loadProgress = 0;
    }

    async init(){
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        this.masterVolume = this.audioContext.createGain();
        this.masterVolume.gain.value = this.config.masterVolume || 0.8;
        this.masterVolume.connect(this.audioContext.destination);
        Logger.info('AudioEngine initialized');
        await this.loadSamples();
        this.isLoaded = true;
        Logger.info('All audio samples loaded');
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
            } catch (error) {
                Logger.error(`Failed to load sample: ${name} from ${path}`, error);
            }
            Logger.info(`Loaded sample: ${name} (${loadedSamples}/${totalSamples})`);
        }
    }

    playSample(name, velocity = 100) {
        if (!this.isLoaded) {
            Logger.warn('Samples not loaded yet');
            return;
        }
        const buffer = this.sampleBuffers.get(name);
        if (!buffer) {
            Logger.error(`Sample not found: ${name}`);
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
            Logger.info('AudioContext resumed');
        }
    }
}