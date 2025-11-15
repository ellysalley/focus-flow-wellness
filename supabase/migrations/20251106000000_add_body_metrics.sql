-- Create body_metrics table
CREATE TABLE public.body_metrics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  weight_pounds DECIMAL(5, 2) NOT NULL,
  height_inches DECIMAL(5, 2) NOT NULL,
  bmi DECIMAL(5, 2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.body_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own body metrics"
ON public.body_metrics
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own body metrics"
ON public.body_metrics
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own body metrics"
ON public.body_metrics
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Create index for better performance
CREATE INDEX idx_body_metrics_user_id ON public.body_metrics(user_id);
CREATE INDEX idx_body_metrics_user_id_created_at ON public.body_metrics(user_id, created_at DESC);

-- Create function to calculate and update BMI
CREATE OR REPLACE FUNCTION calculate_bmi()
RETURNS TRIGGER AS $$
BEGIN
  -- BMI = (weight in pounds / (height in inches)^2) * 703
  NEW.bmi := (NEW.weight_pounds / (NEW.height_inches * NEW.height_inches)) * 703;
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically calculate BMI
CREATE TRIGGER calculate_bmi_trigger
BEFORE INSERT OR UPDATE ON public.body_metrics
FOR EACH ROW
EXECUTE FUNCTION calculate_bmi();

