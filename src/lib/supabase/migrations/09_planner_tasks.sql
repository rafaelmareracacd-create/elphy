-- Create planner_tasks table for study schedule
create table if not exists planner_tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  day_of_week text not null, -- 'monday', 'tuesday', etc. or 'backlog'
  title text not null,
  duration_minutes int default 60,
  color text default '#3B82F6',
  order_index int default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create index for faster querying by user and day
create index if not exists idx_planner_tasks_user_day on planner_tasks(user_id, day_of_week);
