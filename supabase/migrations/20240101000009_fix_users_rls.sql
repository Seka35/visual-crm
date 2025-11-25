-- Allow authenticated users to read all profiles in the public.users table
-- This is necessary so that users can see the names and avatars of other workflow members
create policy "Allow authenticated users to read all profiles"
on public.users
for select
to authenticated
using ( true );
