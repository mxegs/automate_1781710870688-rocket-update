-- Events visibility (mirror sermons), payments/tickets, prayer requests, announcements
-- Run after prior migrations. Clears dummy YouTube seed data.

-- Remove dummy YouTube sermon seeds (admins add their own)
delete from public.media_items
where youtube_id in (
  'dQw4w9WgXcQ', 'L_jWHffIx5E', 'OPf0YbXqDm0', 'hT_nvWreIhg',
  'PT2_F-1esPk', 'YQHsXMglC9A', 'fJ9rUzIMcZQ', 'RgKAFK5djSk'
);

-- ---------------------------------------------------------------------------
-- Events: campus visibility + payments
-- ---------------------------------------------------------------------------
alter table public.events
  add column if not exists visibility public.content_visibility not null default 'campus_only',
  add column if not exists category text not null default 'General',
  add column if not exists image_url text,
  add column if not exists capacity integer,
  add column if not exists is_paid boolean not null default false,
  add column if not exists price_cents integer,
  add column if not exists currency text not null default 'ZAR',
  add column if not exists yoco_payment_link text,
  add column if not exists yoco_checkout_id text,
  add column if not exists reminder_hours_before integer default 24,
  add column if not exists reminder_sent_at timestamptz;

-- campus_id required for campus_only; nullable for church_wide collective events
comment on column public.events.visibility is 'campus_only | church_wide (both campuses) | members_only';

-- ---------------------------------------------------------------------------
-- Event RSVPs: visitors, tickets, payments
-- ---------------------------------------------------------------------------
alter table public.event_rsvps
  add column if not exists email text,
  add column if not exists guests_count integer not null default 1,
  add column if not exists is_visitor boolean not null default false,
  add column if not exists payment_status text not null default 'free',
  add column if not exists ticket_code text unique,
  add column if not exists ticket_scanned_at timestamptz,
  add column if not exists reminder_sent_at timestamptz;

create index if not exists event_rsvps_ticket_code_idx on public.event_rsvps (ticket_code);
create index if not exists event_rsvps_is_visitor_idx on public.event_rsvps (is_visitor);

-- ---------------------------------------------------------------------------
-- Prayer requests (campus-scoped; members submit only)
-- ---------------------------------------------------------------------------
create type public.prayer_request_status as enum (
  'new', 'assigned', 'in_prayer', 'answered', 'closed'
);

create table public.prayer_requests (
  id uuid primary key default gen_random_uuid(),
  campus_id text not null references public.campuses (id),
  profile_id uuid references public.profiles (id) on delete set null,
  submitter_name text not null,
  contact_phone text,
  contact_email text,
  title text not null,
  description text not null,
  category text not null default 'Other',
  is_confidential boolean not null default false,
  status public.prayer_request_status not null default 'new',
  assigned_to uuid references public.profiles (id) on delete set null,
  auto_reply_sent_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint prayer_contact_check check (contact_phone is not null or contact_email is not null)
);

create index prayer_requests_campus_id_idx on public.prayer_requests (campus_id);
create index prayer_requests_status_idx on public.prayer_requests (status);

create trigger prayer_requests_updated_at
  before update on public.prayer_requests
  for each row execute function public.set_updated_at();

alter table public.prayer_requests enable row level security;

create policy "prayer_requests_staff"
  on public.prayer_requests for all
  to authenticated
  using (
    public.is_super_admin()
    or public.can_access_campus(campus_id)
  )
  with check (
    public.is_super_admin()
    or public.can_access_campus(campus_id)
  );

-- ---------------------------------------------------------------------------
-- Announcements (scheduled + repeat)
-- ---------------------------------------------------------------------------
create type public.announcement_status as enum ('draft', 'scheduled', 'published', 'archived');
create type public.repeat_interval as enum ('none', 'weekly', 'monthly');

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  campus_id text not null references public.campuses (id),
  visibility public.content_visibility not null default 'campus_only',
  title text not null,
  content text not null,
  category text not null default 'General',
  author_name text,
  pinned boolean not null default false,
  status public.announcement_status not null default 'draft',
  publish_at timestamptz,
  expires_at timestamptz,
  repeat_interval public.repeat_interval not null default 'none',
  repeat_until timestamptz,
  last_published_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index announcements_campus_id_idx on public.announcements (campus_id);
create index announcements_status_idx on public.announcements (status);
create index announcements_publish_at_idx on public.announcements (publish_at);

create trigger announcements_updated_at
  before update on public.announcements
  for each row execute function public.set_updated_at();

alter table public.announcements enable row level security;

create policy "announcements_select_authenticated"
  on public.announcements for select
  to authenticated
  using (true);

create policy "announcements_staff"
  on public.announcements for all
  to authenticated
  using (
    public.is_super_admin()
    or public.can_access_campus(campus_id)
  )
  with check (
    public.is_super_admin()
    or public.can_access_campus(campus_id)
  );

-- Demo follow-up contacts for tag testing
insert into public.follow_ups (name, phone, campus_id, stage, source, last_contact_at)
select * from (values
  ('Sibusiso Naidoo', '0823331100', 'verulam', 'engaging'::public.follow_up_stage, 'Street outreach', now() - interval '2 days'),
  ('Amanda Pillay', '0732229900', 'midrand', 'cold'::public.follow_up_stage, 'Friend referral', now() - interval '6 days'),
  ('Tshepo Mabena', '0618887766', 'midrand', 'committed'::public.follow_up_stage, 'Home visit', now() - interval '1 day'),
  ('Lerato Pillay', '0825554433', 'verulam', 'cold'::public.follow_up_stage, 'Event visitor', now() - interval '10 days'),
  ('John Mokoena', '0734445566', 'midrand', 'engaging'::public.follow_up_stage, 'Social media', now() - interval '3 days')
) as v(name, phone, campus_id, stage, source, last_contact_at)
where not exists (select 1 from public.follow_ups limit 1);
