export const DRUM_ORDER: Record<string, number> = {
  'ride': 0,
  'tom-low': 1,
  'tom-high': 2,
  'tom-mid': 3,
  'crash': 4,
  'hihat-open': 5,
  'hihat': 6,
  'snare': 7,
  'kick': 8,
};

export const DRUM_LABELS = [
  'RIDE CYMBAL',
  'FLOOR TOM',
  'HIGH TOM',
  'MID TOM',
  'CRASH CYMBAL',
  'HI-HAT OPEN',
  'HI-HAT CLOSED',
  'SNARE',
  'KICK'
];

export const DRUM_COLORS: Record<string, string> = {
  'kick': '#FF9900',
  'snare': '#FFFFFF',
  'hihat': '#999999',
  'hihat-open': '#CCCCCC',
  'tom-high': '#FF6666',
  'tom-mid': '#FF9966',
  'tom-low': '#FF3333',
  'crash': '#FFCC00',
  'ride': '#FFD700',
  'unknown': '#90A4AE',
};

export const FEEDBACK_COLORS: Record<string, string> = {
  PERFECT: '#FFD740',
  GOOD: '#69F0AE',
  EARLY: '#a051caff',
  LATE: '#b87474',
  MISS: '#FF5252',
};


export const KEYBOARD_MAP: Record<string, number> = {
  a: 36, // Kick
  s: 38, // Snare
  d: 42, // Hi-hat fechado
  f: 46, // Hi-hat aberto
  j: 48, // Tom alto
  k: 47, // Tom médio
  l: 45, // Tom baixo
  ';': 49, // Crash
  "'": 51, // Ride
};

export const GAME_CONFIG = {
  LANE_HEIGHT: 40,
  HIT_LINE_OFFSET: 250,
  LOOK_AHEAD_S: 3.0,
  HIGHWAY_TOP_MARGIN: 20,
  NOTE_WIDTH: 25,
  NOTE_BORDER_RADIUS: 3,
};