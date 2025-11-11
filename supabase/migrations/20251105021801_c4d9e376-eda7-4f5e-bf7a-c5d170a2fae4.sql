-- Create table for chat conversations
CREATE TABLE public.chat_messages (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  message text NOT NULL,
  sender text NOT NULL CHECK (sender IN ('user', 'ai')),
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own messages"
ON public.chat_messages
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own messages"
ON public.chat_messages
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Add index for better performance
CREATE INDEX idx_chat_messages_user_id_created_at ON public.chat_messages(user_id, created_at);

-- Create table for active rewards (what users have unlocked)
CREATE TABLE public.active_rewards (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  reward_type text NOT NULL,
  reward_data jsonb,
  activated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, reward_type)
);

-- Enable RLS
ALTER TABLE public.active_rewards ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own active rewards"
ON public.active_rewards
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own active rewards"
ON public.active_rewards
FOR INSERT
WITH CHECK (auth.uid() = user_id);