export interface User {
    id: string;
    email: string;
    username: string;
    avatar?: string;
    createdAt: Date;
    subscription: SubscriptionTier;
    settings: UserSettings;
    stats: UserStats;
}

export type SubscriptionTier = 'free' | 'premium';

export interface UserSettings {
    audio: {
        masterVolume: number;
        backingTrackVolume: number;
        clickVolume: number;
        effectsVolume: number;
    };
    midi: {
        deviceId: string | null;
        latencyOffset: number;  // Em ms
        sensitivity: number;     // 0-100
    };
    visual: {
        noteSpeed: number;       // 1-10
        highwayAngle: number;    // 0-90 graus
        colorScheme: 'default' | 'colorblind' | 'custom';
    };
}

export interface UserStats {
    totalSongsPlayed: number;
    totalPlayTime: number;      // Em segundos
    averageAccuracy: number;
    bestCombo: number;
    achievementsUnlocked: number;
    currentStreak: number;
    longestStreak: number;
}