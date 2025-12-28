"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Play, Search, Edit2, Trash2, Sparkles, Save, X, BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Deck {
    id: string;
    name: string;
    description: string | null;
    color: string;
    icon: string;
    cards_count: number;
}

interface Card {
    id: string;
    front: string;
    back: string;
    deck_id: string;
    interval: number;
    ease_factor: number;
    next_review: string;
}

export default function DeckDetailPage() {
    const params = useParams();
    const deckId = params.id as string;

    const [deck, setDeck] = useState<Deck | null>(null);
    const [cards, setCards] = useState<Card[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showAddCard, setShowAddCard] = useState(false);
    const [editingCard, setEditingCard] = useState<Card | null>(null);
    const [newCard, setNewCard] = useState({ front: "", back: "" });
    const [saving, setSaving] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [aiTopic, setAiTopic] = useState("");

    const supabase = createClient();

    useEffect(() => {
        fetchDeckAndCards();
    }, [deckId]);

    const fetchDeckAndCards = async () => {
        setLoading(true);

        // Fetch deck
        const { data: deckData } = await supabase
            .from("decks")
            .select("*")
            .eq("id", deckId)
            .single();

        if (deckData) setDeck(deckData);

        // Fetch cards
        const { data: cardsData } = await supabase
            .from("flashcards")
            .select("*")
            .eq("deck_id", deckId)
            .order("created_at", { ascending: false });

        setCards(cardsData || []);
        setLoading(false);
    };

    const addCard = async () => {
        if (!newCard.front.trim() || !newCard.back.trim()) return;
        setSaving(true);

        const { data, error } = await supabase
            .from("flashcards")
            .insert({
                front: newCard.front,
                back: newCard.back,
                deck_id: deckId,
                user_id: "00000000-0000-0000-0000-000000000000"
            })
            .select()
            .single();

        if (!error && data) {
            setCards([data, ...cards]);
            setNewCard({ front: "", back: "" });
            setShowAddCard(false);
            // Update deck count
            if (deck) setDeck({ ...deck, cards_count: deck.cards_count + 1 });
        }
        setSaving(false);
    };

    const updateCard = async () => {
        if (!editingCard) return;
        setSaving(true);

        const { error } = await supabase
            .from("flashcards")
            .update({ front: editingCard.front, back: editingCard.back })
            .eq("id", editingCard.id);

        if (!error) {
            setCards(cards.map(c => c.id === editingCard.id ? editingCard : c));
            setEditingCard(null);
        }
        setSaving(false);
    };

    const deleteCard = async (cardId: string) => {
        if (!confirm("Excluir este card?")) return;

        const { error } = await supabase
            .from("flashcards")
            .delete()
            .eq("id", cardId);

        if (!error) {
            setCards(cards.filter(c => c.id !== cardId));
            if (deck) setDeck({ ...deck, cards_count: deck.cards_count - 1 });
        }
    };

    const generateCardsWithAI = async () => {
        if (!aiTopic.trim()) return;
        setGenerating(true);

        try {
            const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
            if (!apiKey) throw new Error("API key not configured");

            const { GoogleGenerativeAI } = await import("@google/generative-ai");
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

            const prompt = `Gere 5 flashcards sobre o tema: "${aiTopic}". 
            
Retorne APENAS um JSON válido no formato:
[
  {"front": "pergunta 1", "back": "resposta 1"},
  {"front": "pergunta 2", "back": "resposta 2"}
]

As perguntas devem ser claras e objetivas. As respostas devem ser concisas mas completas.`;

            const result = await model.generateContent(prompt);
            const text = result.response.text();

            // Extract JSON from response
            const jsonMatch = text.match(/\[[\s\S]*\]/);
            if (!jsonMatch) throw new Error("Invalid response format");

            const generatedCards = JSON.parse(jsonMatch[0]);

            // Save cards to database
            for (const card of generatedCards) {
                const { data } = await supabase
                    .from("flashcards")
                    .insert({
                        front: card.front,
                        back: card.back,
                        deck_id: deckId,
                        user_id: "00000000-0000-0000-0000-000000000000"
                    })
                    .select()
                    .single();

                if (data) {
                    setCards(prev => [data, ...prev]);
                }
            }

            if (deck) {
                setDeck({ ...deck, cards_count: deck.cards_count + generatedCards.length });
            }

            setAiTopic("");
        } catch (error) {
            console.error("Error generating cards:", error);
            alert("Erro ao gerar cards. Tente novamente.");
        }

        setGenerating(false);
    };

    const filteredCards = cards.filter(card =>
        card.front.toLowerCase().includes(searchQuery.toLowerCase()) ||
        card.back.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!deck) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Deck não encontrado</h2>
                    <Link href="/dashboard/decks" className="text-emerald-600 hover:underline">
                        Voltar para Decks
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#F8F9FA] p-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <Link
                        href="/dashboard/decks"
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Voltar para Decks
                    </Link>

                    <div className="flex items-center gap-4">
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl"
                            style={{ backgroundColor: `${deck.color}20` }}
                        >
                            {deck.icon}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{deck.name}</h1>
                            <p className="text-gray-500">
                                {deck.cards_count} cards • {deck.description || "Sem descrição"}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Actions Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
                >
                    {/* Start Study */}
                    <Link
                        href={`/dashboard/anki?deck=${deck.id}`}
                        className="flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-white shadow-md hover:shadow-lg transition-all"
                        style={{ background: `linear-gradient(to right, ${deck.color}, ${deck.color}cc)` }}
                    >
                        <Play className="w-5 h-5" />
                        Iniciar Revisão
                    </Link>

                    {/* Add Card */}
                    <button
                        onClick={() => setShowAddCard(true)}
                        className="flex items-center justify-center gap-2 py-4 bg-white border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:border-emerald-300 hover:bg-emerald-50 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Adicionar Card
                    </button>

                    {/* AI Generate */}
                    <div className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Tema para gerar cards..."
                            value={aiTopic}
                            onChange={(e) => setAiTopic(e.target.value)}
                            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <button
                            onClick={generateCardsWithAI}
                            disabled={!aiTopic.trim() || generating}
                            className="px-4 bg-purple-500 text-white rounded-xl hover:bg-purple-600 disabled:opacity-50 transition-colors"
                        >
                            {generating ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Sparkles className="w-5 h-5" />
                            )}
                        </button>
                    </div>
                </motion.div>

                {/* Search */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-6"
                >
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar cards..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                    </div>
                </motion.div>

                {/* Cards List */}
                {filteredCards.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-gray-200"
                    >
                        <BookOpen className="w-12 h-12 text-gray-300 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {searchQuery ? "Nenhum card encontrado" : "Nenhum card ainda"}
                        </h3>
                        <p className="text-gray-500 mb-4">
                            {searchQuery ? "Tente outra busca" : "Adicione cards manualmente ou use a IA"}
                        </p>
                    </motion.div>
                ) : (
                    <div className="space-y-3">
                        {filteredCards.map((card, i) => (
                            <motion.div
                                key={card.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.03 }}
                                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-all group"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs font-semibold text-gray-400 mb-1">FRENTE</p>
                                            <p className="text-gray-900">{card.front}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-gray-400 mb-1">VERSO</p>
                                            <p className="text-gray-700">{card.back}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => setEditingCard(card)}
                                            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4 text-gray-500" />
                                        </button>
                                        <button
                                            onClick={() => deleteCard(card.id)}
                                            className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Add Card Modal */}
                <AnimatePresence>
                    {showAddCard && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                            onClick={() => setShowAddCard(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900">Novo Card</h2>
                                    <button
                                        onClick={() => setShowAddCard(false)}
                                        className="p-2 rounded-lg hover:bg-gray-100"
                                    >
                                        <X className="w-5 h-5 text-gray-500" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 block mb-2">Frente (Pergunta)</label>
                                        <textarea
                                            placeholder="O que você quer memorizar?"
                                            value={newCard.front}
                                            onChange={(e) => setNewCard({ ...newCard, front: e.target.value })}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 block mb-2">Verso (Resposta)</label>
                                        <textarea
                                            placeholder="A resposta correta"
                                            value={newCard.back}
                                            onChange={(e) => setNewCard({ ...newCard, back: e.target.value })}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => setShowAddCard(false)}
                                        className="flex-1 py-3 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={addCard}
                                        disabled={!newCard.front.trim() || !newCard.back.trim() || saving}
                                        className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        {saving ? "Salvando..." : "Salvar Card"}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Edit Card Modal */}
                <AnimatePresence>
                    {editingCard && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                            onClick={() => setEditingCard(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-xl"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-gray-900">Editar Card</h2>
                                    <button
                                        onClick={() => setEditingCard(null)}
                                        className="p-2 rounded-lg hover:bg-gray-100"
                                    >
                                        <X className="w-5 h-5 text-gray-500" />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 block mb-2">Frente</label>
                                        <textarea
                                            value={editingCard.front}
                                            onChange={(e) => setEditingCard({ ...editingCard, front: e.target.value })}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 block mb-2">Verso</label>
                                        <textarea
                                            value={editingCard.back}
                                            onChange={(e) => setEditingCard({ ...editingCard, back: e.target.value })}
                                            rows={3}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                        />
                                    </div>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <button
                                        onClick={() => setEditingCard(null)}
                                        className="flex-1 py-3 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={updateCard}
                                        disabled={saving}
                                        className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        <Save className="w-4 h-4" />
                                        {saving ? "Salvando..." : "Atualizar"}
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
