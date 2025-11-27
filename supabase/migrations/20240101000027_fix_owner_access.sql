-- Fix RLS to ensure owners can always access their data, even in workflows
-- And re-enable RLS on junction tables

-- 1. Re-enable RLS on junction tables
ALTER TABLE public.deal_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_contacts ENABLE ROW LEVEL SECURITY;

-- 2. Update Deals Policy
DROP POLICY IF EXISTS "Users can view own or shared deals" ON public.deals;
CREATE POLICY "Users can view own or shared deals" ON public.deals
    FOR SELECT USING (
        user_id = auth.uid() -- Owner always sees their data
        OR
        (workflow_id IS NOT NULL AND public.has_workflow_access(workflow_id)) -- Members see shared data
    );

DROP POLICY IF EXISTS "Users can update own or shared deals" ON public.deals;
CREATE POLICY "Users can update own or shared deals" ON public.deals
    FOR UPDATE USING (
        user_id = auth.uid()
        OR
        (workflow_id IS NOT NULL AND public.has_workflow_access(workflow_id))
    );

DROP POLICY IF EXISTS "Users can delete own or shared deals" ON public.deals;
CREATE POLICY "Users can delete own or shared deals" ON public.deals
    FOR DELETE USING (
        user_id = auth.uid()
        OR
        (workflow_id IS NOT NULL AND public.has_workflow_access(workflow_id))
    );

-- 3. Update Tasks Policy
DROP POLICY IF EXISTS "Users can view own or shared tasks" ON public.tasks;
CREATE POLICY "Users can view own or shared tasks" ON public.tasks
    FOR SELECT USING (
        user_id = auth.uid()
        OR
        (workflow_id IS NOT NULL AND public.has_workflow_access(workflow_id))
    );

DROP POLICY IF EXISTS "Users can update own or shared tasks" ON public.tasks;
CREATE POLICY "Users can update own or shared tasks" ON public.tasks
    FOR UPDATE USING (
        user_id = auth.uid()
        OR
        (workflow_id IS NOT NULL AND public.has_workflow_access(workflow_id))
    );

DROP POLICY IF EXISTS "Users can delete own or shared tasks" ON public.tasks;
CREATE POLICY "Users can delete own or shared tasks" ON public.tasks
    FOR DELETE USING (
        user_id = auth.uid()
        OR
        (workflow_id IS NOT NULL AND public.has_workflow_access(workflow_id))
    );

-- 4. Update Contacts Policy
DROP POLICY IF EXISTS "Users can view own or shared contacts" ON public.contacts;
CREATE POLICY "Users can view own or shared contacts" ON public.contacts
    FOR SELECT USING (
        user_id = auth.uid()
        OR
        (workflow_id IS NOT NULL AND public.has_workflow_access(workflow_id))
    );

DROP POLICY IF EXISTS "Users can update own or shared contacts" ON public.contacts;
CREATE POLICY "Users can update own or shared contacts" ON public.contacts
    FOR UPDATE USING (
        user_id = auth.uid()
        OR
        (workflow_id IS NOT NULL AND public.has_workflow_access(workflow_id))
    );

DROP POLICY IF EXISTS "Users can delete own or shared contacts" ON public.contacts;
CREATE POLICY "Users can delete own or shared contacts" ON public.contacts
    FOR DELETE USING (
        user_id = auth.uid()
        OR
        (workflow_id IS NOT NULL AND public.has_workflow_access(workflow_id))
    );
