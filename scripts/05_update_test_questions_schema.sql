-- Adding question_type column to test_questions table to support different question formats
ALTER TABLE public.test_questions 
ADD COLUMN question_type TEXT CHECK (question_type IN ('radio', 'textarea')) DEFAULT 'radio';

-- Making options nullable for textarea questions
ALTER TABLE public.test_questions
ALTER COLUMN option_a DROP NOT NULL,
ALTER COLUMN option_b DROP NOT NULL,
ALTER COLUMN option_c DROP NOT NULL,
ALTER COLUMN option_d DROP NOT NULL;

-- Making correct_answer more flexible for both radio (A/B/C/D) and textarea (keywords)
ALTER TABLE public.test_questions
DROP CONSTRAINT IF EXISTS test_questions_correct_answer_check;

ALTER TABLE public.test_questions
ADD CONSTRAINT test_questions_correct_answer_check 
CHECK (correct_answer IS NOT NULL);
