"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
    BarChart as RechartsBarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    LineChart,
    Line
} from 'recharts';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from '@/components/ui/card';
import {
    Activity,
    Target,
    Clock,
    Calendar,
    Trophy,
    TrendingUp,
    Zap,
    BarChart2,
    ArrowLeft,
    Download,
    Eye,
    PieChart as PieChartIcon2
} from 'lucide-react';

interface ReviewLog {
    id: string;
    rating: 'again' | 'hard' | 'good' | 'easy';
    created_at: string;
    latency_ms: number;
}

interface Distribution {
    name: string;
    value: number;
    color: string;
    [key: string]: any;
}

const COLORS = {
    new: '#3B82F6',      // Blue
    learning: '#F59E0B', // Amber
    review: '#10B981',   // Emerald
    suspended: '#EF4444' // Red
};

interface AnkiStatsProps {
    onBack: () => void;
}

export default function AnkiStats({ onBack }: AnkiStatsProps) {
    const [loading, setLoading] = useState(true);
    const [logs, setLogs] = useState<ReviewLog[]>([]);
    const [distribution, setDistribution] = useState<Distribution[]>([]);
    const [streak, setStreak] = useState(0);
    const [totalCards, setTotalCards] = useState(0);
    const [todayCount, setTodayCount] = useState(0);
    const [averageRetention, setAverageRetention] = useState(0);
    const [averageTime, setAverageTime] = useState<number | null>(null);
    const [activityData, setActivityData] = useState<any[]>([]);

    // Sidebar filters
    const [period, setPeriod] = useState<'7' | '30' | 'all'>('30');
    const [showPerformance, setShowPerformance] = useState(true);
    const [showDistribution, setShowDistribution] = useState(true);

    useEffect(() => {
        fetchStats();
    }, [period]);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Fetch Logs based on period
            const periodDays = period === '7' ? 7 : period === '30' ? 30 : 365;
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - periodDays);

            let logsQuery = supabase
                .from('review_logs')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: true });

            if (period !== 'all') {
                logsQuery = logsQuery.gte('created_at', startDate.toISOString());
            }

            const { data: logData, error: logError } = await logsQuery;

            if (logError) throw logError;
            setLogs(logData as ReviewLog[]);

            // Calculate Today's Reviews
            const today = new Date().toDateString();
            const todayReviews = logData?.filter(l => new Date(l.created_at).toDateString() === today).length || 0;
            setTodayCount(todayReviews);

            // Calculate Retention (Percentage of 'good' + 'easy' / total)
            if (logData && logData.length > 0) {
                const successful = logData.filter(l => l.rating === 'good' || l.rating === 'easy').length;
                setAverageRetention(Math.round((successful / logData.length) * 100));

                // Calculate Average Time per card
                const logsWithTime = logData.filter(l => l.latency_ms && l.latency_ms > 0);
                if (logsWithTime.length > 0) {
                    const totalTime = logsWithTime.reduce((acc, l) => acc + l.latency_ms, 0);
                    setAverageTime(Math.round(totalTime / logsWithTime.length / 1000)); // Convert to seconds
                }
            }

            // Prepare Activity Data (Last 14 days)
            const activity = [];
            for (let i = 13; i >= 0; i--) {
                const d = new Date();
                d.setDate(d.getDate() - i);
                const dateStr = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
                const confirmDate = d.toDateString();

                const count = logData?.filter(l => new Date(l.created_at).toDateString() === confirmDate).length || 0;
                activity.push({ date: dateStr, count });
            }
            setActivityData(activity);


            // Fetch Card Distribution
            const { data: cardsData, error: cardsError } = await supabase
                .from('flashcards')
                .select('id, interval, is_suspended, next_review')
                .eq('user_id', user.id);

            if (cardsError) throw cardsError;

            setTotalCards(cardsData?.length || 0);

            let newCards = 0;
            let learning = 0;
            let review = 0;
            let suspended = 0;

            cardsData?.forEach(card => {
                if (card.is_suspended) {
                    suspended++;
                } else if (card.interval === 0) {
                    newCards++;
                } else if (card.interval < 21) { // Arbitrary threshold for 'learning' vs 'review' (mature)
                    learning++;
                } else {
                    review++;
                }
            });

            setDistribution([
                { name: 'Novos', value: newCards, color: COLORS.new },
                { name: 'Aprendendo', value: learning, color: COLORS.learning },
                { name: 'Revisando', value: review, color: COLORS.review },
                { name: 'Suspensos', value: suspended, color: COLORS.suspended },
            ]);

            // Calculate Streak (consecutive days with at least 1 review)
            let currentStreak = 0;
            const checkDate = new Date();
            for (let i = 0; i < 365; i++) {
                const dateStr = checkDate.toDateString();
                const hasReview = logData?.some(l => new Date(l.created_at).toDateString() === dateStr);
                if (hasReview) {
                    currentStreak++;
                    checkDate.setDate(checkDate.getDate() - 1);
                } else if (i > 0) {
                    break; // Stop if we miss a day (after today)
                } else {
                    checkDate.setDate(checkDate.getDate() - 1); // Check yesterday if no review today
                }
            }
            setStreak(currentStreak);

        } catch (error) {
            console.error("Error fetching stats:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center h-full">
                <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="h-full flex gap-0 overflow-hidden">
            {/* Main Content */}
            <div className="flex-1 p-6 md:p-8 overflow-y-auto space-y-8 animate-in fade-in duration-500 pr-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-100 dark:[&::-webkit-scrollbar-thumb]:bg-slate-800 hover:[&::-webkit-scrollbar-thumb]:bg-gray-200 dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-700 [&::-webkit-scrollbar-track]:bg-transparent">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 flex items-center justify-center text-gray-500 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:border-emerald-200 dark:hover:border-emerald-500/30 hover:shadow-md transition-all group"
                        >
                            <ArrowLeft size={20} className="group-hover:-translate-x-0.5 transition-transform" />
                        </button>
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <BarChart2 size={28} className="text-emerald-500" />
                                Estatísticas
                            </h2>
                            <p className="text-gray-500 dark:text-gray-400 mt-1">Acompanhe seu desempenho e progresso no aprendizado.</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 rounded-lg text-sm font-semibold border border-emerald-100 dark:border-emerald-500/20 flex items-center gap-2">
                            <Zap size={16} />
                            {todayCount} cards hoje
                        </div>
                    </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard
                        title="Total de Cards"
                        value={totalCards}
                        icon={CardIcon}
                        color="text-blue-500 dark:text-blue-400"
                        bg="bg-blue-50 dark:bg-blue-500/10"
                    />
                    <StatCard
                        title="Retenção Média"
                        value={`${averageRetention}%`}
                        icon={Target}
                        color="text-emerald-500 dark:text-emerald-400"
                        bg="bg-emerald-50 dark:bg-emerald-500/10"
                    />
                    <StatCard
                        title={`Revisões (${period === '7' ? '7d' : period === '30' ? '30d' : 'Total'})`}
                        value={logs.length}
                        icon={Activity}
                        color="text-purple-500 dark:text-purple-400"
                        bg="bg-purple-50 dark:bg-purple-500/10"
                    />
                    <StatCard
                        title="Tempo Médio"
                        value={averageTime ? `${averageTime}s` : '--s'}
                        icon={Clock}
                        color="text-orange-500 dark:text-orange-400"
                        bg="bg-orange-50 dark:bg-orange-500/10"
                        sub="por card"
                    />
                </div>

                {/* Charts Row */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* Review Activity */}
                    <Card className="bg-white/95 dark:bg-slate-900 border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
                        <CardHeader className="bg-gray-50/30 dark:bg-slate-800/30 pb-4">
                            <CardTitle className="text-lg flex items-center gap-2 dark:text-white">
                                <Calendar size={18} className="text-emerald-500" />
                                Atividade Recente
                            </CardTitle>
                            <CardDescription className="dark:text-slate-400">Número de revisões nos últimos 14 dias</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="h-[250px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsBarChart data={activityData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="currentColor" className="text-gray-100 dark:text-slate-800" />
                                        <XAxis
                                            dataKey="date"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: 'currentColor', fontSize: 12 }}
                                            className="text-gray-400 dark:text-slate-600"
                                            dy={10}
                                        />
                                        <YAxis
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: 'currentColor', fontSize: 12 }}
                                            className="text-gray-400 dark:text-slate-600"
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'currentColor', opacity: 0.1 }}
                                            contentStyle={{
                                                borderRadius: '12px',
                                                border: 'none',
                                                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                                                backgroundColor: 'rgba(30, 41, 59, 0.8)',
                                                color: '#f8fafc',
                                                backdropFilter: 'blur(8px)'
                                            }}
                                            itemStyle={{ color: '#f8fafc' }}
                                        />
                                        <Bar dataKey="count" name="Revisões" fill="#10B981" radius={[4, 4, 0, 0]} barSize={20} />
                                    </RechartsBarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card Distribution */}
                    <Card className="bg-white/95 dark:bg-slate-900 border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
                        <CardHeader className="bg-gray-50/30 dark:bg-slate-800/30 pb-4">
                            <CardTitle className="text-lg flex items-center gap-2 dark:text-white">
                                <LayersIcon size={18} className="text-blue-500" />
                                Distribuição do Baralho
                            </CardTitle>
                            <CardDescription className="dark:text-slate-400">Estado atual de todos os seus cards</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="h-[250px] w-[250px] relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={distribution}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {distribution.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Center Text */}
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-3xl font-bold text-gray-900 dark:text-white">{totalCards}</span>
                                    <span className="text-xs text-gray-400 dark:text-slate-500 font-medium uppercase tracking-wider">Total</span>
                                </div>
                            </div>

                            {/* Legend */}
                            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
                                {distribution.map((item) => (
                                    <div key={item.name} className="flex items-center gap-2.5">
                                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-gray-400 dark:text-slate-500 uppercase tracking-wider">{item.name}</span>
                                            <span className="text-sm font-bold text-gray-700 dark:text-slate-200">{item.value}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Sidebar */}
            <aside className="w-80 shrink-0 bg-white dark:bg-slate-900 border-l border-gray-100 dark:border-white/5 shadow-xl p-6 space-y-6 overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-100 dark:[&::-webkit-scrollbar-thumb]:bg-slate-800 hover:[&::-webkit-scrollbar-thumb]:bg-gray-200 dark:hover:[&::-webkit-scrollbar-thumb]:bg-slate-700">
                {/* Sidebar Header */}
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white">
                        <BarChart2 size={22} />
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Análise</h3>
                        <p className="text-xs text-gray-400 dark:text-slate-500 uppercase tracking-wide">Configurações & Filtros</p>
                    </div>
                </div>

                {/* Period Filter */}
                <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Calendar size={12} className="text-purple-500" /> Período
                    </h4>
                    <div className="space-y-2">
                        {(['7', '30', 'all'] as const).map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p)}
                                className={`w-full px-4 py-3 rounded-xl text-left text-sm font-semibold transition-all flex items-center justify-between ${period === p
                                    ? 'bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border-2 border-purple-200 dark:border-purple-500/30'
                                    : 'bg-gray-50 dark:bg-white/5 text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-white/10 border-2 border-transparent'
                                    }`}
                            >
                                {p === '7' ? 'Últimos 7 dias' : p === '30' ? 'Últimos 30 dias' : 'Todo o período'}
                                {period === p && <div className="w-2 h-2 rounded-full bg-purple-500" />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Visualization Toggles */}
                <div className="space-y-3">
                    <h4 className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Eye size={12} className="text-purple-500" /> Visualização
                    </h4>
                    <div className="space-y-2">
                        <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                                    <BarChart2 size={14} />
                                </div>
                                <div>
                                    <span className="text-sm font-semibold text-gray-700 dark:text-slate-200">Desempenho</span>
                                    <p className="text-xs text-gray-400 dark:text-slate-500">Acertos vs. Erros</p>
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                checked={showPerformance}
                                onChange={(e) => setShowPerformance(e.target.checked)}
                                className="w-5 h-5 rounded border-gray-300 dark:border-white/10 text-purple-600 focus:ring-purple-500 bg-white dark:bg-slate-800"
                            />
                        </label>
                        <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-white/5 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                                    <PieChartIcon2 size={14} />
                                </div>
                                <div>
                                    <span className="text-sm font-semibold text-gray-700 dark:text-slate-200">Distribuição</span>
                                    <p className="text-xs text-gray-400 dark:text-slate-500">Por dificuldade</p>
                                </div>
                            </div>
                            <input
                                type="checkbox"
                                checked={showDistribution}
                                onChange={(e) => setShowDistribution(e.target.checked)}
                                className="w-5 h-5 rounded border-gray-300 dark:border-white/10 text-purple-600 focus:ring-purple-500 bg-white dark:bg-slate-800"
                            />
                        </label>
                    </div>
                </div>

                {/* Export Button */}
                <button
                    onClick={() => {
                        const csvContent = [
                            ['Data', 'Rating', 'Tempo (ms)'],
                            ...logs.map(l => [
                                new Date(l.created_at).toLocaleDateString('pt-BR'),
                                l.rating,
                                l.latency_ms || 0
                            ])
                        ].map(row => row.join(',')).join('\n');

                        const blob = new Blob([csvContent], { type: 'text/csv' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `anki-stats-${new Date().toISOString().split('T')[0]}.csv`;
                        a.click();
                    }}
                    className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 text-gray-700 dark:text-slate-300 rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2 border border-gray-200 dark:border-white/10"
                >
                    <Download size={16} />
                    Exportar Relatório CSV
                </button>
            </aside>
        </div >
    );
}

function StatCard({ title, value, icon: Icon, color, bg, sub }: any) {
    return (
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm flex items-start justify-between group hover:shadow-md transition-shadow">
            <div>
                <p className="text-[11px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mb-1">{title}</p>
                <div className="flex items-baseline gap-1">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{value}</h3>
                    {sub && <span className="text-xs text-gray-400 dark:text-slate-500 font-medium">{sub}</span>}
                </div>
            </div>
            <div className={`p-2.5 rounded-xl ${bg} ${color} group-hover:scale-110 transition-transform`}>
                <Icon size={20} />
            </div>
        </div>
    );
}

// Icons
function CardIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <path d="M7 7h3" />
            <path d="M7 11h9" />
            <path d="M7 15h3" />
        </svg>
    )
}

function LayersIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
            <path d="m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65" />
            <path d="m22 6.93-9.17 4.16a2 2 0 0 1-1.66 0L2 6.93" />
        </svg>
    )
}
