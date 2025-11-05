-- Admin permissions for tests and questions insert
-- Admin users can insert new tests and questions

-- Allow public (admin from frontend) to insert tests
CREATE POLICY "Admin can insert tests" 
  ON public.tests FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can insert questions" 
  ON public.test_questions FOR INSERT WITH CHECK (true);

-- Optional: Allow admin to update and delete tests
CREATE POLICY "Admin can update tests" 
  ON public.tests FOR UPDATE USING (true);

CREATE POLICY "Admin can delete tests" 
  ON public.tests FOR DELETE USING (true);

CREATE POLICY "Admin can delete questions" 
  ON public.test_questions FOR DELETE USING (true);
