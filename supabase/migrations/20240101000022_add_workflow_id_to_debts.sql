-- Add workflow_id to debts table
ALTER TABLE public.debts
ADD COLUMN IF NOT EXISTS workflow_id UUID REFERENCES public.workflows(id) ON DELETE CASCADE;

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_debts_workflow_id ON public.debts(workflow_id);
