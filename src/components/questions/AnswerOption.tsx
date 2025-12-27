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
            return "bg-emerald-50 border-emerald-400 text-emerald-900";
        }
        if (isRevealed && isSelected && !isCorrect) {
            return "bg-red-50 border-red-400 text-red-900";
        }
        if (isSelected) {
            return "bg-emerald-50 border-emerald-400 text-gray-900";
        }
        return "bg-white border-gray-200 text-gray-900 hover:border-emerald-300 hover:bg-gray-50";
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
                ${isRevealed && isCorrect ? 'bg-emerald-200 text-emerald-900' :
                    isRevealed && isSelected && !isCorrect ? 'bg-red-200 text-red-900' :
                        isSelected ? 'bg-emerald-200 text-emerald-900' :
                            'bg-gray-100 text-gray-700'}
            `}>
                {letter}
            </div>

            {/* Text */}
            <span className="flex-1 font-medium">{text}</span>
        </motion.button>
    );
}
