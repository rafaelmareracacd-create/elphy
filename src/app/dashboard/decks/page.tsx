"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Star, MoreHorizontal, Play, Edit2, Trash2, Clock, BookOpen } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface Deck {
    id: string;
    name: string;
    description: string | null;
    color: string;
    icon: string;
    is_favorite: boolean;
    cards_count: number;
    created_at: string;
}

const EMOJI_OPTIONS = ["📚", "🎯", "🧠", "💡", "🌍", "⚖️", "📊", "🏛️", "🔬", "💼", "🌐", "📖"];
const COLOR_OPTIONS = [
    "#10B981", "#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B", "#EF4444",
    "#06B6D4", "#84CC16", "#6366F1", "#F97316"
];

export default function DecksPage() {
    const [decks, setDecks] = useState<Deck[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newDeck, setNewDeck] = useState({ name: "", description: "", color: "#10B981", icon: "📚" });
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchDecks();
    }, []);

    const fetchDecks = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("decks")
            .select("*")
            .order("is_favorite", { ascending: false })
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching decks:", error);
        } else {
            setDecks(data || []);
        }
        setLoading(false);
    };

    const createDeck = async () => {
        if (!newDeck.name.trim()) return;
        setCreating(true);

        const { data, error } = await supabase
            .from("decks")
            .insert({
                name: newDeck.name,
                description: newDeck.description || null,
                color: newDeck.color,
                icon: newDeck.icon,
                user_id: "00000000-0000-0000-0000-000000000000" // Placeholder - replace with auth
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating deck:", error);
        } else {
            setDecks([data, ...decks]);
            setShowCreateModal(false);
            setNewDeck({ name: "", description: "", color: "#10B981", icon: "📚" });
        }
        setCreating(false);
    };

    const toggleFavorite = async (deck: Deck) => {
        const { error } = await supabase
            .from("decks")
            .update({ is_favorite: !deck.is_favorite })
            .eq("id", deck.id);

        if (!error) {
            setDecks(decks.map(d =>
                d.id === deck.id ? { ...d, is_favorite: !d.is_favorite } : d
            ).sort((a, b) => (b.is_favorite ? 1 : 0) - (a.is_favorite ? 1 : 0)));
        }
    };

    const deleteDeck = async (deckId: string) => {
        if (!confirm("Tem certeza que deseja excluir este deck?")) return;

        const { error } = await supabase
            .from("decks")
            .delete()
            .eq("id", deckId);

        if (!error) {
            setDecks(decks.filter(d => d.id !== deckId));
        }
    };

    const filteredDecks = decks.filter(deck =>
        deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        deck.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#F8F9FA] p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold text-gray-900">Meus Decks</h1>
                    <p className="text-gray-500 mt-1">Organize seus flashcards em baralhos para estudo</p>
                </motion.div>

                {/* Actions Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col sm:flex-row gap-4 mb-8"
                >
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Buscar decks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        />
                    </div>

                    {/* New Deck Button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Novo Deck</span>
                    </motion.button>
                </motion.div>

                {/* Decks Grid */}
                {loading ? (
                    <div className="flex items-center justify-center h-64">
                        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : filteredDecks.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex flex-col items-center justify-center h-64 bg-white rounded-2xl border border-gray-200"
                    >
                        <div className="text-6xl mb-4">📚</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            {searchQuery ? "Nenhum deck encontrado" : "Nenhum deck ainda"}
                        </h3>
                        <p className="text-gray-500 mb-4">
                            {searchQuery ? "Tente outra busca" : "Crie seu primeiro deck para começar"}
                        </p>
                        {!searchQuery && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                            >
                                Criar Deck
                            </button>
                        )}
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {filteredDecks.map((deck, i) => (
                            <DeckCard
                                key={deck.id}
                                deck={deck}
                                index={i}
                                onToggleFavorite={() => toggleFavorite(deck)}
                                onDelete={() => deleteDeck(deck.id)}
                            />
                        ))}
                    </div>
                )}

                {/* Create Modal */}
                <AnimatePresence>
                    {showCreateModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                            onClick={() => setShowCreateModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl"
                            >
                                <h2 className="text-2xl font-bold text-gray-900 mb-6">Novo Deck</h2>

                                {/* Icon Selector */}
                                <div className="mb-4">
                                    <label className="text-sm font-semibold text-gray-700 block mb-2">Ícone</label>
                                    <div className="flex flex-wrap gap-2">
                                        {EMOJI_OPTIONS.map((emoji) => (
                                            <button
                                                key={emoji}
                                                onClick={() => setNewDeck({ ...newDeck, icon: emoji })}
                                                className={`w-10 h-10 text-xl rounded-lg border-2 transition-all ${newDeck.icon === emoji
                                                    ? "border-emerald-500 bg-emerald-50"
                                                    : "border-gray-200 hover:border-gray-300"
                                                    }`}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Color Selector */}
                                <div className="mb-4">
                                    <label className="text-sm font-semibold text-gray-700 block mb-2">Cor</label>
                                    <div className="flex flex-wrap gap-2">
                                        {COLOR_OPTIONS.map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => setNewDeck({ ...newDeck, color })}
                                                className={`w-8 h-8 rounded-full transition-all ${newDeck.color === color ? "ring-2 ring-offset-2 ring-gray-400" : ""
                                                    }`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Name Input */}
                                <div className="mb-4">
                                    <label className="text-sm font-semibold text-gray-700 block mb-2">Nome</label>
                                    <input
                                        type="text"
                                        placeholder="Ex: Direito Internacional"
                                        value={newDeck.name}
                                        onChange={(e) => setNewDeck({ ...newDeck, name: e.target.value })}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>

                                {/* Description Input */}
                                <div className="mb-6">
                                    <label className="text-sm font-semibold text-gray-700 block mb-2">Descrição (opcional)</label>
                                    <textarea
                                        placeholder="Breve descrição do deck"
                                        value={newDeck.description}
                                        onChange={(e) => setNewDeck({ ...newDeck, description: e.target.value })}
                                        rows={2}
                                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                                    />
                                </div>

                                {/* Preview */}
                                <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                                    <p className="text-xs text-gray-500 mb-2">Preview</p>
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                                            style={{ backgroundColor: `${newDeck.color}20` }}
                                        >
                                            {newDeck.icon}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-900">
                                                {newDeck.name || "Nome do deck"}
                                            </p>
                                            <p className="text-sm text-gray-500">0 cards</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setShowCreateModal(false)}
                                        className="flex-1 py-3 border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={createDeck}
                                        disabled={!newDeck.name.trim() || creating}
                                        className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-semibold hover:bg-emerald-600 transition-colors disabled:opacity-50"
                                    >
                                        {creating ? "Criando..." : "Criar Deck"}
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

// Deck Card Component
function DeckCard({ deck, index, onToggleFavorite, onDelete }: {
    deck: Deck;
    index: number;
    onToggleFavorite: () => void;
    onDelete: () => void;
}) {
    const [showMenu, setShowMenu] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group relative bg-white rounded-2xl border border-gray-200 p-5 hover:shadow-lg transition-all"
        >
            {/* Favorite Star */}
            <button
                onClick={onToggleFavorite}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
            >
                <Star
                    className={`w-4 h-4 ${deck.is_favorite ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                />
            </button>

            {/* Icon & Name */}
            <Link href={`/dashboard/decks/${deck.id}`}>
                <div className="flex items-center gap-3 mb-4">
                    <div
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                        style={{ backgroundColor: `${deck.color}20` }}
                    >
                        {deck.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 truncate">{deck.name}</h3>
                        {deck.description && (
                            <p className="text-sm text-gray-500 truncate">{deck.description}</p>
                        )}
                    </div>
                </div>
            </Link>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{deck.cards_count} cards</span>
                </div>
                <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>0 para revisar</span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <Link
                    href={`/dashboard/anki?deck=${deck.id}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-sm font-semibold transition-all"
                    style={{ backgroundColor: `${deck.color}20`, color: deck.color }}
                >
                    <Play className="w-4 h-4" />
                    Estudar
                </Link>
                <div className="relative">
                    <button
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                    >
                        <MoreHorizontal className="w-4 h-4 text-gray-500" />
                    </button>

                    {showMenu && (
                        <div className="absolute right-0 bottom-full mb-2 bg-white border border-gray-200 rounded-xl shadow-lg py-1 min-w-32 z-10">
                            <Link
                                href={`/dashboard/decks/${deck.id}`}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                            >
                                <Edit2 className="w-4 h-4" />
                                Editar
                            </Link>
                            <button
                                onClick={onDelete}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                            >
                                <Trash2 className="w-4 h-4" />
                                Excluir
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
