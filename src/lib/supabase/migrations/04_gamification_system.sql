-- Gamification System Migration
-- Adds XP, levels, achievements, streaks, and daily bonuses

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- User Gamification Stats
CREATE TABLE IF NOT EXISTS user_gamification (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    total_xp INTEGER DEFAULT 0 CHECK (total_xp >= 0),
    current_level INTEGER DEFAULT 1 CHECK (current_level >= 1),
    xp_to_next_level INTEGER DEFAULT 100,
    daily_streak INTEGER DEFAULT 0 CHECK (daily_streak >= 0),
    max_streak INTEGER DEFAULT 0 CHECK (max_streak >= 0),
    last_study_date DATE,
    streak_freeze_count INTEGER DEFAULT 0 CHECK (streak_freeze_count >= 0),
    consecutive_correct INTEGER DEFAULT 0,
    total_questions_answered INTEGER DEFAULT 0,
    total_correct_answers INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- XP Transaction Log (for transparency and debugging)
CREATE TABLE IF NOT EXISTS xp_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    reason VARCHAR(100) NOT NULL,
    multiplier DECIMAL(3,2) DEFAULT 1.0,
    question_id UUID,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Achievement Definitions
CREATE TABLE IF NOT EXISTS achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(10), -- Emoji
    xp_reward INTEGER DEFAULT 0,
    rarity VARCHAR(20) CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User Achievement Unlocks
CREATE TABLE IF NOT EXISTS user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    achievement_id UUID REFERENCES achievements(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, achievement_id)
);

-- Daily Bonuses (spin wheel, streak milestones)
CREATE TABLE IF NOT EXISTS daily_bonuses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    bonus_date DATE NOT NULL,
    bonus_type VARCHAR(50) NOT NULL,
    reward_xp INTEGER DEFAULT 0,
    reward_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, bonus_date, bonus_type)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_gamification_user_id ON user_gamification(user_id);
CREATE INDEX IF NOT EXISTS idx_user_gamification_total_xp ON user_gamification(total_xp DESC);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_user_id ON xp_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_xp_transactions_created_at ON xp_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_bonuses_user_date ON daily_bonuses(user_id, bonus_date DESC);

-- Insert initial achievement definitions
INSERT INTO achievements (code, name, description, icon, xp_reward, rarity) VALUES
('first_question', 'Primeiro Passo', 'Respondeu sua primeira questão', '🎯', 10, 'common'),
('perfect_ten', 'Dez Perfeitas', 'Acertou 10 questões seguidas', '🔟', 50, 'rare'),
('week_warrior', 'Guerreiro Semanal', 'Estudou 7 dias seguidos', '🔥', 100, 'rare'),
('month_master', 'Mestre Mensal', 'Estudou 30 dias seguidos', '💎', 500, 'epic'),
('night_owl', 'Coruja Noturna', 'Estudou após 22h', '🦉', 25, 'common'),
('early_bird', 'Madrugador', 'Estudou antes das 8h', '🐦', 25, 'common'),
('century_club', 'Clube do Século', 'Respondeu 100 questões', '💯', 200, 'epic'),
('speed_demon', 'Demônio da Velocidade', 'Respondeu corretamente em menos de 10s', '⚡', 30, 'rare'),
('comeback_kid', 'Retorno Triunfal', 'Voltou após 7 dias ausente', '🎪', 75, 'rare'),
('level_10', 'Aprendiz', 'Alcançou nível 10', '⭐', 100, 'common'),
('level_25', 'Estudante Dedicado', 'Alcançou nível 25', '🌟', 250, 'rare'),
('level_50', 'Mestre', 'Alcançou nível 50', '👑', 1000, 'legendary')
ON CONFLICT (code) DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for user_gamification
DROP TRIGGER IF EXISTS update_user_gamification_updated_at ON user_gamification;
CREATE TRIGGER update_user_gamification_updated_at
    BEFORE UPDATE ON user_gamification
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE user_gamification ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_bonuses ENABLE ROW LEVEL SECURITY;

-- Policies for user_gamification
CREATE POLICY "Users can view their own gamification stats"
    ON user_gamification FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own gamification stats"
    ON user_gamification FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own gamification stats"
    ON user_gamification FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policies for xp_transactions
CREATE POLICY "Users can view their own XP transactions"
    ON xp_transactions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own XP transactions"
    ON xp_transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policies for achievements (readable by all authenticated users)
CREATE POLICY "Authenticated users can view achievements"
    ON achievements FOR SELECT
    TO authenticated
    USING (true);

-- Policies for user_achievements
CREATE POLICY "Users can view their own achievements"
    ON user_achievements FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can unlock their own achievements"
    ON user_achievements FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policies for daily_bonuses
CREATE POLICY "Users can view their own bonuses"
    ON daily_bonuses FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can claim their own bonuses"
    ON daily_bonuses FOR INSERT
    WITH CHECK (auth.uid() = user_id);
