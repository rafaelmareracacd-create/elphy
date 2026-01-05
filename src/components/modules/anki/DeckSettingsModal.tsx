import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save, Layers, Clock, Zap, Target } from "lucide-react";
import { supabase } from "@/lib/supabase";

// Reuse icons from DecksView or define here
const DECK_ICONS = [
    "📚", "📖", "📝", "✏️", "🎓", "💡", "🧠", "🔬", "🧪", "⚗️",
    "🔭", "🌍", "🌎", "🗺️", "🏛️", "⚖️", "💼", "📊", "📈", "💰",
    "🩺", "💊", "🧬", "🦠", "🫀", "🫁", "🦴", "🧫", "🏥", "⚕️",
    "🎨", "🎭", "🎬", "🎵", "🎹", "🎸", "📷", "🎯", "⚽", "🏀",
    "💻", "⌨️", "🖥️", "📱", "🔧", "⚙️", "🤖", "🚀", "✈️", "🚗",
    "🇧🇷", "🇺🇸", "🇬🇧", "🇪🇸", "🇫🇷", "🇩🇪", "🇮🇹", "🇯🇵", "🇨🇳", "🇰🇷"
];

interface DeckSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    deckId: string;
    onUpdate: () => void;
}

export default function DeckSettingsModal({ isOpen, onClose, deckId, onUpdate }: DeckSettingsModalProps) {
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [name, setName] = useState("");
    const [icon, setIcon] = useState("📚");
    const [limitNew, setLimitNew] = useState(20);
    const [limitReview, setLimitReview] = useState(100);

    useEffect(() => {
        if (isOpen && deckId) {
            fetchDeckSettings();
        }
    }, [isOpen, deckId]);

    const fetchDeckSettings = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("decks")
            .select("name, icon, limit_new, limit_review")
            .eq("id", deckId)
            .single();

        if (data) {
            setName(data.name);
            setIcon(data.icon || "📚");
            setLimitNew(data.limit_new || 20);
            setLimitReview(data.limit_review || 100);
        }
        setLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        const { error } = await supabase
            .from("decks")
            .update({
                name,
                icon,
                limit_new: limitNew,
                limit_review: limitReview
            })
            .eq("id", deckId);

        if (!error) {
            onUpdate();
            onClose();
        }
        setSaving(false);
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl"
                >
                    {/* Header */}
                    <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Opções do Baralho</h2>
                            <p className="text-sm text-gray-500 mt-1">Personalize seus limites de estudo</p>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <X size={20} className="text-gray-400" />
                        </button>
                    </div>

                    {loading ? (
                        <div className="p-12 flex justify-center">
                            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : (
                        <div className="p-8 space-y-8">
                            {/* Visual Identity */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Layers size={14} /> Identidade
                                </h3>
                                <div className="flex gap-4">
                                    <div className="relative group shrink-0">
                                        <div className="w-16 h-16 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center text-3xl shadow-sm">
                                            {icon}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <label className="text-sm font-semibold text-gray-700 mb-1.5 block">Nome do Baralho</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all font-medium"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Limits Config */}
                            <div className="space-y-6">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                    <Target size={14} /> Limites Diários
                                </h3>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                                        <div className="flex items-center gap-2 text-blue-700 font-semibold mb-3">
                                            <Zap size={16} />
                                            Novos Cards
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="number"
                                                value={limitNew}
                                                onChange={(e) => setLimitNew(Number(e.target.value))}
                                                className="w-full bg-white border border-blue-200 text-blue-900 font-bold text-xl px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center"
                                            />
                                            <span className="text-xs font-medium text-blue-400 uppercase">/ dia</span>
                                        </div>
                                        <p className="text-[10px] text-blue-400 mt-2 leading-tight">
                                            Novos conceitos para aprender hoje.
                                        </p>
                                    </div>

                                    <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                                        <div className="flex items-center gap-2 text-emerald-700 font-semibold mb-3">
                                            <Clock size={16} />
                                            Revisões
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="number"
                                                value={limitReview}
                                                onChange={(e) => setLimitReview(Number(e.target.value))}
                                                className="w-full bg-white border border-emerald-200 text-emerald-900 font-bold text-xl px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center"
                                            />
                                            <span className="text-xs font-medium text-emerald-400 uppercase">/ dia</span>
                                        </div>
                                        <p className="text-[10px] text-emerald-400 mt-2 leading-tight">
                                            Cards antigos para revisar hoje.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-200 rounded-xl transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-70 disabled:scale-100"
                        >
                            <Save size={16} />
                            {saving ? "Salvando..." : "Salvar Alterações"}
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

