"use client";

import { useState } from "react";
import {
    Plus, MoreHorizontal, Clock, Target, Trash2,
    Calculator, BookOpen, Globe, Languages, Dna,
    Atom, FlaskConical, Hourglass, Book, Layout,
    Code, Music, Palette, Leaf, GraduationCap,
    Brain, Scale
} from "lucide-react";
import { useStudyData, Subject } from "@/hooks/useStudyData";
import CreateSubjectModal from "./CreateSubjectModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import SubjectDetail from "./SubjectDetail";
import { motion, AnimatePresence } from "framer-motion";

export default function PlannerMatters() {
    const { subjects, addSubject, deleteSubject, topicsBySubject, addTopic, toggleTopic, deleteTopic } = useStudyData();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const [detailedSubject, setDetailedSubject] = useState<Subject | null>(null);

    const handleDeleteClick = (id: string) => {
        setSelectedSubjectId(id);
        setDeleteModalOpen(true);
        setActiveDropdown(null);
    };

    const confirmDelete = () => {
        if (selectedSubjectId) {
            deleteSubject(selectedSubjectId);
            setSelectedSubjectId(null);
        }
    };

    // Helper: Map subject name to Icon
    const getSubjectIcon = (name: string) => {
        const lower = name.toLowerCase();
        if (lower.includes("mat") || lower.includes("calc") || lower.includes("alg") || lower.includes("geom")) return Calculator;
        if (lower.includes("hist")) return Hourglass;
        if (lower.includes("geo")) return Globe;
        if (lower.includes("port") || lower.includes("ingl") || lower.includes("esp") || lower.includes("ling")) return Languages;
        if (lower.includes("bio")) return Dna;
        if (lower.includes("fis") || lower.includes("fís")) return Atom;
        if (lower.includes("quim") || lower.includes("quím")) return FlaskConical;
        if (lower.includes("filo") || lower.includes("socio")) return BookOpen;
        if (lower.includes("lit")) return Book;
        if (lower.includes("art")) return Palette;
        if (lower.includes("mus")) return Music;
        if (lower.includes("prog") || lower.includes("comp")) return Code;
        if (lower.includes("dir")) return Scale;
        if (lower.includes("psi")) return Brain;
        return GraduationCap; // Default
    };

    // Helper: Get Gradient based on color class
    // Assuming subject.color is like "bg-red-500" or similar.
    // We'll map common Tailwind colors to vibrant gradients.
    const getSubjectGradient = (colorClass: string) => {
        if (colorClass.includes("red")) return "from-red-400 to-red-600 shadow-red-200";
        if (colorClass.includes("orange")) return "from-orange-400 to-orange-600 shadow-orange-200";
        if (colorClass.includes("amber") || colorClass.includes("yellow")) return "from-amber-400 to-amber-600 shadow-amber-200";
        if (colorClass.includes("green") || colorClass.includes("emerald")) return "from-emerald-400 to-emerald-600 shadow-emerald-200";
        if (colorClass.includes("teal") || colorClass.includes("cyan")) return "from-cyan-400 to-blue-500 shadow-cyan-200";
        if (colorClass.includes("blue")) return "from-blue-400 to-blue-600 shadow-blue-200";
        if (colorClass.includes("indigo")) return "from-indigo-400 to-indigo-600 shadow-indigo-200";
        if (colorClass.includes("violet") || colorClass.includes("purple")) return "from-purple-400 to-purple-600 shadow-purple-200";
        if (colorClass.includes("pink") || colorClass.includes("rose")) return "from-pink-400 to-pink-600 shadow-pink-200";
        return "from-gray-400 to-gray-600 shadow-gray-200";
    };

    // Helper to get text color for stats
    const getSubjectTextColor = (colorClass: string) => {
        if (colorClass.includes("red")) return "text-red-600 bg-red-50";
        if (colorClass.includes("orange")) return "text-orange-600 bg-orange-50";
        if (colorClass.includes("emerald") || colorClass.includes("green")) return "text-emerald-600 bg-emerald-50";
        if (colorClass.includes("blue")) return "text-blue-600 bg-blue-50";
        if (colorClass.includes("purple")) return "text-purple-600 bg-purple-50";
        if (colorClass.includes("pink")) return "text-pink-600 bg-pink-50";
        return "text-gray-600 bg-gray-50";
    }

    if (detailedSubject) {
        return (
            <SubjectDetail
                subject={detailedSubject}
                topics={topicsBySubject[detailedSubject.id] || []}
                onBack={() => setDetailedSubject(null)}
                onAddTopic={(title) => addTopic(detailedSubject.id, title)}
                onToggleTopic={toggleTopic}
                onDeleteTopic={deleteTopic}
            />
        );
    }

    return (
        <div className="flex flex-col min-h-full" onClick={() => setActiveDropdown(null)}>
            {/* Header / Actions */}
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4 px-1">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Minhas Matérias</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie seu progresso e metas por disciplina</p>
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsCreateModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-all font-semibold shadow-lg shadow-emerald-900/20 hover:scale-[1.02] active:scale-[0.98]"
                >
                    <Plus size={18} />
                    Nova Matéria
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                {subjects.map((subject) => {
                    const Icon = getSubjectIcon(subject.name);
                    const gradient = getSubjectGradient(subject.color);
                    const textColor = getSubjectTextColor(subject.color);

                    return (
                        <div
                            key={subject.id}
                            onClick={() => setDetailedSubject(subject)}
                            className="group bg-white dark:bg-[#1E1E1E] rounded-3xl border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 p-6 flex flex-col relative overflow-hidden cursor-pointer"
                        >
                            {/* Background Decor */}
                            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-[0.03] rounded-bl-[100px] pointer-events-none transition-opacity group-hover:opacity-[0.08]`} />

                            <div className="flex items-start justify-between mb-4 relative z-10">
                                {/* Icon Box */}
                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center text-white shadow-md group-hover:scale-110 transition-transform duration-300`}>
                                    <Icon size={24} strokeWidth={2} />
                                </div>

                                <div className="relative">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setActiveDropdown(activeDropdown === subject.id ? null : subject.id);
                                        }}
                                        className="text-gray-300 dark:text-gray-600 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800"
                                    >
                                        <MoreHorizontal size={20} />
                                    </button>

                                    <AnimatePresence>
                                        {activeDropdown === subject.id && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: 5, x: 10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: 5 }}
                                                className="absolute right-0 top-full mt-1 w-40 bg-white dark:bg-[#252525] rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-50 overflow-hidden"
                                            >
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteClick(subject.id);
                                                    }}
                                                    className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 flex items-center gap-2.5 font-medium transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                    Excluir Matéria
                                                </button>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>

                            <div className="relative z-10 mb-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-gray-900 group-hover:to-gray-600 dark:group-hover:from-gray-100 dark:group-hover:to-gray-400 transition-all">
                                    {subject.name}
                                </h3>

                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
                                <div className="bg-gray-50/80 dark:bg-gray-800/50 rounded-2xl p-3 border border-gray-100 dark:border-gray-700 group-hover:border-transparent group-hover:bg-white/50 dark:group-hover:bg-gray-700/50 group-hover:shadow-sm transition-all">
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-wider">
                                        <Clock size={10} />
                                        Horas
                                    </div>
                                    <div className="text-base font-bold text-gray-800 dark:text-gray-200">
                                        {subject.hoursStudied}h
                                    </div>
                                </div>
                                <div className="bg-gray-50/80 dark:bg-gray-800/50 rounded-2xl p-3 border border-gray-100 dark:border-gray-700 group-hover:border-transparent group-hover:bg-white/50 dark:group-hover:bg-gray-700/50 group-hover:shadow-sm transition-all">
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-wider">
                                        <Target size={10} />
                                        Meta
                                    </div>
                                    <div className="text-base font-bold text-gray-800 dark:text-gray-200">
                                        100h
                                    </div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="mt-auto relative z-10">
                                <div className="flex items-center justify-between text-xs font-semibold mb-2">
                                    <span className="text-gray-400 dark:text-gray-500">Progresso</span>
                                    <span className={`${textColor.split(" ")[0]} dark:text-emerald-400`}>{Math.min(100, Math.round((subject.hoursStudied / 100) * 100))}%</span>
                                </div>
                                <div className="h-2.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, (subject.hoursStudied / 100) * 100)}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                        className={`h-full rounded-full bg-gradient-to-r ${gradient}`}
                                    />
                                </div>
                            </div>
                        </div>
                    )
                })}

                {/* Add New Placeholder Card */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        setIsCreateModalOpen(true);
                    }}
                    className="rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700 hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-all p-6 flex flex-col items-center justify-center text-center gap-4 group min-h-[280px]"
                >
                    <div className="w-16 h-16 rounded-full bg-gray-50 dark:bg-gray-800 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/50 flex items-center justify-center text-gray-400 dark:text-gray-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors group-hover:scale-110 duration-300">
                        <Plus size={32} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-200 mb-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">Adicionar Matéria</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-500">Comece a planejar uma nova disciplina</p>
                    </div>
                </button>
            </div>

            <CreateSubjectModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={(data) => {
                    addSubject(data.title, data.color);
                }}
            />

            <DeleteConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Excluir Matéria"
                description="Tem certeza que deseja remover esta matéria? Todo o histórico de estudos associado a ela será perdido permanentemente."
            />
        </div>
    );
}
