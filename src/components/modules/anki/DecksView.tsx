import { motion, AnimatePresence } from "framer-motion";
import { Plus, Play, Layers, MoreHorizontal, Search, BookOpen, Clock, ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

// Available icons for deck selection
const DECK_ICONS = [
    "📚", "📖", "📝", "✏️", "🎓", "💡", "🧠", "🔬", "🧪", "⚗️",
    "🔭", "🌍", "🌎", "🗺️", "🏛️", "⚖️", "💼", "📊", "📈", "💰",
    "🩺", "💊", "🧬", "🦠", "🫀", "🫁", "🦴", "🧫", "🏥", "⚕️",
    "🎨", "🎭", "🎬", "🎵", "🎹", "🎸", "📷", "🎯", "⚽", "🏀",
    "💻", "⌨️", "🖥️", "📱", "🔧", "⚙️", "🤖", "🚀", "✈️", "🚗",
    "🇧🇷", "🇺🇸", "🇬🇧", "🇪🇸", "🇫🇷", "🇩🇪", "🇮🇹", "🇯🇵", "🇨🇳", "🇰🇷"
];

interface Deck {
    id: string;
    name: string;
    description?: string | null;
    color?: string | null;
    icon?: string | null;
    cards_count?: number;
    review_count?: number; // Added to support "para revisar"
}

interface DecksViewProps {
    decks: Deck[];
    onSelectDeck: (deckId: string) => void;
    onManageDeck?: (deckId: string) => void; // New prop for management
    onCreateDeck: () => void;
    onDeleteDeck?: (deckId: string, e: React.MouseEvent) => void;
    onUpdateDeckIcon?: (deckId: string, icon: string) => void; // New prop for icon update
    hideHeader?: boolean;
    showSearch?: boolean; // New prop to show search bar even if header is hidden
    showCreateButton?: boolean; // New prop to control the "Novo Deck" button
    compact?: boolean; // New prop for compact layout
    showBackButton?: boolean;
}

export default function DecksView({
    decks,
    onSelectDeck,
    onManageDeck,
    onCreateDeck,
    onDeleteDeck,
    onUpdateDeckIcon,
    hideHeader = false,
    showSearch = true,
    showCreateButton = true,
    compact = false,
    showBackButton = true
}: DecksViewProps) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [loadingDeckId, setLoadingDeckId] = useState<string | null>(null);
    const [iconPickerDeckId, setIconPickerDeckId] = useState<string | null>(null);

    const filteredDecks = decks.filter(deck =>
        deck.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className={compact ? "w-full space-y-4" : "p-6 md:p-8 w-full max-w-7xl mx-auto space-y-6"}>
            {/* Header Area */}
            {!hideHeader && (
                <div className="flex flex-col gap-6 border-b border-gray-100 dark:border-white/5 pb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl text-emerald-600 dark:text-emerald-400">
                            <Layers size={32} />
                        </div>
                        <h2 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                            Meus Baralhos
                        </h2>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-lg ml-1 max-w-2xl">Organize seus flashcards em baralhos especializados para o seu aprendizado</p>

                    <div className="flex items-center justify-between mt-2">
                        {showCreateButton && (
                            <Button
                                onClick={onCreateDeck}
                                className="bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold rounded-2xl px-8 h-12 shadow-lg shadow-emerald-500/10 transition-all shrink-0 hover:scale-[1.02] active:scale-[0.98]"
                            >
                                <Plus className="w-5 h-5 mr-2" strokeWidth={3} />
                                Novo Baralho
                            </Button>
                        )}

                        {showBackButton && (
                            <Button
                                onClick={() => router.push("/dashboard/anki")}
                                variant="ghost"
                                className="text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-2xl px-6 transition-all font-semibold"
                            >
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                Voltar
                            </Button>
                        )}
                    </div>
                </div>
            )}

            {/* Search Bar & Actions */}
            <div className="w-full">
                {showSearch && (
                    <div className="relative group w-full">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-emerald-500 transition-colors" />
                        <Input
                            placeholder="Filtrar por nome do baralho..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-14 h-16 bg-white dark:bg-[#181818] border border-gray-100 dark:border-white/5 shadow-sm dark:shadow-black/40 rounded-3xl text-gray-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-600 focus-visible:ring-2 focus-visible:ring-emerald-500/10 dark:focus-visible:ring-emerald-500/20 focus-visible:border-emerald-500/30 transition-all text-lg"
                        />
                    </div>
                )}
            </div>

            {/* Grid */}
            <div className={compact
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            }>
                {filteredDecks.map((deck) => (
                    <motion.div
                        key={deck.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ y: -4, backgroundColor: "var(--deck-hover-bg)" }}
                        onClick={() => onManageDeck && onManageDeck(deck.id)}
                        className="bg-white dark:bg-[#1f1f1f] rounded-[32px] p-7 shadow-lg dark:shadow-black/50 transition-all border border-gray-100 dark:border-white/5 group relative flex flex-col gap-6 cursor-pointer [--deck-hover-bg:#F8FAFC] dark:[--deck-hover-bg:#2a2a2a]"
                    >
                        {/* Title and Icon Row */}
                        <div className="flex items-center gap-5">
                            {/* Icon Picker */}
                            <div className="relative">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setIconPickerDeckId(iconPickerDeckId === deck.id ? null : deck.id);
                                    }}
                                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border border-gray-100 dark:border-white/10 hover:scale-105 transition-all cursor-pointer relative overflow-hidden group/icon"
                                    style={{
                                        backgroundColor: `${deck.color}25`,
                                        borderColor: `${deck.color}40`,
                                        boxShadow: `0 8px 16px -4px ${deck.color}30`
                                    }}
                                    title="Clique para mudar o ícone"
                                >
                                    <div className="absolute inset-0 bg-gray-50/50 dark:bg-white/5 opacity-0 group-hover/icon:opacity-100 transition-opacity" />
                                    {deck.icon || '📚'}
                                </button>

                                <AnimatePresence>
                                    {iconPickerDeckId === deck.id && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.9, y: -10 }}
                                            animate={{ opacity: 1, scale: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.9, y: -10 }}
                                            className="absolute top-16 left-0 z-50 bg-white dark:bg-[#1e1e1e] rounded-2xl border border-gray-100 dark:border-white/10 shadow-2xl dark:shadow-black/60 p-3 w-64"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">Escolher Ícone</div>
                                            <div className="grid grid-cols-8 gap-1 max-h-40 overflow-y-auto scrollbar-thin">
                                                {DECK_ICONS.map((icon) => (
                                                    <button
                                                        key={icon}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            if (onUpdateDeckIcon) {
                                                                onUpdateDeckIcon(deck.id, icon);
                                                            }
                                                            setIconPickerDeckId(null);
                                                        }}
                                                        className={`w-7 h-7 rounded-lg flex items-center justify-center text-lg hover:bg-emerald-500/20 hover:scale-110 transition-all ${deck.icon === icon ? 'bg-emerald-500/30 ring-2 ring-emerald-400' : ''}`}
                                                    >
                                                        {icon}
                                                    </button>
                                                ))}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="flex flex-col">
                                <h3 className="font-bold text-gray-900 dark:text-white text-2xl tracking-tight">{deck.name}</h3>
                                <div className="flex items-center gap-4 mt-2">
                                    <div className="flex items-center gap-2 text-slate-400 text-sm font-semibold">
                                        <Layers size={16} className="text-emerald-500/70" />
                                        <span>{deck.cards_count || 0} <span className="font-medium opacity-60">cards</span></span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-400 text-sm font-semibold">
                                        <Clock size={16} className="text-orange-500/70" />
                                        <span>{deck.review_count || 0} <span className="font-medium opacity-60">revisar</span></span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Row */}
                        <div className="flex items-center justify-between">
                            <Button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setLoadingDeckId(deck.id);
                                    onSelectDeck(deck.id);
                                }}
                                disabled={loadingDeckId === deck.id}
                                className="flex-1 bg-emerald-50 dark:bg-emerald-500/10 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-base h-12 rounded-2xl transition-all flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-70 border border-emerald-100 dark:border-emerald-500/20"
                            >
                                {loadingDeckId === deck.id ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <Play size={18} className="fill-emerald-600 dark:fill-emerald-400" />
                                )}
                                {loadingDeckId === deck.id ? 'Carregando...' : 'Estudar Agora'}
                            </Button>

                            {onDeleteDeck && (
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteDeck(deck.id, e);
                                    }}
                                    className="ml-4 p-3 hover:bg-red-500/10 text-slate-600 hover:text-red-500 rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                                    title="Excluir"
                                >
                                    <MoreHorizontal size={24} />
                                </button>
                            )}
                        </div>
                    </motion.div>
                ))}

                {/* Add New Deck Card */}

            </div>
        </div >
    );
}
