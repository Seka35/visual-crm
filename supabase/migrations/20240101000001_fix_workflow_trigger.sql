-- Fix the add_creator_as_member function to use new.creator_id instead of auth.uid()
-- This avoids potential issues with auth context in triggers and ensures consistency

create or replace function public.add_creator_as_member()
returns trigger as $$
begin
  insert into public.workflow_members (workflow_id, user_id, role, status)
  values (new.id, new.creator_id, 'admin', 'accepted');
  return new;
end;
$$ language plpgsql security definer;
