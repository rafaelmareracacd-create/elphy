// Combo Meter Component - Visual Multiplier Display
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Flame, Zap, Crown } from "lucide-react";
import { useEffect, useState } from "react";

interface ComboMeterProps {
    combo: number;
    multiplier: number;
    maxCombo?: number;
    variant?: 'compact' | 'full';
}

export default function ComboMeter({
    combo,
    multiplier,
    maxCombo = 0,
    variant = 'compact'
}: ComboMeterProps) {
    const [prevCombo, setPrevCombo] = useState(combo);
    const [shouldShake, setShouldShake] = useState(false);

    // Determine tier based on combo
    const getTier = () => {
        if (combo >= 50) return { name: 'LENDÁRIO', color: 'from-amber-400 to-yellow-500', icon: Crown, glow: 'shadow-amber-300' };
        if (combo >= 20) return { name: 'ÉPICO', color: 'from-purple-500 to-pink-500', icon: Zap, glow: 'shadow-purple-300' };
        if (combo >= 10) return { name: 'RARO', color: 'from-blue-500 to-cyan-500', icon: Flame, glow: 'shadow-blue-300' };
        if (combo >= 5) return { name: 'BOM', color: 'from-emerald-500 to-green-500', icon: Flame, glow: 'shadow-emerald-300' };
        return { name: 'COMEÇANDO', color: 'from-gray-400 to-gray-500', icon: Flame, glow: 'shadow-gray-300' };
    };

    const tier = getTier();
    const TierIcon = tier.icon;

    // Progress to next tier
    const getNextTier = () => {
        if (combo < 5) return 5;
        if (combo < 10) return 10;
        if (combo < 20) return 20;
        if (combo < 50) return 50;
        return 100;
    };

    const nextTier = getNextTier();
    const prevTierThreshold = combo < 5 ? 0 : combo < 10 ? 5 : combo < 20 ? 10 : combo < 50 ? 20 : 50;
    const progress = ((combo - prevTierThreshold) / (nextTier - prevTierThreshold)) * 100;

    // Shake animation when combo increases
    useEffect(() => {
        if (combo > prevCombo) {
            setShouldShake(true);
            setTimeout(() => setShouldShake(false), 300);
        }
        setPrevCombo(combo);
    }, [combo, prevCombo]);

    if (variant === 'compact') {
        return (
            <motion.div
                animate={shouldShake ? { scale: [1, 1.15, 1], rotate: [0, -5, 5, 0] } : {}}
                className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r ${tier.color} shadow-lg ${tier.glow}`}
            >
                <TierIcon className="w-4 h-4 text-white" />
                <div className="flex flex-col">
                    <span className="text-white font-bold text-sm leading-none">{combo}x</span>
                    <span className="text-white/80 text-xs leading-none">{multiplier.toFixed(1)}x XP</span>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
        >
            {/* Main Circle */}
            <motion.div
                animate={shouldShake ? {
                    scale: [1, 1.1, 1],
                    rotate: [0, -10, 10, 0]
                } : {}}
                className={`relative w-32 h-32 rounded-full bg-gradient-to-br ${tier.color} shadow-2xl ${tier.glow} flex items-center justify-center overflow-hidden`}
            >
                {/* Animated background glow */}
                <motion.div
                    className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent"
                    animate={{
                        opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{ duration: 2, repeat: Infinity }}
                />

                {/* Combo Number */}
                <div className="relative z-10 text-center">
                    <motion.div
                        key={combo}
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center"
                    >
                        <TierIcon className="w-8 h-8 text-white mb-1" />
                        <span className="text-4xl font-black text-white leading-none">{combo}</span>
                        <span className="text-xs text-white/90 font-semibold uppercase tracking-wider mt-1">
                            {tier.name}
                        </span>
                    </motion.div>
                </div>

                {/* Particle effects for legendary */}
                {combo >= 50 && (
                    <motion.div
                        className="absolute inset-0"
                        animate={{
                            rotate: 360,
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    >
                        {[...Array(8)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="absolute w-2 h-2 bg-yellow-300 rounded-full"
                                style={{
                                    top: '50%',
                                    left: '50%',
                                    transform: `rotate(${i * 45}deg) translate(50px) translateX(-50%) translateY(-50%)`,
                                }}
                                animate={{
                                    opacity: [0, 1, 0],
                                    scale: [0, 1, 0],
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    delay: i * 0.25,
                                }}
                            />
                        ))}
                    </motion.div>
                )}
            </motion.div>

            {/* Multiplier Badge */}
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-4 py-1.5 bg-white rounded-full shadow-lg border-2 border-gray-200"
            >
                <span className={`text-sm font-bold bg-gradient-to-r ${tier.color} bg-clip-text text-transparent`}>
                    {multiplier.toFixed(1)}x XP
                </span>
            </motion.div>

            {/* Progress to Next Tier */}
            {combo < 100 && (
                <div className="mt-6 w-full">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Próximo tier</span>
                        <span className="font-semibold">{nextTier} combo</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(progress, 100)}%` }}
                            transition={{ duration: 0.5 }}
                            className={`h-full bg-gradient-to-r ${tier.color}`}
                        />
                    </div>
                </div>
            )}

            {/* Max Combo Record */}
            {maxCombo > 0 && combo > 0 && (
                <div className="mt-3 text-center">
                    <span className="text-xs text-gray-500">
                        Recorde: <span className="font-bold text-gray-700">{maxCombo}</span>
                    </span>
                </div>
            )}
        </motion.div>
    );
}

// Hook para gerenciar combo state
export function useComboSystem() {
    const [combo, setCombo] = useState(0);
    const [maxCombo, setMaxCombo] = useState(0);

    const incrementCombo = () => {
        const newCombo = combo + 1;
        setCombo(newCombo);
        if (newCombo > maxCombo) {
            setMaxCombo(newCombo);
        }
    };

    const resetCombo = () => {
        setCombo(0);
    };

    const getMultiplier = (): number => {
        if (combo >= 50) return 3.0;
        if (combo >= 20) return 2.0;
        if (combo >= 10) return 1.5;
        if (combo >= 5) return 1.2;
        return 1.0;
    };

    return {
        combo,
        maxCombo,
        multiplier: getMultiplier(),
        incrementCombo,
        resetCombo,
    };
}
