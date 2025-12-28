-- Create achievements table
CREATE TABLE public.achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL,
  points_reward INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user_achievements table
CREATE TABLE public.user_achievements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Achievements policies (read-only for all authenticated users)
CREATE POLICY "Anyone can view achievements" 
ON public.achievements 
FOR SELECT 
USING (true);

-- User achievements policies
CREATE POLICY "Users can view own achievements" 
ON public.user_achievements 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" 
ON public.user_achievements 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" 
ON public.notifications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" 
ON public.notifications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications" 
ON public.notifications 
FOR DELETE 
USING (auth.uid() = user_id);

-- System can insert notifications
CREATE POLICY "System can insert notifications" 
ON public.notifications 
FOR INSERT 
WITH CHECK (true);

-- Insert default achievements
INSERT INTO public.achievements (name, description, icon, category, requirement_type, requirement_value, points_reward) VALUES
('Первые шаги', 'Пройди свой первый тест', 'rocket', 'tests', 'tests_completed', 1, 10),
('Новичок', 'Пройди 5 тестов', 'star', 'tests', 'tests_completed', 5, 25),
('Ученик', 'Пройди 10 тестов', 'book-open', 'tests', 'tests_completed', 10, 50),
('Знаток', 'Пройди 25 тестов', 'graduation-cap', 'tests', 'tests_completed', 25, 100),
('Эксперт', 'Пройди 50 тестов', 'trophy', 'tests', 'tests_completed', 50, 200),
('Мастер', 'Пройди 100 тестов', 'crown', 'tests', 'tests_completed', 100, 500),
('Первые очки', 'Набери 100 очков', 'zap', 'points', 'total_points', 100, 15),
('Сотня', 'Набери 500 очков', 'flame', 'points', 'total_points', 500, 30),
('Тысячник', 'Набери 1000 очков', 'target', 'points', 'total_points', 1000, 75),
('Легенда', 'Набери 5000 очков', 'gem', 'points', 'total_points', 5000, 150),
('Первый день', 'Войди в систему', 'calendar', 'streak', 'streak_days', 1, 5),
('Неделя подряд', 'Заходи 7 дней подряд', 'calendar-check', 'streak', 'streak_days', 7, 50),
('Месяц активности', 'Заходи 30 дней подряд', 'calendar-heart', 'streak', 'streak_days', 30, 200),
('Отличник', 'Получи 100% на тесте', 'award', 'special', 'perfect_score', 1, 50),
('Ежедневный герой', 'Выполни 5 ежедневных заданий', 'sun', 'daily', 'daily_completed', 5, 40),
('Марафонец', 'Выполни 30 ежедневных заданий', 'medal', 'daily', 'daily_completed', 30, 150);