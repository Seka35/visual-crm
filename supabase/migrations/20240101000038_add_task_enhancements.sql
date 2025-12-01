-- Create task_folders table
CREATE TABLE IF NOT EXISTS public.task_folders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    color TEXT NOT NULL DEFAULT '#3b82f6', -- Default blue-500
    workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE,
    created_by UUID REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on task_folders
ALTER TABLE public.task_folders ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for task_folders
CREATE POLICY "Users can view own or shared task folders" ON public.task_folders
    FOR SELECT USING (
        (workflow_id IS NULL AND created_by = auth.uid()) OR
        (workflow_id IS NOT NULL AND public.has_workflow_access(workflow_id))
    );

CREATE POLICY "Users can insert own or shared task folders" ON public.task_folders
    FOR INSERT WITH CHECK (
        (workflow_id IS NULL AND created_by = auth.uid()) OR
        (workflow_id IS NOT NULL AND public.has_workflow_access(workflow_id))
    );

CREATE POLICY "Users can update own or shared task folders" ON public.task_folders
    FOR UPDATE USING (
        (workflow_id IS NULL AND created_by = auth.uid()) OR
        (workflow_id IS NOT NULL AND public.has_workflow_access(workflow_id))
    );

CREATE POLICY "Users can delete own or shared task folders" ON public.task_folders
    FOR DELETE USING (
        (workflow_id IS NULL AND created_by = auth.uid()) OR
        (workflow_id IS NOT NULL AND public.has_workflow_access(workflow_id))
    );

-- Add columns to tasks table
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS folder_id UUID REFERENCES public.task_folders(id) ON DELETE SET NULL;
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS urls JSONB DEFAULT '[]'::jsonb;

-- Add trigger for updated_at on task_folders
CREATE TRIGGER update_task_folders_updated_at BEFORE UPDATE ON public.task_folders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
