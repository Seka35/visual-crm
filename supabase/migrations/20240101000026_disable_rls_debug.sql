-- TEMPORARY DEBUGGING STEP
-- Disable RLS on junction tables to verify if policies are the blocker.

ALTER TABLE public.deal_contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_contacts DISABLE ROW LEVEL SECURITY;
