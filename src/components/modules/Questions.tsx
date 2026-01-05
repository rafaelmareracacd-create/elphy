"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import QuestionCard from "@/components/questions/QuestionCard";
import { supabase } from "@/lib/supabase";
import {
    Loader2, AlertCircle, Search,
    BookOpen, Calendar, Shuffle, RotateCcw,
    ChevronDown, X, CheckCircle2, XCircle, Sparkles,
    SlidersHorizontal, Target, Building2, GraduationCap,
    Bookmark, FileText, Save, Filter, Trash2, BookMarked,
    MessageSquare, Lightbulb, ChevronUp
} from "lucide-react";
import HeaderActions from "../dashboard/HeaderActions";

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

interface Filters {
    subject: string;
    year: string;
    searchQuery: string;
    status: "all" | "resolved" | "unresolved" | "correct" | "wrong";
    banca: string;
    institution: string;
    difficulty: string;
}

interface AdvancedFilters {
    excludeFromNotebooks: boolean;
    excludeFromSimulados: boolean;
    onlyNew: boolean;
    onlyWithComments: boolean;
    onlyWithExplanation: boolean;
    onlyMyNotes: boolean;
}

export default function QuestionsModule() {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [allQuestions, setAllQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [questionType, setQuestionType] = useState<"objetivas" | "discursivas">("objetivas");
    const [isPremium, setIsPremium] = useState(false);

    // Filter states
    const [filters, setFilters] = useState<Filters>({
        subject: "all",
        year: "all",
        searchQuery: "",
        status: "all",
        banca: "all",
        institution: "all",
        difficulty: "all"
    });

    // Advanced filter states
    const [advancedFilters, setAdvancedFilters] = useState<AdvancedFilters>({
        excludeFromNotebooks: false,
        excludeFromSimulados: false,
        onlyNew: false,
        onlyWithComments: false,
        onlyWithExplanation: false,
        onlyMyNotes: false
    });

    // Stats
    const [answeredCount, setAnsweredCount] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);

    // Available filter options
    const [subjects, setSubjects] = useState<string[]>([]);
    const [years, setYears] = useState<number[]>([]);
    const [bancas] = useState<string[]>(["CEBRASPE", "FCC", "VUNESP", "FGV", "CESPE"]);
    const [institutions] = useState<string[]>(["TCU", "STF", "CGU", "PF", "PRF"]);

    useEffect(() => {
        async function fetchQuestions() {
            try {
                setLoading(true);

                // Fetch premium status
                const { data: { user } } = await supabase.auth.getUser();
                if (user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('is_premium')
                        .eq('id', user.id)
                        .single();
                    if (profile) setIsPremium(profile.is_premium);
                }

                const { data, error } = await supabase
                    .from('questions')
                    .select('*')
                    .order('created_at', { ascending: false })
                    .order('num_item', { ascending: true })
                    .limit(200);

                if (error) throw error;

                if (!data || data.length === 0) {
                    setQuestions([]);
                    setAllQuestions([]);
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
                        content: [q.comando, q.texto_item].filter(Boolean).join('\n\n'),
                        referenceText: q.texto_associado || q.comando || undefined,
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

                    setAllQuestions(mappedQuestions);
                    setQuestions(mappedQuestions);

                    // Extract unique subjects and years
                    const uniqueSubjects = [...new Set(mappedQuestions.map(q => q.subject.name))].sort();
                    const uniqueYears = [...new Set(mappedQuestions.map(q => q.exam.year))].sort((a, b) => b - a);
                    setSubjects(uniqueSubjects);
                    setYears(uniqueYears);
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

    // Apply filters
    useEffect(() => {
        let filtered = [...allQuestions];

        if (filters.subject !== "all") {
            filtered = filtered.filter(q => q.subject.name === filters.subject);
        }

        if (filters.year !== "all") {
            filtered = filtered.filter(q => q.exam.year === parseInt(filters.year));
        }

        if (filters.searchQuery.trim()) {
            const query = filters.searchQuery.toLowerCase();
            filtered = filtered.filter(q =>
                q.content.toLowerCase().includes(query) ||
                q.subject.name.toLowerCase().includes(query)
            );
        }

        setQuestions(filtered);
        setCurrentQuestionIndex(0);
    }, [filters, allQuestions]);

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

    const handleShuffle = () => {
        const shuffled = [...questions].sort(() => Math.random() - 0.5);
        setQuestions(shuffled);
        setCurrentQuestionIndex(0);
    };

    const handleReset = () => {
        setFilters({
            subject: "all",
            year: "all",
            searchQuery: "",
            status: "all",
            banca: "all",
            institution: "all",
            difficulty: "all"
        });
        setAdvancedFilters({
            excludeFromNotebooks: false,
            excludeFromSimulados: false,
            onlyNew: false,
            onlyWithComments: false,
            onlyWithExplanation: false,
            onlyMyNotes: false
        });
        setCurrentQuestionIndex(0);
        setAnsweredCount(0);
        setCorrectCount(0);
    };

    const clearSearch = () => {
        setFilters(prev => ({ ...prev, searchQuery: "" }));
    };

    const hasActiveFilters = filters.subject !== "all" || filters.year !== "all" || filters.searchQuery || filters.status !== "all" || filters.banca !== "all" || filters.institution !== "all";
    const accuracy = answeredCount > 0 ? Math.round((correctCount / answeredCount) * 100) : 0;

    // Status button configs
    const statusButtons = [
        { value: "all", label: "TODAS", count: allQuestions.length },
        { value: "resolved", label: "RESOLVIDAS", count: answeredCount },
        { value: "unresolved", label: "NÃO RESOLVIDAS", count: allQuestions.length - answeredCount },
        { value: "correct", label: "ACERTEI", count: correctCount },
        { value: "wrong", label: "ERREI", count: answeredCount - correctCount },
    ];

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
        <div className="min-h-screen bg-[#F8F9FA] dark:bg-[#121212] transition-colors duration-300">
            {/* Top Toolbar - Unified across modules */}
            <header className="h-16 border-b border-gray-100 dark:border-gray-800 bg-white/80 dark:bg-[#1E1E1E]/80 backdrop-blur-xl flex items-center z-50 sticky top-0 px-6 justify-between transition-colors duration-300">
                <div className="flex items-center gap-2.5">
                    <BookOpen className="w-5 h-5 text-[#00B98E]" />
                    <span className="text-base font-bold text-gray-800 dark:text-gray-100 tracking-tight">Estudar Questões</span>
                </div>
                <HeaderActions />
            </header>

            {/* Main Filter Panel - Adjusted for the new top header */}
            <div className="bg-white dark:bg-[#181818] border-b border-gray-100 dark:border-gray-800 relative z-20 transition-colors duration-300">
                <div className="max-w-7xl mx-auto">
                    {/* Row 1: Status Buttons (Header moved to the toolbar above) */}
                    <div className="px-6 py-4 flex items-center gap-8 border-b border-gray-100/80 dark:border-gray-800/80">
                        <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide py-1">
                            {statusButtons.map((btn) => (
                                <button
                                    key={btn.value}
                                    onClick={() => setFilters(prev => ({ ...prev, status: btn.value as Filters["status"] }))}
                                    className={`px-4 py-2 text-xs font-bold rounded-lg transition-all border shadow-sm ${filters.status === btn.value
                                        ? "bg-[#00B98E] text-white border-[#00B98E] shadow-md shadow-emerald-500/20"
                                        : "bg-white dark:bg-[#2A2A2A] text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-500/50 hover:text-emerald-600 dark:hover:text-emerald-400"
                                        }`}
                                >
                                    {btn.label.toUpperCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Row 2: Filter Grid */}
                    {/* Row 2: Filter Grid */}
                    <div className="px-6 py-3 grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 border-b border-gray-100/80">
                        {/* Question Type */}
                        {/* Question Type */}
                        <div className="relative group">
                            <select
                                value={questionType}
                                onChange={(e) => setQuestionType(e.target.value as "objetivas" | "discursivas")}
                                className="w-full appearance-none pl-4 pr-10 py-2.5 bg-white dark:bg-[#2A2A2A] border border-[#00B98E] dark:border-emerald-500/50 rounded-lg text-emerald-600 dark:text-emerald-400 text-sm font-bold focus:outline-none shadow-sm transition-shadow group-hover:shadow-md group-hover:shadow-emerald-500/10"
                            >
                                <option value="objetivas">Objetivas</option>
                                <option value="discursivas">Discursivas</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#00B98E] pointer-events-none" />
                        </div>

                        {/* Search Input */}
                        {/* Search Input */}
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Palavra Chave"
                                value={filters.searchQuery}
                                onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 dark:bg-[#2A2A2A] border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-[#2A2A2A] transition-all text-sm text-gray-700 dark:text-gray-200 placeholder:text-gray-400 font-medium"
                            />
                        </div>

                        {/* Dropdown Filters */}
                        {/* Dropdown Filters */}
                        {[
                            { value: filters.subject, onChange: (v: string) => setFilters(p => ({ ...p, subject: v })), options: subjects, label: "Disciplina" },
                            { value: filters.banca, onChange: (v: string) => setFilters(p => ({ ...p, banca: v })), options: bancas, label: "Banca" },
                            { value: filters.institution, onChange: (v: string) => setFilters(p => ({ ...p, institution: v })), options: institutions, label: "Instituição" },
                            { value: filters.year, onChange: (v: string) => setFilters(p => ({ ...p, year: v })), options: years, label: "Ano" },
                            { value: filters.difficulty, onChange: (v: string) => setFilters(p => ({ ...p, difficulty: v })), options: [{ value: 'easy', label: 'Fácil' }, { value: 'medium', label: 'Médio' }, { value: 'hard', label: 'Difícil' }], label: "Dificuldade", isCustom: true },
                        ].map((filter, i) => (
                            <div key={i} className="relative group">
                                <select
                                    value={filter.value}
                                    onChange={(e) => filter.onChange(e.target.value)}
                                    className="w-full appearance-none pl-4 pr-10 py-2.5 bg-white dark:bg-[#2A2A2A] border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 font-medium focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10 transition-all hover:border-gray-300 dark:hover:border-gray-600"
                                >
                                    <option value="all">{filter.label}</option>
                                    {filter.isCustom
                                        ? filter.options.map((opt: any) => <option key={opt.value} value={opt.value}>{opt.label}</option>)
                                        : filter.options.map((opt: any) => <option key={opt} value={opt.toString()}>{opt}</option>)
                                    }
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none group-hover:text-emerald-500 transition-colors" />
                            </div>
                        ))}
                    </div>

                    {/* Row 3: Advanced Toggle */}
                    <div className="px-6 py-2.5 border-b border-gray-100/80">
                        <button
                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                            className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-emerald-600 transition-colors group"
                        >
                            <SlidersHorizontal className="w-4 h-4 transition-transform group-hover:scale-110" />
                            <span>Mostrar filtros avançados</span>
                        </button>
                    </div>

                    <AnimatePresence>
                        {showAdvancedFilters && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden bg-gray-50/30"
                            >
                                <div className="px-4 py-4 grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-gray-100/50">
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Exclusões</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { label: "Dos meus cadernos", checked: advancedFilters.excludeFromNotebooks, onChange: (v: boolean) => setAdvancedFilters(p => ({ ...p, excludeFromNotebooks: v })) },
                                                { label: "Dos meus simulados", checked: advancedFilters.excludeFromSimulados, onChange: (v: boolean) => setAdvancedFilters(p => ({ ...p, excludeFromSimulados: v })) },
                                                { label: "Inéditas", checked: advancedFilters.onlyNew, onChange: (v: boolean) => setAdvancedFilters(p => ({ ...p, onlyNew: v })) }
                                            ].map((opt, i) => (
                                                <label key={i} className="flex items-center gap-2 cursor-pointer group px-1">
                                                    <input type="checkbox" checked={opt.checked} onChange={(e) => opt.onChange(e.target.checked)} className="w-[14px] h-[14px] text-emerald-500 rounded border-gray-300 focus:ring-emerald-500" />
                                                    <span className="text-sm text-gray-600 group-hover:text-emerald-700">{opt.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest px-1">Requisitos</h4>
                                        <div className="grid grid-cols-2 gap-3">
                                            {[
                                                { label: "Gabarito Comentado", checked: advancedFilters.onlyWithExplanation, onChange: (v: boolean) => setAdvancedFilters(p => ({ ...p, onlyWithExplanation: v })) },
                                                { label: "Comentários", checked: advancedFilters.onlyWithComments, onChange: (v: boolean) => setAdvancedFilters(p => ({ ...p, onlyWithComments: v })) },
                                                { label: "Minhas Anotações", checked: advancedFilters.onlyMyNotes, onChange: (v: boolean) => setAdvancedFilters(p => ({ ...p, onlyMyNotes: v })) }
                                            ].map((opt, i) => (
                                                <label key={i} className="flex items-center gap-2 cursor-pointer group px-1">
                                                    <input type="checkbox" checked={opt.checked} onChange={(e) => opt.onChange(e.target.checked)} className="w-[14px] h-[14px] text-emerald-500 rounded border-gray-300 focus:ring-emerald-500" />
                                                    <span className="text-sm text-gray-600 group-hover:text-emerald-700">{opt.label}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Row 4: Filter List & Action Buttons */}
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="flex items-center gap-2 text-sm text-gray-500 shrink-0">
                                <Filter className="w-4 h-4 text-gray-400" />
                                <span className="font-semibold">Filtrar por: </span>
                            </div>

                            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
                                {Object.entries(filters).filter(([key, value]) => value !== "all" && value !== "" && key !== "status").length +
                                    Object.values(advancedFilters).filter(Boolean).length === 0 && (
                                        <span className="text-sm text-gray-300 italic">Os seus filtros aparecerão aqui.</span>
                                    )}

                                {Object.entries(filters).map(([key, value]) => {
                                    if (value === "all" || value === "" || key === "status") return null;

                                    let displayValue = value;
                                    let label = "";

                                    switch (key) {
                                        case 'subject': label = "Disciplina"; break;
                                        case 'banca': label = "Banca"; break;
                                        case 'institution': label = "Instituição"; break;
                                        case 'year': label = "Ano"; break;
                                        case 'difficulty':
                                            label = "Dificuldade";
                                            displayValue = value === 'easy' ? 'Fácil' : value === 'medium' ? 'Médio' : 'Difícil';
                                            break;
                                        case 'searchQuery': label = "Busca"; break;
                                    }

                                    return (
                                        <div key={key} className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-500/20 rounded-lg text-xs font-bold whitespace-nowrap group animate-in fade-in slide-in-from-left-2 duration-300">
                                            <span className="opacity-60 font-normal">{label}:</span>
                                            <span>{displayValue}</span>
                                            <button
                                                onClick={() => setFilters(prev => ({ ...prev, [key]: key === 'searchQuery' ? "" : "all" }))}
                                                className="ml-1 p-0.5 hover:bg-emerald-200/50 rounded-md transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    );
                                })}

                                {Object.entries(advancedFilters).map(([key, value]) => {
                                    if (!value) return null;

                                    let label = "";
                                    switch (key) {
                                        case 'excludeFromNotebooks': label = "Excluir: Meus cadernos"; break;
                                        case 'excludeFromSimulados': label = "Excluir: Meus simulados"; break;
                                        case 'onlyNew': label = "Inéditas"; break;
                                        case 'onlyWithComments': label = "Com comentários"; break;
                                        case 'onlyWithExplanation': label = "Gabarito comentado"; break;
                                        case 'onlyMyNotes': label = "Minhas anotações"; break;
                                    }

                                    return (
                                        <div key={key} className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded-lg text-xs font-bold whitespace-nowrap group animate-in fade-in slide-in-from-left-2 duration-300">
                                            <span>{label}</span>
                                            <button
                                                onClick={() => setAdvancedFilters(prev => ({ ...prev, [key]: false }))}
                                                className="ml-1 p-0.5 hover:bg-blue-200/50 rounded-md transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            <button className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors hover:bg-gray-50 px-3 py-1.5 rounded-lg">
                                <BookMarked className="w-4 h-4" />
                                <span>Gerar caderno</span>
                            </button>
                            <button className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-700 transition-colors hover:bg-gray-50 px-3 py-1.5 rounded-lg">
                                <Save className="w-4 h-4" />
                                <span>Salvar Filtros</span>
                            </button>
                            <button onClick={handleReset} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-red-500 transition-colors hover:bg-red-50 px-3 py-1.5 rounded-lg">
                                <Trash2 className="w-4 h-4" />
                                <span>Limpar</span>
                            </button>
                            <button className="px-6 py-2.5 bg-[#00B98E] text-white rounded-lg text-sm font-bold hover:bg-emerald-600 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
                                Filtrar
                            </button>
                        </div>
                    </div>

                    {/* Row 5: Stats Bar */}
                    <div className="px-6 py-3 flex items-center justify-between border-t border-gray-50 dark:border-white/5 bg-gray-50/30 dark:bg-white/5">
                        <div className="flex items-center gap-2.5 text-sm font-bold text-gray-700 dark:text-gray-300">
                            <div className="w-5 h-5 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                                <Target className="w-3.5 h-3.5 text-gray-400" />
                            </div>
                            <span>{questions.length} questões encontradas</span>
                        </div>

                        <div className="flex items-center gap-6">
                            <span className="text-sm font-bold text-emerald-600 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> {correctCount} certas
                            </span>
                            <span className="text-sm font-bold text-red-500 flex items-center gap-2">
                                <XCircle className="w-4 h-4" /> {answeredCount - correctCount} erradas
                            </span>
                            <div className="px-3 py-1 bg-gray-200/50 dark:bg-white/10 rounded-full text-gray-600 dark:text-gray-300 text-xs font-black flex items-center gap-1.5">
                                <Target className="w-3.5 h-3.5" />
                                {accuracy}%
                            </div>
                            <div className="h-4 w-px bg-gray-200"></div>
                            <button onClick={handleShuffle} className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                                <Shuffle className="w-4 h-4" />
                            </button>

                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content - Scrollable Question List */}
            <div className="max-w-5xl mx-auto px-4 py-6">
                {questions.length > 0 ? (
                    <div className="space-y-6">
                        {questions.map((question, index) => (
                            <QuestionCard
                                key={question.id}
                                question={question}
                                questionNumber={index + 1}
                                totalQuestions={questions.length}
                                onNext={() => { }}
                                onPrevious={() => { }}
                                showNavigation={false}
                                isPremium={isPremium}
                            />
                        ))}

                        {/* Load More / End of List Indicator */}
                        <div className="text-center py-8">
                            <p className="text-gray-500 text-sm">
                                Exibindo {questions.length} questões
                            </p>
                        </div>
                    </div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20 bg-white dark:bg-[#1E1E1E] rounded-2xl border border-dashed border-gray-300 dark:border-gray-700"
                    >
                        <div className="text-6xl mb-4">🔍</div>
                        <p className="text-gray-700 font-medium text-lg mb-2">Nenhuma questão encontrada</p>
                        <p className="text-gray-500 text-sm mb-4">Tente ajustar os filtros ou limpar a busca</p>
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium"
                        >
                            Limpar filtros
                        </button>
                    </motion.div>
                )}
            </div>
        </div>
    );
}
