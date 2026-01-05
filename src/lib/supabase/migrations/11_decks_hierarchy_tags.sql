-- Add parent_id for sub-decks functionality
alter table decks add column if not exists parent_id uuid references decks(id) on delete cascade;

-- Add tags for decks
alter table decks add column if not exists tags text[] default '{}';

-- Index for performance on parent_id
create index if not exists idx_decks_parent_id on decks(parent_id);
