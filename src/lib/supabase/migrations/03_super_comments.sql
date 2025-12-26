-- Add super_comment column to questions table for curation
alter table questions
  add column if not exists super_comment text,
  add column if not exists comment_updated_at timestamp with time zone;

-- Create index to filter questions by comment status
create index if not exists idx_questions_has_comment 
  on questions ((super_comment is not null));

-- Add comment to track purpose
comment on column questions.super_comment is 'AI-powered curated commentary for this question';
comment on column questions.comment_updated_at is 'Timestamp when super_comment was last modified';
