-- Add question_type column to test_questions table
ALTER TABLE public.test_questions 
ADD COLUMN question_type TEXT DEFAULT 'textarea' CHECK (question_type IN ('radio', 'textarea'));

-- Update correct_answer constraint to allow any text (for textarea keywords)
ALTER TABLE public.test_questions 
DROP CONSTRAINT test_questions_correct_answer_check;

ALTER TABLE public.test_questions 
ADD CONSTRAINT test_questions_correct_answer_check 
CHECK (question_type = 'textarea' OR correct_answer IN ('A', 'B', 'C', 'D'));
