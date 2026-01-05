"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Plus, Play, Search, Edit2, Trash2, Sparkles, Save, X, BookOpen, ChevronRight, Layers } from "lucide-react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import DecksView from "@/components/modules/anki/DecksView";
import CreateAnkiModal from "@/components/modules/anki/CreateAnkiModal";
import DeleteConfirmModal from "@/components/modules/planner/DeleteConfirmModal";
import CardTable from "@/components/modules/anki/CardTable";
import Toast from "@/components/ui/Toast";
import DeckSettingsModal from "@/components/modules/anki/DeckSettingsModal";

interface Deck {
    id: string;
    name: string;
    description: string | null;
    color: string | null;
    icon: string | null;
    cards_count: number;
    parent_id: string | null;
    tags: string[];
}

interface Card {
    id: string;
    front: string;
    back: string;
    deck_id: string;
    interval: number;
    ease_factor: number;
    next_review: string;
    tags: string[];
}


export default function DeckDetailPage() {
    const params = useParams();
    const router = useRouter();
    const deckId = params.id as string;

    const [deck, setDeck] = useState<Deck | null>(null);
    const [subDecks, setSubDecks] = useState<Deck[]>([]); // Sub-decks
    const [allDecks, setAllDecks] = useState<{ id: string; name: string; parent_id?: string | null }[]>([]); // All decks for modal
    const [cards, setCards] = useState<Card[]>([]);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [showAddCard, setShowAddCard] = useState(false);
    const [showCreateSubDeck, setShowCreateSubDeck] = useState(false); // Sub-deck modal
    const [editingCard, setEditingCard] = useState<Card | null>(null);
    const [newCard, setNewCard] = useState({ front: "", back: "", tags: "" });
    const [saving, setSaving] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [aiTopic, setAiTopic] = useState("");
    const [deckTagsInput, setDeckTagsInput] = useState(""); // Deck tags editing

    const [isEditingTags, setIsEditingTags] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [settingsModalOpen, setSettingsModalOpen] = useState(false);
    const [deckToDelete, setDeckToDelete] = useState<string | null>(null);
    const [toast, setToast] = useState<{ isVisible: boolean; message: string; type?: 'success' | 'error' }>({ isVisible: false, message: "" });

    useEffect(() => {
        fetchUser();
        fetchDeckAndCards();
    }, [deckId]);

    const fetchUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUserId(user.id);
        }
    };

    const fetchDeckAndCards = async () => {
        setLoading(true);

        // Fetch deck
        const { data: deckData } = await supabase
            .from("decks")
            .select("*")
            .eq("id", deckId)
            .single();

        if (deckData) {
            setDeck(deckData);
            setDeckTagsInput(deckData.tags ? deckData.tags.join(", ") : "");
        }

        // Fetch Sub-decks
        const { data: subDecksData } = await supabase
            .from("decks")
            .select("*")
            .eq("parent_id", deckId)
            .order("created_at", { ascending: false });
        setSubDecks(subDecksData || []);

        // Fetch All Decks for the modal selector
        const { data: allDecksData } = await supabase
            .from("decks")
            .select("id, name, parent_id");
        setAllDecks(allDecksData || []);

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

        const tagsArray = newCard.tags
            .split(",")
            .map(t => t.trim())
            .filter(t => t.length > 0);

        const { data, error } = await supabase
            .from("flashcards")
            .insert({
                front: newCard.front,
                back: newCard.back,
                deck_id: deckId,
                user_id: userId,
                tags: tagsArray
            })
            .select()
            .single();

        if (!error && data) {
            setCards([data, ...cards]);
            setNewCard({ front: "", back: "", tags: "" });
            setShowAddCard(false);
            // Update deck count
            if (deck) setDeck({ ...deck, cards_count: (deck.cards_count || 0) + 1 });
            setToast({ isVisible: true, message: "Card criado com sucesso!" });
        }
        setSaving(false);
    };

    // Handler for CreateAnkiModal
    const handleCreateCardModal = async (data: any) => {
        const tagsArray = data.tags
            ? (typeof data.tags === 'string' ? data.tags.split(",").map((t: string) => t.trim()).filter((t: string) => t.length > 0) : [data.tags])
            : [];

        const { data: newCardData, error } = await supabase
            .from("flashcards")
            .insert({
                front: data.front,
                back: data.back,
                deck_id: data.deckId || deckId,
                user_id: userId,
                tags: tagsArray
            })
            .select()
            .single();

        if (!error && newCardData) {
            // Only add to local state if it's for the current deck
            if (data.deckId === deckId || !data.deckId) {
                setCards([newCardData, ...cards]);
                if (deck) setDeck({ ...deck, cards_count: (deck.cards_count || 0) + 1 });
            }
            setShowAddCard(false);
            setToast({ isVisible: true, message: "Card criado com sucesso!" });
        } else if (error) {
            setToast({ isVisible: true, message: "Erro ao criar card", type: 'error' });
        }
    };

    const updateCard = async () => {
        if (!editingCard) return;
        setSaving(true);

        const { error } = await supabase
            .from("flashcards")
            .update({
                front: editingCard.front,
                back: editingCard.back,
                tags: editingCard.tags
            })
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
            if (deck) setDeck({ ...deck, cards_count: (deck.cards_count || 0) - 1 });
        }
    };

    const handleCreateSubDeck = async (data: any) => {
        if (!userId) {
            setToast({ isVisible: true, message: "Você precisa estar logado", type: 'error' });
            return;
        }
        const { data: newDeck, error } = await supabase
            .from("decks")
            .insert({
                user_id: userId,
                name: data.name,
                color: data.color,
                icon: data.icon,
                parent_id: deckId, // Sub-deck
                description: "Sub-deck",
                tags: []
            })
            .select()
            .single();

        if (!error && newDeck) {
            setSubDecks([newDeck, ...subDecks]);
            setShowCreateSubDeck(false);
        }
    };

    const updateDeckTags = async () => {
        if (!deck) return;
        const tags = deckTagsInput.split(",").map(t => t.trim()).filter(Boolean);

        const { error } = await supabase
            .from("decks")
            .update({ tags })
            .eq("id", deck.id);

        if (!error) {
            setDeck({ ...deck, tags });
            setIsEditingTags(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!deckToDelete) return;

        const { error } = await supabase
            .from("decks")
            .delete()
            .eq("id", deckToDelete);

        if (!error) {
            setSubDecks(subDecks.filter(d => d.id !== deckToDelete));
            setDeleteModalOpen(false);
            setDeckToDelete(null);
        }
    };

    const handleUpdateSubDeckIcon = async (deckId: string, icon: string) => {
        try {
            const { error } = await supabase
                .from("decks")
                .update({ icon })
                .eq("id", deckId);

            if (error) throw error;

            setSubDecks(prev => prev.map(d => d.id === deckId ? { ...d, icon } : d));
            setToast({ isVisible: true, message: "Ícone atualizado!" });
        } catch (error) {
            console.error("Error updating deck icon:", error);
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
                        user_id: userId
                    })
                    .select()
                    .single();

                if (data) {
                    setCards(prev => [data, ...prev]);
                }
            }

            if (deck) {
                setDeck({ ...deck, cards_count: (deck.cards_count || 0) + generatedCards.length });
            }

            setAiTopic("");
        } catch (error) {
            console.error("Error generating cards:", error);
            setToast({ isVisible: true, message: "Erro ao gerar cards. Tente novamente.", type: 'error' });
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
                            style={{ backgroundColor: `${deck.color || '#10B981'}20` }}
                        >
                            {deck.icon || '📚'}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">{deck.name}</h1>
                            <p className="text-gray-500">
                                {deck.cards_count || 0} cards • {deck.description || "Sem descrição"}
                            </p>

                            {/* Deck Tags */}
                            <div className="flex items-center gap-2 mt-2">
                                {isEditingTags ? (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={deckTagsInput}
                                            onChange={(e) => setDeckTagsInput(e.target.value)}
                                            className="px-2 py-1 text-sm border rounded-lg focus:outline-emerald-500"
                                            placeholder="Tags separadas por vírgula"
                                            onKeyDown={(e) => e.key === 'Enter' && updateDeckTags()}
                                        />
                                        <button onClick={updateDeckTags} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded"><Save size={16} /></button>
                                        <button onClick={() => setIsEditingTags(false)} className="p-1 text-gray-400 hover:bg-gray-50 rounded"><X size={16} /></button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingTags(true)}>
                                        <div className="flex gap-1">
                                            {deck.tags && deck.tags.length > 0 ? (
                                                deck.tags.map((tag, i) => (
                                                    <span key={i} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-md">#{tag}</span>
                                                ))
                                            ) : (
                                                <span className="text-gray-400 text-xs italic">Adicionar tags...</span>
                                            )}
                                        </div>
                                        <Edit2 size={12} className="text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Actions Bar */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                >
                    {/* Start Study */}
                    <Link
                        href={`/dashboard/anki?deck=${deck.id}`}
                        className="flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-white shadow-md hover:shadow-lg transition-all"
                        style={{ background: `linear-gradient(to right, ${deck.color || '#10B981'}, ${deck.color || '#10B981'}cc)` }}
                    >
                        <Play className="w-5 h-5" />
                        Iniciar Revisão
                    </Link>

                    {/* Add Card */}
                    <button
                        onClick={() => setShowAddCard(true)}
                        className="flex items-center justify-center gap-2 py-4 bg-white border-2 border-emerald-500 rounded-xl font-semibold text-emerald-600 hover:bg-emerald-50 transition-all"
                    >
                        <Plus className="w-5 h-5" />
                        Adicionar Card
                    </button>

                    {/* Create Sub-deck */}
                    <button
                        onClick={() => setShowCreateSubDeck(true)}
                        className="flex items-center justify-center gap-2 py-4 bg-white border-2 border-dashed border-gray-300 rounded-xl font-semibold text-gray-500 hover:border-emerald-300 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                    >
                        <Layers className="w-5 h-5" />
                        Criar Sub-baralho
                    </button>

                    {/* Options */}
                    <button
                        onClick={() => setSettingsModalOpen(true)}
                        className="flex items-center justify-center gap-2 py-4 bg-white border border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
                    >
                        <Sparkles className="w-5 h-5 text-gray-400" />
                        Opções
                    </button>
                </motion.div>


                {/* Sub-decks Section */}
                {subDecks.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-800">Sub-baralhos</h3>
                        </div>
                        <DecksView
                            decks={subDecks}
                            onSelectDeck={(id) => router.push(`/dashboard/anki?deck=${id}`)}
                            onManageDeck={(id) => router.push(`/dashboard/decks/${id}`)}
                            onCreateDeck={() => setShowCreateSubDeck(true)}
                            onDeleteDeck={(id, e) => {
                                e.stopPropagation();
                                setDeckToDelete(id);
                                setDeleteModalOpen(true);
                            }}
                            onUpdateDeckIcon={handleUpdateSubDeckIcon}
                            hideHeader={true}
                            showSearch={true}
                            showCreateButton={false}
                            compact={true}
                        />
                    </motion.div>
                )}

                {/* Empty Sub-decks CTA if none (optional, maybe just show the button in main actions?) */}
                {/* Actually let's add a "Create Sub-deck" button to main actions or just rely on the main Create button functionality? 
                    The user asked for functions like adding subgroups. 
                    I'll add a specific "Add Sub-deck" button to the Actions Bar.
                */}


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
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-800">Cards neste baralho</h3>
                            <span className="text-sm text-gray-500 font-medium">{filteredCards.length} itens</span>
                        </div>
                        <CardTable
                            cards={filteredCards}
                            onEdit={setEditingCard}
                            onDelete={deleteCard}
                        />
                    </div>
                )}

                {/* Add Card Modal - Using the complete CreateAnkiModal */}
                <CreateAnkiModal
                    isOpen={showAddCard}
                    onClose={() => setShowAddCard(false)}
                    onCreateCard={handleCreateCardModal}
                    onCreateDeck={() => { }} // Not used here
                    decks={allDecks}
                    initialTab="card"
                    initialSelectedDeckId={deckId}
                />

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

                                    <div>
                                        <label className="text-sm font-semibold text-gray-700 block mb-2">Tags</label>
                                        <input
                                            type="text"
                                            value={editingCard.tags ? editingCard.tags.join(', ') : ''}
                                            onChange={(e) => setEditingCard({ ...editingCard, tags: e.target.value.split(',') })}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                {/* Create Sub-deck Modal */}
                <CreateAnkiModal
                    isOpen={showCreateSubDeck}
                    onClose={() => setShowCreateSubDeck(false)}
                    onCreateCard={() => { }} // Not used here
                    onCreateDeck={handleCreateSubDeck}
                    decks={[]} // Not needed for deck creation
                    initialTab="deck"
                    initialParentId={deckId}
                />

                <DeckSettingsModal
                    isOpen={settingsModalOpen}
                    onClose={() => setSettingsModalOpen(false)}
                    deckId={deckId}
                    onUpdate={() => {
                        fetchDeckAndCards();
                        setToast({ isVisible: true, message: "Configurações atualizadas!" });
                    }}
                />

                <DeleteConfirmModal
                    isOpen={deleteModalOpen}
                    onClose={() => setDeleteModalOpen(false)}
                    onConfirm={handleConfirmDelete}
                    title="Excluir Sub-baralho"
                    description="Tem certeza que deseja excluir este sub-baralho? Todos os cards e sub-baralhos dentro dele também serão excluídos permanentemente."
                />

                <Toast
                    isVisible={toast.isVisible}
                    message={toast.message}
                    onClose={() => setToast({ ...toast, isVisible: false })}
                />
            </div>
        </div>
    );
}
