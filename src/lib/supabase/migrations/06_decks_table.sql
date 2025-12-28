-- Create decks table for organizing flashcards
create table if not exists decks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid not null,
  name text not null,
  description text,
  color text default '#10B981',
  icon text default '📚',
  is_favorite boolean default false,
  cards_count int default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Add deck_id to flashcards table
alter table flashcards add column if not exists deck_id uuid references decks(id) on delete cascade;

-- Create indexes for performance
create index if not exists idx_decks_user_id on decks(user_id);
create index if not exists idx_flashcards_deck_id on flashcards(deck_id);

-- Function to update cards_count automatically
create or replace function update_deck_cards_count()
returns trigger as $$
begin
  if TG_OP = 'INSERT' then
    update decks set cards_count = cards_count + 1, updated_at = now() where id = NEW.deck_id;
  elsif TG_OP = 'DELETE' then
    update decks set cards_count = cards_count - 1, updated_at = now() where id = OLD.deck_id;
  end if;
  return null;
end;
$$ language plpgsql;

-- Trigger to auto-update cards_count
drop trigger if exists trigger_update_deck_cards_count on flashcards;
create trigger trigger_update_deck_cards_count
after insert or delete on flashcards
for each row execute function update_deck_cards_count();
