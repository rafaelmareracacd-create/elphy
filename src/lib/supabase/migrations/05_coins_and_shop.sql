// Extended Database Migration - Coins and Combo System
-- Add coins to user_gamification table

ALTER TABLE user_gamification
ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 0 CHECK (coins >= 0),
ADD COLUMN IF NOT EXISTS max_combo INTEGER DEFAULT 0 CHECK (max_combo >= 0);

-- Create coin transactions table for transparency
CREATE TABLE IF NOT EXISTS coin_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'earn', 'spend'
    source VARCHAR(100) NOT NULL, -- 'question_answered', 'daily_bonus', 'shop_purchase', etc
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shop items catalog
CREATE TABLE IF NOT EXISTS shop_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    item_type VARCHAR(50) NOT NULL, -- 'boost', 'protection', 'cosmetic', 'chest'
    effect JSONB,
    stock_limit INTEGER, -- NULL = unlimited
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user purchases
CREATE TABLE IF NOT EXISTS user_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id UUID REFERENCES shop_items(id),
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    used BOOLEAN DEFAULT false,
    used_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_coin_transactions_user_id ON coin_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_coin_transactions_created_at ON coin_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_purchases_user_id ON user_purchases(user_id);

-- Row Level Security
ALTER TABLE coin_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own coin transactions"
    ON coin_transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own purchases"
    ON user_purchases FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can purchase items"
    ON user_purchases FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Shop items readable by all authenticated users
CREATE POLICY "Authenticated users can view shop items"
    ON shop_items FOR SELECT
    TO authenticated
    USING (true);

-- Insert initial shop items
INSERT INTO shop_items (code, name, description, price, item_type, effect) VALUES
('streak_freeze', 'Proteção de Ofensiva', 'Protege sua ofensiva por 1 dia', 100, 'protection', '{"days": 1}'::jsonb),
('xp_boost_1h', 'Boost de XP (1h)', 'Dobra o XP ganho por 1 hora', 150, 'boost', '{"multiplier": 2.0, "duration_hours": 1}'::jsonb),
('xp_boost_24h', 'Boost de XP (24h)', 'Dobra o XP ganho por 24 horas', 500, 'boost', '{"multiplier": 2.0, "duration_hours": 24}'::jsonb),
('mystery_chest_common', 'Baú Comum', 'Baú misterioso com recompensas comuns', 200, 'chest', '{"rarity": "common"}'::jsonb),
('mystery_chest_rare', 'Baú Raro', 'Baú misterioso com recompensas raras', 500, 'chest', '{"rarity": "rare"}'::jsonb)
ON CONFLICT (code) DO NOTHING;

-- Comment
COMMENT ON COLUMN user_gamification.coins IS 'Virtual currency (Elphy Coins) for shop purchases';
COMMENT ON COLUMN user_gamification.max_combo IS 'Highest combo achieved by user';
COMMENT ON TABLE coin_transactions IS 'Log of all coin earnings and spendings';
COMMENT ON TABLE shop_items IS 'Catalog of items available for purchase';
COMMENT ON TABLE user_purchases IS 'Record of user purchases from shop';
