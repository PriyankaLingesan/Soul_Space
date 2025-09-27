-- Create daily_questions table for tracking daily challenges
CREATE TABLE public.daily_questions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  question_type text NOT NULL DEFAULT 'gratitude',
  question_text text NOT NULL,
  user_response text,
  points_earned integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  answered_at timestamp with time zone
);

-- Enable RLS
ALTER TABLE public.daily_questions ENABLE ROW LEVEL SECURITY;

-- Create policies for daily questions
CREATE POLICY "Users can view their own daily questions" 
ON public.daily_questions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own daily questions" 
ON public.daily_questions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily questions" 
ON public.daily_questions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Update profiles table to track current streak
ALTER TABLE public.profiles 
ADD COLUMN current_streak integer DEFAULT 0,
ADD COLUMN last_activity_date date;

-- Create trigger for automatic timestamp updates on daily_questions
CREATE TRIGGER update_daily_questions_updated_at
BEFORE UPDATE ON public.daily_questions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();