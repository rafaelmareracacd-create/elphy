// Gamification Server Actions
// Handles XP gains, achievements, streaks, and level progression
"use server";

import { createClient } from "@/lib/supabase/server";
import {
    calculateXPGain,
    checkLevelUp,
    checkAchievementUnlocks,
    getXPForLevel,
    type GamificationStats,
    type XPCalculationParams,
} from "@/lib/gamification/utils";

export interface AwardXPParams extends XPCalculationParams {
    questionId?: string;
    reason?: string;
}

export interface AwardXPResult {
    success: boolean;
    xpGained: number;
    totalXP: number;
    coinsEarned: number;
    totalCoins: number;
    combo: number;
    maxCombo: number;
    leveledUp: boolean;
    newLevel?: number;
    achievementsUnlocked: Array<{
        code: string;
        name: string;
        icon: string;
        xpReward: number;
        rarity: string;
    }>;
    error?: string;
}

// Award XP to user for answering a question
export async function awardXP(params: AwardXPParams): Promise<AwardXPResult> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return {
                success: false,
                xpGained: 0,
                totalXP: 0,
                coinsEarned: 0,
                totalCoins: 0,
                combo: 0,
                maxCombo: 0,
                leveledUp: false,
                achievementsUnlocked: [],
                error: "User not authenticated",
            };
        }

        // Get or create user gamification stats
        let { data: stats, error: statsError } = await supabase
            .from("user_gamification")
            .select("*")
            .eq("user_id", user.id)
            .single();

        if (statsError || !stats) {
            // Create new stats entry
            const { data: newStats, error: createError } = await supabase
                .from("user_gamification")
                .insert({
                    user_id: user.id,
                    total_xp: 0,
                    current_level: 1,
                    xp_to_next_level: 100,
                })
                .select()
                .single();

            if (createError || !newStats) {
                throw new Error("Failed to create gamification stats");
            }
            stats = newStats;
        }

        // Calculate XP gain
        const xpResult = calculateXPGain({
            ...params,
            currentStreak: stats.daily_streak,
            consecutiveCorrect: stats.consecutive_correct,
        });

        // Calculate coins earned
        const coinsFromQuestion = params.isCorrect ? 10 : 1; // 10 coins for correct, 1 for effort
        const newCoins = (stats.coins || 0) + coinsFromQuestion;

        // Update combo
        const newCombo = params.isCorrect ? (stats.consecutive_correct || 0) + 1 : 0;
        const newMaxCombo = Math.max(newCombo, stats.max_combo || 0);

        if (xpResult.xpGained === 0 && !params.isCorrect) {
            // Even on wrong answer, award effort coins
            await supabase
                .from("user_gamification")
                .update({
                    coins: newCoins,
                    total_questions_answered: stats.total_questions_answered + 1,
                    consecutive_correct: 0,
                })
                .eq("user_id", user.id);

            // Log coin transaction
            await supabase.from("coin_transactions").insert({
                user_id: user.id,
                amount: coinsFromQuestion,
                type: "earn",
                source: "question_answered_incorrect",
            });

            return {
                success: true,
                xpGained: Math.floor(xpResult.xpGained * 0.1), // 10% XP for effort
                totalXP: stats.total_xp,
                coinsEarned: coinsFromQuestion,
                totalCoins: newCoins,
                combo: 0,
                maxCombo: stats.max_combo || 0,
                leveledUp: false,
                achievementsUnlocked: [],
            };
        }

        // Check for level up
        const levelUpResult = checkLevelUp(
            stats.total_xp,
            stats.current_level,
            xpResult.xpGained
        );

        // Update stats
        const newTotalXP = stats.total_xp + xpResult.xpGained;
        const newLevel = levelUpResult.leveledUp ? levelUpResult.newLevel! : stats.current_level;
        const newXPToNext = getXPForLevel(newLevel + 1);

        const { error: updateError } = await supabase
            .from("user_gamification")
            .update({
                total_xp: newTotalXP,
                current_level: newLevel,
                xp_to_next_level: newXPToNext,
                coins: newCoins,
                total_questions_answered: stats.total_questions_answered + 1,
                total_correct_answers: params.isCorrect
                    ? stats.total_correct_answers + 1
                    : stats.total_correct_answers,
                consecutive_correct: params.isCorrect
                    ? stats.consecutive_correct + 1
                    : 0,
                max_combo: newMaxCombo,
            })
            .eq("user_id", user.id);

        if (updateError) {
            throw new Error("Failed to update gamification stats");
        }

        // Log XP transaction
        await supabase.from("xp_transactions").insert({
            user_id: user.id,
            amount: xpResult.xpGained,
            reason: params.reason || "question_answered",
            multiplier: xpResult.multiplier,
            question_id: params.questionId,
            metadata: xpResult.breakdown,
        });

        // Log coin transaction
        await supabase.from("coin_transactions").insert({
            user_id: user.id,
            amount: coinsFromQuestion,
            type: "earn",
            source: params.isCorrect ? "question_answered_correct" : "question_answered_incorrect",
            metadata: { question_id: params.questionId },
        });

        // Check for achievement unlocks
        const currentTime = new Date().getHours();
        const achievementCodes = checkAchievementUnlocks({
            stats: {
                ...stats,
                totalXP: newTotalXP,
                currentLevel: newLevel,
                totalQuestionsAnswered: stats.total_questions_answered + 1,
                consecutiveCorrect: params.isCorrect ? stats.consecutive_correct + 1 : 0,
            } as GamificationStats,
            action: levelUpResult.leveledUp ? "level_up" : "answer_question",
            metadata: {
                isCorrect: params.isCorrect,
                timeOfDay: currentTime,
                timeToAnswer: params.timeToAnswer,
            },
        });

        // Unlock achievements
        const unlockedAchievements = [];
        if (achievementCodes.length > 0) {
            const { data: achievements } = await supabase
                .from("achievements")
                .select("*")
                .in("code", achievementCodes);

            if (achievements) {
                for (const achievement of achievements) {
                    // Check if already unlocked
                    const { data: existing } = await supabase
                        .from("user_achievements")
                        .select("id")
                        .eq("user_id", user.id)
                        .eq("achievement_id", achievement.id)
                        .single();

                    if (!existing) {
                        await supabase.from("user_achievements").insert({
                            user_id: user.id,
                            achievement_id: achievement.id,
                        });

                        // Award achievement XP
                        if (achievement.xp_reward > 0) {
                            await supabase
                                .from("user_gamification")
                                .update({
                                    total_xp: newTotalXP + achievement.xp_reward,
                                })
                                .eq("user_id", user.id);

                            await supabase.from("xp_transactions").insert({
                                user_id: user.id,
                                amount: achievement.xp_reward,
                                reason: "achievement_unlock",
                                metadata: { achievement_code: achievement.code },
                            });
                        }

                        unlockedAchievements.push({
                            code: achievement.code,
                            name: achievement.name,
                            icon: achievement.icon,
                            xpReward: achievement.xp_reward,
                            rarity: achievement.rarity,
                        });
                    }
                }
            }
        }

        return {
            success: true,
            xpGained: xpResult.xpGained,
            totalXP: newTotalXP,
            coinsEarned: coinsFromQuestion,
            totalCoins: newCoins,
            combo: newCombo,
            maxCombo: newMaxCombo,
            leveledUp: levelUpResult.leveledUp,
            newLevel: levelUpResult.newLevel,
            achievementsUnlocked: unlockedAchievements,
        };
    } catch (error) {
        console.error("Error awarding XP:", error);
        return {
            success: false,
            xpGained: 0,
            totalXP: 0,
            coinsEarned: 0,
            totalCoins: 0,
            combo: 0,
            maxCombo: 0,
            leveledUp: false,
            achievementsUnlocked: [],
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
}

// Get user gamification stats
export async function getGamificationStats(): Promise<GamificationStats | null> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return null;

        const { data: stats } = await supabase
            .from("user_gamification")
            .select("*")
            .eq("user_id", user.id)
            .single();

        if (!stats) {
            // Create default stats
            const { data: newStats } = await supabase
                .from("user_gamification")
                .insert({
                    user_id: user.id,
                    total_xp: 0,
                    current_level: 1,
                    xp_to_next_level: 100,
                })
                .select()
                .single();

            return newStats as GamificationStats;
        }

        return stats as GamificationStats;
    } catch (error) {
        console.error("Error getting gamification stats:", error);
        return null;
    }
}

// Update daily streak
export async function updateDailyStreak(): Promise<boolean> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return false;

        const { data: stats } = await supabase
            .from("user_gamification")
            .select("*")
            .eq("user_id", user.id)
            .single();

        if (!stats) return false;

        const today = new Date().toISOString().split('T')[0];
        const lastStudy = stats.last_study_date;

        let newStreak = stats.daily_streak;

        if (!lastStudy) {
            newStreak = 1;
        } else {
            const lastDate = new Date(lastStudy);
            const currentDate = new Date(today);
            const diffDays = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));

            if (diffDays === 0) {
                // Already studied today
                return true;
            } else if (diffDays === 1) {
                // Consecutive day
                newStreak = stats.daily_streak + 1;
            } else {
                // Streak broken (unless freeze available)
                newStreak = 1;
            }
        }

        await supabase
            .from("user_gamification")
            .update({
                daily_streak: newStreak,
                max_streak: Math.max(newStreak, stats.max_streak),
                last_study_date: today,
            })
            .eq("user_id", user.id);

        return true;
    } catch (error) {
        console.error("Error updating daily streak:", error);
        return false;
    }
}

// Get user achievements
export async function getUserAchievements() {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return [];

        const { data } = await supabase
            .from("user_achievements")
            .select(`
        unlocked_at,
        achievements (
          code,
          name,
          description,
          icon,
          xp_reward,
          rarity
        )
      `)
            .eq("user_id", user.id)
            .order("unlocked_at", { ascending: false });

        return data || [];
    } catch (error) {
        console.error("Error getting user achievements:", error);
        return [];
    }
}
