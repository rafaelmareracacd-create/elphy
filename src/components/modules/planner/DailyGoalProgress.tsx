"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Target, TrendingUp, Flame, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";

interface DailyGoalProgressProps {
    todaySeconds: number;
    goalMinutes?: number;
    onSetGoal?: () => void;
}

export default function DailyGoalProgress({ todaySeconds, goalMinutes = 240, onSetGoal }: DailyGoalProgressProps) {
    const todayMinutes = Math.floor(todaySeconds / 60);
    const percentage = Math.min((todayMinutes / goalMinutes) * 100, 100);
    const isComplete = percentage >= 100;

    // Color based on progress
    const getColor = () => {
        if (percentage < 40) return { from: 'from-rose-500', to: 'to-rose-600', text: 'text-rose-600', bg: 'bg-rose-50' };
        if (percentage < 75) return { from: 'from-amber-500', to: 'to-amber-600', text: 'text-amber-600', bg: 'bg-amber-50' };
        return { from: 'from-emerald-500', to: 'to-emerald-600', text: 'text-emerald-600', bg: 'bg-emerald-50' };
    };

    const colors = getColor();

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] h-full flex flex-col justify-center"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    {/* Minimalist Icon without background circle */}
                    <motion.div
                        animate={isComplete ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.5, repeat: isComplete ? Infinity : 0, repeatDelay: 3 }}
                    >
                        {isComplete ? (
                            <CheckCircle2 className="text-emerald-500" size={28} strokeWidth={2.5} />
                        ) : (
                            <Target className="text-gray-400" size={28} strokeWidth={2.5} />
                        )}
                    </motion.div>

                    <div>
                        <h3 className="font-black text-gray-800 text-base flex items-center gap-2">
                            Meta Diária
                            {isComplete && <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full uppercase tracking-widest">Concluída</span>}
                        </h3>
                        <p className="text-sm text-gray-400 font-black uppercase tracking-widest">
                            {Math.floor(todayMinutes / 60)}h {todayMinutes % 60}m de {Math.floor(goalMinutes / 60)}h {goalMinutes % 60}m
                        </p>
                    </div>
                </div>

                <div className="text-right">
                    <p className={`text-3xl font-black ${colors.text} tabular-nums leading-none`}>
                        {percentage.toFixed(0)}%
                    </p>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Status</p>
                </div>
            </div>

            {/* Robust Progress Bar */}
            <div className="relative pt-2">
                {/* Background track */}
                <div className="h-6 bg-gray-50 rounded-2xl p-1 border border-gray-100/50 shadow-inner overflow-hidden">
                    {/* Animated fill */}
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1.5, ease: [0.34, 1.56, 0.64, 1] }} // smooth spring
                        className={`h-full bg-gradient-to-r ${colors.from} ${colors.to} rounded-xl relative overflow-hidden`}
                    >
                        {/* Glass shine effect */}
                        <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />

                        {/* Shimmer effect */}
                        <motion.div
                            animate={{
                                x: ['-100%', '200%']
                            }}
                            transition={{
                                duration: 3,
                                repeat: Infinity,
                                ease: 'easeInOut'
                            }}
                            className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                        />
                    </motion.div>
                </div>

                {/* Markers */}
                <div className="absolute top-2 w-full flex justify-between px-1 pointer-events-none">
                    {[25, 50, 75].map(mark => (
                        <div key={mark} className="w-0.5 h-6 bg-white/20 z-10" />
                    ))}
                </div>
            </div>

            {/* Achievement celebration footer */}
            <AnimatePresence>
                {isComplete ? (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-6 flex items-center gap-3"
                    >
                        <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm shadow-lg shadow-emerald-200">
                            🎉
                        </div>
                        <p className="text-xs font-black text-gray-500 uppercase tracking-wide">
                            Incrível! Você bateu sua meta de hoje.
                        </p>
                    </motion.div>
                ) : (
                    <motion.div className="mt-6 flex items-center gap-3 opacity-50">
                        <TrendingUp size={16} className="text-gray-400" />
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Continue mantendo o ritmo!
                        </p>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
