import { lanes } from '../domain/instruments';

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
    activeLanes: [
        'kick',
        'snare',
        'hiHatClosed',
        'hiHatOpen',
        'crashCymbal',
        'rideCymbal',
        'highTom',
        'midTom',
        'floorTom',
    ],
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
    // Fonte única do mapeamento de instrumentos: src/domain/instruments.
    // Não redefinir nome/lane/midiNote/cor aqui — apenas referenciar a derivação.
    midiMapping: lanes,
    keyMapping: Object.fromEntries(lanes.map((drum) => [drum.name, drum.key])),
    inputBufferTime: 0.1,
    velocityRange: [0, 127],
    midiChannel: 10,
    sensibilityThreshold: 10,
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
        activeLanes: [
            'kick',
            'snare',
            'hiHatClosed',
            'hiHatOpen',
            'crashCymbal',
            'rideCymbal',
            'highTom',
        ],
    },
    expert: {
        scrollSpeed: 500,
        hitWindow: 0.08,
        activeLanes: [
            'kick',
            'snare',
            'hiHatClosed',
            'hiHatOpen',
            'crashCymbal',
            'rideCymbal',
            'highTom',
            'midTom',
            'floorTom',
        ],
    },
};

export default Config;
