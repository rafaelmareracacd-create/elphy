// XP Bar Component - Elphy Theme (Emerald Green)
"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface XPBarProps {
    currentXP: number;
    level: number;
    xpToNext: number;
    showAnimation?: boolean;
    variant?: 'full' | 'compact';
}

export default function XPBar({
    currentXP,
    level,
    xpToNext,
    showAnimation = false,
    variant = 'full'
}: XPBarProps) {
    const [displayXP, setDisplayXP] = useState(currentXP);

    // Total XP for current level progress
    const xpForCurrentLevel = currentXP - (currentXP - xpToNext);
    const totalXPForLevel = xpToNext + xpForCurrentLevel;
    const progress = (xpForCurrentLevel / totalXPForLevel) * 100;

    useEffect(() => {
        if (showAnimation) {
            // Animate XP counter
            const duration = 1000;
            const step = (currentXP - displayXP) / (duration / 16);
            const interval = setInterval(() => {
                setDisplayXP(prev => {
                    const next = prev + step;
                    if (step > 0 && next >= currentXP) {
                        clearInterval(interval);
                        return currentXP;
                    }
                    if (step < 0 && next <= currentXP) {
                        clearInterval(interval);
                        return currentXP;
                    }
                    return next;
                });
            }, 16);
            return () => clearInterval(interval);
        } else {
            setDisplayXP(currentXP);
        }
    }, [currentXP, showAnimation]);

    if (variant === 'compact') {
        return (
            <div className="flex items-center gap-2">
                {/* Level Badge */}
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-md">
                    <span className="text-white font-bold text-sm">{level}</span>
                </div>

                {/* XP Bar */}
                <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 relative"
                    >
                        {showAnimation && (
                            <motion.div
                                className="absolute inset-0 bg-white/30"
                                initial={{ x: '-100%' }}
                                animate={{ x: '200%' }}
                                transition={{ duration: 1.5, ease: "easeInOut" }}
                            />
                        )}
                    </motion.div>
                </div>

                {/* XP Text */}
                <span className="text-xs font-semibold text-gray-600 whitespace-nowrap">
                    {Math.floor(displayXP)} XP
                </span>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4"
        >
            <div className="flex items-center gap-4">
                {/* Level Badge */}
                <div className="flex-shrink-0">
                    <div className="relative">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg">
                            <Sparkles className="w-6 h-6 text-white absolute -top-1 -right-1" />
                            <div className="text-center">
                                <div className="text-xs text-emerald-100 font-medium">Nível</div>
                                <div className="text-2xl font-bold text-white">{level}</div>
                            </div>
                        </div>
                        {showAnimation && (
                            <motion.div
                                className="absolute inset-0 rounded-2xl bg-emerald-400/50"
                                initial={{ scale: 1, opacity: 1 }}
                                animate={{ scale: 1.5, opacity: 0 }}
                                transition={{ duration: 1 }}
                            />
                        )}
                    </div>
                </div>

                {/* XP Progress */}
                <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-gray-900">
                            {Math.floor(displayXP).toLocaleString()} XP
                        </span>
                        <span className="text-xs text-gray-500">
                            {xpToNext.toLocaleString()} para nível {level + 1}
                        </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative h-4 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 relative shadow-lg shadow-emerald-200"
                        >
                            {/* Shine effect */}
                            {showAnimation && (
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                                    initial={{ x: '-100%' }}
                                    animate={{ x: '200%' }}
                                    transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 2 }}
                                />
                            )}
                        </motion.div>

                        {/* Percentage text */}
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-xs font-bold text-gray-700 drop-shadow-sm">
                                {Math.round(progress)}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
