-- Add icon column to planner_subjects table
ALTER TABLE planner_subjects
ADD COLUMN IF NOT EXISTS icon text DEFAULT 'Book';
