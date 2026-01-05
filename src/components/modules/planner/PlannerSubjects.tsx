"use client";

import { useState } from "react";
import { BookOpen, Plus, MoreHorizontal, Clock, Target, CheckCircle2, Pencil, Trash2 } from "lucide-react";
import { useStudyData, Subject } from "@/hooks/useStudyData";
import { AnimatePresence, motion } from "framer-motion";
import SubjectDetail from "./SubjectDetail";
import CreateSubjectModal from "./CreateSubjectModal";
import DeleteConfirmModal from "./DeleteConfirmModal";

export default function PlannerSubjects() {
    const { subjects, addSubject, updateSubject, deleteSubject, topicsBySubject, addTopic, toggleTopic, deleteTopic, loading } = useStudyData();
    const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // Edit & Delete State
    const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
    const [subjectToDelete, setSubjectToDelete] = useState<Subject | null>(null);
    const [activeDropdownId, setActiveDropdownId] = useState<string | null>(null);

    const selectedSubject = subjects.find(s => s.id === selectedSubjectId);

    const handleOpenCreate = () => {
        setEditingSubject(null);
        setIsCreateModalOpen(true);
    };

    const handleOpenEdit = (subject: Subject, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingSubject(subject);
        setIsCreateModalOpen(true);
        setActiveDropdownId(null);
    };

    const handleOpenDelete = (subject: Subject, e: React.MouseEvent) => {
        e.stopPropagation();
        setSubjectToDelete(subject);
        setActiveDropdownId(null);
    };

    const handleSaveSubject = (data: { title: string, color: string, goalHours: number, icon?: string }) => {
        if (editingSubject && updateSubject) {
            updateSubject(editingSubject.id, data.title, data.color, data.goalHours, data.icon);
        } else {
            addSubject(data.title, data.color, data.goalHours, data.icon);
        }
        setIsCreateModalOpen(false);
        setEditingSubject(null);
    };

    const handleDeleteConfirm = () => {
        if (subjectToDelete) {
            deleteSubject(subjectToDelete.id);
            setSubjectToDelete(null);
        }
    };

    if (selectedSubjectId && selectedSubject) {
        return (
            <SubjectDetail
                subject={selectedSubject}
                topics={topicsBySubject[selectedSubjectId] || []}
                onBack={() => setSelectedSubjectId(null)}
                // We wrap these to pass the subjectId
                onAddTopic={(title) => addTopic(selectedSubjectId, title)}
                onToggleTopic={toggleTopic}
                onDeleteTopic={deleteTopic}
            />
        );
    }

    return (
        <div
            className="h-full flex flex-col max-w-7xl mx-auto w-full"
            onClick={() => setActiveDropdownId(null)} // Close dropdown on click outside
        >
            {/* Header / Actions */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Minhas Matérias</h2>
                    <p className="text-gray-500 mt-1">Gerencie seu progresso e metas por disciplina</p>
                </div>
                <button
                    onClick={handleOpenCreate}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all font-semibold shadow-sm hover:translate-y-[-1px]"
                >
                    <Plus size={18} />
                    Nova Matéria
                </button>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {subjects.map((subject) => {
                        // Calculate progress dynamically based on topics if available
                        const tops = topicsBySubject[subject.id] || [];
                        const completedTops = tops.filter(t => t.completed).length;
                        const topicProgress = tops.length > 0 ? Math.round((completedTops / tops.length) * 100) : 0;
                        const isDropdownOpen = activeDropdownId === subject.id;

                        return (
                            <motion.div
                                key={subject.id}
                                layoutId={subject.id}
                                onClick={() => setSelectedSubjectId(subject.id)}
                                className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 p-6 flex flex-col relative overflow-visible cursor-pointer"
                            >
                                {/* Decorative Top Bar */}
                                <div className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl ${subject.color.replace('text', 'bg').split(' ')[0].replace('bg-', 'bg-')}`} />

                                <div className="flex items-start justify-between mb-6 z-10 relative">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${subject.color}`}>
                                        {subject.name.substring(0, 1)}
                                    </div>
                                    <div className="relative">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveDropdownId(isDropdownOpen ? null : subject.id);
                                            }}
                                            className={`text-gray-300 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-50 ${isDropdownOpen ? 'bg-gray-50 text-gray-600' : ''}`}
                                        >
                                            <MoreHorizontal size={20} />
                                        </button>

                                        {/* Dropdown Menu */}
                                        <AnimatePresence>
                                            {isDropdownOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, scale: 0.95, y: 5 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.95, y: 5 }}
                                                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 overflow-hidden"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <button
                                                        onClick={(e) => handleOpenEdit(subject, e)}
                                                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center gap-2 transition-colors"
                                                    >
                                                        <Pencil size={16} className="text-gray-400" />
                                                        Editar
                                                    </button>
                                                    <div className="h-px bg-gray-50 my-1" />
                                                    <button
                                                        onClick={(e) => handleOpenDelete(subject, e)}
                                                        className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                                                    >
                                                        <Trash2 size={16} className="text-red-400" />
                                                        Excluir
                                                    </button>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-4 group-hover:text-emerald-600 transition-colors">
                                    {subject.name}
                                </h3>

                                {/* Stats Grid */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 mb-1">
                                            <Clock size={12} />
                                            HORAS
                                        </div>
                                        <div className="text-sm font-bold text-gray-700">
                                            {subject.hoursStudied}h <span className="text-gray-400 font-normal">/ {subject.goalHours}h</span>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 rounded-lg p-3">
                                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 mb-1">
                                            <Target size={12} />
                                            TÓPICOS
                                        </div>
                                        <div className="text-sm font-bold text-gray-700">
                                            {completedTops} / {tops.length}
                                        </div>
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mt-auto">
                                    <div className="flex items-center justify-between text-xs font-semibold mb-2">
                                        <span className="text-gray-400">Progresso (Tópicos)</span>
                                        <span className="text-gray-900">{topicProgress}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-500 ${subject.color.replace('text', 'bg').split(' ')[0].replace('bg-', 'bg-').replace('50', '500')}`}
                                            style={{ width: `${topicProgress}%` }}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {/* Add New Placeholder Card */}
                <button
                    onClick={handleOpenCreate}
                    className="rounded-2xl border-2 border-dashed border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/30 transition-all p-6 flex flex-col items-center justify-center text-center gap-4 group min-h-[280px]"
                >
                    <div className="w-16 h-16 rounded-full bg-gray-50 group-hover:bg-emerald-100 flex items-center justify-center text-gray-400 group-hover:text-emerald-600 transition-colors">
                        <Plus size={32} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Adicionar Matéria</h3>
                        <p className="text-sm text-gray-500">Comece a planejar uma nova disciplina</p>
                    </div>
                </button>
            </div>

            <CreateSubjectModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSubmit={handleSaveSubject}
                initialData={editingSubject ? { title: editingSubject.name, color: editingSubject.color, goalHours: editingSubject.goalHours, icon: editingSubject.icon } : undefined}
            />

            <DeleteConfirmModal
                isOpen={!!subjectToDelete}
                onClose={() => setSubjectToDelete(null)}
                onConfirm={handleDeleteConfirm}
                title="Excluir Matéria"
                description={`Tem certeza que deseja excluir "${subjectToDelete?.name}"? Isso também excluirá todos os tópicos relacionados.`}
            />
        </div>
    );
}
