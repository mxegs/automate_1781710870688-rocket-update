-- One attendance row per person per event. Does not change event_rsvps.

create table public.event_checkins (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  campus_id text references public.campuses (id) on delete set null,
  profile_id uuid references public.profiles (id) on delete set null,
  member_id uuid references public.members (id) on delete set null,
  rsvp_id uuid references public.event_rsvps (id) on delete set null,
  is_dependant boolean not null default false,
  dependant_name text,
  guardian_member_id uuid references public.members (id) on delete set null,
  room text,
  seat text,
  security_code text,
  method text not null default 'self' check (method in ('self', 'kiosk', 'scanner', 'staff')),
  checked_in_by uuid references public.profiles (id) on delete set null,
  checked_in_at timestamptz not null default now(),
  synced_at timestamptz
);

-- Members cannot be checked in twice. Dependants have a null member_id, and
-- Postgres treats those nulls as distinct, so several children can share an event.
alter table public.event_checkins
  add constraint event_checkins_event_member_key unique (event_id, member_id);

create index event_checkins_event_id_idx on public.event_checkins (event_id);
create index event_checkins_member_id_idx on public.event_checkins (member_id);
create index event_checkins_guardian_member_id_idx on public.event_checkins (guardian_member_id);

alter table public.event_checkins enable row level security;

create policy "event_checkins_select_own"
  on public.event_checkins for select
  to authenticated
  using (
    profile_id = auth.uid()
    or guardian_member_id in (
      select id from public.members where profile_id = auth.uid()
    )
  );

create policy "event_checkins_select_staff"
  on public.event_checkins for select
  to authenticated
  using (public.is_staff() or public.is_super_admin());
