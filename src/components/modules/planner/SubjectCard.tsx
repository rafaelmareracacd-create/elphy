
import { Subject } from "@/hooks/useStudyData";
import * as Icons from "lucide-react";
import { Clock } from "lucide-react";

interface SubjectCardProps {
    subject: Subject;
    isDragging?: boolean;
    className?: string;
    style?: React.CSSProperties;
}

export default function SubjectCard({ subject, isDragging, className = "", style }: SubjectCardProps) {
    const Icon = subject.icon ? (Icons as any)[subject.icon] : null;

    return (
        <div
            style={style}
            className={`
                group rounded-[16px] p-3
                ${subject.color || 'bg-emerald-500'} 
                hover:shadow-lg hover:shadow-${subject.color ? subject.color.split('-')[1] : 'emerald'}-500/30
                hover:scale-[1.02] transition-all duration-300
                cursor-grab active:cursor-grabbing relative overflow-hidden
                flex flex-col gap-1.5 justify-between
                min-h-[70px] border border-white/10 shadow-lg shadow-black/20
                ${isDragging ? 'opacity-50 ring-4 ring-offset-2 ring-' + (subject.color ? subject.color.split('-')[1] : 'emerald') + '-300' : ''}
                ${className}
            `}
        >
            <div className="flex items-start justify-between gap-2">
                <h4
                    className="font-bold text-[13px] text-white leading-tight drop-shadow-md text-left line-clamp-1 flex-1"
                >
                    {subject.name}
                </h4>
                {Icon && (
                    <Icon className="w-3.5 h-3.5 text-white/80 shrink-0" />
                )}
            </div>

            <div className="flex items-center justify-between mt-auto">
                <div className="
                    w-fit px-2 py-0.5 rounded-lg text-[10px] font-bold 
                    bg-black/10 text-white/90 backdrop-blur-md shadow-sm
                    border border-white/5 flex items-center gap-1
                ">
                    {subject.hoursStudied}h <span className="font-normal opacity-70">/ {subject.goalHours || 100}h</span>
                </div>

                {subject.startTime && (
                    <div className="flex items-center gap-1 text-[10px] text-white/80 font-medium">
                        <Clock className="w-2.5 h-2.5" />
                        {subject.startTime}
                    </div>
                )}
            </div>
        </div>
    );
}
