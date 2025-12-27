"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import QuestionCard from "@/components/questions/QuestionCard";
import { supabase } from "@/lib/supabase";
import { Loader2, AlertCircle } from "lucide-react";

// --- Types ---
interface DatabaseQuestion {
    id: string;
    materia: string;
    comando: string | null;
    texto_associado: string | null;
    num_item: number;
    texto_item: string;
    gabarito: string | null;
    examen_ano: number | null;
    examen_turno: string | null;
    institution?: string;
}

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

export default function QuestionsModule() {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchQuestions() {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('questions')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .order('num_item', { ascending: true })
                    .limit(50);

                if (error) throw error;

                if (!data || data.length === 0) {
                    setQuestions([]);
                } else {
                    const mappedQuestions: Question[] = data.map((q: DatabaseQuestion) => ({
                        id: q.id,
                        exam: {
                            name: `Questão ${q.num_item} - ${q.examen_ano || ''}`,
                            institution: q.institution || "CEBRASPE",
                            year: q.examen_ano || new Date().getFullYear(),
                            position: q.examen_turno || undefined
                        },
                        subject: {
                            name: q.materia || "Geral",
                        },
                        content: [q.comando, `(${q.num_item}) ${q.texto_item}`].filter(Boolean).join('\n\n'),
                        referenceText: q.texto_associado || undefined,
                        type: "true-false",
                        options: [
                            {
                                letter: "C",
                                text: "Certo",
                                isCorrect: q.gabarito?.toUpperCase() === 'C'
                            },
                            {
                                letter: "E",
                                text: "Errado",
                                isCorrect: q.gabarito?.toUpperCase() === 'E'
                            }
                        ],
                        explanation: undefined
                    }));
                    setQuestions(mappedQuestions);
                }
            } catch (err: any) {
                console.error("Error fetching questions:", err);
                setError(err.message || "Erro ao carregar questões.");
            } finally {
                setLoading(false);
            }
        }

        fetchQuestions();
    }, []);

    const handleNext = () => {
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
        }
    };

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(prev => prev - 1);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
                    <p className="text-gray-500 font-medium">Carregando questões...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center">
                <div className="max-w-md w-full bg-white p-6 rounded-xl shadow-sm border border-red-100 flex flex-col items-center gap-4 text-center">
                    <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                        <AlertCircle className="w-6 h-6 text-red-500" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">Erro ao carregar</h3>
                        <p className="text-sm text-gray-500">{error}</p>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                    >
                        Tentar novamente
                    </button>
                </div>
            </div>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <div className="min-h-screen bg-[#F8F9FA] pt-20 pb-8 px-6">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Banco de Questões</h1>
                    <p className="text-gray-600">Pratique com questões reais do banco de dados</p>
                </motion.div>

                {questions.length > 0 ? (
                    <QuestionCard
                        question={currentQuestion}
                        questionNumber={currentQuestionIndex + 1}
                        totalQuestions={questions.length}
                        onNext={handleNext}
                        onPrevious={handlePrevious}
                    />
                ) : (
                    <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                        <p className="text-gray-500 font-medium">Nenhuma questão encontrada no banco de dados.</p>
                        <a href="/dashboard/ingestao" className="text-emerald-600 hover:text-emerald-700 font-semibold text-sm mt-2 inline-block">
                            Adicionar questões →
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
