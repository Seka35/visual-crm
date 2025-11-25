-- =====================================================
-- FINAL FIX FOR WORKFLOW CREATION
-- =====================================================

-- 1. Enable UUID extension (Required for uuid_generate_v4)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. DROP ALL TRIGGERS related to workflow creation to be absolutely sure
DROP TRIGGER IF EXISTS on_workflow_created ON public.workflows;
DROP FUNCTION IF EXISTS public.add_creator_as_member();

-- 3. Ensure RLS policies allow creation
-- (These should already exist, but re-asserting them avoids confusion if they were deleted)
-- Note: We use DO block to avoid errors if policies already exist

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'workflows' AND policyname = 'Users can create workflows'
    ) THEN
        CREATE POLICY "Users can create workflows" ON public.workflows
        FOR INSERT WITH CHECK (auth.uid() = creator_id);
    END IF;
END
$$;

-- 4. Ensure workflow_members allows insertion by creators (for the manual add step)
-- The existing policy "Users can join workflows (create membership)" checks (auth.uid() = user_id)
-- This is fine for the creator adding themselves.

-- 5. Grant necessary permissions (just in case)
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;
