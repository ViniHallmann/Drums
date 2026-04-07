import { AudioConfig } from '../types/Audio';

export class AudioEngine {
  private config: AudioConfig;
  private audioContext: AudioContext;
  private masterVolume: GainNode;
  private sampleBuffers: Map<string, AudioBuffer>;
  
  public isLoaded: boolean = false;
  public loadProgress: number = 0;

  constructor(config: AudioConfig) {
    this.config = config;
    this.sampleBuffers = new Map<string, AudioBuffer>();
    
    // As in the POC, AudioContext initialization is deferred to init() 
    // to comply with browsers' autoplay policy.
    this.audioContext = null as unknown as AudioContext;
    this.masterVolume = null as unknown as GainNode;
  }

  public async init(): Promise<void> {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.audioContext = new AudioContextClass();
    
    this.masterVolume = this.audioContext.createGain();
    this.masterVolume.gain.value = this.config.masterVolume ?? 0.8;
    this.masterVolume.connect(this.audioContext.destination);

    await this.loadSamples();
    this.isLoaded = true;
  }

  private async loadSamples(): Promise<void> {
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
        // Ignorado por enquanto conforme instrução de não lidar com logs
      }
    }
  }

  public playSample(name: string, velocity: number = 100): void {
    if (!this.isLoaded) {
      return;
    }

    const buffer = this.sampleBuffers.get(name);
    if (!buffer) {
      return;
    }

    const source = this.audioContext.createBufferSource();
    source.buffer = buffer;
    
    const gain = this.audioContext.createGain();
    // A velocidade (velocity) MIDI vai de 0 a 127
    gain.gain.value = (velocity / 127) * this.masterVolume.gain.value;
    
    source.connect(gain);
    gain.connect(this.audioContext.destination);
    
    source.start(0);
  }

  public setMasterVolume(volume: number): void {
    if (this.masterVolume) {
      // Limita o volume entre 0 e 1 (boa prática para ganho mestre)
      const clampedVolume = Math.max(0, Math.min(1, volume));
      this.masterVolume.gain.value = clampedVolume;
    }
  }

  public resume(): void {
    if (this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }
}
