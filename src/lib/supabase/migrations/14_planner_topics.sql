-- 14_planner_topics.sql

-- Add goal_hours to planner_subjects with constraint to ensure positive goals
ALTER TABLE planner_subjects
ADD COLUMN IF NOT EXISTS goal_hours INTEGER DEFAULT 100 CHECK (goal_hours > 0);

-- Create planner_topics table with constraints
-- - title must not be empty (or just whitespace)
-- - defaults to not completed
CREATE TABLE IF NOT EXISTS planner_topics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  subject_id uuid REFERENCES planner_subjects(id) ON DELETE CASCADE,
  title text NOT NULL CHECK (char_length(trim(title)) > 0),
  completed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Index for performance on queries filtering by subject
CREATE INDEX IF NOT EXISTS idx_planner_topics_subject ON planner_topics(subject_id);
