"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Timer, BrainCircuit } from "lucide-react";
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

    const currentCard = cards[currentIndex];

    useEffect(() => {
        // Start timer when card appears (front)
        setStartTime(Date.now());
        setExplanation(null);
    }, [currentIndex]);

    const handleFlip = () => {
        if (!isFlipped) {
            const now = Date.now();
            setLatency(now - startTime);
            setIsFlipped(true);
        } else {
            setIsFlipped(false);
        }
    };

    const handleRate = (rating: Rating) => {
        // Calculate new state logic (In real app, update DB here)
        const newState = calculateNextReview(rating, currentCard.interval, currentCard.ease, latency);

        console.log(`Rated: ${rating}, Latency: ${latency}ms`);
        console.log("New State:", newState);

        // Move to next card
        if (currentIndex < cards.length - 1) {
            setIsFlipped(false);
            setCurrentIndex((prev) => prev + 1);
        } else {
            alert("Session Complete!");
            // Reset for demo
            setCurrentIndex(0);
            setIsFlipped(false);
        }
    };

    const handleExplain = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent flip
        setIsExplaining(true);
        const text = await explainCardContent(currentCard.back);
        setExplanation(text);
        setIsExplaining(false);
    };

    // 3D Flip Variants
    const variants = {
        front: { rotateY: 0 },
        back: { rotateY: 180 },
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6">
            <div className="mb-8 text-center space-y-2">
                <h2 className="text-3xl font-bold flex items-center justify-center gap-2">
                    <BrainCircuit className="text-primary" /> Anki Neural Review
                </h2>
                <p className="text-muted-foreground">Adaptive Latency Learning Active</p>
            </div>

            <div className="relative w-full max-w-xl h-80 perspective-1000 group cursor-pointer" onClick={handleFlip}>
                <motion.div
                    className="w-full h-full relative preserve-3d transition-all duration-500"
                    animate={isFlipped ? "back" : "front"}
                    variants={variants}
                    transition={{ duration: 0.6 }}
                    style={{ transformStyle: "preserve-3d" }}
                >
                    {/* FRONT */}
                    <div className="absolute inset-0 backface-hidden" style={{ backfaceVisibility: "hidden" }}>
                        <Card className="w-full h-full flex flex-col items-center justify-center p-8 bg-card border-primary/20 shadow-lg">
                            <span className="text-xs font-mono text-muted-foreground absolute top-4 right-4 flex items-center gap-1">
                                <Timer className="w-3 h-3" /> Latency Tracker
                            </span>
                            <h3 className="text-2xl font-serif font-medium text-center">{currentCard.front}</h3>
                            <p className="text-sm text-muted-foreground mt-8 animate-pulse">Click to Reveal</p>
                        </Card>
                    </div>

                    {/* BACK */}
                    <div
                        className="absolute inset-0 backface-hidden rotate-y-180"
                        style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                    >
                        <Card className="w-full h-full flex flex-col items-center justify-center p-8 bg-slate-900 text-white border-primary shadow-xl">
                            <h3 className="text-2xl font-bold text-center mb-4">{currentCard.back}</h3>

                            {explanation ? (
                                <div className="mb-4 text-sm bg-white/10 p-3 rounded-md text-left overflow-y-auto max-h-32 w-full">
                                    <p className="font-semibold text-emerald-400 flex items-center gap-2">
                                        <Sparkles className="w-3 h-3" /> AI Insight:
                                    </p>
                                    {explanation}
                                </div>
                            ) : (
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="mb-4 border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
                                    onClick={handleExplain}
                                    disabled={isExplaining}
                                >
                                    {isExplaining ? "Thinking..." : "AI Explica (Gemini)"}
                                </Button>
                            )}
                        </Card>
                    </div>
                </motion.div>
            </div>

            {/* CONTROLS */}
            {isFlipped && (
                <div className="flex gap-4 mt-8">
                    <Button
                        variant="destructive"
                        className="w-24"
                        onClick={() => handleRate("again")}
                    >
                        Errei
                    </Button>
                    <Button
                        variant="secondary"
                        className="w-24 bg-orange-500/10 text-orange-500 hover:bg-orange-500/20"
                        onClick={() => handleRate("hard")}
                    >
                        Difícil
                    </Button>
                    <Button
                        variant="secondary"
                        className="w-24 bg-blue-500/10 text-blue-500 hover:bg-blue-500/20"
                        onClick={() => handleRate("good")}
                    >
                        Bom
                    </Button>
                    <Button
                        className="w-24 bg-green-500 hover:bg-green-600 text-white"
                        onClick={() => handleRate("easy")}
                    >
                        Fácil
                    </Button>
                </div>
            )}

            {!isFlipped && (
                <div className="mt-8 h-10" />
            )}
        </div>
    );
}
