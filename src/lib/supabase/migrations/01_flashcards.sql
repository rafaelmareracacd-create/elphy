-- Create flashcards table for Spaced Repetition
create table flashcards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null, -- Assumes a users table exists or managed by Supabase Auth
  subject_id uuid, -- Optional relation to a subject/topic
  front text not null,
  back text not null,
  interval float default 0, -- Interval in days
  ease_factor float default 2.5, -- Standard SM-2 start value
  next_review timestamp with time zone default now(),
  last_latency_ms int default 0, -- Metric for "Learned Latency"
  created_at timestamp with time zone default now(),
  
  constraint interval_non_negative check (interval >= 0),
  constraint ease_factor_min check (ease_factor >= 1.3) -- SM-2 lower bound recommendation
);

-- Index for querying cards due for review
create index idx_flashcards_next_review on flashcards(user_id, next_review);
