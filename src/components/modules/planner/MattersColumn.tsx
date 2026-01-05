"use client";

import { useDroppable } from "@dnd-kit/core";
import { useStudyData } from "@/hooks/useStudyData";
import { Plus, Book } from "lucide-react";
import DraggableSubjectCard from "./DraggableSubjectCard";

export default function MattersColumn({ onAddMatter, usedSubjects = [] }: { onAddMatter: () => void, usedSubjects?: string[] }) {
    const { subjects } = useStudyData();
    const { setNodeRef } = useDroppable({
        id: "matters-column",
        data: {
            isMattersColumn: true
        }
    });

    const availableSubjects = subjects.filter(subject => !usedSubjects.includes(subject.name));

    return (
        <div className="flex flex-col h-full min-w-[200px] w-full max-w-[260px] bg-white dark:bg-[#1e1e1e] rounded-[24px] border border-gray-100 dark:border-white/5 shadow-2xl dark:shadow-black/50 overflow-hidden transition-all duration-300">
            {/* Header */}
            <div className="px-5 py-4 flex items-start justify-between bg-emerald-50 dark:bg-emerald-500/10">
                <div className="flex flex-col gap-1">
                    <h3 className="font-bold text-sm tracking-tight text-emerald-950 dark:text-white">
                        Minhas Matérias
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">
                        {availableSubjects.length} {availableSubjects.length === 1 ? 'matéria' : 'matérias'}
                    </span>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/5 border border-emerald-500/20 text-emerald-400 shadow-sm mt-1 shrink-0">
                    <Book className="w-3.5 h-3.5 text-emerald-500" />
                </div>
            </div>

            {/* Content Area */}
            <div
                ref={setNodeRef}
                className="flex-1 p-5 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/5"
            >
                {availableSubjects.map((subject) => (
                    <DraggableSubjectCard key={subject.id} subject={subject} />
                ))}

                {availableSubjects.length === 0 && (
                    <div className="h-20 border-2 border-dashed border-white/5 rounded-3xl flex items-center justify-center text-slate-700 text-[10px] font-bold uppercase tracking-widest select-none">
                        Vazio
                    </div>
                )}

                <button
                    onClick={onAddMatter}
                    className="group w-full py-4 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-500 hover:text-emerald-400 uppercase tracking-widest hover:bg-emerald-500/10 rounded-2xl transition-all"
                >
                    <div className="w-4 h-4 rounded-full border-2 border-white/10 group-hover:border-emerald-500 flex items-center justify-center transition-colors">
                        <Plus className="w-2.5 h-2.5 text-slate-500 group-hover:text-emerald-400 transition-colors" strokeWidth={3} />
                    </div>
                    Nova Matéria
                </button>
            </div>
        </div>
    );
}
