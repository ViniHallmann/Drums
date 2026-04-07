export interface Achievement {
    id: string;
    title: string;
    description: string;
    icon: string;
    type: AchievementType;
    requirement: number;
    reward?: {
        type: 'badge' | 'song' | 'theme';
        value: string;
    };
}

export type AchievementType =
    | 'songs_completed'
    | 'perfect_score'
    | 'combo'
    | 'streak'
    | 'practice_time'
    | 'specific_song';