"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, Clock, TrendingUp, Network, BookmarkPlus, ArrowRight, CheckCircle2, XCircle, Circle } from "lucide-react";
import { calculateNextReview, Rating } from "@/lib/anki-engine";
import { explainCardContent } from "@/app/actions/explain-card";

// Mock Data
const MOCK_CARDS = [
    { id: "1", front: "What is the capital of France?", back: "Paris", interval: 0, ease: 2.5, deck: "Geography" },
    { id: "2", front: "Mitochondria is the...", back: "Powerhouse of the cell", interval: 0, ease: 2.5, deck: "Biology" },
    { id: "3", front: "React useEffect runs when?", back: "After render, based on dependency array", interval: 0, ease: 2.5, deck: "Programming" },
];

export default function AnkiModule() {
    const [cards, setCards] = useState(MOCK_CARDS);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [startTime, setStartTime] = useState<number>(0);
    const [latency, setLatency] = useState<number>(0);
    const [userAnswer, setUserAnswer] = useState("");
    const [explanation, setExplanation] = useState<string | null>(null);
    const [isExplaining, setIsExplaining] = useState(false);
    const [confidence, setConfidence] = useState(92);
    const [sessionProgress, setSessionProgress] = useState(0);

    const currentCard = cards[currentIndex];

    useEffect(() => {
        setStartTime(Date.now());
        setExplanation(null);
        setUserAnswer("");
        setIsFlipped(false);
        // Update progress
        setSessionProgress(Math.round(((currentIndex) / cards.length) * 100));
    }, [currentIndex, cards.length]);

    const handleReveal = () => {
        if (!isFlipped && userAnswer.trim()) {
            const now = Date.now();
            setLatency(now - startTime);
            setIsFlipped(true);
        }
    };

    // Calculate confidence only after flip (client-side only)
    useEffect(() => {
        if (isFlipped) {
            const newConfidence = Math.floor(Math.random() * 20) + 80;
            setConfidence(newConfidence);
        }
    }, [isFlipped]);

    const handleRate = (rating: Rating) => {
        const newState = calculateNextReview(rating, currentCard.interval, currentCard.ease, latency);
        console.log(`Rated: ${rating}, Latency: ${latency}ms`, newState);

        if (currentIndex < cards.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        } else {
            setCurrentIndex(0);
        }
    };

    const handleExplain = async () => {
        setIsExplaining(true);
        const text = await explainCardContent(currentCard.back);
        setExplanation(text);
        setIsExplaining(false);
    };

    return (
        <div className="min-h-screen bg-[#F8F9FA] pt-20 pb-8 px-6">
            <div className="max-w-[1600px] mx-auto">
                <div className="grid grid-cols-12 gap-6">
                    {/* Main Content - Question Card */}
                    <div className="col-span-12 lg:col-span-8 space-y-6">
                        {/* Session Header */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-between"
                        >
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Spaced Review</h1>
                                <p className="text-sm text-gray-500 mt-1">Deck: {currentCard.deck}</p>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm">
                                <Clock className="w-4 h-4 text-emerald-600" />
                                <span className="text-sm font-semibold text-gray-700">
                                    {currentIndex + 1} / {cards.length}
                                </span>
                            </div>
                        </motion.div>

                        {/* Question Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 min-h-[420px] flex flex-col items-center justify-center"
                        >
                            <div className="w-full max-w-2xl space-y-8">
                                {/* Question */}
                                <motion.h2
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-5xl font-bold text-gray-900 text-center leading-tight"
                                >
                                    {currentCard.front}
                                </motion.h2>

                                {/* Answer Input */}
                                {!isFlipped ? (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.2 }}
                                        className="space-y-4"
                                    >
                                        <input
                                            type="text"
                                            value={userAnswer}
                                            onChange={(e) => setUserAnswer(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleReveal()}
                                            placeholder="Enter your answer here..."
                                            className="w-full px-6 py-4 text-lg text-gray-900 bg-gray-50 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 transition-all placeholder:text-gray-400"
                                            autoFocus
                                        />
                                        <motion.button
                                            onClick={handleReveal}
                                            disabled={!userAnswer.trim()}
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            Analyze Answer
                                            <ArrowRight className="w-5 h-5" />
                                        </motion.button>
                                    </motion.div>
                                ) : (
                                    // Revealed Answer
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="space-y-6"
                                    >
                                        {/* Correct Answer */}
                                        <div className="p-6 bg-emerald-50 border-2 border-emerald-200 rounded-xl">
                                            <p className="text-sm font-semibold text-emerald-700 mb-2">Correct Answer</p>
                                            <p className="text-2xl font-bold text-emerald-900">{currentCard.back}</p>
                                        </div>

                                        {/* Your Answer */}
                                        <div className="p-6 bg-gray-50 border-2 border-gray-200 rounded-xl">
                                            <p className="text-sm font-semibold text-gray-600 mb-2">Your Answer</p>
                                            <p className="text-xl font-semibold text-gray-900">{userAnswer}</p>
                                        </div>

                                        {/* AI Explain Button */}
                                        {!explanation && (
                                            <motion.button
                                                onClick={handleExplain}
                                                disabled={isExplaining}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-emerald-200 rounded-xl hover:bg-emerald-50 transition-all group"
                                            >
                                                <Sparkles className="w-4 h-4 text-emerald-600" />
                                                <span className="text-sm font-semibold text-emerald-700">
                                                    {isExplaining ? 'Thinking...' : 'Explain with AI'}
                                                </span>
                                            </motion.button>
                                        )}

                                        {/* AI Explanation */}
                                        {explanation && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-6 bg-gradient-to-br from-emerald-50 to-blue-50 border-2 border-emerald-200 rounded-xl"
                                            >
                                                <div className="flex items-center gap-2 mb-3">
                                                    <Sparkles className="w-4 h-4 text-emerald-600" />
                                                    <p className="text-sm font-bold text-emerald-700">AI Insight</p>
                                                </div>
                                                <p className="text-sm text-gray-700 leading-relaxed">{explanation}</p>
                                            </motion.div>
                                        )}

                                        {/* Rating Buttons */}
                                        <div className="grid grid-cols-4 gap-3 pt-4">
                                            {[
                                                { label: 'Again', rating: 'again' as Rating, icon: XCircle, color: 'red' },
                                                { label: 'Hard', rating: 'hard' as Rating, icon: Circle, color: 'orange' },
                                                { label: 'Good', rating: 'good' as Rating, icon: Circle, color: 'blue' },
                                                { label: 'Easy', rating: 'easy' as Rating, icon: CheckCircle2, color: 'emerald' }
                                            ].map((btn) => (
                                                <motion.button
                                                    key={btn.rating}
                                                    onClick={() => handleRate(btn.rating)}
                                                    whileHover={{ y: -4 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className={`
                                                        py-3 px-4 rounded-xl font-semibold text-sm transition-all border-2
                                                        ${btn.color === 'red' ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100' : ''}
                                                        ${btn.color === 'orange' ? 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100' : ''}
                                                        ${btn.color === 'blue' ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100' : ''}
                                                        ${btn.color === 'emerald' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100' : ''}
                                                    `}
                                                >
                                                    <btn.icon className="w-4 h-4 mx-auto mb-1" />
                                                    {btn.label}
                                                </motion.button>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Sidebar - AI Insights */}
                    <div className="col-span-12 lg:col-span-4 space-y-4">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6 space-y-6"
                        >
                            <h3 className="text-xl font-bold text-gray-900">AI Insights</h3>

                            {/* Session Progress */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm font-semibold text-gray-700">Session Progress</span>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-gray-400" />
                                </div>
                                <div className="space-y-2">
                                    <div className="w-full h-3 bg-white/80 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${sessionProgress}%` }}
                                            transition={{ duration: 0.5 }}
                                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                                        />
                                    </div>
                                    <p className="text-sm font-bold text-blue-700">{sessionProgress}% Complete</p>
                                </div>
                            </div>

                            {/* AI Confidence */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-emerald-600" />
                                        <span className="text-sm font-semibold text-gray-700">AI Confidence</span>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-gray-400" />
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="relative w-16 h-16">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle
                                                cx="32"
                                                cy="32"
                                                r="28"
                                                stroke="#E5E7EB"
                                                strokeWidth="6"
                                                fill="none"
                                            />
                                            <motion.circle
                                                cx="32"
                                                cy="32"
                                                r="28"
                                                stroke="#10B981"
                                                strokeWidth="6"
                                                fill="none"
                                                strokeLinecap="round"
                                                strokeDasharray={2 * Math.PI * 28}
                                                initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                                                animate={{ strokeDashoffset: 2 * Math.PI * 28 * (1 - confidence / 100) }}
                                                transition={{ duration: 1, delay: 0.3 }}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-xs font-bold text-emerald-600">{confidence}%</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-emerald-700">High Confidence</p>
                                        <p className="text-xs text-gray-600">Based on your performance</p>
                                    </div>
                                </div>
                            </div>

                            {/* Knowledge Map */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Network className="w-4 h-4 text-purple-600" />
                                        <span className="text-sm font-semibold text-gray-700">Knowledge Map</span>
                                    </div>
                                    <ArrowRight className="w-4 h-4 text-gray-400" />
                                </div>
                                <div className="bg-white/60 rounded-xl p-4 h-32 flex items-center justify-center border border-blue-100">
                                    <div className="relative w-full h-full flex items-center justify-center">
                                        {/* Simple knowledge graph visualization */}
                                        <div className="flex items-center gap-2">
                                            <div className="px-3 py-1.5 bg-emerald-100 border border-emerald-300 rounded-lg text-xs font-semibold text-emerald-700">
                                                {currentCard.deck}
                                            </div>
                                            <div className="w-4 h-0.5 bg-gray-300" />
                                            <div className="px-3 py-1.5 bg-blue-100 border border-blue-300 rounded-lg text-xs font-semibold text-blue-700">
                                                Related
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Links */}
                            <div className="pt-4 border-t border-blue-200 space-y-2">
                                <h4 className="text-sm font-bold text-gray-800">Quick Links</h4>
                                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-white/60 rounded-lg transition-colors flex items-center justify-between group">
                                    <span>Related Topics</span>
                                    <ArrowRight className="w-3 h-3 text-gray-400 group-hover:translate-x-1 transition-transform" />
                                </button>
                                <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-white/60 rounded-lg transition-colors flex items-center justify-between group">
                                    <span>Review Later</span>
                                    <BookmarkPlus className="w-3 h-3 text-gray-400" />
                                </button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
