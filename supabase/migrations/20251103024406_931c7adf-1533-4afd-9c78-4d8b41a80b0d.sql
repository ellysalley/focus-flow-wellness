-- Create challenges table
CREATE TABLE public.challenges (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  duration TEXT NOT NULL,
  xp INTEGER NOT NULL,
  icon_name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create badges table
CREATE TABLE public.badges (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT NOT NULL,
  rarity TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_badges table (earned badges)
CREATE TABLE public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  badge_id INTEGER NOT NULL REFERENCES public.badges(id),
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, badge_id)
);

-- Create rewards_catalog table
CREATE TABLE public.rewards_catalog (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  cost INTEGER NOT NULL,
  reward_type TEXT NOT NULL,
  reward_data JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards_catalog ENABLE ROW LEVEL SECURITY;

-- Policies for challenges (public read)
CREATE POLICY "Anyone can view active challenges"
ON public.challenges FOR SELECT
USING (is_active = true);

-- Policies for badges (public read)
CREATE POLICY "Anyone can view badges"
ON public.badges FOR SELECT
USING (true);

-- Policies for user_badges
CREATE POLICY "Users can view their own badges"
ON public.user_badges FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own badges"
ON public.user_badges FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policies for rewards_catalog (public read)
CREATE POLICY "Anyone can view active rewards"
ON public.rewards_catalog FOR SELECT
USING (is_active = true);

-- Insert default challenges
INSERT INTO public.challenges (title, description, duration, xp, icon_name) VALUES
('Morning Walk', 'Take a 10-minute walk outside', '10 min', 50, 'Target'),
('Digital Detox Hour', 'Stay off social media for 1 hour', '60 min', 75, 'Clock'),
('Mindful Moment', 'Take 5 deep breaths and stretch', '5 min', 25, 'Brain'),
('Hydration Check', 'Drink 8 glasses of water today', '1 day', 30, 'Droplet'),
('Healthy Meal Prep', 'Prepare a nutritious meal', '30 min', 60, 'Apple');

-- Insert default badges
INSERT INTO public.badges (title, description, icon_name, rarity, requirement_type, requirement_value) VALUES
('Wellness Warrior', 'Complete 50 challenges', 'Trophy', 'Gold', 'challenges_completed', 50),
('Quick Starter', 'Complete 10 morning challenges', 'Zap', 'Silver', 'challenges_completed', 10),
('Consistency King', '30-day streak achieved', 'Star', 'Gold', 'streak_days', 30),
('Level Master', 'Reach Level 10', 'Crown', 'Platinum', 'level_reached', 10),
('Perfect Week', 'Complete all daily challenges for a week', 'Target', 'Gold', 'perfect_weeks', 1);

-- Insert default rewards
INSERT INTO public.rewards_catalog (title, description, cost, reward_type, reward_data) VALUES
('Custom Theme', 'Unlock a premium app theme', 500, 'theme', '{"theme_id": "premium_dark"}'),
('Bonus Challenge Pack', 'Get 5 exclusive challenges', 750, 'challenges', '{"challenge_count": 5}'),
('AI Companion Upgrade', 'Enhanced conversation features', 1000, 'ai_upgrade', '{"features": ["longer_context", "voice_mode"]}');