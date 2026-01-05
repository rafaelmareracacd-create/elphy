"use client";

import { useDraggable } from "@dnd-kit/core";
import { Subject } from "@/hooks/useStudyData";
import SubjectCard from "./SubjectCard";

interface DraggableSubjectCardProps {
    subject: Subject;
}

export default function DraggableSubjectCard({ subject }: DraggableSubjectCardProps) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `subject-${subject.id}`,
        data: {
            type: "Subject",
            subject,
        },
    });

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            // Outline wrapper for layout positioning, styling in SubjectCard
            style={{ touchAction: 'none' }}
            className="cursor-grab active:cursor-grabbing outline-none"
        >
            <SubjectCard subject={subject} isDragging={isDragging} />
        </div>
    );
}
