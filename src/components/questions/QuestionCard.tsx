// QuestionCard.tsx - Silent Gamification Version
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, BookOpen, Tag, XCircle, Zap, CheckCircle, MinusCircle, PlusCircle, MessageSquare, BarChart3, FolderOpen, StickyNote, AlertTriangle, PlayCircle, CheckCircle2 } from "lucide-react";
import ExamBadge from "./ExamBadge";
import AnswerOption from "./AnswerOption";
import { useState, useEffect } from "react";
import { generateFlashcardsFromQuestion } from "@/lib/actions/generate-flashcards";
import { awardXP } from "@/lib/actions/gamification";
import confetti from "canvas-confetti";
import { CommentsSection } from "@/components/questions/CommentsSection";
import { supabase } from "@/lib/supabase";

interface Question {
    id: string;
    exam: {
        name: string;
        institution: string;
        year: number;
        position?: string;
    };
    subject: {
        name: string;
        topic?: string;
        legislation?: string;
    };
    content: string;
    referenceText?: string;
    type: "multiple-choice" | "true-false";
    options: {
        letter: string;
        text: string;
        isCorrect: boolean;
    }[];
    explanation?: string;
}

interface QuestionCardProps {
    question: Question;
    questionNumber: number;
    totalQuestions: number;
    onNext: () => void;
    onPrevious: () => void;
    showNavigation?: boolean;
    isPremium?: boolean;
}

export default function QuestionCard({
    question,
    questionNumber,
    totalQuestions,
    onNext,
    onPrevious,
    showNavigation = true,
    isPremium = false
}: QuestionCardProps) {
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);
    const [showGabaritoComentado, setShowGabaritoComentado] = useState(false);
    const [isReferenceOpen, setIsReferenceOpen] = useState(true);
    const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
    const [flashcardsGenerated, setFlashcardsGenerated] = useState(false);
    const [generatedFlashcards, setGeneratedFlashcards] = useState<Array<{ front: string, back: string }>>([]);
    const [flashcardError, setFlashcardError] = useState<string | null>(null);
    const [answerStartTime, setAnswerStartTime] = useState<number>(Date.now());
    const [isCommentsOpen, setIsCommentsOpen] = useState(false);
    const [commentCount, setCommentCount] = useState(0);

    // Fetch comment count
    useEffect(() => {
        const fetchCount = async () => {
            const { count } = await supabase
                .from('comments')
                .select('*', { count: 'exact', head: true })
                .eq('question_id', question.id);
            setCommentCount(count || 0);
        };
        fetchCount();
    }, [question.id]);

    const handleSubmit = async () => {
        if (!selectedAnswer) return;

        setIsSubmitted(true);

        // Calculate time taken
        const timeToAnswer = (Date.now() - answerStartTime) / 1000;
        const isCorrect = question.options.find(o => o.letter === selectedAnswer)?.isCorrect || false;

        // Trigger confetti for correct answer
        if (isCorrect) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#10B981', '#34D399', '#6EE7B7'],
            });
        }

        // Award XP (Silent Mode)
        try {
            await awardXP({
                isCorrect,
                difficultyMultiplier: 1.0,
                timeToAnswer,
                questionId: question.id,
                reason: 'question_answered',
            });
        } catch (error) {
            console.error('Error awarding XP:', error);
        }
    };

    const handleReset = () => {
        setSelectedAnswer(null);
        setIsSubmitted(false);
        setShowExplanation(false);
        setFlashcardsGenerated(false);
        setGeneratedFlashcards([]);
        setFlashcardError(null);
        setAnswerStartTime(Date.now());
    };

    // Reset timer when question changes
    useEffect(() => {
        setAnswerStartTime(Date.now());
    }, [question.id]);

    const handleGenerateFlashcards = async () => {
        setIsGeneratingFlashcards(true);
        setFlashcardError(null);

        try {
            const correctOption = question.options.find(o => o.isCorrect);
            const flashcards = await generateFlashcardsFromQuestion({
                content: question.content,
                subject: question.subject,
                exam: question.exam,
                correctAnswer: correctOption?.text || "",
                explanation: question.explanation
            });

            setGeneratedFlashcards(flashcards);
            setFlashcardsGenerated(true);
        } catch (error) {
            console.error("Error generating flashcards:", error);
            setFlashcardError("Erro ao gerar flashcards. Tente novamente.");
        } finally {
            setIsGeneratingFlashcards(false);
        }
    };

    const handleNextQuestion = () => {
        handleReset();
        onNext();
    };

    const isCorrect = question.options.find(o => o.letter === selectedAnswer)?.isCorrect;

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-gray-600">
                        Questão {questionNumber} de {totalQuestions}
                    </span>
                    <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-semibold text-emerald-700">{question.subject.name}</span>
                    </div>
                </div>
            </motion.div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
                    className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600"
                />
            </div>

            {/* Exam Info Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-500/20 rounded-xl p-4"
            >
                <div className="flex flex-wrap items-center gap-3">
                    <ExamBadge
                        institution={question.exam.institution}
                        year={question.exam.year}
                    />
                    {question.exam.position && (
                        <div className="px-3 py-1 bg-white dark:bg-[#2A2A2A] rounded-lg border border-emerald-200 dark:border-emerald-500/20">
                            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">{question.exam.position}</span>
                        </div>
                    )}
                    {question.subject.topic && (
                        <div className="px-3 py-1 bg-white dark:bg-[#2A2A2A] rounded-lg border border-gray-200 dark:border-gray-700">
                            <span className="text-xs text-gray-600 dark:text-gray-300">{question.subject.topic}</span>
                        </div>
                    )}
                    {question.subject.legislation && (
                        <div className="px-3 py-1 bg-white dark:bg-[#2A2A2A] rounded-lg border border-gray-200 dark:border-gray-700 flex items-center gap-1">
                            <BookOpen className="w-3 h-3 text-gray-500 dark:text-gray-400" />
                            <span className="text-xs text-gray-600 dark:text-gray-300">{question.subject.legislation}</span>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Reference Text (if applicable) */}
            {(() => {
                const normalize = (text: string) => text.toLowerCase().replace(/\s+/g, '').replace(/[^\w\u00C0-\u017F]/g, '');
                const normalizedRef = normalize(question.referenceText || "");
                const normalizedContent = normalize(question.content);

                const isShortInstruction = (question.referenceText || "").length < 150;
                if (!question.referenceText || (isShortInstruction && normalizedContent.startsWith(normalizedRef))) return null;

                return (
                    <div className="mb-6">
                        <button
                            onClick={() => setIsReferenceOpen(!isReferenceOpen)}
                            className="flex items-center gap-2 text-blue-600 font-bold mb-2 hover:text-blue-700 transition-colors"
                        >
                            {isReferenceOpen ? (
                                <MinusCircle className="w-5 h-5" />
                            ) : (
                                <PlusCircle className="w-5 h-5" />
                            )}
                            <span>Texto associado</span>
                        </button>

                        <AnimatePresence initial={false}>
                            {isReferenceOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                >
                                    <div className="text-gray-700 leading-relaxed whitespace-pre-line text-sm border-l-4 border-blue-200 pl-4 py-2">
                                        {question.referenceText}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                );
            })()}

            {/* Question Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700/50 rounded-xl p-6 shadow-sm"
            >
                <div className="text-base text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-line">
                    {question.content}
                </div>
            </motion.div>

            {/* Answer Options */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-3"
            >
                {question.options.map((option) => (
                    <AnswerOption
                        key={option.letter}
                        letter={option.letter}
                        text={option.text}
                        isSelected={selectedAnswer === option.letter}
                        isCorrect={option.isCorrect}
                        isRevealed={isSubmitted}
                        onSelect={() => setSelectedAnswer(option.letter)}
                        disabled={isSubmitted}
                    />
                ))}
            </motion.div>

            {/* Question Action Bar - Green Identity Design */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="bg-white dark:bg-[#1E1E1E] border border-gray-200 dark:border-gray-700/50 rounded-xl overflow-hidden shadow-sm"
            >
                {/* Top Row - Main Action */}
                <div className="flex items-center px-4 py-3 border-b border-gray-100 dark:border-white/5">
                    {!isSubmitted ? (
                        <motion.button
                            whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSubmit}
                            disabled={!selectedAnswer}
                            className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-semibold rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Responder
                        </motion.button>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleReset}
                            className="px-6 py-2.5 border-2 border-emerald-500 text-emerald-700 text-sm font-semibold rounded-lg hover:bg-emerald-50 transition-all"
                        >
                            Refazer
                        </motion.button>
                    )}
                </div>

                {/* Bottom Row - Action Links */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50/50 dark:bg-white/5">
                    <div className="flex items-center gap-1 flex-wrap">
                        <button
                            onClick={() => setShowGabaritoComentado(!showGabaritoComentado)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${showGabaritoComentado
                                ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/20'
                                : 'text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                                }`}
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Gabarito Comentado</span>
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors">
                            <PlayCircle className="w-3.5 h-3.5" />
                            <span>Aulas</span>
                        </button>
                        <button
                            onClick={() => setIsCommentsOpen(!isCommentsOpen)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${isCommentsOpen
                                ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/20'
                                : 'text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'
                                }`}
                        >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Comentários</span>
                            <span className="text-[10px] text-gray-400">({commentCount})</span>
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors">
                            <BarChart3 className="w-3.5 h-3.5" />
                            <span>Estatísticas</span>
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors">
                            <FolderOpen className="w-3.5 h-3.5" />
                            <span>Cadernos</span>
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-colors">
                            <StickyNote className="w-3.5 h-3.5" />
                            <span>Criar anotações</span>
                        </button>
                    </div>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Notificar Erro</span>
                    </button>
                </div>
            </motion.div>

            {/* Gabarito Comentado Section */}
            <AnimatePresence>
                {showGabaritoComentado && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200 dark:border-emerald-500/20 rounded-xl overflow-hidden"
                    >
                        <div className="p-5">
                            {/* Header */}
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-gray-900 dark:text-white">Gabarito Comentado</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Comentário oficial do professor</p>
                                </div>
                            </div>

                            {/* Comment Content */}
                            <div className="bg-white dark:bg-[#2A2A2A] rounded-xl p-4 border border-emerald-100 dark:border-emerald-500/10">
                                {question.explanation ? (
                                    <div className="prose prose-sm max-w-none text-gray-700 dark:text-gray-300">
                                        <p>{question.explanation}</p>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <MessageSquare className="w-6 h-6 text-gray-400" />
                                        </div>
                                        <p className="text-gray-500 text-sm font-medium">Nenhum comentário disponível</p>
                                        <p className="text-gray-400 text-xs mt-1">Esta questão ainda não possui gabarito comentado</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Comments Section */}
            <AnimatePresence>
                {isCommentsOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-gray-50 border-t border-b border-gray-200 mt-4 rounded-xl overflow-hidden"
                    >
                        <CommentsSection questionId={question.id} isOpen={isCommentsOpen} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Result Feedback */}
            {isSubmitted && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-6 rounded-xl border-2 ${isCorrect
                        ? 'bg-emerald-50 border-emerald-500'
                        : 'bg-orange-50 border-orange-500'
                        }`}
                >
                    <div className="flex items-center gap-3 mb-3">
                        {isCorrect ? (
                            <>
                                <CheckCircle className="w-6 h-6 text-emerald-600" />
                                <h3 className="text-lg font-bold text-emerald-900">Correto!</h3>
                            </>
                        ) : (
                            <>
                                <XCircle className="w-6 h-6 text-orange-600" />
                                <h3 className="text-lg font-bold text-orange-900">Resposta Incorreta</h3>
                            </>
                        )}
                    </div>
                    <p className="text-sm text-gray-700">
                        {isCorrect
                            ? "Parabéns! Você acertou esta questão."
                            : "Não desanime! Todo erro é uma oportunidade de aprendizado."}
                    </p>
                </motion.div>
            )}

            {/* AI Help & Flashcards - Premium Features */}
            {isSubmitted && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/10 dark:to-indigo-900/10 border border-purple-200 dark:border-purple-500/20 rounded-2xl p-5"
                >
                    {/* Header with Premium Badge */}
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h4 className="font-bold text-gray-900 dark:text-white">Recursos Premium com IA</h4>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Desbloqueie o poder da IA para estudar melhor</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full">
                            <Zap className="w-3.5 h-3.5 text-white" />
                            <span className="text-xs font-bold text-white">PREMIUM</span>
                        </div>
                    </div>

                    {/* Premium Features Grid */}
                    <div className="grid grid-cols-1 gap-4 mb-4">
                        {/* AI Chat Feature - Locked */}
                        <div className="relative bg-white/80 dark:bg-[#1E1E1E] border border-purple-100 dark:border-purple-500/20 rounded-xl p-4 overflow-hidden group/premium cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-500/20 rounded-lg flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <h5 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Pergunte à IA</h5>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Tire dúvidas sobre a questão, peça explicações ou exemplos</p>
                                </div>
                            </div>
                            {!isPremium && (
                                <div className="absolute inset-0 bg-white/70 dark:bg-black/50 rounded-xl flex items-center justify-center backdrop-blur-[1px]">
                                    <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                                        <Zap className="w-4 h-4" />
                                        <span className="text-xs font-semibold">Premium</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Quick Question Chips - Disabled */}
                    <div className="flex flex-wrap gap-2 mb-4 justify-center">
                        <span className="text-xs text-gray-500 dark:text-gray-400 w-full mb-1 text-center">Perguntas rápidas:</span>
                        <button disabled={!isPremium} className={`px-3 py-1.5 bg-white/80 dark:bg-[#1E1E1E] border border-purple-200 dark:border-purple-500/20 rounded-full text-xs font-medium text-purple-700 dark:text-purple-400 transition-all ${isPremium ? 'hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:border-purple-300 active:scale-95' : 'opacity-50 cursor-not-allowed'}`}>
                            💡 Explique o conceito
                        </button>
                        <button disabled={!isPremium} className={`px-3 py-1.5 bg-white/80 dark:bg-[#1E1E1E] border border-purple-200 dark:border-purple-500/20 rounded-full text-xs font-medium text-purple-700 dark:text-purple-400 transition-all ${isPremium ? 'hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:border-purple-300 active:scale-95' : 'opacity-50 cursor-not-allowed'}`}>
                            📚 Dê exemplos práticos
                        </button>
                        <button disabled={!isPremium} className={`px-3 py-1.5 bg-white/80 dark:bg-[#1E1E1E] border border-purple-200 dark:border-purple-500/20 rounded-full text-xs font-medium text-purple-700 dark:text-purple-400 transition-all ${isPremium ? 'hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:border-purple-300 active:scale-95' : 'opacity-50 cursor-not-allowed'}`}>
                            ⚖️ Compare alternativas
                        </button>
                        <button disabled={!isPremium} className={`px-3 py-1.5 bg-white/80 dark:bg-[#1E1E1E] border border-purple-200 dark:border-purple-500/20 rounded-full text-xs font-medium text-purple-700 dark:text-purple-400 transition-all ${isPremium ? 'hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:border-purple-300 active:scale-95' : 'opacity-50 cursor-not-allowed'}`}>
                            🎯 Dicas de memorização
                        </button>
                        <button disabled={!isPremium} className={`px-3 py-1.5 bg-white/80 dark:bg-[#1E1E1E] border border-purple-200 dark:border-purple-500/20 rounded-full text-xs font-medium text-purple-700 dark:text-purple-400 transition-all ${isPremium ? 'hover:bg-purple-50 dark:hover:bg-purple-500/10 hover:border-purple-300 active:scale-95' : 'opacity-50 cursor-not-allowed'}`}>
                            ✨ Flashcards com IA
                        </button>
                    </div>

                    {/* CTA Button */}
                    <div className="text-center pt-2 border-t border-purple-100">
                        {isPremium ? (
                            <div className="mt-3 flex items-center justify-center gap-2 text-emerald-600 font-bold text-sm">
                                <CheckCircle2 className="w-5 h-5" />
                                Recursos Premium Ativos
                            </div>
                        ) : (
                            <button className="mt-3 px-6 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-purple-600 hover:to-indigo-700 transition-all shadow-md hover:shadow-lg inline-flex items-center gap-2">
                                <Zap className="w-4 h-4" />
                                Desbloquear Recursos Premium
                            </button>
                        )}
                    </div>
                </motion.div>
            )}

            {/* Action Button - Explanation Only */}
            {isSubmitted && question.explanation && (
                <div className="flex flex-wrap items-center justify-center gap-3">
                    <motion.button
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowExplanation(!showExplanation)}
                        className="group relative inline-flex items-center gap-2.5 px-8 py-3.5 bg-white dark:bg-[#1E1E1E] border-2 border-emerald-500 text-emerald-700 dark:text-emerald-400 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all shadow-sm hover:shadow-md overflow-hidden"
                    >
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-emerald-600/10"
                            initial={{ x: '-100%' }}
                            whileHover={{ x: 0 }}
                            transition={{ duration: 0.3 }}
                        />
                        <motion.div
                            animate={{
                                rotate: showExplanation ? 180 : 0,
                                scale: showExplanation ? 1.1 : 1
                            }}
                            transition={{ duration: 0.3 }}
                            className="relative z-10"
                        >
                            <Sparkles className="w-5 h-5" />
                        </motion.div>
                        <span className="relative z-10 font-semibold text-[15px]">
                            {showExplanation ? 'Esconder Explicação' : 'Ver Explicação'}
                        </span>
                    </motion.button>
                </div>
            )}

            {/* Explanation */}
            {showExplanation && question.explanation && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-gray-50 border border-gray-200 rounded-xl p-6"
                >
                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-500" />
                        Explicação
                    </h4>
                    <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                        {question.explanation}
                    </p>
                </motion.div>
            )}

            {/* Flashcard Error */}
            {flashcardError && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm text-red-700">{flashcardError}</p>
                </div>
            )}

            {/* Generated Flashcards Preview */}
            {flashcardsGenerated && generatedFlashcards.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                >
                    <div className="flex items-center justify-between">
                        <h4 className="font-bold text-gray-900">
                            ✨ {generatedFlashcards.length} Flashcards Gerados
                        </h4>
                        <a
                            href="/dashboard/anki"
                            className="text-sm font-semibold text-emerald-600 hover:text-emerald-700"
                        >
                            Ver no Spaced Review →
                        </a>
                    </div>
                    <div className="grid gap-3">
                        {generatedFlashcards.map((flashcard, index) => (
                            <div
                                key={index}
                                className="p-4 bg-gray-50 border border-gray-200 rounded-xl"
                            >
                                <p className="text-sm font-semibold text-gray-700 mb-2">
                                    {flashcard.front}
                                </p>
                                <p className="text-sm text-gray-600">{flashcard.back}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Navigation */}
            {showNavigation && (
                <div className="flex items-center justify-between pt-4">
                    <button
                        onClick={onPrevious}
                        disabled={questionNumber === 1}
                        className="px-6 py-2.5 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        ← Anterior
                    </button>

                    {!isSubmitted ? (
                        <button
                            onClick={handleSubmit}
                            disabled={!selectedAnswer}
                            className="px-8 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            Verificar Resposta
                        </button>
                    ) : (
                        <button
                            onClick={handleReset}
                            className="px-6 py-2.5 border-2 border-emerald-500 text-emerald-700 dark:text-emerald-400 rounded-xl font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all"
                        >
                            Tentar Novamente
                        </button>
                    )}

                    <button
                        onClick={handleNextQuestion}
                        disabled={questionNumber === totalQuestions}
                        className="px-6 py-2.5 border-2 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:border-gray-400 dark:hover:border-gray-600 hover:bg-gray-50 dark:hover:bg-white/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Próxima →
                    </button>
                </div>
            )}
        </div>
    );
}
