-- Create screen_time table
CREATE TABLE public.screen_time (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  minutes INTEGER NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS
ALTER TABLE public.screen_time ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own screen time"
ON public.screen_time
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own screen time"
ON public.screen_time
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own screen time"
ON public.screen_time
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_screen_time_user_id_date ON public.screen_time(user_id, date DESC);

