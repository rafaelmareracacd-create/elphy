"use client";

import { useState, useMemo } from "react";
import { ArrowLeft, Plus, CheckCircle2, Circle, Clock, Target, Calendar, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Subject, Topic } from "@/hooks/useStudyData";

interface SubjectDetailProps {
    subject: Subject;
    topics: Topic[];
    onBack: () => void;
    onAddTopic: (title: string) => Promise<void>;
    onToggleTopic: (id: string, currentStatus: boolean) => Promise<void>;
    onDeleteTopic: (id: string) => Promise<void>;
}

export default function SubjectDetail({ subject, topics = [], onBack, onAddTopic, onToggleTopic, onDeleteTopic }: SubjectDetailProps) {
    const [newTopic, setNewTopic] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleAddTopic = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTopic.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await onAddTopic(newTopic);
            setNewTopic("");
        } finally {
            setIsSubmitting(false);
        }
    };

    const completedTopics = topics.filter(t => t.completed).length;
    const progress = topics.length > 0 ? Math.round((completedTopics / topics.length) * 100) : 0;

    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="h-full flex flex-col"
        >
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={onBack}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors text-gray-500 hover:text-gray-900"
                >
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">{subject.name}</h2>
                    <p className="text-gray-500">Planejamento e Tópicos</p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${subject.color.replace('bg-', 'from-')} ${subject.color.replace('bg-', 'to-').replace('500', '600')} text-white shadow-md shadow-emerald-500/10`}>
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-500">Horas Estudadas</p>
                        <p className="text-xl font-bold text-gray-900">{subject.hoursStudied}h</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gray-900 text-white`}>
                        <Target size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-500">Progresso dos Tópicos</p>
                        <div className="flex items-end gap-2">
                            <p className="text-xl font-bold text-gray-900">{progress}%</p>
                            <p className="text-sm text-gray-400 mb-1">({completedTopics}/{topics.length})</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-blue-500 text-white`}>
                        <Calendar size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-gray-500">Meta de Horas</p>
                        <p className="text-xl font-bold text-gray-900">{subject.goalHours}h</p>
                    </div>
                </div>
            </div>

            {/* Topics Section */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm flex-1 flex flex-col overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-900">Assuntos a Estudar</h3>
                    <span className="text-sm font-medium text-gray-400">
                        {topics.length} tópicos cadastrados
                    </span>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-3">
                    <AnimatePresence>
                        {topics.map((topic) => (
                            <motion.div
                                key={topic.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, height: 0 }}
                                className={`
                                    group flex items-center gap-4 p-4 rounded-xl border transition-all duration-200
                                    ${topic.completed
                                        ? 'bg-gray-50 border-gray-100 opacity-75'
                                        : 'bg-white border-gray-100 hover:border-emerald-200 hover:shadow-sm'
                                    }
                                `}
                            >
                                <button
                                    onClick={() => onToggleTopic(topic.id, topic.completed)}
                                    className={`
                                        flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
                                        ${topic.completed
                                            ? 'bg-emerald-500 border-emerald-500 text-white'
                                            : 'border-gray-300 text-transparent hover:border-emerald-400'
                                        }
                                    `}
                                >
                                    <CheckCircle2 size={14} />
                                </button>

                                <span className={`flex-1 font-medium ${topic.completed ? 'text-gray-400 line-through' : 'text-gray-700'}`}>
                                    {topic.title}
                                </span>

                                <button
                                    onClick={() => onDeleteTopic(topic.id)}
                                    className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    title="Excluir tópico"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {topics.length === 0 && (
                        <div className="text-center py-12 text-gray-400">
                            <p>Nenhum assunto cadastrado ainda.</p>
                        </div>
                    )}
                </div>

                {/* Add Topic Bar */}
                <div className="p-6 bg-gray-50 border-t border-gray-100">
                    <form onSubmit={handleAddTopic} className="relative">
                        <input
                            type="text"
                            value={newTopic}
                            onChange={(e) => setNewTopic(e.target.value)}
                            placeholder="Adicionar novo assunto..."
                            className="w-full pl-6 pr-14 py-4 rounded-xl border-none shadow-sm focus:ring-2 focus:ring-emerald-500/20 focus:shadow-md transition-all text-gray-700 placeholder:text-gray-400 font-medium"
                        />
                        <button
                            type="submit"
                            disabled={!newTopic.trim()}
                            className="absolute right-2 top-2 bottom-2 aspect-square bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:hover:bg-emerald-600 text-white rounded-lg flex items-center justify-center transition-all"
                        >
                            <Plus size={20} />
                        </button>
                    </form>
                </div>
            </div>
        </motion.div>
    );
}
