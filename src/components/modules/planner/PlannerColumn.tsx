import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import PlannerCard from "./PlannerCard";
import { Clock, Plus } from "lucide-react";

interface PlannerTask {
    id: string;
    title: string;
    duration: string;
    duration_minutes: number;
    color: string;
    day_of_week: string;
    start_time?: string; // New field: "08:00"
}

interface Props {
    id: string; // The day
    title: string;
    tasks: PlannerTask[];
    onAddTask?: () => void;
    onRemoveTask?: (id: string) => void;
    onEditTask?: (task: PlannerTask) => void;
    isToday?: boolean;
    colorClass?: string;
    isCompact?: boolean;
}

export default function PlannerColumn({ id, title, tasks, onAddTask, onRemoveTask, onEditTask, isToday, colorClass, isCompact = true }: Props) {
    const { setNodeRef, isOver } = useDroppable({
        id: id,
    });

    const totalDuration = tasks.reduce((acc, t) => acc + t.duration_minutes, 0);
    const hours = Math.floor(totalDuration / 60);
    const mins = totalDuration % 60;

    // Use default if not provided
    const safeColorClass = colorClass || "bg-gray-50 text-gray-700 border-gray-200";



    return (
        <div className={`flex flex-col h-fit min-w-[200px] w-full max-w-[260px] bg-white dark:bg-[#1e1e1e] rounded-[24px] border border-gray-100 dark:border-white/5 shadow-2xl dark:shadow-black/50 overflow-hidden transition-all duration-300`}>
            {/* Header */}
            <div className={`px-5 py-4 flex items-start justify-between ${colorClass || 'bg-emerald-50 dark:bg-emerald-500/10'}`}>
                <div className="flex flex-col gap-1">
                    <h3 className={`font-bold text-sm tracking-tight ${colorClass?.includes('text-emerald-700') ? 'text-emerald-950 dark:text-white' : 'text-gray-900 dark:text-white'}`}>
                        {title}
                    </h3>
                    <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-400">
                        {tasks.length} {tasks.length === 1 ? 'tarefa' : 'tarefas'}
                    </span>
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-white/5 border border-emerald-500/20 text-emerald-400 shadow-sm mt-1 shrink-0">
                    <Clock className="w-3.5 h-3.5 text-emerald-500" />
                    <span>
                        {hours > 0 ? `${hours}h` : ''}{mins > 0 ? `${mins}m` : hours === 0 ? '0m' : ''}
                    </span>
                </div>
            </div>

            {/* Content Area */}
            <div
                ref={setNodeRef}
                className={`flex-1 p-5 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/5 ${isOver ? 'bg-emerald-500/5' : ''}`}
            >
                <SortableContext
                    id={id}
                    items={tasks.map(t => t.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {tasks.map((task) => (
                        <PlannerCard
                            key={task.id}
                            task={task}
                            onRemove={onRemoveTask}
                            onClick={onEditTask}
                            isCompact={isCompact}
                        />
                    ))}
                </SortableContext>

                {tasks.length === 0 && (
                    <div className="h-20 border-2 border-dashed border-white/5 rounded-3xl flex items-center justify-center text-slate-700 text-[10px] font-bold uppercase tracking-widest select-none">
                        Livre
                    </div>
                )}

                <button
                    onClick={onAddTask}
                    className="group w-full py-4 flex items-center justify-center gap-2 text-[10px] font-bold text-slate-500 hover:text-emerald-400 uppercase tracking-widest hover:bg-emerald-500/10 rounded-2xl transition-all"
                >
                    <div className="w-4 h-4 rounded-full border-2 border-white/10 group-hover:border-emerald-500 flex items-center justify-center transition-colors">
                        <Plus className="w-2.5 h-2.5 text-slate-500 group-hover:text-emerald-400 transition-colors" strokeWidth={3} />
                    </div>
                    Adicionar
                </button>
            </div>
        </div>
    );
}


