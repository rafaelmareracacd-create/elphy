"use client";

interface ExamBadgeProps {
    institution: string;
    year: number;
    position?: string;
    variant?: "default" | "emerald" | "blue" | "purple";
}

export default function ExamBadge({ institution, year, position, variant = "emerald" }: ExamBadgeProps) {
    const getVariantClasses = () => {
        switch (variant) {
            case "emerald":
                return "bg-emerald-100 text-emerald-700 border-emerald-200";
            case "blue":
                return "bg-blue-100 text-blue-700 border-blue-200";
            case "purple":
                return "bg-purple-100 text-purple-700 border-purple-200";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    return (
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-semibold ${getVariantClasses()}`}>
            <span>{institution}</span>
            <span className="opacity-60">•</span>
            <span>{year}</span>
            {position && (
                <>
                    <span className="opacity-60">•</span>
                    <span className="text-xs">{position}</span>
                </>
            )}
        </div>
    );
}
