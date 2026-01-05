import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Layers, FileQuestion, Plus, Sparkles, Maximize2, Minimize2, ChevronDown, Check } from "lucide-react";
import RichTextEditor from "@/components/ui/RichTextEditor";

interface CreateAnkiModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateCard: (data: any) => void;
    onCreateDeck: (data: any) => void;
    decks: Deck[];
    initialTab?: 'card' | 'deck';
    initialParentId?: string;
    initialSelectedDeckId?: string;
    initialCard?: { id: string; front: string; back: string; deck_id: string; tags?: string[] } | null;
    deckOnly?: boolean;
}

interface Deck {
    id: string;
    name: string;
    parent_id?: string | null;
}

const COLORS = [
    { label: "Esmeralda", value: "#10b981" },
    { label: "Azul", value: "#3b82f6" },
    { label: "Roxo", value: "#a855f7" },
    { label: "Rosa", value: "#ec4899" },
    { label: "Laranja", value: "#f97316" },
    { label: "Vermelho", value: "#ef4444" },
];

export default function CreateAnkiModal({
    isOpen,
    onClose,
    onCreateCard,
    onCreateDeck,
    decks,
    initialTab = 'card',
    initialParentId,
    initialSelectedDeckId,
    initialCard = null,
    deckOnly = false
}: CreateAnkiModalProps) {
    const [activeTab, setActiveTab] = useState<'card' | 'deck'>(initialTab);
    const [isMaximized, setIsMaximized] = useState(false);
    const [isDeckSelectorOpen, setIsDeckSelectorOpen] = useState(false);
    const [isSubDeckSelectorOpen, setIsSubDeckSelectorOpen] = useState(false);

    // Card State
    const [front, setFront] = useState("");
    const [back, setBack] = useState("");
    const [selectedDeckId, setSelectedDeckId] = useState("");
    const [selectedSubDeckId, setSelectedSubDeckId] = useState("");
    const [tag, setTag] = useState("");

    // Deck State
    const [deckName, setDeckName] = useState("");
    const [deckColor, setDeckColor] = useState(COLORS[0].value);
    const [deckIcon, setDeckIcon] = useState("📚");

    // Filter sub-decks based on parent selection
    const availableSubDecks = decks.filter(d => d.parent_id === selectedDeckId);

    // Helper to decode HTML entities (fixes double-escaping issue)
    const cleanContent = (content: string) => {
        if (!content) return "";
        try {
            // Check for escaped HTML tags like &lt;p&gt;
            if (content.includes('&lt;') || content.includes('&gt;')) {
                const parser = new DOMParser();
                const decoded = parser.parseFromString(content, 'text/html').body.textContent;
                return decoded || content;
            }
        } catch (e) {
            console.error("Error decoding HTML:", e);
        }
        return content;
    };

    useEffect(() => {
        if (isOpen) {
            console.log("CreateAnkiModal opened. initialCard:", initialCard);
            setActiveTab(deckOnly ? 'deck' : initialTab);
            setIsDeckSelectorOpen(false);
            setIsSubDeckSelectorOpen(false);

            if (initialCard) {
                setFront(cleanContent(initialCard.front));
                setBack(cleanContent(initialCard.back));
                setTag(initialCard.tags?.join(', ') || "");
                setSelectedDeckId(initialCard.deck_id);
                // Sub-deck handled by sub-deck filter if it exists
                const deck = decks.find(d => d.id === initialCard.deck_id);
                if (deck?.parent_id) {
                    setSelectedDeckId(deck.parent_id);
                    setSelectedSubDeckId(deck.id);
                } else {
                    setSelectedDeckId(initialCard.deck_id);
                }
            } else {
                setFront("");
                setBack("");
                setTag("");
                setDeckName("");

                if (decks.length > 0) {
                    if (initialSelectedDeckId) {
                        const deck = decks.find(d => d.id === initialSelectedDeckId);
                        if (deck?.parent_id) {
                            setSelectedDeckId(deck.parent_id);
                            setSelectedSubDeckId(deck.id);
                        } else {
                            setSelectedDeckId(initialSelectedDeckId);
                            setSelectedSubDeckId("");
                        }
                    } else if (!selectedDeckId) {
                        const topLevelDecks = decks.filter(d => !d.parent_id);
                        if (topLevelDecks.length > 0) {
                            setSelectedDeckId(topLevelDecks[0].id);
                        }
                        setSelectedSubDeckId("");
                    }
                }
            }
        }
    }, [isOpen, initialTab, decks, initialSelectedDeckId, initialCard]);

    // Reset sub-deck when parent changes
    useEffect(() => {
        setSelectedSubDeckId("");
        setIsSubDeckSelectorOpen(false);
    }, [selectedDeckId]);

    if (!isOpen) return null;

    const handleCardSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const finalDeckId = selectedSubDeckId || selectedDeckId;
        if (front && back && finalDeckId) {
            onCreateCard({
                id: initialCard?.id, // Pass ID if editing
                front,
                back,
                deckId: finalDeckId,
                tags: tag.trim()
            });
            if (!initialCard) { // Reset only if not editing
                setFront("");
                setBack("");
                setTag("");
            }
        }
    };

    const handleDeckSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!deckName) return;
        onCreateDeck({
            name: deckName,
            color: deckColor,
            icon: deckIcon,
            parentId: initialParentId
        });
        setDeckName("");
        onClose();
    };

    const getModalClasses = () => {
        if (activeTab === 'deck') return 'max-w-md max-h-[85vh]';
        return isMaximized
            ? 'max-w-[98vw] h-[95vh] rounded-xl'
            : 'max-w-3xl max-h-[85vh]';
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-2 sm:p-4"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            onClick={(e) => {
                                e.stopPropagation();
                                setIsDeckSelectorOpen(false);
                                setIsSubDeckSelectorOpen(false);
                            }}
                            className={`bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl w-full overflow-hidden flex flex-col border border-gray-100 dark:border-white/5 transition-all duration-300 ${getModalClasses()} rounded-3xl`}
                        >
                            {/* Header */}
                            <div className="px-6 py-5 border-b border-gray-100 dark:border-white/5 flex items-center justify-between bg-white/50 dark:bg-slate-800/50 sticky top-0 z-10 shrink-0">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight flex items-center gap-2">
                                    <Plus className="w-5 h-5 text-emerald-500" />
                                    {initialCard ? 'Editar Flashcard' : (activeTab === 'card' ? 'Novo Flashcard' : 'Novo Baralho')}
                                </h2>
                                <div className="flex items-center gap-2">
                                    {activeTab === 'card' && (
                                        <button
                                            onClick={() => setIsMaximized(!isMaximized)}
                                            className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-white transition-all"
                                            title={isMaximized ? "Restaurar" : "Maximizar"}
                                        >
                                            {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                        </button>
                                    )}
                                    <button
                                        onClick={onClose}
                                        className="p-2 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl text-gray-400 dark:text-gray-500 hover:text-red-500 transition-all"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>

                            {/* Tabs */}
                            {!deckOnly && (
                                <div className="flex px-6 bg-white/30 dark:bg-slate-900/30 border-b border-gray-100/50 dark:border-white/5">
                                    <button
                                        onClick={() => setActiveTab('card')}
                                        className={`py-3 text-[11px] font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === 'card'
                                            ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500'
                                            : 'text-gray-400 dark:text-slate-500 border-transparent hover:text-gray-600 dark:hover:text-white'
                                            }`}
                                    >
                                        Flashcard
                                    </button>
                                    <div className="w-6" />
                                    <button
                                        onClick={() => setActiveTab('deck')}
                                        className={`py-3 text-[11px] font-bold uppercase tracking-widest transition-all border-b-2 ${activeTab === 'deck'
                                            ? 'text-emerald-600 dark:text-emerald-400 border-emerald-500'
                                            : 'text-gray-400 dark:text-slate-500 border-transparent hover:text-gray-600 dark:hover:text-white'
                                            }`}
                                    >
                                        Baralho
                                    </button>
                                </div>
                            )}

                            {/* Content */}
                            <div className="p-6 overflow-y-auto custom-scrollbar bg-gray-50/20 dark:bg-slate-950/20 flex-1">
                                {activeTab === 'card' ? (
                                    <form onSubmit={handleCardSubmit} className="flex flex-col h-full">
                                        {/* Selectors Area */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 shrink-0 relative z-20">
                                            {/* Deck Selector */}
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2 px-3 py-1 bg-white/50 dark:bg-slate-800/50 border border-gray-100 dark:border-white/5 rounded-lg text-[9px] font-extrabold text-gray-400 dark:text-slate-500 uppercase tracking-widest shadow-sm w-fit">
                                                    <Layers size={11} />
                                                    <span>Baralho</span>
                                                </div>

                                                <div className="relative h-10">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setIsDeckSelectorOpen(!isDeckSelectorOpen);
                                                            setIsSubDeckSelectorOpen(false);
                                                        }}
                                                        className="w-full h-full text-left px-4 py-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 rounded-xl text-sm text-gray-700 dark:text-slate-300 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5 transition-all flex items-center justify-between shadow-sm group"
                                                    >
                                                        <div className="flex items-center gap-2.5 truncate">
                                                            {selectedDeckId ? (
                                                                <>
                                                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] shrink-0" />
                                                                    <span className="truncate font-semibold text-gray-700 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                                                                        {decks.find(d => d.id === selectedDeckId)?.name || "Selecione..."}
                                                                    </span>
                                                                </>
                                                            ) : (
                                                                <span className="text-gray-400 italic">Selecione...</span>
                                                            )}
                                                        </div>
                                                        <ChevronDown size={14} className={`text-gray-400 dark:text-slate-500 transition-transform duration-300 ${isDeckSelectorOpen ? 'rotate-180 text-emerald-500 dark:text-emerald-400' : ''}`} />
                                                    </button>

                                                    <AnimatePresence>
                                                        {isDeckSelectorOpen && (
                                                            <motion.div
                                                                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                                                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                                                                transition={{ duration: 0.2, ease: "easeOut" }}
                                                                className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-gray-100 dark:border-white/5 rounded-2xl shadow-2xl dark:shadow-black/50 max-h-64 overflow-y-auto z-50 p-1.5 flex flex-col gap-1"
                                                            >
                                                                {decks.filter(d => !d.parent_id).map(deck => (
                                                                    <button
                                                                        key={deck.id}
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setSelectedDeckId(deck.id);
                                                                            setIsDeckSelectorOpen(false);
                                                                        }}
                                                                        className={`
                                                                        w-full text-left px-3.5 py-2.5 rounded-xl text-sm transition-all flex items-center justify-between group
                                                                        ${selectedDeckId === deck.id ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold' : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'}
                                                                    `}
                                                                    >
                                                                        <div className="flex items-center gap-2">
                                                                            <div className={`w-1.5 h-1.5 rounded-full transition-all ${selectedDeckId === deck.id ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-slate-700 group-hover:bg-gray-300 dark:group-hover:bg-slate-600'}`} />
                                                                            <span className="truncate">{deck.name}</span>
                                                                        </div>
                                                                        {selectedDeckId === deck.id && <Check size={14} className="text-emerald-500 shrink-0" strokeWidth={3} />}
                                                                    </button>
                                                                ))}
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>
                                            </div>

                                            {/* Sub-deck Selector */}
                                            {selectedDeckId && availableSubDecks.length > 0 && (
                                                <div className="flex flex-col gap-2">
                                                    <div className="flex items-center gap-2 px-3 py-1 bg-white/50 dark:bg-slate-800/50 border border-gray-100 dark:border-white/5 rounded-lg text-[9px] font-extrabold text-gray-400 dark:text-slate-500 uppercase tracking-widest shadow-sm w-fit">
                                                        <Layers size={11} className="text-emerald-400" />
                                                        <span>Sub-baralho</span>
                                                    </div>

                                                    <div className="relative h-10">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setIsSubDeckSelectorOpen(!isSubDeckSelectorOpen);
                                                                setIsDeckSelectorOpen(false);
                                                            }}
                                                            className="w-full h-full text-left px-4 py-2 bg-white dark:bg-slate-900 border border-gray-100 dark:border-white/5 rounded-xl text-sm text-gray-700 dark:text-slate-300 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/5 transition-all flex items-center justify-between shadow-sm group"
                                                        >
                                                            <div className="flex items-center gap-2.5 truncate">
                                                                {selectedSubDeckId ? (
                                                                    <>
                                                                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] shrink-0" />
                                                                        <span className="truncate font-semibold text-gray-700 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                                                                            {availableSubDecks.find(d => d.id === selectedSubDeckId)?.name}
                                                                        </span>
                                                                    </>
                                                                ) : (
                                                                    <span className="text-gray-400 italic">Opcional...</span>
                                                                )}
                                                            </div>
                                                            <ChevronDown size={14} className={`text-gray-400 dark:text-slate-500 transition-transform duration-300 ${isSubDeckSelectorOpen ? 'rotate-180 text-emerald-500 dark:text-emerald-400' : ''}`} />
                                                        </button>

                                                        <AnimatePresence>
                                                            {isSubDeckSelectorOpen && (
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: -8, scale: 0.98 }}
                                                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                                                    exit={{ opacity: 0, y: -8, scale: 0.98 }}
                                                                    transition={{ duration: 0.2, ease: "easeOut" }}
                                                                    className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-gray-100 dark:border-white/5 rounded-2xl shadow-2xl dark:shadow-black/50 max-h-64 overflow-y-auto z-50 p-1.5 flex flex-col gap-1"
                                                                >
                                                                    {availableSubDecks.map(deck => (
                                                                        <button
                                                                            key={deck.id}
                                                                            type="button"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setSelectedSubDeckId(deck.id);
                                                                                setIsSubDeckSelectorOpen(false);
                                                                            }}
                                                                            className={`
                                                                        w-full text-left px-3.5 py-2.5 rounded-xl text-sm transition-all flex items-center justify-between group
                                                                        ${selectedSubDeckId === deck.id ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold' : 'hover:bg-gray-50 dark:hover:bg-white/5 text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white'}
                                                                    `}
                                                                        >
                                                                            <div className="flex items-center gap-2">
                                                                                <div className={`w-1.5 h-1.5 rounded-full transition-all ${selectedSubDeckId === deck.id ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-slate-700 group-hover:bg-gray-300 dark:group-hover:bg-slate-600'}`} />
                                                                                <span className="truncate">{deck.name}</span>
                                                                            </div>
                                                                            {selectedSubDeckId === deck.id && <Check size={14} className="text-emerald-500 shrink-0" strokeWidth={3} />}
                                                                        </button>
                                                                    ))}

                                                                    {selectedSubDeckId && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                setSelectedSubDeckId("");
                                                                                setIsSubDeckSelectorOpen(false);
                                                                            }}
                                                                            className="w-full text-center py-2 text-xs text-gray-400 dark:text-slate-500 hover:text-emerald-500 transition-colors mt-1 border-t border-gray-50 dark:border-white/5 pt-2"
                                                                        >
                                                                            Limpar seleção
                                                                        </button>
                                                                    )}
                                                                </motion.div>
                                                            )}
                                                        </AnimatePresence>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Editor Area (Split Vertical) */}
                                        <div className="flex-1 flex flex-col gap-5 min-h-0 relative z-10">
                                            <div className="flex-1 flex flex-col min-h-0">
                                                <div className="flex items-center justify-between mb-2 px-1">
                                                    <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em]">Frente</label>
                                                </div>
                                                <RichTextEditor
                                                    key={`front-${initialCard?.id || 'new'}`}
                                                    value={front}
                                                    onChange={setFront}
                                                    placeholder="Qual a pergunta?"
                                                    className="flex-1 min-h-[140px]"
                                                />
                                            </div>

                                            <div className="flex-1 flex flex-col min-h-0">
                                                <div className="flex items-center justify-between mb-2 px-1">
                                                    <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em]">Verso</label>
                                                </div>
                                                <RichTextEditor
                                                    key={`back-${initialCard?.id || 'new'}`}
                                                    value={back}
                                                    onChange={setBack}
                                                    placeholder="E a resposta?"
                                                    className="flex-1 min-h-[140px]"
                                                />
                                            </div>
                                        </div>

                                        {/* Bottom Bar: Tags & Actions */}
                                        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/5 flex items-center gap-4 shrink-0">
                                            <div className="flex-1 relative">
                                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                                                    <Sparkles size={15} className="text-emerald-400" />
                                                </div>
                                                <input
                                                    type="text"
                                                    value={tag}
                                                    onChange={(e) => setTag(e.target.value)}
                                                    placeholder="Adicionar etiquetas..."
                                                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-100 dark:border-white/5 focus:border-emerald-500 dark:focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm text-gray-700 dark:text-slate-300 placeholder:text-gray-300 dark:placeholder:text-slate-600 transition-all bg-white dark:bg-slate-900 shadow-sm"
                                                />
                                            </div>

                                            <button
                                                type="submit"
                                                className="px-10 py-3 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white text-sm font-bold rounded-2xl shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                                                disabled={!selectedDeckId || !front || !back}
                                            >
                                                <Plus size={20} strokeWidth={3} />
                                                <span>{initialCard ? 'Salvar Alterações' : 'Adicionar Card'}</span>
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <form onSubmit={handleDeckSubmit} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">Nome do Baralho</label>
                                            <input
                                                type="text"
                                                value={deckName}
                                                onChange={(e) => setDeckName(e.target.value)}
                                                placeholder="Ex: Inglês, Medicina..."
                                                className="w-full px-4 py-3 rounded-2xl border border-gray-100 dark:border-white/5 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm text-gray-700 dark:text-slate-300 placeholder:text-gray-300 dark:placeholder:text-slate-700 transition-all bg-white dark:bg-slate-900 shadow-sm"
                                                autoFocus
                                            />
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">Escolha uma Cor</label>
                                            <div className="flex gap-3 flex-wrap p-1">
                                                {COLORS.map(c => (
                                                    <button
                                                        key={c.value}
                                                        type="button"
                                                        onClick={() => setDeckColor(c.value)}
                                                        className={`w-8 h-8 rounded-full transition-all relative ${deckColor === c.value ? 'ring-2 ring-emerald-500 ring-offset-4 scale-110 shadow-lg' : 'hover:scale-110 opacity-60 hover:opacity-100'}`}
                                                        style={{ backgroundColor: c.value }}
                                                        title={c.label}
                                                    >
                                                        {deckColor === c.value && (
                                                            <div className="absolute inset-0 flex items-center justify-center">
                                                                <Check size={14} className="text-white drop-shadow-sm" strokeWidth={4} />
                                                            </div>
                                                        )}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">Ícone</label>
                                            <div className="flex gap-2.5 overflow-x-auto pb-3 pt-1 custom-scrollbar px-1">
                                                {['📚', '🧠', '🌎', '🔬', '⚖️', '💻', '🎨', '🔥', '💡', '📝', '⚡', '🌟'].map(icon => (
                                                    <button
                                                        key={icon}
                                                        type="button"
                                                        onClick={() => setDeckIcon(icon)}
                                                        className={`w-11 h-11 flex-shrink-0 rounded-xl border-2 flex items-center justify-center transition-all text-xl ${deckIcon === icon ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 shadow-lg shadow-emerald-500/10' : 'border-gray-50 dark:border-white/5 bg-white dark:bg-slate-900 hover:border-gray-200 dark:hover:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                                                    >
                                                        {icon}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full py-3.5 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-white text-sm font-bold rounded-2xl shadow-xl shadow-emerald-500/20 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
                                            disabled={!deckName}
                                        >
                                            <Plus size={18} strokeWidth={3} />
                                            Criar Baralho Agora
                                        </button>
                                    </form>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
