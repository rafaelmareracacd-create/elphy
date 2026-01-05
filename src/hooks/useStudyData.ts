import { useStudyContext, Subject, Topic, HeatmapDay } from "@/context/StudyContext";

export type { Subject, Topic, HeatmapDay };

export function useStudyData() {
    return useStudyContext();
}
