"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
    Sparkles, ArrowRight, CheckCircle2, XCircle, Circle,
    Undo2, Lightbulb, Brain, BookOpen, Mic, Flame,
    GraduationCap, FileQuestion, Pencil, Layers, Timer, ChevronRight,
    Trash2, EyeOff, ChevronDown, BarChart2, Calendar, PieChart, Download, Filter,
    SkipForward, ArrowLeft, MessageSquare, Send
} from "lucide-react";
import { calculateNextReview, Rating } from "@/lib/anki-engine";
import { explainCardContent } from "@/app/actions/explain-card";
import { generateHint, generateMnemonic, askTutor } from "@/app/actions/tutor-ai";
import { supabase } from "@/lib/supabase";

// ... imports
import CreateAnkiModal from "./anki/CreateAnkiModal";
import ConfirmRedoModal from "./anki/ConfirmRedoModal";
import AnkiStats from "./anki/AnkiStats";
import AnkiNavbar from "./anki/AnkiNavbar";
import Toast from "@/components/ui/Toast";

// Define Flashcard Interface
interface Flashcard {
    id: string;
    front: string;
    back: string;
    interval: number;
    ease_factor: number;
    deck_id: string;
    deck_name?: string;
    is_suspended?: boolean;
}



export default function AnkiModule() {
    const router = useRouter();
    const [cards, setCards] = useState<Flashcard[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    // ... other existing state
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [startTime, setStartTime] = useState<number>(0);
    const [latency, setLatency] = useState<number>(0);
    const [explanation, setExplanation] = useState<string | null>(null);
    const [isExplaining, setIsExplaining] = useState(false);

    // Modal State
    const [showAddModal, setShowAddModal] = useState(false);
    const [allDecks, setAllDecks] = useState<{ id: string; name: string; parent_id?: string | null }[]>([]);
    const [toast, setToast] = useState<{ isVisible: boolean; message: string; type?: 'success' | 'error' }>({ isVisible: false, message: "" });

    // State for editing
    const [editingCard, setEditingCard] = useState<Flashcard | null>(null);

    // ... (experimental features state)
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [scratchpadOpen, setScratchpadOpen] = useState(false);
    const [scratchpadText, setScratchpadText] = useState("");
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isTimerPaused, setIsTimerPaused] = useState(false);
    const [hint, setHint] = useState<string | null>(null);
    const [mnemonic, setMnemonic] = useState<string | null>(null);
    const [showDeckSelector, setShowDeckSelector] = useState(false);
    const [showRedoModal, setShowRedoModal] = useState(false);

    // Track completed cards (cards that have been rated, even if re-queued with "again")
    const [completedCardIds, setCompletedCardIds] = useState<Set<string>>(new Set());
    const [originalCardCount, setOriginalCardCount] = useState(0);

    // View State
    const [view, setView] = useState<'study' | 'stats'>('study');

    const currentCard = cards[currentIndex];

    const getFontSizeClass = (text: string) => {
        const length = text?.length || 0;
        if (length < 30) return "text-4xl md:text-5xl";
        if (length < 100) return "text-2xl md:text-3xl";
        if (length < 250) return "text-xl md:text-2xl";
        return "text-lg md:text-xl";
    };

    // Timer and Start Time Logic - also reset AI responses when card changes
    useEffect(() => {
        setStartTime(Date.now());
        // Reset AI responses for new card
        setHint(null);
        setMnemonic(null);
        setChatAnswer("");
    }, [currentIndex]);

    useEffect(() => {
        const timer = setInterval(() => {
            if (!isTimerPaused) {
                setElapsedTime(prev => prev + 1);
            }
        }, 1000);
        return () => clearInterval(timer);
    }, [isTimerPaused]);

    // Fetch decks
    const searchParams = useSearchParams();
    const deckIdFilter = searchParams.get('deck');

    // Fetch all data on mount - parallelized for performance
    useEffect(() => {
        async function loadData() {
            setLoading(true);
            const nowISO = new Date().toISOString();

            // Fetch decks and user in parallel first
            const [decksResult, userResult] = await Promise.all([
                supabase.from("decks").select("id, name, parent_id, limit_new, limit_review"),
                supabase.auth.getUser()
            ]);

            // Process decks
            if (decksResult.data) {
                setAllDecks(decksResult.data);
            }

            // Process user
            if (userResult.data?.user) {
                setUserId(userResult.data.user.id);
            }

            // Get deck limits (defaults if not set or no filter)
            let limitNew = 20;
            let limitReview = 100;

            if (deckIdFilter && decksResult.data) {
                const currentDeck = decksResult.data.find(d => d.id === deckIdFilter);
                if (currentDeck) {
                    limitNew = currentDeck.limit_new ?? 20;
                    limitReview = currentDeck.limit_review ?? 100;
                }
            }

            // Build separate queries for new cards and review cards
            let newCardsQuery = supabase
                .from('flashcards')
                .select(`*, decks (name)`)
                .eq('interval', 0)
                .eq('is_suspended', false)
                .order('created_at', { ascending: true })
                .limit(limitNew);

            let reviewCardsQuery = supabase
                .from('flashcards')
                .select(`*, decks (name)`)
                .gt('interval', 0)
                .lte('next_review', nowISO)
                .eq('is_suspended', false)
                .order('next_review', { ascending: true })
                .limit(limitReview);

            if (deckIdFilter) {
                newCardsQuery = newCardsQuery.eq('deck_id', deckIdFilter);
                reviewCardsQuery = reviewCardsQuery.eq('deck_id', deckIdFilter);
            }

            // Fetch both card types in parallel
            const [newCardsResult, reviewCardsResult] = await Promise.all([
                newCardsQuery,
                reviewCardsQuery
            ]);

            // Combine and format cards (reviews first, then new)
            const allCards: any[] = [];

            if (reviewCardsResult.data) {
                allCards.push(...reviewCardsResult.data);
            }
            if (newCardsResult.data) {
                allCards.push(...newCardsResult.data);
            }

            const formattedCards = allCards.map((item: any) => ({
                id: item.id,
                front: item.front,
                back: item.back,
                interval: item.interval || 0,
                ease_factor: item.ease_factor || 2.5,
                deck_id: item.deck_id,
                deck_name: item.decks?.name || 'Sem Categoria'
            }));

            setCards(formattedCards);
            setOriginalCardCount(formattedCards.length); // Track original count
            setCompletedCardIds(new Set()); // Reset completed cards
            setLoading(false);
        }

        loadData();
    }, [deckIdFilter]);

    const handleReveal = () => {
        if (!isFlipped) {
            const now = Date.now();
            setLatency(now - startTime);
            setIsFlipped(true);
        }
    };

    const handleRate = async (rating: Rating) => {
        if (!currentCard) return;

        const cardToUpdate = { ...currentCard }; // Capture state securely
        const newState = calculateNextReview(rating, cardToUpdate.interval, cardToUpdate.ease_factor, latency);

        // Special handling for "Again" (Errei) - card should reappear at the end
        if (rating === "again") {
            // Move to next card
            if (currentIndex < cards.length - 1) {
                setCurrentIndex((prev) => prev + 1);
            } else {
                // If this is the last card, remove it temporarily
                setCards(prev => prev.filter(c => c.id !== cardToUpdate.id));
            }

            // Add the card back to the end of the queue with updated state
            setCards(prev => [...prev, {
                ...cardToUpdate,
                interval: newState.interval,
                ease_factor: newState.easeFactor
            }]);
        } else {
            // Mark card as completed only when rating is NOT "again"
            setCompletedCardIds(prev => new Set(prev).add(cardToUpdate.id));

            // Normal flow for other ratings - remove card from queue
            if (currentIndex < cards.length - 1) {
                setCurrentIndex((prev) => prev + 1);
            } else {
                setCards([]); // Clear all cards to trigger "Missão Cumprida"
                setCurrentIndex(0);
            }
        }

        setIsFlipped(false);
        setExplanation(null);

        // Database Update
        const updatePayload = {
            interval: newState.interval,
            ease_factor: newState.easeFactor,
            next_review: newState.nextReview.toISOString(),
            last_latency_ms: Math.round(latency)
        };

        const { error } = await supabase
            .from('flashcards')
            .update(updatePayload)
            .eq('id', cardToUpdate.id);

        // Log Review
        if (userId) {
            await supabase.from('review_logs').insert({
                user_id: userId,
                flashcard_id: cardToUpdate.id,
                rating: rating,
                latency_ms: Math.round(latency),
                created_at: new Date().toISOString()
            });
        }

        if (error) {
            console.error("Failed to update card:", cardToUpdate.id);
            console.error("Full Error (stringified):", JSON.stringify(error, null, 2));
            console.error("Payload sent:", JSON.stringify(updatePayload, null, 2));
            console.error("Current card state:", { interval: cardToUpdate.interval, ease_factor: cardToUpdate.ease_factor });
            const errorMsg = error.message || error.details || error.hint || error.code || JSON.stringify(error);
            setToast({ isVisible: true, message: `Erro: ${errorMsg}`, type: 'error' });
        }
    };

    const handleSuspendCard = async () => {
        if (!currentCard) return;
        const cardToSuspend = { ...currentCard };

        // UI Update: Move to next card
        if (currentIndex < cards.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setCards([]); // Clear cards to trigger correct empty state
            setCurrentIndex(0);
        }

        const { error } = await supabase
            .from('flashcards')
            .update({ is_suspended: true })
            .eq('id', cardToSuspend.id);

        if (error) {
            setToast({ isVisible: true, message: "Erro ao suspender card", type: "error" });
        } else {
            setToast({ isVisible: true, message: "Card suspenso com sucesso" });
        }
    };

    const handleDeleteCard = async () => {
        if (!currentCard) return;
        if (!confirm("Tem certeza que deseja excluir permanentemente este card?")) return;

        const cardToDelete = { ...currentCard };

        // UI Update: Move to next card
        if (currentIndex < cards.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setCards([]); // Clear cards to trigger correct empty state
            setCurrentIndex(0);
        }

        const { error } = await supabase
            .from('flashcards')
            .delete()
            .eq('id', cardToDelete.id);

        if (error) {
            setToast({ isVisible: true, message: "Erro ao excluir card", type: "error" });
        } else {
            setToast({ isVisible: true, message: "Card excluído com sucesso" });
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
            setIsFlipped(false);
            setExplanation(null);
        }
    };

    const handleSkip = () => {
        if (currentIndex < cards.length - 1) {
            setCurrentIndex(prev => prev + 1);
            setIsFlipped(false);
            setExplanation(null);
        }
    };

    const handleCreateCard = async (data: any) => {
        if (data.id) {
            // Update mode
            const { error } = await supabase
                .from("flashcards")
                .update({
                    front: data.front,
                    back: data.back,
                    deck_id: data.deckId,
                    tags: data.tags ? (Array.isArray(data.tags) ? data.tags : [data.tags]) : []
                })
                .eq('id', data.id);

            if (error) {
                console.error("Error updating card:", error);
                setToast({ isVisible: true, message: "Erro ao atualizar card", type: 'error' });
            } else {
                setToast({ isVisible: true, message: "Card atualizado com sucesso!", type: 'success' });
                // Update local cards state if the card is in the current session
                setCards(prev => prev.map(c => c.id === data.id ? { ...c, front: data.front, back: data.back, deck_id: data.deckId } : c));
                setShowAddModal(false);
                setEditingCard(null);
            }
        } else {
            // Create mode
            if (!userId) {
                setToast({ isVisible: true, message: "Você precisa estar logado para criar cards", type: 'error' });
                return;
            }
            const { error } = await supabase.from("flashcards").insert({
                front: data.front,
                back: data.back,
                deck_id: data.deckId,
                user_id: userId,
                tags: data.tags ? [data.tags] : []
            });

            if (error) {
                console.error("Error creating card:", error);
                setToast({ isVisible: true, message: "Erro ao criar card", type: 'error' });
            } else {
                setToast({ isVisible: true, message: "Card criado com sucesso!", type: 'success' });
                setShowAddModal(false);
            }
        }
    };

    const handleCreateDeck = async (data: any) => {
        if (!userId) {
            setToast({ isVisible: true, message: "Você precisa estar logado para criar baralhos", type: 'error' });
            return;
        }
        const { data: newDeck, error } = await supabase.from("decks").insert({
            name: data.name,
            color: data.color,
            icon: data.icon,
            user_id: userId
        }).select().single();

        if (error) {
            console.error("Error creating deck:", error);
        } else if (newDeck) {
            setAllDecks([...allDecks, { id: newDeck.id, name: newDeck.name }]);
        }
    };

    // AI Tutor Interactions
    const [isGeneratingHint, setIsGeneratingHint] = useState(false);
    const [isGeneratingMnemonic, setIsGeneratingMnemonic] = useState(false);

    const handleGetHint = async () => {
        if (!currentCard) return;
        setIsGeneratingHint(true);
        try {
            const hintText = await generateHint(currentCard.front, currentCard.back);
            setHint(hintText);
        } catch (error) {
            console.error("Error generating hint:", error);
            setHint("Não foi possível gerar uma dica no momento.");
        } finally {
            setIsGeneratingHint(false);
        }
    };

    const handleGetMnemonic = async () => {
        if (!currentCard) return;
        setIsGeneratingMnemonic(true);
        try {
            const mnemonicText = await generateMnemonic(currentCard.front, currentCard.back);
            setMnemonic(mnemonicText);
        } catch (error) {
            console.error("Error generating mnemonic:", error);
            setMnemonic("Não foi possível gerar um mnemônico no momento.");
        } finally {
            setIsGeneratingMnemonic(false);
        }
    };

    // Chat with Tutor
    const [chatQuestion, setChatQuestion] = useState("");
    const [chatAnswer, setChatAnswer] = useState("");
    const [isAskingTutor, setIsAskingTutor] = useState(false);

    const handleAskTutor = async () => {
        if (!currentCard || !chatQuestion.trim()) return;
        setIsAskingTutor(true);
        try {
            const answer = await askTutor(chatQuestion, currentCard.front, currentCard.back);
            setChatAnswer(answer);
            setChatQuestion("");
        } catch (error) {
            console.error("Error asking tutor:", error);
            setChatAnswer("Não foi possível responder no momento.");
        } finally {
            setIsAskingTutor(false);
        }
    };

    const handleExplain = async () => {
        if (!currentCard) return;
        setIsExplaining(true);
        const text = await explainCardContent(currentCard.back);
        setExplanation(text);
        setIsExplaining(false);
    };

    const handleRedoReviews = async () => {
        setLoading(true);
        const nowISO = new Date().toISOString();

        try {
            // Update all cards with interval > 0 to have next_review = now
            // This makes them all appear due for review again
            const { error } = await supabase
                .from('flashcards')
                .update({ next_review: nowISO })
                .gt('interval', 0)
                .eq('is_suspended', false);

            if (error) {
                console.error('Error resetting reviews:', error);
                setToast({ isVisible: true, message: 'Erro ao resetar revisões', type: 'error' });
            } else {
                setToast({ isVisible: true, message: 'Revisões resetadas! Recarregando...', type: 'success' });
                // Reload the page to fetch the updated cards
                setTimeout(() => window.location.reload(), 1000);
            }
        } catch (error) {
            console.error('Error resetting reviews:', error);
            setToast({ isVisible: true, message: 'Erro ao resetar revisões', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Removed early returns to persist layout

    // ... (render logic)

    return (
        <div className={`flex flex-col h-[calc(100vh-2rem)] bg-[#F8FAFC] dark:bg-[#121212] overflow-hidden ${view === 'stats' ? 'rounded-l-[32px] rounded-r-none' : 'rounded-[32px]'} transition-colors duration-300`}>
            {/* 1. Top Header (Gamified) */}
            <AnkiNavbar
                onOpenAddModal={() => setShowAddModal(true)}
                sidebarOpen={sidebarOpen}
                setSidebarOpen={setSidebarOpen}
                elapsedTime={elapsedTime}
                isTimerPaused={isTimerPaused}
                onTogglePause={() => setIsTimerPaused(!isTimerPaused)}
                view={view}
                onSetView={setView}
                showSidebarToggle={view !== 'stats'}
                onRedoReviews={() => setShowRedoModal(true)}
            />

            {/* ... (Main content) */}

            <ConfirmRedoModal
                isOpen={showRedoModal}
                onClose={() => setShowRedoModal(false)}
                onConfirm={handleRedoReviews}
            />

            <CreateAnkiModal
                isOpen={showAddModal}
                onClose={() => { setShowAddModal(false); setEditingCard(null); }}
                onCreateCard={handleCreateCard}
                onCreateDeck={handleCreateDeck}
                decks={allDecks}
                initialTab="card"
                initialSelectedDeckId={deckIdFilter || (currentCard?.deck_id)}
                initialCard={editingCard}
            />

            <Toast
                isVisible={toast.isVisible}
                message={toast.message}
                onClose={() => setToast({ ...toast, isVisible: false })}
            />

            <div className="flex-1 flex overflow-hidden relative dark:bg-[#121212] transition-colors duration-300">
                {/* 2. Main Content Area */}
                <main className={`flex-1 flex flex-col ${view === 'study' ? 'items-center justify-center p-6' : ''} relative transition-all duration-300 ${sidebarOpen ? 'mr-0' : 'mr-0'}`}>
                    {view === 'stats' ? (
                        <div className="w-full h-full">
                            <AnkiStats onBack={() => setView('study')} />
                        </div>
                    ) : loading ? (
                        <div className="flex-1 flex items-center justify-center p-10">
                            <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
                        </div>
                    ) : cards.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center p-10 h-full">
                            <div className="text-center space-y-6 max-w-md">
                                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 animate-bounce">
                                    <CheckCircle2 size={40} />
                                </div>
                                <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Missão Cumprida!</h2>
                                <p className="text-gray-500 dark:text-gray-400">Você completou todas as revisões de hoje. Mantenha o foco e volte amanhã para aumentar sua ofensiva!</p>
                                <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
                                    Atualizar
                                </Button>
                            </div>
                        </div>
                    ) : currentCard ? (
                        <>
                            <div className="w-full max-w-3xl flex gap-6 items-start h-full max-h-[600px]">
                                {/* Scratchpad (Left Side Toggle) */}
                                <AnimatePresence>
                                    {scratchpadOpen && (
                                        <motion.div
                                            initial={{ width: 0, opacity: 0, x: -20 }}
                                            animate={{ width: 280, opacity: 1, x: 0 }}
                                            exit={{ width: 0, opacity: 0, x: -20 }}
                                            className="h-full bg-white dark:bg-slate-900 rounded-2xl border border-gray-200/60 dark:border-white/5 shadow-xl shadow-gray-200/40 dark:shadow-black/20 flex flex-col overflow-hidden"
                                        >
                                            <div className="p-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
                                                <span className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                                                    <Pencil size={12} className="text-emerald-600 dark:text-emerald-400" /> Rascunho
                                                </span>
                                            </div>
                                            <textarea
                                                className="flex-1 p-5 bg-transparent resize-none focus:outline-none text-sm leading-relaxed text-gray-600 dark:text-slate-300 font-medium placeholder:text-gray-300 dark:placeholder:text-slate-700"
                                                placeholder="Digite sua resposta aqui para testar seu conhecimento..."
                                                value={scratchpadText}
                                                onChange={(e) => setScratchpadText(e.target.value)}
                                                spellCheck={false}
                                            />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Central Card */}
                                <div className="flex-1 flex flex-col gap-6 h-full">
                                    <motion.div
                                        layout
                                        className="flex-1 bg-white/95 dark:bg-slate-900 backdrop-blur-xl rounded-[32px] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-gray-100 dark:border-slate-700/50 relative overflow-hidden flex flex-col"
                                    >
                                        {/* Card Header */}
                                        <div className="px-6 py-4 flex items-center justify-between relative z-10 border-b border-gray-100 dark:border-white/5">
                                            {/* Left: Deck Name or Back Button */}
                                            <div className="flex items-center gap-3 min-w-[140px] relative">
                                                {isFlipped ? (
                                                    <button
                                                        onClick={() => setIsFlipped(false)}
                                                        className="flex items-center gap-2 text-gray-400 dark:text-gray-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors group"
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center group-hover:from-emerald-50 group-hover:to-emerald-100 dark:group-hover:from-emerald-500/10 dark:group-hover:to-emerald-500/20 transition-all border border-gray-100 dark:border-white/5 shadow-sm">
                                                            <Undo2 size={14} />
                                                        </div>
                                                        <span className="text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity">Voltar</span>
                                                    </button>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => setShowDeckSelector(!showDeckSelector)}
                                                            className="flex items-center gap-2 group cursor-pointer hover:opacity-80 transition-opacity"
                                                        >
                                                            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                                                            <span className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-gray-50 to-gray-100 dark:from-slate-800 dark:to-slate-900 text-gray-600 dark:text-slate-300 border border-gray-100/80 dark:border-white/5 text-[10px] font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                                                                {currentCard.deck_name}
                                                                <ChevronDown size={12} className={`text-gray-400 dark:text-gray-500 transition-transform ${showDeckSelector ? 'rotate-180' : ''}`} />
                                                            </span>
                                                        </button>

                                                        {/* Deck Selector Dropdown */}
                                                        <AnimatePresence>
                                                            {showDeckSelector && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                                                    className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl border border-gray-100 dark:border-slate-800 shadow-xl shadow-gray-200/50 dark:shadow-black/50 z-50 overflow-hidden"
                                                                >
                                                                    <div className="p-2 border-b border-gray-50 dark:border-white/5 bg-gray-50/50 dark:bg-slate-800/50">
                                                                        <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider px-2">Selecionar Baralho</span>
                                                                    </div>
                                                                    <div className="max-h-64 overflow-y-auto p-2 space-y-1">
                                                                        {/* Option: All Decks */}
                                                                        <button
                                                                            onClick={() => {
                                                                                router.push('/dashboard/anki');
                                                                                setShowDeckSelector(false);
                                                                            }}
                                                                            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${!deckIdFilter
                                                                                ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20'
                                                                                : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/5'
                                                                                }`}
                                                                        >
                                                                            <Layers size={14} />
                                                                            Todos os Baralhos
                                                                        </button>

                                                                        {/* Deck List */}
                                                                        {allDecks.map(deck => (
                                                                            <button
                                                                                key={deck.id}
                                                                                onClick={() => {
                                                                                    router.push(`/dashboard/anki?deck=${deck.id}`);
                                                                                    setShowDeckSelector(false);
                                                                                }}
                                                                                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${deckIdFilter === deck.id
                                                                                    ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20'
                                                                                    : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-white/5'
                                                                                    }`}
                                                                            >
                                                                                {deck.name}
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </>
                                                )}
                                            </div>

                                            {/* Center: Mastery Indicator - absolutely centered */}
                                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-3">
                                                <span className="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-[0.15em]">Maestria</span>
                                                <div className="flex gap-1">
                                                    {[1, 2, 3, 4, 5].map(i => (
                                                        <div
                                                            key={i}
                                                            className={`
                                                                w-6 h-1.5 rounded-full transition-all duration-300
                                                                ${i <= 3
                                                                    ? 'bg-gradient-to-r from-emerald-400 to-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]'
                                                                    : 'bg-gray-100 dark:bg-slate-800 border border-gray-200/50 dark:border-white/5'}
                                                            `}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="flex gap-1">
                                                {!isFlipped && (
                                                    <>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={(e) => { e.stopPropagation(); setEditingCard(currentCard); setShowAddModal(true); }}
                                                            className="w-8 h-8 rounded-full text-gray-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                                                            title="Editar Card"
                                                        >
                                                            <Pencil size={14} />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={(e) => { e.stopPropagation(); handleSuspendCard(); }}
                                                            className="w-8 h-8 rounded-full text-gray-400 dark:text-slate-500 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-colors"
                                                            title="Suspender Card"
                                                        >
                                                            <EyeOff size={14} />
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteCard(); }}
                                                            className="w-8 h-8 rounded-full text-gray-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                                            title="Excluir Card"
                                                        >
                                                            <Trash2 size={14} />
                                                        </Button>
                                                        <div className="w-px h-4 bg-gray-100 dark:bg-white/5 mx-1" />
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="w-8 h-8 rounded-full text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-white/5"
                                                        >
                                                            <Mic size={14} />
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        {/* Card Body */}
                                        <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 text-center overflow-y-auto overflow-x-hidden custom-scrollbar max-h-[400px]">
                                            <AnimatePresence mode="wait">
                                                <motion.div
                                                    key={isFlipped ? "back" : "front"}
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -10 }}
                                                    className="w-full"
                                                >
                                                    <div
                                                        className={`${getFontSizeClass(isFlipped ? currentCard?.back || "" : currentCard?.front || "")} font-medium text-gray-900 dark:text-white leading-relaxed font-['Inter'] tracking-tight prose prose-sm max-w-none [&>p]:my-2 [&>ul]:list-disc [&>ul]:ml-4 [&>ol]:list-decimal [&>ol]:ml-4`}
                                                        dangerouslySetInnerHTML={{ __html: isFlipped ? currentCard?.back || "" : currentCard?.front || "" }}
                                                    />
                                                </motion.div>
                                            </AnimatePresence>
                                        </div>

                                        {/* Post-Answer Context */}
                                        {isFlipped && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                className="bg-gray-50/50 dark:bg-slate-800/50 border-t border-gray-100 dark:border-white/5 p-6"
                                            >
                                                <div className="flex items-start gap-4">
                                                    <div className="p-2 bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/5 rounded-lg text-emerald-600 dark:text-emerald-400 shrink-0 shadow-sm">
                                                        <GraduationCap size={18} />
                                                    </div>
                                                    <div className="space-y-1 text-left">
                                                        <h4 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">Contexto Estratégico</h4>
                                                        <p className="text-sm text-gray-600 dark:text-slate-300 leading-relaxed">
                                                            {explanation || "Este conceito é frequentemente cobrado para testar a compreensão sobre..."}
                                                        </p>
                                                        {!explanation && (
                                                            <button onClick={handleExplain} className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1.5 transition-colors">
                                                                <Sparkles size={12} /> Gerar Insight com IA
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        )}
                                    </motion.div>

                                    {/* Action Bar */}
                                    <div className="h-[72px] shrink-0">
                                        {!isFlipped ? (
                                            <div className="flex items-center gap-3 h-full">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={handlePrevious}
                                                    disabled={currentIndex === 0}
                                                    className="h-full aspect-square rounded-[20px] border border-gray-200 dark:border-white/5 bg-white dark:bg-slate-900 text-gray-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                                                    title="Questão Anterior"
                                                >
                                                    <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                                                </motion.button>

                                                <motion.button
                                                    whileHover={{ scale: 1.01 }}
                                                    whileTap={{ scale: 0.99 }}
                                                    onClick={handleReveal}
                                                    className="flex-1 h-full relative overflow-hidden bg-gradient-to-r from-emerald-500 via-emerald-500 to-teal-500 text-white text-base font-bold rounded-[20px] shadow-[0_10px_40px_-10px_rgba(16,185,129,0.5)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)] tracking-wide transition-all border border-emerald-400/30 flex items-center justify-center gap-3 group"
                                                >
                                                    {/* Animated shine effect */}
                                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                                                    <span className="relative z-10">Mostrar Resposta</span>
                                                    <ArrowRight className="relative z-10 w-5 h-5 opacity-80 group-hover:translate-x-1 transition-transform" />
                                                </motion.button>

                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={handleSkip}
                                                    disabled={currentIndex === cards.length - 1}
                                                    className="h-full aspect-square rounded-[20px] border border-gray-200 dark:border-white/5 bg-white dark:bg-slate-900 text-gray-400 dark:text-slate-500 hover:text-purple-600 dark:hover:text-purple-400 hover:border-purple-200 dark:hover:border-purple-500/30 hover:bg-purple-50 dark:hover:bg-purple-500/10 flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
                                                    title="Pular Questão"
                                                >
                                                    <SkipForward size={24} className="group-hover:translate-x-1 transition-transform" />
                                                </motion.button>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-4 gap-3 h-full">
                                                {[
                                                    { label: "Errei", sub: "< 1m", color: "text-red-500", bgHover: "hover:bg-gradient-to-br hover:from-red-50 hover:to-red-100 dark:hover:from-red-500/10 dark:hover:to-red-500/20", borderColor: "border-red-100 dark:border-red-500/20 hover:border-red-200 dark:hover:border-red-500/40", shadow: "hover:shadow-red-500/20", val: "again" as Rating },
                                                    { label: "Difícil", sub: "2d", color: "text-orange-500", bgHover: "hover:bg-gradient-to-br hover:from-orange-50 hover:to-amber-100 dark:hover:from-orange-500/10 dark:hover:to-orange-500/20", borderColor: "border-orange-100 dark:border-orange-500/20 hover:border-orange-200 dark:hover:border-orange-500/40", shadow: "hover:shadow-orange-500/20", val: "hard" as Rating },
                                                    { label: "Bom", sub: "4d", color: "text-blue-500", bgHover: "hover:bg-gradient-to-br hover:from-blue-50 hover:to-sky-100 dark:hover:from-blue-500/10 dark:hover:to-blue-500/20", borderColor: "border-blue-100 dark:border-blue-500/20 hover:border-blue-200 dark:hover:border-blue-500/40", shadow: "hover:shadow-blue-500/20", val: "good" as Rating },
                                                    { label: "Fácil", sub: "7d", color: "text-emerald-500", bgHover: "hover:bg-gradient-to-br hover:from-emerald-50 hover:to-teal-100 dark:hover:from-emerald-500/10 dark:hover:to-emerald-500/20", borderColor: "border-emerald-100 dark:border-emerald-500/20 hover:border-emerald-200 dark:hover:border-emerald-500/40", shadow: "hover:shadow-emerald-500/20", val: "easy" as Rating },
                                                ].map((opt) => (
                                                    <motion.button
                                                        key={opt.label}
                                                        whileHover={{ y: -3, scale: 1.02 }}
                                                        whileTap={{ scale: 0.98 }}
                                                        onClick={() => handleRate(opt.val)}
                                                        className={`
                                                            flex flex-col items-center justify-center rounded-[18px] bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-2
                                                            shadow-lg transition-all duration-300 ${opt.shadow}
                                                            ${opt.bgHover} ${opt.borderColor} group
                                                        `}
                                                    >
                                                        <span className={`font-extrabold text-lg ${opt.color} group-hover:scale-105 transition-transform`}>{opt.label}</span>
                                                        <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider mt-0.5 group-hover:text-gray-500 dark:group-hover:text-slate-400">{opt.sub}</span>
                                                    </motion.button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : null}
                </main>

                {/* 3. Tutor Sidebar (Right) - Only show in study view */}
                <AnimatePresence>
                    {sidebarOpen && view !== 'stats' && (
                        <motion.aside
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 340, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            className="bg-[#F8FAFC] dark:bg-[#121212] border-l border-gray-100 dark:border-white/5 h-full flex flex-col shrink-0 z-20 transition-colors duration-300"
                        >
                            <div className="p-6 pb-2 pt-6 flex-1 flex flex-col overflow-hidden">
                                {/* Tutor Header */}
                                <div className="flex items-center gap-4 mb-6 p-4 bg-white/70 dark:bg-slate-800/70 rounded-2xl border border-gray-100/50 dark:border-white/5 shadow-lg shadow-gray-100/50 dark:shadow-black/20 shrink-0">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 shadow-lg shadow-emerald-200/50 dark:shadow-emerald-500/20 flex items-center justify-center text-white">
                                        <Brain size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
                                            Tutor IA
                                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                                        </h3>
                                        <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-wider">Assistente Inteligente</p>
                                    </div>
                                </div>

                                <div className="flex-1 overflow-y-auto space-y-6 pr-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-100 dark:[&::-webkit-scrollbar-thumb]:bg-slate-800 hover:[&::-webkit-scrollbar-thumb]:bg-gray-200 dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-track]:bg-transparent">
                                    {/* Hint Section */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                <Lightbulb size={12} className="text-yellow-500" /> Dica Semântica
                                            </h4>
                                        </div>

                                        {hint ? (
                                            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm text-sm text-gray-600 dark:text-slate-300 leading-relaxed relative overflow-hidden group">
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-yellow-400 rounded-l-full" />
                                                <p>"{hint}"</p>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={handleGetHint}
                                                disabled={isGeneratingHint || !currentCard}
                                                className="w-full bg-white dark:bg-slate-800/50 hover:bg-emerald-50/50 dark:hover:bg-emerald-500/10 p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md hover:border-emerald-100 dark:hover:border-emerald-500/30 transition-all duration-300 group text-left flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-slate-900 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-500/20 text-gray-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 flex items-center justify-center transition-colors">
                                                        {isGeneratingHint ? (
                                                            <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                                                        ) : (
                                                            <Sparkles size={14} />
                                                        )}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-600 dark:text-slate-300 group-hover:text-emerald-800 dark:group-hover:text-emerald-200 transition-colors">
                                                        {isGeneratingHint ? 'Gerando...' : 'Pedir uma dica'}
                                                    </span>
                                                </div>
                                                <div className="w-6 h-6 rounded-full bg-gray-50 dark:bg-slate-900 group-hover:bg-white dark:group-hover:bg-slate-800 flex items-center justify-center">
                                                    <ChevronRight size={14} className="text-gray-300 dark:text-slate-600 group-hover:text-emerald-500 transition-colors" />
                                                </div>
                                            </button>
                                        )}
                                    </div>

                                    {/* Mnemonic Section */}
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                                <Brain size={12} className="text-purple-500" /> Mnemônico
                                            </h4>
                                        </div>

                                        {mnemonic ? (
                                            <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm text-sm text-gray-600 dark:text-slate-300 leading-relaxed relative overflow-hidden group">
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-400 rounded-l-full" />
                                                <p>{mnemonic}</p>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={handleGetMnemonic}
                                                disabled={isGeneratingMnemonic || !currentCard}
                                                className="w-full bg-white dark:bg-slate-800/50 hover:bg-purple-50/50 dark:hover:bg-purple-500/10 p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md hover:border-purple-100 dark:hover:border-purple-500/30 transition-all duration-300 group text-left flex items-center justify-between disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-gray-50 dark:bg-slate-900 group-hover:bg-purple-100 dark:group-hover:bg-purple-500/20 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 flex items-center justify-center transition-colors">
                                                        {isGeneratingMnemonic ? (
                                                            <div className="w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                                                        ) : (
                                                            <Sparkles size={14} />
                                                        )}
                                                    </div>
                                                    <span className="text-sm font-medium text-gray-600 dark:text-slate-300 group-hover:text-purple-800 dark:group-hover:text-purple-200 transition-colors">
                                                        {isGeneratingMnemonic ? 'Gerando...' : 'Gerar Mnemônico'}
                                                    </span>
                                                </div>
                                                <div className="w-6 h-6 rounded-full bg-gray-50 dark:bg-slate-900 group-hover:bg-white dark:group-hover:bg-slate-800 flex items-center justify-center">
                                                    <ChevronRight size={14} className="text-gray-300 dark:text-slate-600 group-hover:text-purple-500 transition-colors" />
                                                </div>
                                            </button>
                                        )}
                                    </div>

                                    {/* Ask Tutor Chat */}
                                    <div className="pt-4 space-y-3">
                                        <h4 className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                            <MessageSquare size={12} className="text-blue-500" /> Pergunte ao Tutor
                                        </h4>

                                        {chatAnswer && (
                                            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm text-sm text-gray-600 dark:text-slate-300 leading-relaxed relative overflow-hidden">
                                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400 rounded-l-full" />
                                                <p>{chatAnswer}</p>
                                            </div>
                                        )}

                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={chatQuestion}
                                                onChange={(e) => setChatQuestion(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAskTutor()}
                                                placeholder="Digite sua dúvida..."
                                                disabled={!currentCard || isAskingTutor}
                                                className="flex-1 px-4 py-2.5 text-sm bg-white dark:bg-slate-800 border border-gray-200 dark:border-white/5 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 placeholder:text-gray-400 dark:placeholder:text-slate-600 dark:text-white"
                                            />
                                            <button
                                                onClick={handleAskTutor}
                                                disabled={!currentCard || !chatQuestion.trim() || isAskingTutor}
                                                className="px-4 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                                            >
                                                {isAskingTutor ? (
                                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                                ) : (
                                                    <Send size={14} />
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Session Stats (Premium) */}
                                    <div className="p-5 bg-gradient-to-br from-white via-white to-emerald-50/30 dark:from-slate-800 dark:via-slate-800 dark:to-emerald-500/5 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-white/5 shadow-lg shadow-gray-100/30 dark:shadow-black/20 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-[0.15em]">Sessão de Estudo</span>
                                            <span className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">{currentIndex + 1} de {cards.length}</span>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="w-full h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${((currentIndex + 1) / Math.max(cards.length, 1)) * 100}%` }}
                                                    transition={{ duration: 0.5, ease: "easeOut" }}
                                                    className="h-full bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                        </motion.aside>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
