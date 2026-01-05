-- Migration: Advanced Timer Features
-- Description: Adds support for Pomodoro mode, pause tracking, and enhanced analytics
-- Created: 2025-12-30

-- 1. Create pause_logs table
CREATE TABLE IF NOT EXISTS pause_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID REFERENCES study_sessions(id) ON DELETE CASCADE,
    pause_type TEXT NOT NULL CHECK (pause_type IN ('planned', 'distraction')),
    duration_seconds INTEGER NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create pomodoro_settings table
CREATE TABLE IF NOT EXISTS pomodoro_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    work_duration_minutes INTEGER DEFAULT 25 CHECK (work_duration_minutes > 0),
    break_duration_minutes INTEGER DEFAULT 5 CHECK (break_duration_minutes > 0),
    long_break_duration_minutes INTEGER DEFAULT 15 CHECK (long_break_duration_minutes > 0),
    cycles_before_long_break INTEGER DEFAULT 4 CHECK (cycles_before_long_break > 0),
    auto_start_breaks BOOLEAN DEFAULT false,
    auto_start_work BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Modify study_sessions table
ALTER TABLE study_sessions
ADD COLUMN IF NOT EXISTS session_type TEXT DEFAULT 'normal' CHECK (session_type IN ('normal', 'pomodoro', 'manual')),
ADD COLUMN IF NOT EXISTS is_manual BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS notes TEXT,
ADD COLUMN IF NOT EXISTS pause_time_seconds INTEGER DEFAULT 0;

-- 4. Add daily_goal_minutes to planner_subjects table
ALTER TABLE planner_subjects
ADD COLUMN IF NOT EXISTS daily_goal_minutes INTEGER DEFAULT 120 CHECK (daily_goal_minutes >= 0);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_pause_logs_user_id ON pause_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_pause_logs_session_id ON pause_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_pause_logs_created_at ON pause_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_study_sessions_session_type ON study_sessions(session_type);
CREATE INDEX IF NOT EXISTS idx_study_sessions_is_manual ON study_sessions(is_manual);

-- 6. Enable RLS
ALTER TABLE pause_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pomodoro_settings ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for pause_logs
CREATE POLICY "Users can view their own pause logs"
    ON pause_logs FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pause logs"
    ON pause_logs FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pause logs"
    ON pause_logs FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pause logs"
    ON pause_logs FOR DELETE
    USING (auth.uid() = user_id);

-- 8. RLS Policies for pomodoro_settings
CREATE POLICY "Users can view their own pomodoro settings"
    ON pomodoro_settings FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own pomodoro settings"
    ON pomodoro_settings FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pomodoro settings"
    ON pomodoro_settings FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pomodoro settings"
    ON pomodoro_settings FOR DELETE
    USING (auth.uid() = user_id);

-- 9. Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 10. Create trigger for pomodoro_settings
DROP TRIGGER IF EXISTS update_pomodoro_settings_updated_at ON pomodoro_settings;
CREATE TRIGGER update_pomodoro_settings_updated_at
    BEFORE UPDATE ON pomodoro_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
