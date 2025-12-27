// Gamification System Utilities
// XP calculation, level progression, and achievement logic

export interface GamificationStats {
    totalXP: number;
    currentLevel: number;
    xpToNextLevel: number;
    dailyStreak: number;
    maxStreak: number;
    streakFreezeCount: number;
    consecutiveCorrect: number;
    totalQuestionsAnswered: number;
    totalCorrectAnswers: number;
}

export interface XPGainResult {
    xpGained: number;
    multiplier: number;
    breakdown: {
        base: number;
        difficulty?: number;
        streak?: number;
        speed?: number;
        combo?: number;
    };
    leveledUp: boolean;
    newLevel?: number;
}

export interface Achievement {
    id: string;
    code: string;
    name: string;
    description: string;
    icon: string;
    xpReward: number;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

// XP required for each level (exponential curve)
export function getXPForLevel(level: number): number {
    return Math.floor(100 * Math.pow(level, 1.5));
}

// Calculate current level from total XP
export function getLevelFromXP(totalXP: number): number {
    let level = 1;
    let xpNeeded = 0;

    while (xpNeeded <= totalXP) {
        level++;
        xpNeeded += getXPForLevel(level);
    }

    return level - 1;
}

// Calculate XP needed to reach next level
export function getXPToNextLevel(currentXP: number, currentLevel: number): number {
    const xpForNextLevel = getXPForLevel(currentLevel + 1);
    const xpForCurrentLevel = currentLevel === 1 ? 0 : getXPForLevel(currentLevel);
    const totalXPForNextLevel = xpForCurrentLevel + xpForNextLevel;

    return totalXPForNextLevel - currentXP;
}

// Calculate XP gained from answering a question
export interface XPCalculationParams {
    isCorrect: boolean;
    difficultyMultiplier?: number; // 1.0 (easy), 1.5 (medium), 2.0 (hard)
    timeToAnswer?: number; // in seconds
    currentStreak?: number;
    consecutiveCorrect?: number;
}

export function calculateXPGain(params: XPCalculationParams): XPGainResult {
    const {
        isCorrect,
        difficultyMultiplier = 1.0,
        timeToAnswer,
        currentStreak = 0,
        consecutiveCorrect = 0,
    } = params;

    if (!isCorrect) {
        return {
            xpGained: 0,
            multiplier: 0,
            breakdown: { base: 0 },
            leveledUp: false,
        };
    }

    const baseXP = 10;
    const breakdown: XPGainResult['breakdown'] = { base: baseXP };

    // Difficulty multiplier
    breakdown.difficulty = difficultyMultiplier;

    // Streak bonus (1.5x if 7+ day streak)
    const streakBonus = currentStreak >= 7 ? 1.5 : 1.0;
    breakdown.streak = streakBonus;

    // Speed bonus (1.2x if answered in < 30 seconds)
    const speedBonus = timeToAnswer && timeToAnswer < 30 ? 1.2 : 1.0;
    breakdown.speed = speedBonus;

    // Combo multiplier (+20% per 5 consecutive correct)
    const comboMultiplier = 1 + Math.floor(consecutiveCorrect / 5) * 0.2;
    breakdown.combo = comboMultiplier;

    // Calculate total XP
    const totalMultiplier = difficultyMultiplier * streakBonus * speedBonus * comboMultiplier;
    const xpGained = Math.floor(baseXP * totalMultiplier);

    return {
        xpGained,
        multiplier: totalMultiplier,
        breakdown,
        leveledUp: false,
    };
}

// Check if user leveled up after gaining XP
export function checkLevelUp(
    currentXP: number,
    currentLevel: number,
    xpGained: number
): { leveledUp: boolean; newLevel?: number; newXP: number } {
    const newXP = currentXP + xpGained;
    const newLevel = getLevelFromXP(newXP);

    return {
        leveledUp: newLevel > currentLevel,
        newLevel: newLevel > currentLevel ? newLevel : undefined,
        newXP,
    };
}

// Achievement check logic
export interface AchievementCheckParams {
    stats: GamificationStats;
    action: 'answer_question' | 'daily_study' | 'level_up';
    metadata?: {
        isCorrect?: boolean;
        timeOfDay?: number; // hour (0-23)
        timeToAnswer?: number;
        daysAbsent?: number;
    };
}

export function checkAchievementUnlocks(params: AchievementCheckParams): string[] {
    const { stats, action, metadata } = params;
    const unlockedCodes: string[] = [];

    switch (action) {
        case 'answer_question':
            // First question
            if (stats.totalQuestionsAnswered === 1) {
                unlockedCodes.push('first_question');
            }

            // Perfect ten (10 correct in a row)
            if (metadata?.isCorrect && stats.consecutiveCorrect === 10) {
                unlockedCodes.push('perfect_ten');
            }

            // Century club (100 total questions)
            if (stats.totalQuestionsAnswered === 100) {
                unlockedCodes.push('century_club');
            }

            // Time-based achievements
            if (metadata?.timeOfDay !== undefined) {
                // Night owl (after 10 PM)
                if (metadata.timeOfDay >= 22) {
                    unlockedCodes.push('night_owl');
                }
                // Early bird (before 8 AM)
                if (metadata.timeOfDay < 8) {
                    unlockedCodes.push('early_bird');
                }
            }

            // Speed demon (< 10 seconds and correct)
            if (metadata?.isCorrect && metadata?.timeToAnswer && metadata.timeToAnswer < 10) {
                unlockedCodes.push('speed_demon');
            }

            // Comeback kid (returned after 7 days)
            if (metadata?.daysAbsent && metadata.daysAbsent >= 7) {
                unlockedCodes.push('comeback_kid');
            }
            break;

        case 'daily_study':
            // Week warrior (7 day streak)
            if (stats.dailyStreak === 7) {
                unlockedCodes.push('week_warrior');
            }

            // Month master (30 day streak)
            if (stats.dailyStreak === 30) {
                unlockedCodes.push('month_master');
            }
            break;

        case 'level_up':
            // Level milestones
            if (stats.currentLevel === 10) {
                unlockedCodes.push('level_10');
            }
            if (stats.currentLevel === 25) {
                unlockedCodes.push('level_25');
            }
            if (stats.currentLevel === 50) {
                unlockedCodes.push('level_50');
            }
            break;
    }

    return unlockedCodes;
}

// Calculate streak status
export interface StreakStatus {
    currentStreak: number;
    isActive: boolean;
    needsStudyToday: boolean;
    daysUntilLost: number;
}

export function calculateStreakStatus(lastStudyDate: Date | null, streakFreezeCount: number): StreakStatus {
    if (!lastStudyDate) {
        return {
            currentStreak: 0,
            isActive: false,
            needsStudyToday: true,
            daysUntilLost: 0,
        };
    }

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const lastStudy = new Date(lastStudyDate);
    const lastStudyDay = new Date(lastStudy.getFullYear(), lastStudy.getMonth(), lastStudy.getDate());

    const daysDifference = Math.floor((today.getTime() - lastStudyDay.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDifference === 0) {
        // Studied today
        return {
            currentStreak: 0,
            isActive: true,
            needsStudyToday: false,
            daysUntilLost: 1,
        };
    } else if (daysDifference === 1) {
        // Studied yesterday, need to study today
        return {
            currentStreak: 0,
            isActive: true,
            needsStudyToday: true,
            daysUntilLost: 0,
        };
    } else {
        // Streak lost (unless using freeze)
        const hasFreeze = streakFreezeCount > 0;
        return {
            currentStreak: 0,
            isActive: hasFreeze,
            needsStudyToday: true,
            daysUntilLost: hasFreeze ? 0 : -1,
        };
    }
}

// Rarity color mapping for UI
export const RARITY_COLORS = {
    common: {
        bg: 'bg-gray-100',
        border: 'border-gray-300',
        text: 'text-gray-700',
        glow: 'shadow-gray-200',
    },
    rare: {
        bg: 'bg-blue-100',
        border: 'border-blue-400',
        text: 'text-blue-700',
        glow: 'shadow-blue-300',
    },
    epic: {
        bg: 'bg-purple-100',
        border: 'border-purple-400',
        text: 'text-purple-700',
        glow: 'shadow-purple-300',
    },
    legendary: {
        bg: 'bg-amber-100',
        border: 'border-amber-400',
        text: 'text-amber-700',
        glow: 'shadow-amber-300',
    },
} as const;
