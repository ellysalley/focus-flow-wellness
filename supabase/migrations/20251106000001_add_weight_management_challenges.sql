-- Add weight management challenges for BMI-based suggestions
INSERT INTO public.challenges (title, description, duration, xp, icon_name, is_active) VALUES
-- Challenges for weight gain (underweight BMI < 18.5)
('Strength Training', 'Complete 20 minutes of strength training exercises', '20 min', 80, 'Target', true),
('Protein-Rich Meal', 'Eat a protein-rich meal with lean meats or plant proteins', '30 min', 60, 'Apple', true),
('Calorie Tracking', 'Track your daily calorie intake to ensure adequate nutrition', '1 day', 50, 'Brain', true),

-- Challenges for weight loss (overweight/obese BMI >= 25)
('30-Minute Cardio', 'Complete 30 minutes of cardio exercise (walking, running, cycling)', '30 min', 100, 'Target', true),
('Portion Control', 'Practice mindful eating with proper portion sizes', '1 day', 60, 'Apple', true),
('10K Steps', 'Walk 10,000 steps today', '1 day', 90, 'Target', true),
('Skip Sugary Drinks', 'Replace sugary drinks with water today', '1 day', 40, 'Droplet', true),
('Meal Planning', 'Plan and prepare healthy meals for the week', '1 hour', 70, 'Apple', true);

