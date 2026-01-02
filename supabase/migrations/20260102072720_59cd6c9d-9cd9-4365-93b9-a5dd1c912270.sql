-- Включаем расширения для cron и http запросов
CREATE EXTENSION IF NOT EXISTS pg_cron WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Добавляем достижение за прохождение всех тестов
INSERT INTO public.achievements (name, description, icon, category, requirement_type, requirement_value, points_reward)
VALUES ('Мастер всех предметов', 'Прошёл все доступные тесты', '🏅', 'tests', 'tests_completed', 290, 5000)
ON CONFLICT DO NOTHING;

-- Добавляем ещё достижений
INSERT INTO public.achievements (name, description, icon, category, requirement_type, requirement_value, points_reward)
VALUES 
  ('Новичок', 'Прошёл первый тест', '🎯', 'tests', 'tests_completed', 1, 10),
  ('Упорный', 'Прошёл 10 тестов', '💪', 'tests', 'tests_completed', 10, 50),
  ('Знаток', 'Прошёл 50 тестов', '🧠', 'tests', 'tests_completed', 50, 200),
  ('Эксперт', 'Прошёл 100 тестов', '🎓', 'tests', 'tests_completed', 100, 500),
  ('Легенда', 'Прошёл 200 тестов', '👑', 'tests', 'tests_completed', 200, 1000),
  ('Первые шаги', 'Набрал 100 очков', '⭐', 'points', 'total_points', 100, 20),
  ('Набирающий силу', 'Набрал 1000 очков', '🌟', 'points', 'total_points', 1000, 100),
  ('Чемпион', 'Набрал 5000 очков', '🏆', 'points', 'total_points', 5000, 500),
  ('Легендарный', 'Набрал 10000 очков', '💎', 'points', 'total_points', 10000, 1000)
ON CONFLICT DO NOTHING;