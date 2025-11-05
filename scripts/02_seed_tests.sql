-- Seed test data with complete question options and question_type

-- Insert sample tests
INSERT INTO public.tests (title, description) VALUES
  ('Kitob — bilim manbai', 'Kitoblar insoniyat tarixining eng bebaho xazinasi. Ular bizni dunyo bilan tanishtiiradi, bilim va axloq olamiga yetaklaydi.'),
  ('Qalam va karandash', 'Yozish asbaoblari tarixini o''rganing'),
  ('Tabiiy yadro', 'Tabiiyning sirlariga chuqur tushunarli');

-- Insert complete questions with options for test 1 (with question_type = 'radio')
INSERT INTO public.test_questions (test_id, question_text, question_order, question_type, option_a, option_b, option_c, option_d, correct_answer)
SELECT id, 'Matnga ko''ra kitob bizga nima beradi?', 1, 'radio',
  'Faqat zavq-ziyofat',
  'Bilim, tajriba va ilm-fanni',
  'Yalpi vaqt o''tkazish',
  'Hech narsa',
  'B'
FROM public.tests WHERE title = 'Kitob — bilim manbai'

UNION ALL

SELECT id, 'Matnga ko''ra kitob bizni nimaga olib boravoti?', 2, 'radio',
  'Fantaziya olami',
  'Dunyo bilan tanishuv, bilim va axloq olamiga',
  'Faqat fanni',
  'Yalpi qisqa hikoya',
  'B'
FROM public.tests WHERE title = 'Kitob — bilim manbai'

UNION ALL

SELECT id, 'Kitob bizga nimani beradi?', 3, 'radio',
  'Faqat vaqt o''tkazish',
  'Axloq, ma''naviyat va insan sevgisi',
  'Faqat pul',
  'Hech narsa',
  'B'
FROM public.tests WHERE title = 'Kitob — bilim manbai';
