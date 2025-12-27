// Streak Flame Component - Elphy Theme
"use client";

import { motion } from "framer-motion";
import { Flame, Snowflake } from "lucide-react";

interface StreakFlameProps {
    days: number;
    isActive: boolean;
    isFrozen?: boolean;
    variant?: 'full' | 'compact';
}

export default function StreakFlame({
    days,
    isActive,
    isFrozen = false,
    variant = 'full'
}: StreakFlameProps) {
    const getFlameSize = () => {
        if (days >= 100) return { emoji: '💎', size: 'text-5xl', label: 'Diamante' };
        if (days >= 30) return { emoji: '🔥🔥🔥', size: 'text-4xl', label: 'Chama Grande' };
        if (days >= 7) return { emoji: '🔥🔥', size: 'text-3xl', label: 'Chama Média' };
        return { emoji: '🔥', size: 'text-2xl', label: 'Chama Pequena' };
    };

    const flame = getFlameSize();

    if (variant === 'compact') {
        return (
            <div className="flex items-center gap-2">
                {isFrozen ? (
                    <div className="flex items-center gap-1 px-3 py-1.5 bg-blue-100 border border-blue-300 rounded-lg">
                        <Snowflake className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-bold text-blue-700">{days}</span>
                    </div>
                ) : (
                    <motion.div
                        animate={isActive ? {
                            scale: [1, 1.1, 1],
                        } : {}}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-orange-100 to-red-100 border border-orange-300 rounded-lg"
                    >
                        <span className="text-lg">{flame.emoji}</span>
                        <span className="text-sm font-bold text-orange-700">{days}</span>
                    </motion.div>
                )}
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
        >
            <div className="flex items-center gap-4">
                {/* Flame Icon */}
                <div className="relative">
                    {isFrozen ? (
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 text-info items-center justify-center shadow-lg">
                            <Snowflake className="w-10 h-10 text-white" />
                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                                <span className="text-xs font-bold text-white">🧊</span>
                            </div>
                        </div>
                    ) : (
                        <motion.div
                            animate={isActive ? {
                                scale: [1, 1.05, 1],
                                rotate: [-2, 2, -2],
                            } : {}}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center shadow-lg relative overflow-hidden"
                        >
                            <span className={`${flame.size} relative z-10`}>{flame.emoji}</span>

                            {/* Animated glow */}
                            {isActive && (
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-t from-yellow-400 to-orange-500 opacity-50"
                                    animate={{
                                        opacity: [0.3, 0.6, 0.3],
                                    }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                />
                            )}
                        </motion.div>
                    )}
                </div>

                {/* Streak Info */}
                <div className="flex-1">
                    <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-3xl font-bold text-gray-900">{days}</span>
                        <span className="text-sm text-gray-600">
                            {days === 1 ? 'dia' : 'dias'}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        {isFrozen ? (
                            <div className="flex items-center gap-1">
                                <Snowflake className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-semibold text-blue-700">
                                    Sequência Congelada
                                </span>
                            </div>
                        ) : (
                            <>
                                <Flame className="w-4 h-4 text-orange-600" />
                                <span className="text-sm font-semibold text-gray-700">
                                    {isActive ? 'Sequência Ativa' : 'Sequência Perdida'}
                                </span>
                            </>
                        )}
                    </div>
                    {days >= 7 && (
                        <p className="text-xs text-emerald-600 mt-1 font-medium">
                            ⭐ Bônus de XP {days >= 30 ? '+50%' : '+20%'}
                        </p>
                    )}
                </div>
            </div>

            {/* Milestones Progress */}
            {!isFrozen && days < 100 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                        <span>Próxima meta</span>
                        <span className="font-semibold">
                            {days < 7 ? '7 dias 🔥🔥' : days < 30 ? '30 dias 🔥🔥🔥' : '100 dias 💎'}
                        </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{
                                width: `${((days % (days < 7 ? 7 : days < 30 ? 30 : 100)) / (days < 7 ? 7 : days < 30 ? 30 : 100)) * 100}%`
                            }}
                            className="h-full bg-gradient-to-r from-orange-500 to-red-600"
                        />
                    </div>
                </div>
            )}
        </motion.div>
    );
}
