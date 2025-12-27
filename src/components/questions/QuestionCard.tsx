// QuestionCard.tsx - Complete version with gamification
"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, BookOpen, Tag, XCircle, Zap, CheckCircle, MinusCircle, PlusCircle } from "lucide-react";
import ExamBadge from "./ExamBadge";
import AnswerOption from "./AnswerOption";
import { useState, useEffect } from "react";
import { generateFlashcardsFromQuestion } from "@/lib/actions/generate-flashcards";
import { awardXP } from "@/lib/actions/gamification";
import { useXPGainAnimation } from "@/components/gamification/XPGainPopup";
import { useAchievementToast } from "@/components/gamification/AchievementUnlock";
import ComboMeter, { useComboSystem } from "@/components/gamification/ComboMeter";
import CoinDisplay, { CoinGainAnimation } from "@/components/gamification/CoinDisplay";
import { useSoundManager } from "@/lib/gamification/sounds";
import confetti from "canvas-confetti";

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
}

export default function QuestionCard({
    question,
    questionNumber,
    totalQuestions,
    onNext,
    onPrevious
}: QuestionCardProps) {
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);
    const [isReferenceOpen, setIsReferenceOpen] = useState(true);
    const [isGeneratingFlashcards, setIsGeneratingFlashcards] = useState(false);
    const [flashcardsGenerated, setFlashcardsGenerated] = useState(false);
    const [generatedFlashcards, setGeneratedFlashcards] = useState<Array<{ front: string, back: string }>>([]);
    const [flashcardError, setFlashcardError] = useState<string | null>(null);
    const [answerStartTime, setAnswerStartTime] = useState<number>(Date.now());
    const [coinsEarned, setCoinsEarned] = useState(0);
    const [showCoinGain, setShowCoinGain] = useState(false);

    // Gamification hooks
    const { triggerXPGain, XPGainAnimations } = useXPGainAnimation();
    const { showAchievement, AchievementToasts } = useAchievementToast();
    const { combo, maxCombo, multiplier, incrementCombo, resetCombo } = useComboSystem();
    const { playComboSound, play } = useSoundManager();

    const handleSubmit = async () => {
        if (!selectedAnswer) return;

        setIsSubmitted(true);

        // Calculate time taken
        const timeToAnswer = (Date.now() - answerStartTime) / 1000;
        const isCorrect = question.options.find(o => o.letter === selectedAnswer)?.isCorrect || false;

        // Update combo
        if (isCorrect) {
            incrementCombo();
        } else {
            resetCombo();
            play('incorrect');
        }

        // Trigger confetti for correct answer
        if (isCorrect) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#10B981', '#34D399', '#6EE7B7'],
            });

            setTimeout(() => playComboSound(combo + 1), 100);
        }

        // Award XP
        try {
            const result = await awardXP({
                isCorrect,
                difficultyMultiplier: 1.0,
                timeToAnswer,
                questionId: question.id,
                reason: 'question_answered',
            });

            if (result.success) {
                // Show coin gain
                if (result.coinsEarned > 0) {
                    setCoinsEarned(result.coinsEarned);
                    setShowCoinGain(true);
                    play('coinCollect');
                    setTimeout(() => setShowCoinGain(false), 1500);
                }

                // Trigger XP gain animation
                if (result.xpGained > 0) {
                    setTimeout(() => {
                        triggerXPGain({
                            amount: result.xpGained,
                            x: 50,
                            y: 40,
                            reason: isCorrect ? `🔥 Combo ${combo + 1}x!` : 'Esforço!',
                        });
                    }, 500);
                }

                // Level up celebration
                if (result.leveledUp) {
                    play('levelUp');
                    confetti({
                        particleCount: 200,
                        spread: 90,
                        origin: { y: 0.5 },
                        colors: ['#FFD700', '#FFA500', '#FF6347'],
                    });
                }

                // Show achievement unlocks
                if (result.achievementsUnlocked.length > 0) {
                    result.achievementsUnlocked.forEach((achievement, index) => {
                        setTimeout(() => {
                            play('achievementUnlock');
                            showAchievement({
                                name: achievement.name,
                                description: `Você desbloqueou a conquista ${achievement.name}!`,
                                icon: achievement.icon,
                                xpReward: achievement.xpReward,
                                rarity: achievement.rarity as any,
                            });
                        }, 1500 + index * 500);
                    });
                }
            }
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
            {/* Gamification Animations */}
            <XPGainAnimations />
            <AchievementToasts />
            {showCoinGain && (
                <CoinGainAnimation
                    amount={coinsEarned}
                    onComplete={() => setShowCoinGain(false)}
                />
            )}

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

                {/* Combo Meter */}
                {combo > 0 && (
                    <ComboMeter
                        combo={combo}
                        multiplier={multiplier}
                        maxCombo={maxCombo}
                        variant="compact"
                    />
                )}
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
                className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4"
            >
                <div className="flex flex-wrap items-center gap-3">
                    <ExamBadge
                        institution={question.exam.institution}
                        year={question.exam.year}
                    />
                    {question.exam.position && (
                        <div className="px-3 py-1 bg-white rounded-lg border border-emerald-200">
                            <span className="text-xs font-semibold text-emerald-700">{question.exam.position}</span>
                        </div>
                    )}
                    {question.subject.topic && (
                        <div className="px-3 py-1 bg-white rounded-lg border border-gray-200">
                            <span className="text-xs text-gray-600">{question.subject.topic}</span>
                        </div>
                    )}
                    {question.subject.legislation && (
                        <div className="px-3 py-1 bg-white rounded-lg border border-gray-200 flex items-center gap-1">
                            <BookOpen className="w-3 h-3 text-gray-500" />
                            <span className="text-xs text-gray-600">{question.subject.legislation}</span>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Reference Text (if applicable) */}
            {question.referenceText && (
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
            )}

            {/* Question Content */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm"
            >
                <p className="text-base text-gray-800 leading-relaxed whitespace-pre-line">
                    {question.content}
                </p>
            </motion.div>

            {/* Answer Options */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="space-y-3"
            >
                {question.options.map((option, index) => (
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

            {/* Action Buttons Row - Explanation and Flashcards */}
            {isSubmitted && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-wrap items-center justify-center gap-3"
                >
                    {/* AI Explanation Button - Outlined Style */}
                    {question.explanation && (
                        <motion.button
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setShowExplanation(!showExplanation)}
                            className="group relative inline-flex items-center gap-2.5 px-8 py-3.5 bg-white border-2 border-emerald-500 text-emerald-700 rounded-xl hover:bg-emerald-50 transition-all shadow-sm hover:shadow-md overflow-hidden"
                        >
                            {/* Hover background effect */}
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
                    )}

                    {/* Flashcard Generation Button - Premium Style */}
                    {!flashcardsGenerated && (
                        <motion.button
                            onClick={handleGenerateFlashcards}
                            disabled={isGeneratingFlashcards}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            className="group relative inline-flex items-center gap-2.5 px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 overflow-hidden"
                        >
                            {/* Shine effect */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                initial={{ x: '-100%' }}
                                animate={{ x: '200%' }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 3,
                                    ease: "linear"
                                }}
                            />

                            <motion.div
                                animate={isGeneratingFlashcards ? {
                                    rotate: 360,
                                    scale: [1, 1.2, 1]
                                } : {}}
                                transition={isGeneratingFlashcards ? {
                                    rotate: { duration: 2, repeat: Infinity, ease: "linear" },
                                    scale: { duration: 1, repeat: Infinity, ease: "easeInOut" }
                                } : {}}
                                className="relative z-10"
                            >
                                <Sparkles className="w-5 h-5" />
                            </motion.div>
                            <span className="relative z-10 font-semibold text-[15px]">
                                {isGeneratingFlashcards ? 'Gerando Flashcards...' : 'Gerar Flashcards com IA'}
                            </span>
                        </motion.button>
                    )}
                </motion.div>
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
            <div className="flex items-center justify-between pt-4">
                <button
                    onClick={onPrevious}
                    disabled={questionNumber === 1}
                    className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
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
                        className="px-6 py-2.5 border-2 border-emerald-500 text-emerald-700 rounded-xl font-semibold hover:bg-emerald-50 transition-all"
                    >
                        Tentar Novamente
                    </button>
                )}

                <button
                    onClick={handleNextQuestion}
                    disabled={questionNumber === totalQuestions}
                    className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:border-gray-400 hover:bg-gray-50 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    Próxima →
                </button>
            </div>
        </div>
    );
}
