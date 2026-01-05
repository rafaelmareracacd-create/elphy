import { Edit2, Trash2, Calendar, Tag, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface BaseCard {
    id: string;
    front: string;
    back: string;
    tags: string[];
    next_review?: string;
}

interface CardTableProps<T extends BaseCard> {
    cards: T[];
    onEdit: (card: T) => void;
    onDelete: (cardId: string) => void;
}

// Strip HTML tags for clean text preview
const stripHtml = (html: string): string => {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, '').trim();
};

export default function CardTable<T extends BaseCard>({ cards, onEdit, onDelete }: CardTableProps<T>) {
    if (cards.length === 0) return null;

    return (
        <div className="w-full overflow-hidden bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/40">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse table-fixed">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest w-[40%] border-r border-gray-50/50">Frente (Pergunta)</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest w-[35%] border-r border-gray-50/50">Verso (Resposta)</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest w-[15%] border-r border-gray-50/50">Tags</th>
                            <th className="px-6 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest w-[10%] text-center">Ações</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {cards.map((card) => (
                            <tr
                                key={card.id}
                                className="hover:bg-emerald-50/30 transition-colors group"
                            >
                                <td className="px-6 py-4 border-r border-gray-50/50">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-semibold text-gray-900 line-clamp-2 leading-relaxed">{stripHtml(card.front)}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 border-r border-gray-50/50">
                                    <span className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{stripHtml(card.back)}</span>
                                </td>
                                <td className="px-6 py-4 border-r border-gray-50/50">
                                    <div className="flex flex-wrap gap-1.5">
                                        {card.tags && card.tags.length > 0 ? (
                                            card.tags.map((tag, i) => (
                                                <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-md bg-gray-100/80 text-gray-500 text-[10px] font-bold uppercase tracking-wider border border-gray-200/50">
                                                    {tag}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-[10px] text-gray-300 italic">Sem tags</span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            onClick={() => onEdit(card)}
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                                        >
                                            <Edit2 size={14} />
                                        </Button>
                                        <Button
                                            onClick={() => onDelete(card.id)}
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
