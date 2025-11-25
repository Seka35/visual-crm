-- Enable RLS on storage.objects if not already enabled
alter table storage.objects enable row level security;

-- Allow public read access to AVATAR bucket
create policy "Public Access to Avatars"
on storage.objects for select
using ( bucket_id = 'AVATAR' );

-- Allow authenticated users to upload avatars
-- We use (bucket_id = 'AVATAR') to restrict to this bucket
create policy "Authenticated users can upload avatars"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'AVATAR' );

-- Allow users to update their own avatars
create policy "Users can update their own avatars"
on storage.objects for update
to authenticated
using ( bucket_id = 'AVATAR' AND owner = auth.uid() );

-- Allow users to delete their own avatars
create policy "Users can delete their own avatars"
on storage.objects for delete
to authenticated
using ( bucket_id = 'AVATAR' AND owner = auth.uid() );
