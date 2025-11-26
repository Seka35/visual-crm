create table if not exists public.debts (
    id uuid not null default gen_random_uuid(),
    user_id uuid not null default auth.uid(),
    borrower_name text not null,
    amount_lent text not null,
    amount_repaid text default '$0',
    date_lent timestamptz default now(),
    reminder_date timestamptz,
    description text,
    status text not null default 'lent', -- 'lent', 'partial', 'repaid'
    created_at timestamptz default now(),
    updated_at timestamptz default now(),
    constraint debts_pkey primary key (id),
    constraint debts_user_id_fkey foreign key (user_id) references auth.users (id) on delete cascade
);

-- Enable RLS
alter table public.debts enable row level security;

-- Create policies
-- Drop policies if they exist to ensure clean creation
drop policy if exists "Users can view their own debts" on public.debts;
drop policy if exists "Users can insert their own debts" on public.debts;
drop policy if exists "Users can update their own debts" on public.debts;
drop policy if exists "Users can delete their own debts" on public.debts;

-- Create policies
create policy "Users can view their own debts" on public.debts
    for select using (auth.uid() = user_id);

create policy "Users can insert their own debts" on public.debts
    for insert with check (auth.uid() = user_id);

create policy "Users can update their own debts" on public.debts
    for update using (auth.uid() = user_id);

create policy "Users can delete their own debts" on public.debts
    for delete using (auth.uid() = user_id);

-- Create indexes
drop index if exists debts_user_id_idx;
drop index if exists debts_status_idx;

create index debts_user_id_idx on public.debts (user_id);
create index debts_status_idx on public.debts (status);
