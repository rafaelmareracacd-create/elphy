-- Migration: Deck Card Limits
-- Description: Adds daily limits for new and review cards per deck
-- Created: 2026-01-01

-- Add limit columns to decks table
ALTER TABLE decks
ADD COLUMN IF NOT EXISTS limit_new INTEGER DEFAULT 20 CHECK (limit_new >= 0),
ADD COLUMN IF NOT EXISTS limit_review INTEGER DEFAULT 100 CHECK (limit_review >= 0);

-- Create index for performance when querying limits
CREATE INDEX IF NOT EXISTS idx_decks_limits ON decks(limit_new, limit_review);

-- Comment for documentation
COMMENT ON COLUMN decks.limit_new IS 'Maximum new cards to study per day for this deck';
COMMENT ON COLUMN decks.limit_review IS 'Maximum review cards to study per day for this deck';
