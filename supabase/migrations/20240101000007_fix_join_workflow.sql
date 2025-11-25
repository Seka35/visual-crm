-- =====================================================
-- FIX JOIN WORKFLOW RLS
-- =====================================================

-- The issue is that "Users can view workflows" policy restricts access to only workflows
-- the user is ALREADY a member of or created.
-- This prevents finding a workflow by its share_code if you are not yet a member.

-- We need a policy that allows ANY authenticated user to view a workflow if they know its share_code.

-- 1. Drop the restrictive policy (re-creating it with broader access)
DROP POLICY IF EXISTS "Users can view workflows" ON public.workflows;

-- 2. Create a new policy that includes finding by share_code
-- Note: We cannot easily check "if query uses share_code" in RLS directly without complex logic or security definer functions.
-- However, for this use case, allowing users to read basic workflow info (id, name, creator) is generally acceptable
-- if we want them to be able to join.
-- A stricter approach is to create a specific function to "lookup" workflow by code.

-- Let's try the function approach for maximum security and to avoid opening up "SELECT *" too much.
-- But first, let's fix the RLS for the general case.

CREATE POLICY "Users can view workflows" ON public.workflows
    FOR SELECT USING (
        creator_id = auth.uid()
        OR
        id IN (SELECT * FROM public.get_user_workflow_ids())
        OR
        -- Allow access if the user is querying by a valid share_code (conceptually).
        -- Since we can't filter the WHERE clause of the user's query here, we simply allow
        -- reading ALL workflows? No, that's bad.
        -- We will use a SECURITY DEFINER function to find the workflow by code, bypassing RLS.
        -- So we keep this policy RESTRICTIVE.
        false 
    );

-- Wait, the previous policy was actually fine for "listing" workflows.
-- The problem is `joinWorkflow` in JS tries to `select * from workflows where share_code = ...`
-- This fails RLS because the user is not yet a member.

-- SOLUTION: Create a Secure Function to find workflow by code.

CREATE OR REPLACE FUNCTION public.find_workflow_by_code(code TEXT)
RETURNS TABLE (id UUID, creator_id UUID, name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT w.id, w.creator_id, w.name
  FROM public.workflows w
  WHERE w.share_code = code;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.find_workflow_by_code(TEXT) TO authenticated;

-- Restore the standard view policy for listing
DROP POLICY IF EXISTS "Users can view workflows" ON public.workflows;
CREATE POLICY "Users can view workflows" ON public.workflows
    FOR SELECT USING (
        creator_id = auth.uid()
        OR
        id IN (SELECT * FROM public.get_user_workflow_ids())
    );
