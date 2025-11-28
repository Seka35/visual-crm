-- Ensure columns exist (idempotent)
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'debts' and column_name = 'related_task_id') then
        alter table public.debts add column related_task_id uuid references public.tasks(id) on delete set null;
    end if;

    if not exists (select 1 from information_schema.columns where table_name = 'debts' and column_name = 'related_event_id') then
        alter table public.debts add column related_event_id uuid references public.calendar_events(id) on delete set null;
    end if;
end $$;

-- Ensure indexes exist
create index if not exists debts_related_task_id_idx on public.debts(related_task_id);
create index if not exists debts_related_event_id_idx on public.debts(related_event_id);
