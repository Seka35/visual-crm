-- =====================================================
-- ASSOCIATE CONTACTS WITH TASKS AND DEALS (Many-to-Many)
-- =====================================================

-- 1. Create Task Contacts Junction Table
CREATE TABLE IF NOT EXISTS public.task_contacts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(task_id, contact_id)
);

-- 2. Create Deal Contacts Junction Table
CREATE TABLE IF NOT EXISTS public.deal_contacts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    deal_id UUID REFERENCES public.deals(id) ON DELETE CASCADE NOT NULL,
    contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(deal_id, contact_id)
);

-- 3. Enable RLS
ALTER TABLE public.task_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deal_contacts ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies

-- Task Contacts Policies
-- Users can view if they can view the task AND the contact
-- Simplified: If they have access to the task, they can see its contacts (assuming they have access to contacts generally, which they do if in same workflow or owner)
CREATE POLICY "Users can view task_contacts" ON public.task_contacts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.tasks t
            WHERE t.id = public.task_contacts.task_id
            AND (
                (t.workflow_id IS NULL AND t.user_id = auth.uid()) OR
                (t.workflow_id IS NOT NULL AND public.has_workflow_access(t.workflow_id))
            )
        )
    );

CREATE POLICY "Users can insert task_contacts" ON public.task_contacts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.tasks t
            WHERE t.id = public.task_contacts.task_id
            AND (
                (t.workflow_id IS NULL AND t.user_id = auth.uid()) OR
                (t.workflow_id IS NOT NULL AND public.has_workflow_access(t.workflow_id))
            )
        )
    );

CREATE POLICY "Users can delete task_contacts" ON public.task_contacts
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.tasks t
            WHERE t.id = public.task_contacts.task_id
            AND (
                (t.workflow_id IS NULL AND t.user_id = auth.uid()) OR
                (t.workflow_id IS NOT NULL AND public.has_workflow_access(t.workflow_id))
            )
        )
    );

-- Deal Contacts Policies
CREATE POLICY "Users can view deal_contacts" ON public.deal_contacts
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.deals d
            WHERE d.id = public.deal_contacts.deal_id
            AND (
                (d.workflow_id IS NULL AND d.user_id = auth.uid()) OR
                (d.workflow_id IS NOT NULL AND public.has_workflow_access(d.workflow_id))
            )
        )
    );

CREATE POLICY "Users can insert deal_contacts" ON public.deal_contacts
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.deals d
            WHERE d.id = public.deal_contacts.deal_id
            AND (
                (d.workflow_id IS NULL AND d.user_id = auth.uid()) OR
                (d.workflow_id IS NOT NULL AND public.has_workflow_access(d.workflow_id))
            )
        )
    );

CREATE POLICY "Users can delete deal_contacts" ON public.deal_contacts
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.deals d
            WHERE d.id = public.deal_contacts.deal_id
            AND (
                (d.workflow_id IS NULL AND d.user_id = auth.uid()) OR
                (d.workflow_id IS NOT NULL AND public.has_workflow_access(d.workflow_id))
            )
        )
    );
