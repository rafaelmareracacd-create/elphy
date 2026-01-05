"use client";

import { useState, useEffect, useRef } from "react";
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";

import PlannerColumn from "./PlannerColumn";
import MattersColumn from "./MattersColumn";
import PlannerCard from "./PlannerCard";
import SubjectCard from "./SubjectCard";
import CreateTaskModal from "./CreateTaskModal";
import CreateSubjectModal from "./CreateSubjectModal";
import DraggableSubjectCard from "./DraggableSubjectCard";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { supabase } from "@/lib/supabase";
import { useStudyData, Subject } from "@/hooks/useStudyData";
import Toast from "@/components/ui/Toast";

interface PlannerTask {
    id: string;
    title: string;
    duration: string; // Display string, e.g. "1h 30m"
    duration_minutes: number;
    color: string;
    day_of_week: string; // 'monday', etc.
    start_time?: string;
    order_index?: number;
}

const DAYS = [
    { id: "monday", title: "Segunda", color: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20" },
    { id: "tuesday", title: "Terça", color: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20" },
    { id: "wednesday", title: "Quarta", color: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20" },
    { id: "thursday", title: "Quinta", color: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20" },
    { id: "friday", title: "Sexta", color: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20" },
    { id: "saturday", title: "Sábado", color: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20" },
    { id: "sunday", title: "Domingo", color: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20" },
];

interface PlannerBoardProps {
    externalShowAddModal?: boolean;
    onExternalModalClose?: () => void;
}

const SUBJECT_COLOR_MAP: Record<string, string> = {
    "bg-red-500": "#ef4444",
    "bg-orange-500": "#f97316",
    "bg-amber-500": "#f59e0b",
    "bg-yellow-500": "#eab308",
    "bg-lime-500": "#84cc16",
    "bg-green-500": "#22c55e",
    "bg-emerald-500": "#10b981",
    "bg-teal-500": "#14b8a6",
    "bg-cyan-500": "#06b6d4",
    "bg-sky-500": "#0ea5e9",
    "bg-blue-500": "#3b82f6",
    "bg-indigo-500": "#6366f1",
    "bg-violet-500": "#8b5cf6",
    "bg-purple-500": "#a855f7",
    "bg-fuchsia-500": "#d946ef",
    "bg-pink-500": "#ec4899",
    "bg-rose-500": "#f43f5e",
};

export default function PlannerBoard({ externalShowAddModal, onExternalModalClose }: PlannerBoardProps) {
    const { addSubject, subjects } = useStudyData();
    const [tasks, setTasks] = useState<PlannerTask[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeSubject, setActiveSubject] = useState<Subject | null>(null);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState<string | null>(null);
    const [toast, setToast] = useState<{ isVisible: boolean; message: string; type?: 'error' | 'success' }>({ isVisible: false, message: '' });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);

    // Sync external modal state
    useEffect(() => {
        if (externalShowAddModal) {
            setIsModalOpen(true);
            setCreateTaskDay("monday"); // Default day when using top navbar
        }
    }, [externalShowAddModal]);

    // Update parent when modal closes
    useEffect(() => {
        if (!isModalOpen && externalShowAddModal && onExternalModalClose) {
            onExternalModalClose();
        }
    }, [isModalOpen, externalShowAddModal, onExternalModalClose]);
    const [createTaskDay, setCreateTaskDay] = useState("monday");
    const [editingTask, setEditingTask] = useState<PlannerTask | null>(null);
    const [dragStartTime, setDragStartTime] = useState<string | undefined | null>(undefined);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Delete Modal State
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [taskToDelete, setTaskToDelete] = useState<string | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const currentScroll = scrollRef.current.scrollLeft;
            const scrollAmount = 300; // Slightly larger for better feel
            const targetScroll = direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount;

            scrollRef.current.scrollTo({
                left: targetScroll,
                behavior: 'smooth'
            });
        }
    };

    useEffect(() => {
        fetchTasks();
        fetchUser();
    }, []);

    const fetchUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            setUserId(user.id);
        }
    };

    const fetchTasks = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("planner_tasks")
            .select("*")
            .order("order_index", { ascending: true });

        if (error) {
            console.error("Error fetching tasks:", error);
        } else if (data) {
            // Map DB fields to UI fields if needed
            const mappedTasks = data.map(t => ({
                ...t,
                duration: `${Math.floor(t.duration_minutes / 60)}h ${t.duration_minutes % 60} m`
            }));
            setTasks(mappedTasks);
        }
        setLoading(false);
    };



    const handleEditTask = (task: PlannerTask) => {
        setEditingTask(task);
        setCreateTaskDay(task.day_of_week);
        setIsModalOpen(true);
    };

    const openCreateTaskModal = (dayId: string) => {
        setCreateTaskDay(dayId);
        setIsModalOpen(true);
    };

    const handleTaskSubmit = async (data: { title: string; duration: number; color: string; startTime?: string }) => {
        if (editingTask) {
            // Update Logic
            const updatedTask = {
                ...editingTask,
                title: data.title,
                duration_minutes: data.duration,
                color: data.color,
                start_time: data.startTime,
                duration: `${Math.floor(data.duration / 60)}h ${data.duration % 60}m` // Optimistic UI update
            };

            setTasks(prev => prev.map(t => t.id === editingTask.id ? updatedTask : t));

            const { error } = await supabase
                .from("planner_tasks")
                .update({
                    title: data.title,
                    duration_minutes: data.duration,
                    color: data.color,
                    start_time: data.startTime
                })
                .eq("id", editingTask.id);

            if (error) {
                console.error("Error updating task:", error);
                fetchTasks(); // Revert
            }
        } else {
            // Create Logic
            if (!userId) {
                setToast({ isVisible: true, message: 'Você precisa estar logado para criar tarefas', type: 'error' });
                return;
            }
            const newTask = {
                user_id: userId,
                title: data.title,
                day_of_week: createTaskDay,
                duration_minutes: data.duration,
                color: data.color,
                start_time: data.startTime,
                order_index: tasks.filter(t => t.day_of_week === createTaskDay).length
            };

            // Optimistic update
            const tempId = Math.random().toString();
            const durationStr = `${Math.floor(data.duration / 60)}h ${data.duration % 60}m`;

            setTasks([...tasks, { ...newTask, id: tempId, duration: durationStr }]);

            const { data: insertedTask, error } = await supabase
                .from("planner_tasks")
                .insert(newTask)
                .select()
                .single();

            if (error) {
                console.error("Error creating task:", error);
                // Revert optimistic update
                setTasks(prev => prev.filter(t => t.id !== tempId));
            } else if (insertedTask) {
                // Replace temp task with real one
                setTasks(prev => prev.map(t => t.id === tempId ? { ...t, id: insertedTask.id, duration: `${Math.floor(insertedTask.duration_minutes / 60)}h ${insertedTask.duration_minutes % 60}m` } : t));
            }
        }

        setIsModalOpen(false);
        setEditingTask(null);
    };

    const promptDeleteTask = (taskId: string) => {
        setTaskToDelete(taskId);
        setIsDeleteModalOpen(true);
    };

    const confirmDeleteTask = async () => {
        if (!taskToDelete) return;

        // Optimistic update
        setTasks((prev) => prev.filter((t) => t.id !== taskToDelete));

        const { error } = await supabase.from("planner_tasks").delete().eq("id", taskToDelete);

        if (error) {
            console.error("Error deleting task:", error);
            fetchTasks(); // Revert on error
        }

        setTaskToDelete(null);
    };

    // Find column for a given task ID
    const findContainer = (id: string) => {
        if (id === 'inventory') return 'inventory';
        if (DAYS.some(d => d.id === id)) return id;
        return tasks.find((t) => t.id === id)?.day_of_week;
    };

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const activeIdStr = active.id as string;

        // Try to get subject from data
        if (active.data.current?.type === 'Subject') {
            setActiveId(activeIdStr);
            setActiveSubject(active.data.current.subject);
            return;
        }

        // Fallback: Check ID prefix
        if (activeIdStr.startsWith('subject-')) {
            const subjectId = activeIdStr.replace('subject-', '');
            const subject = subjects.find(s => s.id === subjectId);
            if (subject) {
                setActiveId(activeIdStr);
                setActiveSubject(subject);
                return;
            }
        }

        setActiveId(activeIdStr);
        const task = tasks.find(t => t.id === active.id);
        setDragStartTime(task?.start_time);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        if (activeId === overId) return;

        const activeTask = tasks.find(t => t.id === activeId);
        const overTask = tasks.find(t => t.id === overId);

        if (!activeTask) return;

        const overIsColumn = DAYS.some(d => d.id === overId) || overId === 'inventory';

        // HANDLING SUBJECT DRAGGING (New Logic)
        if (active.data.current?.type === 'Subject') {
            // We don't visually move subjects into the list during drag (it would be complex to fake a task)
            // But we allow "dropping" on a column or task in handleDragEnd.
            // For now, no specific "drag over" logic for subjects except maybe highlighting
            return;
        }

        if (overTask) {
            if (activeTask.day_of_week !== overTask.day_of_week) {
                setTasks((prev) => {
                    const activeIndex = prev.findIndex(t => t.id === activeId);
                    const overIndex = prev.findIndex(t => t.id === overId);

                    const updated = [...prev];
                    updated[activeIndex] = { ...activeTask, day_of_week: overTask.day_of_week };

                    return arrayMove(updated, activeIndex, overIndex);
                });
            } else {
                setTasks((prev) => {
                    const activeIndex = prev.findIndex(t => t.id === activeId);
                    const overIndex = prev.findIndex(t => t.id === overId);
                    return arrayMove(prev, activeIndex, overIndex);
                });
            }
        } else if (overIsColumn) {
            if (activeTask.day_of_week !== overId) {
                setTasks((prev) => {
                    return prev.map(t => t.id === activeId ? { ...t, day_of_week: overId } : t);
                });
            }
        }
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        // Reset drag states
        setActiveId(null);
        setDragStartTime(null);
        setActiveSubject(null);

        if (!over) {
            return;
        }

        const activeId = active.id as string;
        const overId = over.id as string;

        // 0. Handle Task Drop -> Matters Column (Unschedule/Delete)
        if (overId === 'matters-column' && active.data.current?.type !== 'Subject') {
            // Optimistic update
            setTasks((prev) => prev.filter((t) => t.id !== activeId));

            const { error } = await supabase.from("planner_tasks").delete().eq("id", activeId);

            if (error) {
                console.error("Error deleting task (unschedule):", error);
                fetchTasks(); // Revert on error
            }
            return;
        }

        // 1. Handle Subject Drop -> Create Task
        if (active.data.current?.type === 'Subject') {
            const subject = active.data.current.subject as Subject;
            let targetDay = '';

            // Determine target day
            if (DAYS.some(d => d.id === overId)) {
                targetDay = overId;
            } else {
                // Dropped on a task?
                const overTask = tasks.find(t => t.id === overId);
                if (overTask) {
                    targetDay = overTask.day_of_week;
                }
            }

            if (targetDay) {
                if (!userId) {
                    setToast({ isVisible: true, message: 'Você precisa estar logado para criar tarefas', type: 'error' });
                    return;
                }
                // Convert tailwind class to hex
                const hexColor = SUBJECT_COLOR_MAP[subject.color] || '#10b981'; // Default to emerald if not found

                // Create the task immediately
                const newTask: any = {
                    user_id: userId,
                    title: subject.name, // Use subject name
                    day_of_week: targetDay,
                    duration_minutes: 60, // Default 1 hour
                    color: hexColor, // Use HEX color
                    start_time: null,
                    order_index: tasks.filter(t => t.day_of_week === targetDay).length
                };

                // Optimistic UI
                const tempId = Math.random().toString();
                const durationStr = `1h 0m`;

                setTasks(prev => [...prev, { ...newTask, id: tempId, duration: durationStr } as PlannerTask]);

                // Persist
                const { data: insertedTask, error } = await supabase
                    .from("planner_tasks")
                    .insert(newTask)
                    .select()
                    .single();

                if (error) {
                    console.error("Error creating task from subject:", error);
                    setTasks(prev => prev.filter(t => t.id !== tempId));
                } else if (insertedTask) {
                    setTasks(prev => prev.map(t => t.id === tempId ? { ...t, id: insertedTask.id } : t));
                }
            }
            return;
        }

        const activeTask = tasks.find(t => t.id === activeId);
        if (!activeTask) return;

        // After reordering is finished, we need to update order_index for ALL tasks in affected columns
        // to persist the new state to Supabase.


        const affectedDays = new Set<string>();
        affectedDays.add(activeTask.day_of_week);
        // If we want to be thorough, we can update everything, but let's stick to the current view

        // Calculate new order_index for all tasks currently in state
        // We'll iterate through each column and assign indices 0, 1, 2...
        const updatedTasks = [...tasks];
        const dayTasks: Record<string, PlannerTask[]> = {};

        // Group by day
        updatedTasks.forEach(t => {
            if (!dayTasks[t.day_of_week]) dayTasks[t.day_of_week] = [];
            dayTasks[t.day_of_week].push(t);
        });

        // Update order_index within each group based on current array order
        const batchUpdates: any[] = [];

        Object.keys(dayTasks).forEach(day => {
            dayTasks[day].forEach((task, index) => {
                task.order_index = index;
                batchUpdates.push({
                    id: task.id,
                    day_of_week: task.day_of_week,
                    order_index: index,
                    // Preserve start_time if it exists
                    start_time: task.start_time || null
                });
            });
        });

        setTasks(updatedTasks);

        // Batch update in Supabase
        // Note: For now we'll do individual updates or use a specific RPC if available. 
        // Individual concurrent updates are okay for small lists.
        try {
            await Promise.all(batchUpdates.map(async (upd) => {
                return supabase
                    .from("planner_tasks")
                    .update({
                        day_of_week: upd.day_of_week,
                        order_index: upd.order_index,
                        updated_at: new Date().toISOString()
                    })
                    .eq("id", upd.id);
            }));
        } catch (error) {
            console.error("Error persisting reorder:", error);
            fetchTasks(); // Revert on failure
        }
    };

    const activeTask = tasks.find(t => t.id === activeId);

    const dropAnimation = {
        sideEffects: defaultDropAnimationSideEffects({
            styles: {
                active: {
                    opacity: '0.5',
                },
            },
        }),
    };

    const sortTasksByTime = (taskList: PlannerTask[]) => {
        // Now fully relies on order_index which is updated during drag
        return [...taskList].sort((a, b) => (a.order_index || 0) - (b.order_index || 0));
    };

    return (
        <div className="flex flex-col min-h-full w-full">
            {/* Action Bar - Simplified */}
            <div className="relative z-10 flex items-center justify-between mb-8 flex-wrap gap-4 px-8">
                <div className="flex items-center gap-2">


                    <div className="flex items-center gap-1 bg-white/80 dark:bg-white/5 p-1 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm backdrop-blur-md transition-colors">
                        <button
                            type="button"
                            onClick={() => scroll('left')}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 hover:shadow-sm rounded-lg text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all active:scale-90"
                            title="Anterior"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="w-px h-4 bg-gray-100 dark:bg-white/10 mx-1" />
                        <button
                            type="button"
                            onClick={() => scroll('right')}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 hover:shadow-sm rounded-lg text-slate-400 hover:text-emerald-500 dark:hover:text-emerald-400 transition-all active:scale-90"
                            title="Próximo"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>

                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-3 hidden sm:block">
                        * Arraste para organizar sua semana
                    </span>
                </div>
                <div className="px-4 py-2 bg-white/80 dark:bg-white/5 rounded-xl border border-gray-100 dark:border-white/10 shadow-sm backdrop-blur-md transition-colors">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                        Total: <span className="text-emerald-600 dark:text-emerald-400">{tasks.length}</span> tarefas
                    </span>
                </div>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div
                    ref={scrollRef}
                    className="flex-1 flex items-start gap-4 overflow-x-auto pb-8 px-8 no-scrollbar"
                >
                    {/* Matters Column */}
                    <div className="flex-shrink-0">
                        <MattersColumn
                            onAddMatter={() => setIsSubjectModalOpen(true)}
                            usedSubjects={Array.from(new Set(tasks.map(t => t.title)))}
                        />
                    </div>

                    {DAYS.map((day) => (
                        <div key={day.id} className="flex-shrink-0">
                            <PlannerColumn
                                id={day.id}
                                title={day.title}
                                tasks={sortTasksByTime(tasks.filter(t => t.day_of_week === day.id))}
                                isToday={new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() === day.id}
                                onAddTask={() => openCreateTaskModal(day.id)}
                                onRemoveTask={promptDeleteTask}
                                onEditTask={handleEditTask}
                                colorClass={day.color}
                                isCompact={true}
                            />
                        </div>
                    ))}
                </div>

                <DragOverlay dropAnimation={dropAnimation}>
                    {activeSubject ? (
                        <div className="rotate-3 cursor-grabbing pointer-events-none w-[220px]">
                            <SubjectCard subject={activeSubject} />
                        </div>
                    ) : activeTask ? (
                        <div className="rotate-3 cursor-grabbing pointer-events-none">
                            <PlannerCard task={activeTask} />
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            <CreateTaskModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingTask(null);
                }}
                onSubmit={handleTaskSubmit}
                initialDay={createTaskDay}
                usedColors={tasks.map(t => t.color)}
                initialData={editingTask ? {
                    id: editingTask.id,
                    title: editingTask.title,
                    duration: editingTask.duration_minutes,
                    color: editingTask.color,
                    startTime: editingTask.start_time
                } : null}
            />

            <CreateSubjectModal
                isOpen={isSubjectModalOpen}
                onClose={() => setIsSubjectModalOpen(false)}
                onSubmit={(data) => {
                    addSubject(data.title, data.color);
                }}
            />

            <DeleteConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDeleteTask}
            />

            <Toast
                isVisible={toast.isVisible}
                message={toast.message}
                onClose={() => setToast({ ...toast, isVisible: false })}
            />
        </div >
    );
}
