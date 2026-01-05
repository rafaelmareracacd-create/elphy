-- Create planner_subjects table
create table if not exists planner_subjects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  title text not null,
  color text default 'bg-emerald-500',
  daily_goal_minutes int default 60,
  created_at timestamp with time zone default now()
);

-- Create study_sessions table for logging net hours
create table if not exists study_sessions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  subject_id uuid references planner_subjects(id) on delete cascade,
  duration_seconds int not null,
  notes text,
  created_at timestamp with time zone default now()
);

-- Indexes for performance
create index if not exists idx_planner_subjects_user on planner_subjects(user_id);
create index if not exists idx_study_sessions_user_date on study_sessions(user_id, created_at);
