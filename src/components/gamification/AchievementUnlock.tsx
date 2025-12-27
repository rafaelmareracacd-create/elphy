// Achievement Unlock Toast - Elphy Theme
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Trophy, X } from "lucide-react";
import confetti from "canvas-confetti";

interface Achievement {
    name: string;
    description: string;
    icon: string;
    xpReward: number;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface AchievementUnlockProps {
    achievement: Achievement;
    onClose: () => void;
    autoClose?: boolean;
    autoCloseDelay?: number;
}

const RARITY_STYLES = {
    common: {
        bg: 'from-gray-50 to-gray-100',
        border: 'border-gray-300',
        text: 'text-gray-800',
        badge: 'bg-gray-200 text-gray-700',
    },
    rare: {
        bg: 'from-blue-50 to-blue-100',
        border: 'border-blue-400',
        text: 'text-blue-900',
        badge: 'bg-blue-200 text-blue-800',
    },
    epic: {
        bg: 'from-purple-50 to-purple-100',
        border: 'border-purple-400',
        text: 'text-purple-900',
        badge: 'bg-purple-200 text-purple-800',
    },
    legendary: {
        bg: 'from-amber-50 via-yellow-100 to-amber-100',
        border: 'border-amber-400',
        text: 'text-amber-900',
        badge: 'bg-gradient-to-r from-amber-300 to-yellow-300 text-amber-900',
    },
};

export default function AchievementUnlock({
    achievement,
    onClose,
    autoClose = true,
    autoCloseDelay = 5000,
}: AchievementUnlockProps) {
    const [isVisible, setIsVisible] = useState(true);
    const style = RARITY_STYLES[achievement.rarity];

    useEffect(() => {
        // Trigger confetti
        const duration = achievement.rarity === 'legendary' ? 3000 : 1500;
        const particleCount = achievement.rarity === 'legendary' ? 200 : 100;

        confetti({
            particleCount,
            spread: 70,
            origin: { y: 0.6 },
            colors: achievement.rarity === 'legendary'
                ? ['#FFD700', '#FFA500', '#FF6347']
                : ['#10B981', '#3B82F6', '#8B5CF6'],
            duration,
        });

        // Auto close
        if (autoClose) {
            const timer = setTimeout(() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
            }, autoCloseDelay);
            return () => clearTimeout(timer);
        }
    }, [achievement.rarity, autoClose, autoCloseDelay, onClose]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(onClose, 300);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, x: 100, scale: 0.8 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 100, scale: 0.8 }}
                    transition={{ type: "spring", damping: 15 }}
                    className="fixed top-20 right-4 z-50 max-w-sm"
                >
                    <div
                        className={`bg-gradient-to-r ${style.bg} border-2 ${style.border} rounded-2xl shadow-2xl overflow-hidden`}
                    >
                        {/* Header */}
                        <div className="px-4 py-3 bg-white/50 backdrop-blur-sm border-b flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Trophy className={`w-5 h-5 ${style.text}`} />
                                <span className="font-bold text-sm ${style.text}">
                                    Conquista Desbloqueada!
                                </span>
                            </div>
                            <button
                                onClick={handleClose}
                                className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                <X className="w-4 h-4 text-gray-600" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                            <div className="flex items-start gap-4">
                                {/* Icon */}
                                <motion.div
                                    animate={{
                                        scale: [1, 1.2, 1],
                                        rotate: [0, -10, 10, 0],
                                    }}
                                    transition={{ duration: 0.5, delay: 0.2 }}
                                    className="text-5xl flex-shrink-0"
                                >
                                    {achievement.icon}
                                </motion.div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className={`font-bold text-lg ${style.text} mb-1`}>
                                        {achievement.name}
                                    </h3>
                                    <p className="text-sm text-gray-700 mb-3">
                                        {achievement.description}
                                    </p>

                                    <div className="flex items-center gap-2">
                                        {/* Rarity Badge */}
                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${style.badge}`}>
                                            {achievement.rarity.toUpperCase()}
                                        </span>

                                        {/* XP Reward */}
                                        {achievement.xpReward > 0 && (
                                            <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 border border-emerald-300 rounded-full">
                                                <span className="text-emerald-600 font-bold text-xs">
                                                    +{achievement.xpReward} XP
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Shine effect */}
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none"
                            initial={{ x: '-100%' }}
                            animate={{ x: '200%' }}
                            transition={{ duration: 1.5, delay: 0.3 }}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}

// Hook for managing achievement toasts
export function useAchievementToast() {
    const [achievements, setAchievements] = useState<Array<{ id: string; achievement: Achievement }>>([]);

    const showAchievement = (achievement: Achievement) => {
        const id = Math.random().toString(36);
        setAchievements(prev => [...prev, { id, achievement }]);
    };

    const handleClose = (id: string) => {
        setAchievements(prev => prev.filter(a => a.id !== id));
    };

    const AchievementToasts = () => (
        <>
            {achievements.map(({ id, achievement }, index) => (
                <div key={id} style={{ top: `${20 + index * 180}px` }} className="fixed right-4">
                    <AchievementUnlock
                        achievement={achievement}
                        onClose={() => handleClose(id)}
                    />
                </div>
            ))}
        </>
    );

    return { showAchievement, AchievementToasts };
}
