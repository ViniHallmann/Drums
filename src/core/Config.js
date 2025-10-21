import Logger from '../utils/Logger.js';
import Metronome from './Metronome.js';



const VisualConfig = {
    CANVAS_WIDTH: 1280,
    CANVAS_HEIGHT: 720,
    NOTE_HEIGHT: 45,
    NOTE_WIDTH: 45,
    HIT_LINE_X: 350,
    KICK_COLOR: '#FF0000',
    SNARE_COLOR: '#00FF00',
    HI_HAT_COLOR: '#0000FF',
    CRASH_CYMBAL_COLOR: '#FFFF00',
    RIDE_CYMBAL_COLOR: '#FF00FF',
    HIGH_TOM_COLOR: '#00FFFF',
    MID_TOM_COLOR: '#FFA500',
    FLOOR_TOM_COLOR: '#800080',
    BACKGROUND_COLOR: '#000000',
    NOTE_COLOR: '#FFFFFF',
    HIT_EFFECT_COLOR: '#FFD700',
    MISS_EFFECT_COLOR: '#FF4500',
    FPS: 60,
    NUM_LANES: 9,
};

const GameplayConfig = {
    scrollSpeed: 300, 
    hitWindow: 0.15, 
    lookAheadTime: 4,
    scorePerHit: 100,
    maxComboMultiplier: 5,
    CHART_START_DELAY: 2.0, 
    difficultyLevels: {
        easy: 1,
        medium: 2,
        hard: 3,
        expert: 4,
    },
    activeLanes: ['kick', 'snare', 'hiHatClosed', 'hiHatOpen', 'crashCymbal', 'rideCymbal', 'highTom', 'midTom', 'floorTom'],
    earlyHitWindow: 0.25,
    lateHitWindow: 0.25,
};

const AudioConfig = {
    masterVolume: 0.8,
    musicVolume: 0.7,
    sfxVolume: 0.9,
    audioLatency: 0.1,
    samplePaths: {
        kick: 'assets/audio/drum-samples/kick.wav',
        snare: 'assets/audio/drum-samples/snare.wav',
        hiHatClosed: 'assets/audio/drum-samples/hihat-closed.wav',
        hiHatOpen: 'assets/audio/drum-samples/hihat-open.wav',
    },
};

const InputConfig = {
    midiMapping: [
        {
            midiNote: 51,
            name: 'rideCymbal',
            lane: 0,
            color: '#ffcc00',
            sample: 'ride.wav',
            aliases: []
        },
        {
            midiNote: 41,
            name: 'floorTom',
            lane: 1,
            color: '#ff3333',
            sample: 'floortom.wav',
            aliases: [43, 44]
        },
        {
            midiNote: 48,
            name: 'highTom',
            lane: 2,
            color: '#ff6666',
            sample: 'hightom.wav',
            aliases: []
        },
        {
            midiNote: 45,
            name: 'midTom',
            lane: 3,
            color: '#ff9966',
            sample: 'midtom.wav',
            aliases: []
        },
        {
            midiNote: 49,
            name: 'crashCymbal',
            lane: 4,
            color: '#ffcc00',
            sample: 'crash.wav',
            aliases: []
        },
        {
            midiNote: 46,
            name: 'hiHatOpen',
            lane: 5,
            color: '#cccccc',
            sample: 'hihat_open.wav',
            aliases: [45]
        },
        {
            midiNote: 42,
            name: 'hiHatClosed',
            lane: 6,
            color: '#cccccc',
            sample: 'hihat_closed.wav',
            aliases: [41]
        },
        {
            midiNote: 38,
            name: 'snare',
            lane: 7,
            color: '#ffffff',
            sample: 'snare.wav',
            aliases: [40]
        },
        {
            midiNote: 36,
            name: 'kick',
            lane: 8,
            color: '#d4a574',
            sample: 'kick.wav',
            aliases: [35]
        }
        
    ],
    keyMapping: {
        kick: 'A',
        snare: 'S',
        hiHatClosed: 'D',
        hiHatOpen: 'F',
        crashCymbal: 'G',
        rideCymbal: 'H',
        highTom: 'I',
        midTom: 'J',
        floorTom: 'K',
    },
    inputBufferTime: 0.1,
    velocityRange: [0, 127],
    midiChannel: 10, 
    sensibilityThreshold: 10
};

const TimingConfig = {
    bpm: 105,
    beatDivision: 4,
    latencyCompensation: 0.05,
};

const UIConfig = {
    scoreFont: '20px Arial',
    scoreColor: '#FFFFFF',
    comboFont: '18px Arial',
    comboColor: '#FFD700',
    showHitEffects: true,
    hitEffectDuration: 0.3,
    scoreHUDPosition: [10, 30], 
    comboHUDPosition: [10, 60], 
    percentageHUDPosition: [10, 90], 
    fpsHUDPosition: [700, 30], 
};

const MetronomeConfig = {
    showMetronome: true,
    beatSpacing: 25,
    beatRadius: 9,
    inactiveColor: '#2a2a2a',
    inactiveBorder: '#3a3a3a',
    activeColor: '#48bc22',
    downbeatColor: '#b53030',
    textColor: '#9a9a9a',
    activeTextColor: '#e8e8e8',
};

const Config = {
    visual: VisualConfig,
    gameplay: GameplayConfig,
    audio: AudioConfig,
    input: InputConfig,
    timing: TimingConfig,
    ui: UIConfig,
    metronome: MetronomeConfig,
};

const DIFFICULTY_PROFILES = {
    easy: {
        scrollSpeed: 200,
        hitWindow: 0.5,
        activeLanes: ['kick', 'snare', 'hiHatClosed'],
    },
    medium: {
        scrollSpeed: 300,
        hitWindow: 0.15,
        activeLanes: ['kick', 'snare', 'hiHatClosed', 'hiHatOpen', 'crashCymbal'],
    },
    hard: {
        scrollSpeed: 400,
        hitWindow: 0.1,
        activeLanes: ['kick', 'snare', 'hiHatClosed', 'hiHatOpen', 'crashCymbal', 'rideCymbal', 'highTom'],
    },
    expert: {
        scrollSpeed: 500,
        hitWindow: 0.08,
        activeLanes: ['kick', 'snare', 'hiHatClosed', 'hiHatOpen', 'crashCymbal', 'rideCymbal', 'highTom', 'midTom', 'floorTom'],
    },
};

export default Config;