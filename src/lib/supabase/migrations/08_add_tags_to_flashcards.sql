-- Add tags column to flashcards table
ALTER TABLE flashcards ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}';

-- Create index for faster tag filtering
CREATE INDEX IF NOT EXISTS idx_flashcards_tags ON flashcards USING GIN (tags);
