-- Add start_time column to planner_tasks table
ALTER TABLE planner_tasks 
ADD COLUMN IF NOT EXISTS start_time TEXT; -- Format: "HH:mm" e.g., "08:00"

-- Optional: Add index for faster querying if needed, though volume is low per user
-- CREATE INDEX IF NOT EXISTS idx_planner_tasks_start_time ON planner_tasks(start_time);
