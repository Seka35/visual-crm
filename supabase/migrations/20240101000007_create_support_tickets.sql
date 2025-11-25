create table if not exists public.support_tickets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  subject text not null,
  message text not null,
  status text default 'open' check (status in ('open', 'in_progress', 'resolved', 'closed')),
  created_at timestamptz default now()
);

-- RLS
alter table public.support_tickets enable row level security;

create policy "Users can view their own tickets"
  on public.support_tickets for select
  using (auth.uid() = user_id);

create policy "Users can create tickets"
  on public.support_tickets for insert
  with check (auth.uid() = user_id);
