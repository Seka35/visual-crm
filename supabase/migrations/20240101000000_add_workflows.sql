-- =====================================================
-- WORKFLOWS SYSTEM MIGRATION
-- =====================================================

-- 1. Create Workflows Table
CREATE TABLE IF NOT EXISTS public.workflows (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    creator_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    share_code TEXT UNIQUE NOT NULL,
    shared_resources TEXT[] DEFAULT '{}', -- e.g., ['contacts', 'deals']
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Workflow Members Table
CREATE TABLE IF NOT EXISTS public.workflow_members (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(workflow_id, user_id)
);

-- 3. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    type TEXT NOT NULL, -- 'join_request', 'join_accepted', etc.
    content TEXT NOT NULL,
    data JSONB DEFAULT '{}', -- Store related IDs e.g. { "workflow_id": "...", "requester_id": "..." }
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Add workflow_id to existing data tables
ALTER TABLE public.contacts ADD COLUMN IF NOT EXISTS workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE;
ALTER TABLE public.deals ADD COLUMN IF NOT EXISTS workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE;
ALTER TABLE public.calendar_events ADD COLUMN IF NOT EXISTS workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE;

-- 5. Enable RLS on new tables
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflow_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- RLS POLICIES
-- =====================================================

-- Workflows Policies
CREATE POLICY "Users can view workflows they are members of" ON public.workflows
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.workflow_members
            WHERE workflow_id = public.workflows.id
            AND user_id = auth.uid()
            AND status = 'accepted'
        )
        OR creator_id = auth.uid()
    );

CREATE POLICY "Users can create workflows" ON public.workflows
    FOR INSERT WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Creators can update their workflows" ON public.workflows
    FOR UPDATE USING (auth.uid() = creator_id);

CREATE POLICY "Creators can delete their workflows" ON public.workflows
    FOR DELETE USING (auth.uid() = creator_id);

-- Workflow Members Policies
CREATE POLICY "Members can view other members in their workflows" ON public.workflow_members
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.workflow_members wm
            WHERE wm.workflow_id = public.workflow_members.workflow_id
            AND wm.user_id = auth.uid()
            AND wm.status = 'accepted'
        )
        OR user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM public.workflows w
            WHERE w.id = public.workflow_members.workflow_id
            AND w.creator_id = auth.uid()
        )
    );

CREATE POLICY "Users can join workflows (create membership)" ON public.workflow_members
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Creators can update membership status" ON public.workflow_members
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.workflows w
            WHERE w.id = public.workflow_members.workflow_id
            AND w.creator_id = auth.uid()
        )
    );

-- Notifications Policies
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications (mark read)" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System/Users can insert notifications" ON public.notifications
    FOR INSERT WITH CHECK (true); -- Allow insert, usually handled by server logic or triggers, but for client-side simplicity we allow it if authenticated. Ideally restricted.

-- =====================================================
-- UPDATE EXISTING DATA POLICIES
-- =====================================================

-- Helper function to check access
CREATE OR REPLACE FUNCTION public.has_workflow_access(target_workflow_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    IF target_workflow_id IS NULL THEN
        RETURN TRUE; -- Personal data check handled by user_id match in policy
    END IF;
    
    RETURN EXISTS (
        SELECT 1 FROM public.workflow_members
        WHERE workflow_id = target_workflow_id
        AND user_id = auth.uid()
        AND status = 'accepted'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update Contacts Policies
DROP POLICY IF EXISTS "Users can view own contacts" ON public.contacts;
CREATE POLICY "Users can view own or shared contacts" ON public.contacts
    FOR SELECT USING (
        (workflow_id IS NULL AND user_id = auth.uid()) OR
        (workflow_id IS NOT NULL AND public.has_workflow_access(workflow_id))
    );

DROP POLICY IF EXISTS "Users can insert own contacts" ON public.contacts;
CREATE POLICY "Users can insert own or shared contacts" ON public.contacts
    FOR INSERT WITH CHECK (
        (workflow_id IS NULL AND user_id = auth.uid()) OR
        (workflow_id IS NOT NULL AND public.has_workflow_access(workflow_id))
    );

DROP POLICY IF EXISTS "Users can update own contacts" ON public.contacts;
CREATE POLICY "Users can update own or shared contacts" ON public.contacts
    FOR UPDATE USING (
        (workflow_id IS NULL AND user_id = auth.uid()) OR
        (workflow_id IS NOT NULL AND public.has_workflow_access(workflow_id))
    );

DROP POLICY IF EXISTS "Users can delete own contacts" ON public.contacts;
CREATE POLICY "Users can delete own or shared contacts" ON public.contacts
    FOR DELETE USING (
        (workflow_id IS NULL AND user_id = auth.uid()) OR
        (workflow_id IS NOT NULL AND public.has_workflow_access(workflow_id))
    );

-- Update Deals Policies
DROP POLICY IF EXISTS "Users can view own deals" ON public.deals;
CREATE POLICY "Users can view own or shared deals" ON public.deals
    FOR SELECT USING (
        (workflow_id IS NULL AND user_id = auth.uid()) OR
        (workflow_id IS NOT NULL AND public.has_workflow_access(workflow_id))
    );

DROP POLICY IF EXISTS "Users can insert own deals" ON public.deals;
CREATE POLICY "Users can insert own or shared deals" ON public.deals
    FOR INSERT WITH CHECK (
        (workflow_id IS NULL AND user_id = auth.uid()) OR
        (workflow_id IS NOT NULL AND public.has_workflow_access(workflow_id))
    );

DROP POLICY IF EXISTS "Users can update own deals" ON public.deals;
CREATE POLICY "Users can update own or shared deals" ON public.deals
    FOR UPDATE USING (
        (workflow_id IS NULL AND user_id = auth.uid()) OR
        (workflow_id IS NOT NULL AND public.has_workflow_access(workflow_id))
    );

DROP POLICY IF EXISTS "Users can delete own deals" ON public.deals;
CREATE POLICY "Users can delete own or shared deals" ON public.deals
    FOR DELETE USING (
        (workflow_id IS NULL AND user_id = auth.uid()) OR
        (workflow_id IS NOT NULL AND public.has_workflow_access(workflow_id))
    );

-- Update Tasks Policies
DROP POLICY IF EXISTS "Users can view own tasks" ON public.tasks;
CREATE POLICY "Users can view own or shared tasks" ON public.tasks
    FOR SELECT USING (
        (workflow_id IS NULL AND user_id = auth.uid()) OR
        (workflow_id IS NOT NULL AND public.has_workflow_access(workflow_id))
    );

DROP POLICY IF EXISTS "Users can insert own tasks" ON public.tasks;
CREATE POLICY "Users can insert own or shared tasks" ON public.tasks
    FOR INSERT WITH CHECK (
        (workflow_id IS NULL AND user_id = auth.uid()) OR
        (workflow_id IS NOT NULL AND public.has_workflow_access(workflow_id))
    );

DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;
CREATE POLICY "Users can update own or shared tasks" ON public.tasks
    FOR UPDATE USING (
        (workflow_id IS NULL AND user_id = auth.uid()) OR
        (workflow_id IS NOT NULL AND public.has_workflow_access(workflow_id))
    );

DROP POLICY IF EXISTS "Users can delete own tasks" ON public.tasks;
CREATE POLICY "Users can delete own or shared tasks" ON public.tasks
    FOR DELETE USING (
        (workflow_id IS NULL AND user_id = auth.uid()) OR
        (workflow_id IS NOT NULL AND public.has_workflow_access(workflow_id))
    );

-- Update Calendar Events Policies
DROP POLICY IF EXISTS "Users can view own events" ON public.calendar_events;
CREATE POLICY "Users can view own or shared events" ON public.calendar_events
    FOR SELECT USING (
        (workflow_id IS NULL AND user_id = auth.uid()) OR
        (workflow_id IS NOT NULL AND public.has_workflow_access(workflow_id))
    );

DROP POLICY IF EXISTS "Users can insert own events" ON public.calendar_events;
CREATE POLICY "Users can insert own or shared events" ON public.calendar_events
    FOR INSERT WITH CHECK (
        (workflow_id IS NULL AND user_id = auth.uid()) OR
        (workflow_id IS NOT NULL AND public.has_workflow_access(workflow_id))
    );

DROP POLICY IF EXISTS "Users can update own events" ON public.calendar_events;
CREATE POLICY "Users can update own or shared events" ON public.calendar_events
    FOR UPDATE USING (
        (workflow_id IS NULL AND user_id = auth.uid()) OR
        (workflow_id IS NOT NULL AND public.has_workflow_access(workflow_id))
    );

DROP POLICY IF EXISTS "Users can delete own events" ON public.calendar_events;
CREATE POLICY "Users can delete own or shared events" ON public.calendar_events
    FOR DELETE USING (
        (workflow_id IS NULL AND user_id = auth.uid()) OR
        (workflow_id IS NOT NULL AND public.has_workflow_access(workflow_id))
    );

-- Triggers for updated_at
CREATE TRIGGER update_workflows_updated_at BEFORE UPDATE ON public.workflows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_workflow_members_updated_at BEFORE UPDATE ON public.workflow_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
