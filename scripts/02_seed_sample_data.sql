-- Insert sample test
INSERT INTO public.tests (title, description) VALUES 
('Kitob — bilim manbai', 'O''qish va tushunish ko''nikmasini testlash');

-- Get the test ID (adjust query based on your needs)
WITH test_data AS (
  SELECT id FROM public.tests WHERE title = 'Kitob — bilim manbai' LIMIT 1
)
INSERT INTO public.test_questions (test_id, question_text, option_a, option_b, option_c, option_d, correct_answer, question_number)
SELECT 
  (SELECT id FROM test_data),
  'Matnga ko''ra kitob bizga nima beradi?',
  'Faqat zavq-ziyofat',
  'Bilim, tajriba va ilm-fanni',
  'Yalpi vaqt o''tkazish',
  'Hech narsa',
  'B',
  1
UNION ALL
SELECT 
  (SELECT id FROM test_data),
  'Kitob o''qiganda eng muhimi nima?',
  'Tezda o''qish',
  'Tushunib, sog''lom fikr bilan o''qish',
  'Haddan tashqari o''qish',
  'Rasmlarni ko''rish',
  'B',
  2
UNION ALL
SELECT 
  (SELECT id FROM test_data),
  'Matnsdan qanday xulosalar chiqarish kerak?',
  'Faqat qiziq qismlari',
  'Chuqur o''ylash orqali',
  'Hech qanday',
  'Tezda',
  'B',
  3;

-- Insert admin user (username: admin, password: admin123)
INSERT INTO public.admin_users (username, password_hash) VALUES 
('admin', 'admin123')
ON CONFLICT DO NOTHING;
