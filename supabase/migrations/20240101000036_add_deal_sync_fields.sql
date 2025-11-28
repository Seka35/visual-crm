-- Add columns to track associated task and event
alter table public.deals
add column if not exists related_task_id uuid references public.tasks(id) on delete set null;

-- Add indexes for performance
create index if not exists deals_related_task_id_idx on public.deals(related_task_id);
