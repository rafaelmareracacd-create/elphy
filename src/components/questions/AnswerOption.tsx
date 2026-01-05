"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Circle } from "lucide-react";

interface AnswerOptionProps {
    letter: string;
    text: string;
    isSelected: boolean;
    isCorrect?: boolean;
    isRevealed: boolean;
    onSelect: () => void;
    disabled: boolean;
}

export default function AnswerOption({
    letter,
    text,
    isSelected,
    isCorrect,
    isRevealed,
    onSelect,
    disabled
}: AnswerOptionProps) {
    // Determine visual state
    const getStateClasses = () => {
        if (isRevealed && isCorrect) {
            return "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400 dark:border-emerald-500/50 text-emerald-900 dark:text-emerald-100";
        }
        if (isRevealed && isSelected && !isCorrect) {
            return "bg-red-50 dark:bg-red-900/20 border-red-400 dark:border-red-500/50 text-red-900 dark:text-red-100";
        }
        if (isSelected) {
            return "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-400 dark:border-emerald-500/50 text-gray-900 dark:text-gray-100";
        }
        return "bg-white dark:bg-[#1E1E1E] border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-200 hover:border-emerald-300 dark:hover:border-emerald-500/50 hover:bg-gray-50 dark:hover:bg-white/5";
    };

    const getIconState = () => {
        if (isRevealed && isCorrect) {
            return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
        }
        if (isRevealed && isSelected && !isCorrect) {
            return <XCircle className="w-5 h-5 text-red-600" />;
        }
        if (isSelected) {
            return <Circle className="w-5 h-5 text-emerald-600 fill-emerald-600" />;
        }
        return <Circle className="w-5 h-5 text-gray-400" />;
    };

    return (
        <motion.button
            onClick={onSelect}
            disabled={disabled}
            whileHover={!disabled ? { scale: 1.01 } : {}}
            whileTap={!disabled ? { scale: 0.99 } : {}}
            className={`
                w-full p-4 rounded-xl border-2 transition-all text-left flex items-center gap-4
                ${getStateClasses()}
                ${disabled ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}
            `}
        >
            {/* Icon */}
            {getIconState()}

            {/* Letter Badge */}
            <div className={`
                w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm
                ${isRevealed && isCorrect ? 'bg-emerald-200 dark:bg-emerald-500/30 text-emerald-900 dark:text-emerald-300' :
                    isRevealed && isSelected && !isCorrect ? 'bg-red-200 dark:bg-red-500/30 text-red-900 dark:text-red-300' :
                        isSelected ? 'bg-emerald-200 dark:bg-emerald-500/30 text-emerald-900 dark:text-emerald-300' :
                            'bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-300'}
            `}>
                {letter}
            </div>

            {/* Text */}
            <span className="flex-1 font-medium">{text}</span>
        </motion.button>
    );
}
