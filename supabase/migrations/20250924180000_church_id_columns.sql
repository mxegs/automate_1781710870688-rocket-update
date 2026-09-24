-- Mark existing rows as CKC. Default fills current rows. No other columns change.

alter table public.profiles
  add column church_id text not null default 'ckc' references public.churches (id);
create index profiles_church_id_idx on public.profiles (church_id);

alter table public.members
  add column church_id text not null default 'ckc' references public.churches (id);
create index members_church_id_idx on public.members (church_id);

alter table public.membership_applications
  add column church_id text not null default 'ckc' references public.churches (id);
create index membership_applications_church_id_idx on public.membership_applications (church_id);

alter table public.events
  add column church_id text not null default 'ckc' references public.churches (id);
create index events_church_id_idx on public.events (church_id);

alter table public.event_rsvps
  add column church_id text not null default 'ckc' references public.churches (id);
create index event_rsvps_church_id_idx on public.event_rsvps (church_id);

alter table public.media_items
  add column church_id text not null default 'ckc' references public.churches (id);
create index media_items_church_id_idx on public.media_items (church_id);

alter table public.announcements
  add column church_id text not null default 'ckc' references public.churches (id);
create index announcements_church_id_idx on public.announcements (church_id);

alter table public.prayer_requests
  add column church_id text not null default 'ckc' references public.churches (id);
create index prayer_requests_church_id_idx on public.prayer_requests (church_id);

alter table public.groups
  add column church_id text not null default 'ckc' references public.churches (id);
create index groups_church_id_idx on public.groups (church_id);

alter table public.visitors
  add column church_id text not null default 'ckc' references public.churches (id);
create index visitors_church_id_idx on public.visitors (church_id);

alter table public.follow_ups
  add column church_id text not null default 'ckc' references public.churches (id);
create index follow_ups_church_id_idx on public.follow_ups (church_id);
