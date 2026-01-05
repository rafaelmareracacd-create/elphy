"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

// Types (copied from useStudyData to maintain compatibility)
export interface Subject {
    id: string;
    name: string;
    color: string;
    icon?: string;
    startTime?: string;
    colorHex: string;
    colorLight: string;
    textColor: string;
    hoursStudied: number;
    goalHours: number;
    topicsTotal: number;
    topicsCompleted: number;
}

export interface Topic {
    id: string;
    subject_id: string;
    title: string;
    completed: boolean;
    created_at: string;
}

export interface HeatmapDay {
    date: string;
    hours: number;
    subjects: string[];
}

interface StudyContextType {
    subjects: Subject[];
    heatmap: HeatmapDay[];
    totalHours: number;
    totalPomodoros: number;
    loading: boolean;
    topicsBySubject: Record<string, Topic[]>;
    refreshData: () => Promise<void>;
    addSession: (subjectId: string, seconds: number, sessionType?: 'normal' | 'pomodoro' | 'manual') => Promise<void>;
    addSubject: (title: string, color: string, goalHours?: number, icon?: string, startTime?: string) => Promise<void>;
    updateSubject: (subjectId: string, title: string, color: string, goalHours: number, icon?: string) => Promise<void>;
    deleteSubject: (subjectId: string) => Promise<void>;
    addTopic: (subjectId: string, title: string) => Promise<void>;
    toggleTopic: (topicId: string, currentCompleted: boolean) => Promise<void>;
    deleteTopic: (topicId: string) => Promise<void>;
}

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export function StudyProvider({ children }: { children: ReactNode }) {
    const [rawData, setRawData] = useState<{ subjects: any[], sessions: any[], topics: any[] }>({ subjects: [], sessions: [], topics: [] });
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // Parallel fetching for better performance
            const [subjectsResult, sessionsResult, topicsResult] = await Promise.all([
                supabase.from('planner_subjects').select('*').eq('user_id', user.id),
                supabase.from('study_sessions').select('*').eq('user_id', user.id),
                supabase.from('planner_topics').select('*').eq('user_id', user.id).order('created_at', { ascending: true })
            ]);

            if (subjectsResult.error) throw subjectsResult.error;
            if (sessionsResult.error) throw sessionsResult.error;
            if (topicsResult.error) throw topicsResult.error;

            setRawData({
                subjects: subjectsResult.data || [],
                sessions: sessionsResult.data || [],
                topics: topicsResult.data || []
            });

        } catch (error: any) {
            console.error('Error fetching study data:', error.message || error);
        } finally {
            setLoading(false);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const { subjects, heatmap, totalHours, totalPomodoros, topicsBySubject } = useMemo(() => {
        if (!rawData.subjects.length && !rawData.sessions.length && !rawData.topics.length) {
            return { subjects: [], heatmap: [], totalHours: 0, totalPomodoros: 0, topicsBySubject: {} as Record<string, Topic[]> };
        }

        const hoursBySubject = new Map<string, number>();
        const sessionsByDate = new Map<string, { hours: number, subjects: Set<string> }>();

        rawData.sessions.forEach((session: any) => {
            const currentSubjectHours = hoursBySubject.get(session.subject_id) || 0;
            hoursBySubject.set(session.subject_id, currentSubjectHours + session.duration_seconds);

            let date: string;
            try {
                date = session.created_at ? new Date(session.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
            } catch (e) {
                date = new Date().toISOString().split('T')[0];
            }

            if (!sessionsByDate.has(date)) {
                sessionsByDate.set(date, { hours: 0, subjects: new Set() });
            }
            const dayData = sessionsByDate.get(date)!;
            dayData.hours += session.duration_seconds / 3600;
        });

        const totalPomodorosCount = rawData.sessions.filter((s: any) => s.session_type === 'pomodoro').length;

        const subjectNameMap = new Map<string, string>();
        rawData.subjects.forEach((s: any) => subjectNameMap.set(s.id, s.title));

        rawData.sessions.forEach((session: any) => {
            let date: string;
            try {
                date = session.created_at ? new Date(session.created_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
            } catch (e) {
                date = new Date().toISOString().split('T')[0];
            }

            const subjName = subjectNameMap.get(session.subject_id);
            if (subjName && sessionsByDate.has(date)) {
                sessionsByDate.get(date)!.subjects.add(subjName);
            }
        });

        const topicsMap = new Map<string, Topic[]>();
        rawData.topics.forEach((t: any) => {
            const list = topicsMap.get(t.subject_id) || [];
            list.push(t);
            topicsMap.set(t.subject_id, list);
        });

        const processedSubjects: Subject[] = rawData.subjects.map((s: any) => {
            const totalSeconds = hoursBySubject.get(s.id) || 0;
            const hours = Number((totalSeconds / 3600).toFixed(2));
            const baseColor = s.color || 'bg-emerald-500';

            return {
                id: s.id,
                name: s.title,
                icon: s.icon,
                startTime: s.start_time,
                color: baseColor,
                colorHex: '#10b981',
                colorLight: baseColor.replace('500', '50'),
                textColor: baseColor.replace('bg-', 'text-').replace('500', '700'),
                hoursStudied: hours,
                goalHours: s.daily_goal_minutes ? Math.round(s.daily_goal_minutes / 60) : 1,
                topicsTotal: (topicsMap.get(s.id) || []).length,
                topicsCompleted: (topicsMap.get(s.id) || []).filter(t => t.completed).length,
            };
        });

        const topicsBySubjectObj: Record<string, Topic[]> = {};
        topicsMap.forEach((value, key) => {
            topicsBySubjectObj[key] = value;
        });

        const days = [];
        for (let i = 13; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dayData = sessionsByDate.get(dateStr) || { hours: 0, subjects: new Set() };
            days.push({
                date: dateStr,
                hours: Number(dayData.hours.toFixed(1)),
                subjects: Array.from(dayData.subjects).map(s => `${s} (${dayData.hours.toFixed(1)}h)`)
            });
        }

        const totalH = Number(processedSubjects.reduce((acc, s) => acc + s.hoursStudied, 0).toFixed(1));

        return { subjects: processedSubjects, heatmap: days, totalHours: totalH, totalPomodoros: totalPomodorosCount, topicsBySubject: topicsBySubjectObj };

    }, [rawData]);

    // Actions
    const addSession = async (subjectId: string, seconds: number, sessionType: 'normal' | 'pomodoro' | 'manual' = 'normal') => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { error } = await supabase.from('study_sessions').insert({
                user_id: user.id,
                subject_id: subjectId,
                duration_seconds: seconds,
                session_type: sessionType,
                created_at: new Date().toISOString()
            });
            if (error) throw error;
            fetchData();
        } catch (error) { console.error('Error saving session:', error); }
    };

    const addSubject = async (title: string, color: string, goalHours: number = 20, icon?: string, startTime?: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { error } = await supabase.from('planner_subjects').insert({ user_id: user.id, title, color, daily_goal_minutes: goalHours * 60, icon: icon || 'Book', created_at: new Date().toISOString() });
            if (error) throw error;
            fetchData();
        } catch (error) { console.error('Error adding subject:', error); }
    };

    const updateSubject = async (subjectId: string, title: string, color: string, goalHours: number, icon?: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { error } = await supabase.from('planner_subjects').update({ title, color, daily_goal_minutes: goalHours * 60, icon: icon || 'Book' }).eq('id', subjectId).eq('user_id', user.id);
            if (error) throw error;
            fetchData();
        } catch (error) { console.error('Error updating subject:', error); }
    };

    const deleteSubject = async (subjectId: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            // First, get the subject name before deleting
            const subjectToDelete = rawData.subjects.find(s => s.id === subjectId);
            if (!subjectToDelete) {
                throw new Error("Subject not found");
            }

            // Delete associated tasks that have this subject's name as title
            const { error: tasksError } = await supabase
                .from('planner_tasks')
                .delete()
                .eq('user_id', user.id)
                .eq('title', subjectToDelete.title);

            if (tasksError) {
                console.error('Error deleting associated tasks:', tasksError);
                // Continue with subject deletion even if tasks deletion fails
            }

            // Delete the subject
            const { error } = await supabase.from('planner_subjects').delete().eq('id', subjectId).eq('user_id', user.id);
            if (error) throw error;
            fetchData();
        } catch (error) { console.error('Error deleting subject:', error); }
    };

    const addTopic = async (subjectId: string, title: string) => {
        try {
            if (!title.trim()) throw new Error("Title cannot be empty");
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { error } = await supabase.from('planner_topics').insert({ user_id: user.id, subject_id: subjectId, title: title.trim(), completed: false });
            if (error) throw error;
            fetchData();
        } catch (error) { console.error('Error adding topic:', error); throw error; }
    };

    const toggleTopic = async (topicId: string, currentCompleted: boolean) => {
        try {
            const { error } = await supabase.from('planner_topics').update({ completed: !currentCompleted }).eq('id', topicId);
            if (error) throw error;
            fetchData();
        } catch (error) { console.error('Error toggling topic:', error); throw error; }
    };

    const deleteTopic = async (topicId: string) => {
        try {
            const { error } = await supabase.from('planner_topics').delete().eq('id', topicId);
            if (error) throw error;
            fetchData();
        } catch (error) { console.error('Error deleting topic:', error); throw error; }
    };

    return (
        <StudyContext.Provider value={{
            subjects, heatmap, totalHours, totalPomodoros, loading, topicsBySubject,
            refreshData: fetchData,
            addSession, addSubject, updateSubject, deleteSubject,
            addTopic, toggleTopic, deleteTopic
        }}>
            {children}
        </StudyContext.Provider>
    );
}

// Hook to consume the context (can be used directly or wrapped by the existing hook)
export function useStudyContext() {
    const context = useContext(StudyContext);
    if (!context) {
        throw new Error("useStudyContext must be used within a StudyProvider");
    }
    return context;
}
