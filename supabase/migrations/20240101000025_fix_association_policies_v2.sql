-- Comprehensive RLS fix for Association Tables (Task/Deal Contacts)
-- This replaces/augments previous policies to ensure full visibility in Workflows and Personal modes.

-- 1. Drop existing restrictive policies to avoid conflicts or "OR" logic confusion
DROP POLICY IF EXISTS "Users can view their own task contacts" ON public.task_contacts;
DROP POLICY IF EXISTS "Users can view their own deal contacts" ON public.deal_contacts;
DROP POLICY IF EXISTS "Users can view deal contacts via contact ownership" ON public.deal_contacts;
DROP POLICY IF EXISTS "Users can view task contacts via contact ownership" ON public.task_contacts;
DROP POLICY IF EXISTS "Users can view deal_contacts" ON public.deal_contacts;
DROP POLICY IF EXISTS "Users can view task_contacts" ON public.task_contacts;
DROP POLICY IF EXISTS "Users can manage task_contacts" ON public.task_contacts;
DROP POLICY IF EXISTS "Users can manage deal_contacts" ON public.deal_contacts;

-- 2. Create robust policies for DEAL CONTACTS
-- Allow access if user has access to the Deal OR the Contact
CREATE POLICY "Users can view deal_contacts" ON public.deal_contacts
    FOR SELECT USING (
        -- Check access to Deal
        EXISTS (
            SELECT 1 FROM public.deals d
            WHERE d.id = deal_contacts.deal_id
            AND (
                (d.workflow_id IS NULL AND d.user_id = auth.uid()) OR
                (d.workflow_id IS NOT NULL AND public.has_workflow_access(d.workflow_id))
            )
        )
        OR
        -- Check access to Contact
        EXISTS (
            SELECT 1 FROM public.contacts c
            WHERE c.id = deal_contacts.contact_id
            AND (
                (c.workflow_id IS NULL AND c.user_id = auth.uid()) OR
                (c.workflow_id IS NOT NULL AND public.has_workflow_access(c.workflow_id))
            )
        )
    );

-- 3. Create robust policies for TASK CONTACTS
-- Allow access if user has access to the Task OR the Contact
CREATE POLICY "Users can view task_contacts" ON public.task_contacts
    FOR SELECT USING (
        -- Check access to Task
        EXISTS (
            SELECT 1 FROM public.tasks t
            WHERE t.id = task_contacts.task_id
            AND (
                (t.workflow_id IS NULL AND t.user_id = auth.uid()) OR
                (t.workflow_id IS NOT NULL AND public.has_workflow_access(t.workflow_id))
            )
        )
        OR
        -- Check access to Contact
        EXISTS (
            SELECT 1 FROM public.contacts c
            WHERE c.id = task_contacts.contact_id
            AND (
                (c.workflow_id IS NULL AND c.user_id = auth.uid()) OR
                (c.workflow_id IS NOT NULL AND public.has_workflow_access(c.workflow_id))
            )
        )
    );

-- 4. Ensure Insert/Update/Delete also respects these rules (or at least ownership)
-- For simplicity, we allow modification if you have access to the PARENT resource you are linking from.
-- But since these are junction tables, usually you modify them via the parent.

-- Re-create INSERT policies (if they were dropped or need update)
-- We keep it simple: You can insert if you have access to the Task/Deal you are linking.
DROP POLICY IF EXISTS "Users can create their own task contacts" ON public.task_contacts;
CREATE POLICY "Users can manage task_contacts" ON public.task_contacts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.tasks t
            WHERE t.id = task_contacts.task_id
            AND (
                (t.workflow_id IS NULL AND t.user_id = auth.uid()) OR
                (t.workflow_id IS NOT NULL AND public.has_workflow_access(t.workflow_id))
            )
        )
    );

DROP POLICY IF EXISTS "Users can create their own deal contacts" ON public.deal_contacts;
CREATE POLICY "Users can manage deal_contacts" ON public.deal_contacts
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.deals d
            WHERE d.id = deal_contacts.deal_id
            AND (
                (d.workflow_id IS NULL AND d.user_id = auth.uid()) OR
                (d.workflow_id IS NOT NULL AND public.has_workflow_access(d.workflow_id))
            )
        )
    );
