-- Extra tenant rules. Existing policies stay in place.

create or replace function public.current_church_id()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select church_id from public.profiles where id = auth.uid();
$$;

-- Reading another church's profile from inside a policy would loop forever,
-- so the lookup above bypasses row security.

alter table public.profiles enable row level security;
create policy tenant_isolation_read on public.profiles
  for select to authenticated
  using (church_id = public.current_church_id());
create policy tenant_isolation_write on public.profiles
  for all to authenticated
  using (church_id = public.current_church_id())
  with check (church_id = public.current_church_id());

alter table public.members enable row level security;
create policy tenant_isolation_read on public.members
  for select to authenticated
  using (church_id = public.current_church_id());
create policy tenant_isolation_write on public.members
  for all to authenticated
  using (church_id = public.current_church_id())
  with check (church_id = public.current_church_id());

alter table public.membership_applications enable row level security;
create policy tenant_isolation_read on public.membership_applications
  for select to authenticated
  using (church_id = public.current_church_id());
create policy tenant_isolation_write on public.membership_applications
  for all to authenticated
  using (church_id = public.current_church_id())
  with check (church_id = public.current_church_id());

alter table public.events enable row level security;
create policy tenant_isolation_read on public.events
  for select to authenticated
  using (church_id = public.current_church_id());
create policy tenant_isolation_write on public.events
  for all to authenticated
  using (church_id = public.current_church_id())
  with check (church_id = public.current_church_id());

alter table public.event_rsvps enable row level security;
create policy tenant_isolation_read on public.event_rsvps
  for select to authenticated
  using (church_id = public.current_church_id());
create policy tenant_isolation_write on public.event_rsvps
  for all to authenticated
  using (church_id = public.current_church_id())
  with check (church_id = public.current_church_id());

alter table public.media_items enable row level security;
create policy tenant_isolation_read on public.media_items
  for select to authenticated
  using (church_id = public.current_church_id());
create policy tenant_isolation_write on public.media_items
  for all to authenticated
  using (church_id = public.current_church_id())
  with check (church_id = public.current_church_id());

alter table public.announcements enable row level security;
create policy tenant_isolation_read on public.announcements
  for select to authenticated
  using (church_id = public.current_church_id());
create policy tenant_isolation_write on public.announcements
  for all to authenticated
  using (church_id = public.current_church_id())
  with check (church_id = public.current_church_id());

alter table public.prayer_requests enable row level security;
create policy tenant_isolation_read on public.prayer_requests
  for select to authenticated
  using (church_id = public.current_church_id());
create policy tenant_isolation_write on public.prayer_requests
  for all to authenticated
  using (church_id = public.current_church_id())
  with check (church_id = public.current_church_id());

alter table public.groups enable row level security;
create policy tenant_isolation_read on public.groups
  for select to authenticated
  using (church_id = public.current_church_id());
create policy tenant_isolation_write on public.groups
  for all to authenticated
  using (church_id = public.current_church_id())
  with check (church_id = public.current_church_id());

alter table public.visitors enable row level security;
create policy tenant_isolation_read on public.visitors
  for select to authenticated
  using (church_id = public.current_church_id());
create policy tenant_isolation_write on public.visitors
  for all to authenticated
  using (church_id = public.current_church_id())
  with check (church_id = public.current_church_id());

alter table public.follow_ups enable row level security;
create policy tenant_isolation_read on public.follow_ups
  for select to authenticated
  using (church_id = public.current_church_id());
create policy tenant_isolation_write on public.follow_ups
  for all to authenticated
  using (church_id = public.current_church_id())
  with check (church_id = public.current_church_id());
