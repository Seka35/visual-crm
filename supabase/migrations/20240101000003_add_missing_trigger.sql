-- Create the trigger function if it doesn't exist (it was defined in the fix file, but let's be sure)
create or replace function public.add_creator_as_member()
returns trigger as $$
begin
  insert into public.workflow_members (workflow_id, user_id, role, status)
  values (new.id, new.creator_id, 'admin', 'accepted');
  return new;
end;
$$ language plpgsql security definer;

-- DROP the trigger if it exists to avoid errors
DROP TRIGGER IF EXISTS on_workflow_created ON public.workflows;

-- CREATE the trigger
CREATE TRIGGER on_workflow_created
  AFTER INSERT ON public.workflows
  FOR EACH ROW EXECUTE FUNCTION public.add_creator_as_member();
