"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useSpring } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, Timer, Activity } from "lucide-react";
import { calculateNextReview, Rating } from "@/lib/anki-engine";
import { explainCardContent } from "@/app/actions/explain-card";

// Mock Data (replace with Supabase fetch later)
const MOCK_CARDS = [
    { id: "1", front: "What is the capital of France?", back: "Paris", interval: 0, ease: 2.5 },
    { id: "2", front: "Mitochondria is the...", back: "Powerhouse of the cell", interval: 0, ease: 2.5 },
    { id: "3", front: "React useEffect runs when?", back: "After render, based on dependency array.", interval: 0, ease: 2.5 },
];

export default function AnkiModule() {
    const [cards, setCards] = useState(MOCK_CARDS);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [startTime, setStartTime] = useState<number>(0);
    const [latency, setLatency] = useState<number>(0);
    const [explanation, setExplanation] = useState<string | null>(null);
    const [isExplaining, setIsExplaining] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const currentCard = cards[currentIndex];

    useEffect(() => {
        setStartTime(Date.now());
        setExplanation(null);
    }, [currentIndex]);

    const handleFlip = () => {
        if (!isFlipped) {
            const now = Date.now();
            setLatency(now - startTime);
            setIsFlipped(true);
        }
    };

    const handleRate = (rating: Rating) => {
        const newState = calculateNextReview(rating, currentCard.interval, currentCard.ease, latency);
        console.log(`Rated: ${rating}, Latency: ${latency}ms`);
        console.log("New State:", newState);

        if (currentIndex < cards.length - 1) {
            setIsFlipped(false);
            setCurrentIndex((prev) => prev + 1);
        } else {
            setCurrentIndex(0);
            setIsFlipped(false);
        }
    };

    const handleExplain = async (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExplaining(true);
        const text = await explainCardContent(currentCard.back);
        setExplanation(text);
        setIsExplaining(false);
    };

    return (
        <>
            {/* Premium Fonts */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');
            `}</style>

            {/* Mesh Gradient Background */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900" />
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl" />
            </div>

            <div className="flex flex-col items-center justify-center min-h-[85vh] p-6 relative">
                {/* Minimalist Latency Tracker - Top Right */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed top-24 right-8 z-50"
                >
                    <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl px-4 py-2.5 shadow-2xl">
                        <div className="flex items-center gap-2">
                            <Activity className="w-3.5 h-3.5 text-blue-400" />
                            <span className="text-xs font-['Inter'] font-medium text-white/70">
                                {isFlipped ? `${latency}ms` : 'Tracking...'}
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Session Info */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12 text-center space-y-3"
                >
                    <h1 className="text-5xl font-['Playfair_Display'] font-bold text-white tracking-tight">
                        Neural Review
                    </h1>
                    <p className="text-sm font-['Inter'] font-medium text-blue-300/70 tracking-wide uppercase">
                        Adaptive Latency Learning
                    </p>
                </motion.div>

                {/* Premium Glassmorphic Card */}
                <div className="relative w-full max-w-2xl">
                    <motion.div
                        className="relative"
                        onHoverStart={() => setIsHovered(true)}
                        onHoverEnd={() => setIsHovered(false)}
                        onClick={!isFlipped ? handleFlip : undefined}
                    >
                        {/* Glow Effect */}
                        <motion.div
                            className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-500 rounded-[28px] opacity-0 blur-xl"
                            animate={{
                                opacity: isHovered ? 0.6 : 0.2,
                            }}
                            transition={{ duration: 0.3 }}
                        />

                        {/* Card Container */}
                        <motion.div
                            className={`relative backdrop-blur-2xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl overflow-hidden min-h-[420px] ${!isFlipped ? 'cursor-pointer' : ''}`}
                            animate={{
                                scale: isHovered && !isFlipped ? 1.02 : 1,
                            }}
                            transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 30
                            }}
                        >
                            {/* Content */}
                            {!isFlipped ? (
                                // FRONT SIDE
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="p-12 flex flex-col items-center justify-center min-h-[420px]"
                                >
                                    <motion.h2
                                        className="text-4xl font-['Playfair_Display'] font-semibold text-white text-center leading-relaxed mb-8"
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.1, type: "spring" }}
                                    >
                                        {currentCard.front}
                                    </motion.h2>

                                    <motion.div
                                        className="flex items-center gap-2 text-blue-300/60 font-['Inter'] text-sm"
                                        animate={{ opacity: [0.5, 1, 0.5] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        <Timer className="w-4 h-4" />
                                        <span>Toque para revelar</span>
                                    </motion.div>
                                </motion.div>
                            ) : (
                                // BACK SIDE
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{
                                        type: "spring",
                                        stiffness: 300,
                                        damping: 25
                                    }}
                                    className="p-12 flex flex-col items-center justify-center min-h-[420px]"
                                >
                                    <motion.h3
                                        className="text-5xl font-['Playfair_Display'] font-bold text-white text-center mb-8"
                                        initial={{ y: 20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        {currentCard.back}
                                    </motion.h3>

                                    {/* AI Explain Button */}
                                    {!explanation ? (
                                        <motion.button
                                            onClick={handleExplain}
                                            disabled={isExplaining}
                                            className="group flex items-center gap-2 px-6 py-3 rounded-xl border border-emerald-400/30 bg-emerald-500/10 hover:bg-emerald-500/20 transition-all duration-300 backdrop-blur-sm"
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Sparkles className="w-4 h-4 text-emerald-400" />
                                            <span className="text-sm font-['Inter'] font-medium text-emerald-300">
                                                {isExplaining ? 'Pensando...' : 'Explicar com IA'}
                                            </span>
                                        </motion.button>
                                    ) : (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="w-full max-h-32 overflow-y-auto backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-4"
                                        >
                                            <p className="text-xs font-['Inter'] font-semibold text-emerald-400 mb-2 flex items-center gap-1.5">
                                                <Sparkles className="w-3 h-3" />
                                                AI Insight
                                            </p>
                                            <p className="text-sm font-['Inter'] text-white/80 leading-relaxed">
                                                {explanation}
                                            </p>
                                        </motion.div>
                                    )}
                                </motion.div>
                            )}
                        </motion.div>
                    </motion.div>
                </div>

                {/* Rating Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{
                        opacity: isFlipped ? 1 : 0,
                        y: isFlipped ? 0 : 20,
                        height: isFlipped ? 'auto' : 0
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30
                    }}
                    className="flex gap-3 mt-12"
                >
                    {[
                        { label: 'Errei', rating: 'again' as Rating, color: 'red' },
                        { label: 'Difícil', rating: 'hard' as Rating, color: 'orange' },
                        { label: 'Bom', rating: 'good' as Rating, color: 'blue' },
                        { label: 'Fácil', rating: 'easy' as Rating, color: 'green' }
                    ].map((btn, i) => (
                        <motion.button
                            key={btn.rating}
                            onClick={() => handleRate(btn.rating)}
                            className={`
                                px-8 py-4 rounded-2xl font-['Inter'] font-semibold text-sm
                                backdrop-blur-xl border transition-all duration-300
                                ${btn.color === 'red' ? 'bg-red-500/20 border-red-500/40 text-red-200 hover:bg-red-500/30' : ''}
                                ${btn.color === 'orange' ? 'bg-orange-500/20 border-orange-500/40 text-orange-200 hover:bg-orange-500/30' : ''}
                                ${btn.color === 'blue' ? 'bg-blue-500/20 border-blue-500/40 text-blue-200 hover:bg-blue-500/30' : ''}
                                ${btn.color === 'green' ? 'bg-green-500/20 border-green-500/40 text-green-200 hover:bg-green-500/30' : ''}
                            `}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                                delay: 0.1 + i * 0.05,
                                type: "spring",
                                stiffness: 400,
                                damping: 30
                            }}
                            whileHover={{ scale: 1.05, y: -2 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {btn.label}
                        </motion.button>
                    ))}
                </motion.div>

                {/* Progress Indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 flex items-center gap-2"
                >
                    {cards.map((_, i) => (
                        <div
                            key={i}
                            className={`h-1.5 rounded-full transition-all duration-500 ${i === currentIndex
                                    ? 'w-8 bg-blue-400'
                                    : i < currentIndex
                                        ? 'w-1.5 bg-green-500/50'
                                        : 'w-1.5 bg-white/20'
                                }`}
                        />
                    ))}
                </motion.div>
            </div>
        </>
    );
}
