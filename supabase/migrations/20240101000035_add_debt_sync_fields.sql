-- Add columns to track associated task and event
alter table public.debts
add column if not exists related_task_id uuid references public.tasks(id) on delete set null,
add column if not exists related_event_id uuid references public.events(id) on delete set null;

-- Add indexes for performance
create index if not exists debts_related_task_id_idx on public.debts(related_task_id);
create index if not exists debts_related_event_id_idx on public.debts(related_event_id);
