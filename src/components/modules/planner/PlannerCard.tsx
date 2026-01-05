import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Clock, X } from "lucide-react";

interface PlannerTask {
    id: string;
    title: string;
    duration: string;
    duration_minutes: number;
    color: string;
    day_of_week: string;
    start_time?: string; // e.g. "08:00"
}

interface Props {
    task: PlannerTask;
    onRemove?: (id: string) => void;
    onClick?: (task: PlannerTask) => void;
    isCompact?: boolean;
}

export default function PlannerCard({ task, onRemove, onClick, isCompact = false }: Props) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: task.id,
        data: {
            type: "Task",
            task,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className={`opacity-50 rounded-[24px] border-2 border-dashed border-white/10 bg-white/5 ${isCompact ? 'h-[60px]' : 'h-[100px]'}`}
            />
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={{
                ...style,
                backgroundColor: task.color
            }}
            onClick={() => onClick?.(task)}
            className={`
                ${isCompact ? 'p-3 rounded-[16px]' : 'p-5 rounded-[24px]'}
                shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all duration-300 
                cursor-pointer active:cursor-grabbing group relative overflow-hidden ring-1 ring-black/5
            `}
            {...attributes}
            {...listeners}
        >
            <div className="flex flex-col gap-1.5 relative z-10 w-full">
                <div className="flex items-start justify-between gap-2">
                    <h4 className={`
                        font-bold text-white leading-tight drop-shadow-md flex-1 break-words tracking-tight
                        ${isCompact ? 'text-[13px] line-clamp-1' : 'text-[16px]'}
                    `}>
                        {task.title}
                    </h4>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove?.(task.id);
                        }}
                        className={`
                            text-white/60 hover:text-white hover:bg-white/20 rounded-full transition-all opacity-0 group-hover:opacity-100
                            ${isCompact ? 'p-1 -mr-1 -mt-1' : 'p-1.5 -mr-2 -mt-2'}
                        `}
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>

                <div className="flex items-center self-start gap-2">
                    {task.start_time ? (
                        <div className={`
                            flex items-center gap-1.5 bg-black/15 text-white font-bold backdrop-blur-sm border border-black/5 shadow-sm
                            ${isCompact ? 'px-2 py-0.5 rounded-lg text-[10px]' : 'px-3 py-1.5 rounded-xl text-xs'}
                        `}>
                            <Clock className={`opacity-90 ${isCompact ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'}`} />
                            <span>
                                {task.start_time} - {(() => {
                                    const [h, m] = task.start_time.split(':').map(Number);
                                    const totalMinutes = h * 60 + m + task.duration_minutes;
                                    const endH = Math.floor(totalMinutes / 60) % 24;
                                    const endM = totalMinutes % 60;
                                    return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
                                })()}
                            </span>
                        </div>
                    ) : (
                        <div className={`
                            flex items-center gap-1.5 bg-black/15 text-white font-bold backdrop-blur-sm border border-black/5 shadow-sm
                            ${isCompact ? 'px-2 py-0.5 rounded-lg text-[10px]' : 'px-3 py-1.5 rounded-xl text-xs'}
                        `}>
                            <Clock className={`opacity-90 ${isCompact ? 'w-2.5 h-2.5' : 'w-3.5 h-3.5'}`} />
                            <span>{task.duration}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
