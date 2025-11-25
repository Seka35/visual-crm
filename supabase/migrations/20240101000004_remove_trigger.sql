-- Drop the trigger and function to revert to client-side handling
-- This is to resolve the 500 Internal Server Error causing workflow creation failure

DROP TRIGGER IF EXISTS on_workflow_created ON public.workflows;
DROP FUNCTION IF EXISTS public.add_creator_as_member();
