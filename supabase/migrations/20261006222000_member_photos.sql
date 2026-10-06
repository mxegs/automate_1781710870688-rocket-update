-- Staging first. Do not run on live.

alter table public.members
  add column if not exists photo_url text;

alter table public.members
  add column if not exists photo_visible boolean not null default true;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'member-photos',
  'member-photos',
  true,
  2097152,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "member_photos_public_read" on storage.objects;
create policy "member_photos_public_read"
on storage.objects
for select
using (bucket_id = 'member-photos');

drop policy if exists "member_photos_authenticated_insert" on storage.objects;
create policy "member_photos_authenticated_insert"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'member-photos');

drop policy if exists "member_photos_authenticated_update" on storage.objects;
create policy "member_photos_authenticated_update"
on storage.objects
for update
to authenticated
using (bucket_id = 'member-photos')
with check (bucket_id = 'member-photos');

drop policy if exists "member_photos_authenticated_delete" on storage.objects;
create policy "member_photos_authenticated_delete"
on storage.objects
for delete
to authenticated
using (bucket_id = 'member-photos');
