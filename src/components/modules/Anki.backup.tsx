"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowRight, CheckCircle2, XCircle, Circle, BarChart2, Plus, LayoutGrid, Layers, Undo2 } from "lucide-react";
import { calculateNextReview, Rating } from "@/lib/anki-engine";
import { explainCardContent } from "@/app/actions/explain-card";
import { supabase } from "@/lib/supabase";

// Define Flashcard Interface
interface Flashcard {
    id: string;
    front: string;
    back: string;
    interval: number;
    ease_factor: number;
    deck_id: string;
    deck_name?: string;
}

const NAV_ITEMS = [
    { label: "Baralhos", icon: Layers },
    { label: "Adicionar", icon: Plus },
    { label: "Painel", icon: LayoutGrid },
    { label: "Estatísticas", icon: BarChart2 },
];

export default function AnkiModule() {
    const [cards, setCards] = useState<Flashcard[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [startTime, setStartTime] = useState<number>(0);
    const [latency, setLatency] = useState<number>(0);
    const [explanation, setExplanation] = useState<string | null>(null);
    const [isExplaining, setIsExplaining] = useState(false);
    const [activeTab, setActiveTab] = useState("Painel");

    const currentCard = cards[currentIndex];

    // Fetch due cards on mount
    useEffect(() => {
        async function fetchDueCards() {
            setLoading(true);
            const nowISO = new Date().toISOString();

            const { data, error } = await supabase
                .from('flashcards')
                .select(`
                    *,
                    decks (
                        name
                    )
                `)
                .or(`next_review.lte.${nowISO},next_review.is.null`)
                .order('next_review', { ascending: true })
                .limit(20);

            if (error) {
                console.error("Error fetching cards:", error);
            } else if (data) {
                const formattedCards = data.map((item: any) => ({
                    id: item.id,
                    front: item.front,
                    back: item.back,
                    interval: item.interval || 0,
                    ease_factor: item.ease_factor || 2.5,
                    deck_id: item.deck_id,
                    deck_name: item.decks?.name || 'Sem Categoria'
                }));
                setCards(formattedCards);
            }
            setLoading(false);
        }

        fetchDueCards();
    }, []);

    useEffect(() => {
        if (!currentCard) return;
        setStartTime(Date.now());
        setExplanation(null);
        setIsFlipped(false);
    }, [currentIndex, cards.length, currentCard]);

    const handleReveal = () => {
        if (!isFlipped) {
            const now = Date.now();
            setLatency(now - startTime);
            setIsFlipped(true);
        }
    };

    const handleRate = async (rating: Rating) => {
        if (!currentCard) return;

        const newState = calculateNextReview(rating, currentCard.interval, currentCard.ease_factor, latency);
        console.log(`Rated: ${rating}, Latency: ${latency}ms`, newState);

        if (currentIndex < cards.length - 1) {
            setCurrentIndex((prev) => prev + 1);
        } else {
            setCards(prev => prev.filter(c => c.id !== currentCard.id));
        }

        const { error } = await supabase
            .from('flashcards')
            .update({
                interval: newState.interval,
                ease_factor: newState.easeFactor,
                next_review: newState.nextReview.toISOString(),
                last_latency_ms: latency
            })
            .eq('id', currentCard.id);

        if (error) {
            console.error("Failed to update card progress:", error);
        }
    };

    const handleExplain = async () => {
        if (!currentCard) return;
        setIsExplaining(true);
        const text = await explainCardContent(currentCard.back);
        setExplanation(text);
        setIsExplaining(false);
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center p-10">
                <div className="animate-spin w-8 h-8 border-2 border-gray-900 border-t-transparent rounded-full" />
            </div>
        );
    }

    if (cards.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center p-10">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                        <CheckCircle2 size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">Tudo em dia!</h2>
                    <p className="text-gray-500">Você completou todas as revisões pendentes.</p>
                </div>
            </div>
        );
    }

    if (!currentCard) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
                <p className="text-gray-500">Atualizando sessão...</p>
                {setTimeout(() => window.location.reload(), 1000) && null}
            </div>
        )
    }

    return (
        <div className="flex flex-col h-[calc(100vh-2rem)] bg-gray-50/50 rounded-[32px] overflow-hidden">
            {/* Top Navigation Bar */}
            <header className="h-16 border-b border-gray-200 bg-white/50 backdrop-blur-xl flex items-center justify-center px-8 sticky top-0 z-50 relative">
                <div className="flex items-center gap-8">
                    {NAV_ITEMS.map((item) => (
                        <button
                            key={item.label}
                            onClick={() => setActiveTab(item.label)}
                            className={`flex items-center gap-2 text-sm font-medium transition-colors ${activeTab === item.label
                                ? "text-gray-900"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            <item.icon size={16} />
                            {item.label}
                        </button>
                    ))}
                </div>

                <div className="absolute right-8 text-sm font-medium text-gray-500 tabular-nums">
                    {currentIndex + 1} <span className="text-gray-300">/</span> {cards.length}
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex items-center justify-center p-8 relative">
                {/* Subtle Background Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-gray-100 to-gray-50 rounded-full blur-[100px] opacity-50" />
                </div>

                {/* Floating Card */}
                <motion.div
                    layout
                    className="w-full max-w-4xl bg-white rounded-[40px] shadow-[0_20px_60px_-10px_rgba(0,0,0,0.08)] ring-1 ring-gray-100 relative z-10 overflow-hidden flex flex-col min-h-[500px]"
                >
                    {/* Header: Deck Info & Status */}
                    <div className="px-10 py-8 border-b border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {isFlipped ? (
                                <button
                                    onClick={() => setIsFlipped(false)}
                                    className="flex items-center gap-2 text-gray-400 hover:text-gray-600 transition-colors group"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
                                        <Undo2 size={16} />
                                    </div>
                                    <span className="text-sm font-semibold uppercase tracking-widest hidden sm:inline">Voltar</span>
                                </button>
                            ) : (
                                <>
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <span className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
                                        {currentCard.deck_name}
                                    </span>
                                </>
                            )}
                        </div>
                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${isFlipped ? "bg-indigo-50 text-indigo-600" : "bg-gray-100 text-gray-600"
                            }`}>
                            {isFlipped ? "Resposta" : "Pergunta"}
                        </span>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 flex flex-col items-center justify-center p-10 md:p-14 text-center">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isFlipped ? "back" : "front"}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="w-full max-w-2xl"
                            >
                                <h2 className="text-5xl md:text-6xl font-medium text-gray-900 leading-tight font-['Inter'] tracking-tight">
                                    {isFlipped ? currentCard.back : currentCard.front}
                                </h2>

                                {isFlipped && explanation && (
                                    <motion.div
                                        initial={{ opacity: 0, marginTop: 0 }}
                                        animate={{ opacity: 1, marginTop: 40 }}
                                        className="text-left bg-gray-50 rounded-2xl p-6 border border-gray-100/50"
                                    >
                                        <div className="flex items-center gap-2 text-emerald-600 mb-2">
                                            <Sparkles size={14} />
                                            <span className="text-xs font-bold uppercase tracking-wider">AI Insight</span>
                                        </div>
                                        <p className="text-gray-600 leading-relaxed text-sm">{explanation}</p>
                                    </motion.div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Footer: Actions */}
                    <div className="p-8 bg-gray-50/30 border-t border-gray-100">
                        {!isFlipped ? (
                            <Button
                                onClick={handleReveal}
                                className="w-full h-16 bg-gray-900 hover:bg-black text-white text-lg font-medium rounded-2xl shadow-lg shadow-gray-200 tracking-wide transition-all hover:scale-[1.01] active:scale-[0.99]"
                            >
                                Mostrar Resposta
                                <ArrowRight className="ml-2 w-5 h-5 opacity-50" />
                            </Button>
                        ) : (
                            <div className="flex flex-col gap-6">
                                {/* AI Action */}
                                {!explanation && (
                                    <button
                                        onClick={handleExplain}
                                        disabled={isExplaining}
                                        className="flex items-center justify-center gap-2 text-sm font-semibold text-gray-400 hover:text-emerald-600 transition-colors mx-auto"
                                    >
                                        <Sparkles size={16} />
                                        {isExplaining ? "Gerando..." : "Explicar com IA"}
                                    </button>
                                )}

                                {/* Rating Grid */}
                                <div className="grid grid-cols-4 gap-4">
                                    {[
                                        { label: "Errei", sub: "< 1m", color: "text-red-500", bg: "hover:bg-red-50", ring: "hover:ring-red-100", val: "again" as Rating },
                                        { label: "Difícil", sub: "2d", color: "text-orange-500", bg: "hover:bg-orange-50", ring: "hover:ring-orange-100", val: "hard" as Rating },
                                        { label: "Bom", sub: "4d", color: "text-blue-500", bg: "hover:bg-blue-50", ring: "hover:ring-blue-100", val: "good" as Rating },
                                        { label: "Fácil", sub: "7d", color: "text-emerald-500", bg: "hover:bg-emerald-50", ring: "hover:ring-emerald-100", val: "easy" as Rating },
                                    ].map((opt) => (
                                        <button
                                            key={opt.label}
                                            onClick={() => handleRate(opt.val)}
                                            className={`
                                                flex flex-col items-center justify-center py-4 rounded-xl bg-white border border-gray-200 
                                                shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md
                                                ${opt.bg} ${opt.ring} hover:border-transparent
                                            `}
                                        >
                                            <span className={`font-bold text-lg ${opt.color}`}>{opt.label}</span>
                                            <span className="text-xs font-medium text-gray-400 mt-1">{opt.sub}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </main>
        </div>
    );
}
