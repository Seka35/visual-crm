-- =====================================================
-- FIX RLS INFINITE RECURSION
-- =====================================================

-- 1. Create a secure function to get workflow IDs for the current user
-- This function runs as the database owner (SECURITY DEFINER), bypassing RLS on workflow_members
-- This breaks the infinite loop between workflows and workflow_members policies
CREATE OR REPLACE FUNCTION public.get_user_workflow_ids()
RETURNS TABLE (workflow_id UUID)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT wm.workflow_id
  FROM public.workflow_members wm
  WHERE wm.user_id = auth.uid()
  AND wm.status = 'accepted';
END;
$$;

-- 2. Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view workflows they are members of" ON public.workflows;
DROP POLICY IF EXISTS "Members can view other members in their workflows" ON public.workflow_members;

-- 3. Create new recursion-free policies

-- Workflows: View if creator OR if ID is in the list of joined workflows
CREATE POLICY "Users can view workflows" ON public.workflows
    FOR SELECT USING (
        creator_id = auth.uid()
        OR
        id IN (SELECT * FROM public.get_user_workflow_ids())
    );

-- Workflow Members: View if it's your own membership OR if it's for a workflow you created OR if it's for a workflow you are a member of
CREATE POLICY "Users can view workflow members" ON public.workflow_members
    FOR SELECT USING (
        user_id = auth.uid() -- View own membership
        OR
        workflow_id IN ( -- View members of workflows I created
            SELECT id FROM public.workflows WHERE creator_id = auth.uid()
        )
        OR
        workflow_id IN ( -- View members of workflows I am part of
            SELECT * FROM public.get_user_workflow_ids()
        )
    );

-- 4. Ensure Trigger is GONE (Redundant but safe)
DROP TRIGGER IF EXISTS on_workflow_created ON public.workflows;
DROP FUNCTION IF EXISTS public.add_creator_as_member();
