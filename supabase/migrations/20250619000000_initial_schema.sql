-- CKC Church App — initial schema
-- Run via Supabase Dashboard → SQL Editor, or: supabase db push

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums (match src/lib/* TypeScript types)
-- ---------------------------------------------------------------------------
create type public.user_role as enum (
  'super_admin',
  'admin',
  'pastor',
  'leader',
  'member',
  'visitor'
);

create type public.invite_request_status as enum ('pending', 'approved', 'declined');
create type public.invite_status as enum ('pending', 'accepted', 'expired');
create type public.application_status as enum ('draft', 'submitted', 'approved', 'rejected');
create type public.member_status as enum ('active', 'inactive');
create type public.group_category as enum ('ministry', 'community');
create type public.group_member_role as enum ('leader', 'member');
create type public.broadcast_status as enum ('draft', 'scheduled', 'sent');
create type public.follow_up_stage as enum ('cold', 'engaging', 'committed');
create type public.rsvp_status as enum ('going', 'maybe', 'declined');

-- ---------------------------------------------------------------------------
-- Campuses
-- ---------------------------------------------------------------------------
create table public.campuses (
  id text primary key,
  label text not null,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Profiles (1:1 with auth.users when phone OTP is enabled)
-- id must match auth.users.id after sign-up
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  phone text not null unique,
  role public.user_role not null default 'visitor',
  campus_id text references public.campuses (id) on delete set null,
  official_name text,
  username text unique,
  display_name text,
  photo_url text,
  email text,
  gender text check (gender in ('Male', 'Female')),
  date_of_birth date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_campus_id_idx on public.profiles (campus_id);
create index profiles_role_idx on public.profiles (role);
create index profiles_phone_idx on public.profiles (phone);

-- ---------------------------------------------------------------------------
-- Invite requests (/request-invite)
-- ---------------------------------------------------------------------------
create table public.invite_requests (
  id uuid primary key default gen_random_uuid(),
  surname text not null,
  full_name text not null,
  phone text not null,
  campus_id text not null references public.campuses (id),
  status public.invite_request_status not null default 'pending',
  notes text,
  requested_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles (id) on delete set null
);

create index invite_requests_status_idx on public.invite_requests (status);
create index invite_requests_campus_idx on public.invite_requests (campus_id);
create index invite_requests_phone_idx on public.invite_requests (phone);

-- ---------------------------------------------------------------------------
-- Invites (admin Send Invite → SMS link)
-- ---------------------------------------------------------------------------
create table public.invites (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,
  phone text not null,
  official_name text not null,
  username text,
  campus_id text references public.campuses (id) on delete set null,
  invite_request_id uuid references public.invite_requests (id) on delete set null,
  status public.invite_status not null default 'pending',
  sent_at timestamptz not null default now(),
  accepted_at timestamptz,
  expires_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null
);

create index invites_phone_idx on public.invites (phone);
create index invites_status_idx on public.invites (status);

-- ---------------------------------------------------------------------------
-- Membership applications (signup wizard — full JSON matches MembershipApplication)
-- ---------------------------------------------------------------------------
create table public.membership_applications (
  id uuid primary key default gen_random_uuid(),
  invite_id uuid references public.invites (id) on delete set null,
  phone text not null,
  campus_id text not null references public.campuses (id),
  status public.application_status not null default 'draft',
  application_data jsonb not null default '{}'::jsonb,
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles (id) on delete set null,
  review_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index membership_applications_status_idx on public.membership_applications (status);
create index membership_applications_phone_idx on public.membership_applications (phone);
create index membership_applications_campus_idx on public.membership_applications (campus_id);

-- ---------------------------------------------------------------------------
-- Members (approved — searchable fields denormalized for filters/bulk SMS)
-- ---------------------------------------------------------------------------
create table public.members (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid unique references public.profiles (id) on delete set null,
  application_id uuid unique references public.membership_applications (id) on delete set null,
  campus_id text not null references public.campuses (id),
  status public.member_status not null default 'active',
  surname text not null,
  full_name text not null,
  username text,
  phone text not null,
  email text,
  gender text check (gender in ('Male', 'Female')),
  date_of_birth date,
  age int,
  marital_status text,
  member_since date not null default current_date,
  covenant_signed_at timestamptz,
  id_photo_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index members_campus_id_idx on public.members (campus_id);
create index members_gender_idx on public.members (gender);
create index members_status_idx on public.members (status);
create index members_phone_idx on public.members (phone);

-- ---------------------------------------------------------------------------
-- Groups (/groups, /my-groups)
-- ---------------------------------------------------------------------------
create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category public.group_category not null default 'community',
  campus_id text not null references public.campuses (id),
  description text,
  leader_profile_id uuid references public.profiles (id) on delete set null,
  leader_phone text not null,
  leader_name text not null,
  enable_song_library boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index groups_campus_id_idx on public.groups (campus_id);
create index groups_leader_phone_idx on public.groups (leader_phone);

-- ---------------------------------------------------------------------------
-- Group members (replaces memberPhones[] arrays)
-- ---------------------------------------------------------------------------
create table public.group_members (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  profile_id uuid references public.profiles (id) on delete cascade,
  member_phone text not null,
  role public.group_member_role not null default 'member',
  joined_at timestamptz not null default now(),
  unique (group_id, member_phone)
);

create index group_members_group_id_idx on public.group_members (group_id);
create index group_members_profile_id_idx on public.group_members (profile_id);

-- ---------------------------------------------------------------------------
-- Group broadcasts
-- ---------------------------------------------------------------------------
create table public.group_broadcasts (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  message text not null,
  scheduled_at timestamptz not null,
  status public.broadcast_status not null default 'draft',
  created_by uuid references public.profiles (id) on delete set null,
  created_by_phone text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index group_broadcasts_group_id_idx on public.group_broadcasts (group_id);
create index group_broadcasts_status_idx on public.group_broadcasts (status);
create index group_broadcasts_scheduled_at_idx on public.group_broadcasts (scheduled_at);

-- ---------------------------------------------------------------------------
-- Group songs (song library)
-- ---------------------------------------------------------------------------
create table public.group_songs (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  title text not null,
  musical_key text not null,
  verse1 text not null default '',
  verse2 text not null default '',
  chorus text not null default '',
  bridge text,
  notes text,
  sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index group_songs_group_id_idx on public.group_songs (group_id);

-- ---------------------------------------------------------------------------
-- Follow-ups (evangelism pipeline)
-- ---------------------------------------------------------------------------
create table public.follow_ups (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text not null,
  campus_id text not null references public.campuses (id),
  stage public.follow_up_stage not null default 'cold',
  source text,
  last_contact_at timestamptz,
  assigned_to uuid references public.profiles (id) on delete set null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index follow_ups_campus_id_idx on public.follow_ups (campus_id);
create index follow_ups_stage_idx on public.follow_ups (stage);

-- ---------------------------------------------------------------------------
-- Visitors (event RSVP capture, newsletters)
-- ---------------------------------------------------------------------------
create table public.visitors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  email text,
  campus_id text references public.campuses (id) on delete set null,
  source text,
  first_visit_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now()
);

create index visitors_campus_id_idx on public.visitors (campus_id);
create index visitors_phone_idx on public.visitors (phone);

-- ---------------------------------------------------------------------------
-- Events
-- ---------------------------------------------------------------------------
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  campus_id text references public.campuses (id) on delete set null,
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index events_campus_id_idx on public.events (campus_id);
create index events_starts_at_idx on public.events (starts_at);

-- ---------------------------------------------------------------------------
-- Event RSVPs
-- ---------------------------------------------------------------------------
create table public.event_rsvps (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events (id) on delete cascade,
  visitor_id uuid references public.visitors (id) on delete set null,
  profile_id uuid references public.profiles (id) on delete set null,
  name text not null,
  phone text,
  status public.rsvp_status not null default 'going',
  rsvp_at timestamptz not null default now()
);

create index event_rsvps_event_id_idx on public.event_rsvps (event_id);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger membership_applications_updated_at
  before update on public.membership_applications
  for each row execute function public.set_updated_at();

create trigger members_updated_at
  before update on public.members
  for each row execute function public.set_updated_at();

create trigger groups_updated_at
  before update on public.groups
  for each row execute function public.set_updated_at();

create trigger follow_ups_updated_at
  before update on public.follow_ups
  for each row execute function public.set_updated_at();

create trigger events_updated_at
  before update on public.events
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Auth helper: auto-create profile on sign-up (phone OTP)
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, phone, role)
  values (
    new.id,
    coalesce(new.phone, new.raw_user_meta_data ->> 'phone', ''),
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'visitor')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- RLS helper functions
-- ---------------------------------------------------------------------------
create or replace function public.current_profile()
returns public.profiles
language sql
stable
security definer
set search_path = public
as $$
  select * from public.profiles where id = auth.uid();
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'super_admin'
  );
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('super_admin', 'admin', 'pastor', 'leader')
  );
$$;

create or replace function public.can_access_campus(target_campus text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_super_admin()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'pastor')
        and p.campus_id = target_campus
    );
$$;

create or replace function public.leads_group(target_group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.groups g
    join public.profiles p on p.id = auth.uid()
    where g.id = target_group_id
      and (
        g.leader_profile_id = auth.uid()
        or g.leader_phone = p.phone
      )
  );
$$;

create or replace function public.is_group_member(target_group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.leads_group(target_group_id)
    or exists (
      select 1 from public.group_members gm
      join public.profiles p on p.id = auth.uid()
      where gm.group_id = target_group_id
        and gm.member_phone = p.phone
    );
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.campuses enable row level security;
alter table public.profiles enable row level security;
alter table public.invite_requests enable row level security;
alter table public.invites enable row level security;
alter table public.membership_applications enable row level security;
alter table public.members enable row level security;
alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.group_broadcasts enable row level security;
alter table public.group_songs enable row level security;
alter table public.follow_ups enable row level security;
alter table public.visitors enable row level security;
alter table public.events enable row level security;
alter table public.event_rsvps enable row level security;

-- Campuses: readable by authenticated users
create policy "campuses_select_authenticated"
  on public.campuses for select
  to authenticated
  using (true);

-- Profiles: own row + staff read same campus / super_admin all
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using (
    id = auth.uid()
    or public.is_super_admin()
    or (
      public.is_staff()
      and campus_id is not null
      and public.can_access_campus(campus_id)
    )
  );

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- Invite requests: anyone can submit (anon); staff read by campus
create policy "invite_requests_insert_anon"
  on public.invite_requests for insert
  to anon, authenticated
  with check (true);

create policy "invite_requests_select_staff"
  on public.invite_requests for select
  to authenticated
  using (
    public.is_super_admin()
    or public.can_access_campus(campus_id)
  );

create policy "invite_requests_update_staff"
  on public.invite_requests for update
  to authenticated
  using (
    public.is_super_admin()
    or public.can_access_campus(campus_id)
  );

-- Invites: staff manage; token lookup via service role or edge function
create policy "invites_select_staff"
  on public.invites for select
  to authenticated
  using (
    public.is_super_admin()
    or (campus_id is not null and public.can_access_campus(campus_id))
    or phone = (select phone from public.profiles where id = auth.uid())
  );

create policy "invites_insert_staff"
  on public.invites for insert
  to authenticated
  with check (
    public.is_super_admin()
    or (campus_id is not null and public.can_access_campus(campus_id))
  );

create policy "invites_update_staff"
  on public.invites for update
  to authenticated
  using (
    public.is_super_admin()
    or (campus_id is not null and public.can_access_campus(campus_id))
  );

-- Membership applications
create policy "applications_insert_own_phone"
  on public.membership_applications for insert
  to authenticated
  with check (phone = (select phone from public.profiles where id = auth.uid()));

create policy "applications_select_own_or_staff"
  on public.membership_applications for select
  to authenticated
  using (
    phone = (select phone from public.profiles where id = auth.uid())
    or public.is_super_admin()
    or public.can_access_campus(campus_id)
  );

create policy "applications_update_own_or_staff"
  on public.membership_applications for update
  to authenticated
  using (
    phone = (select phone from public.profiles where id = auth.uid())
    or public.is_super_admin()
    or public.can_access_campus(campus_id)
  );

-- Members
create policy "members_select_staff_or_self"
  on public.members for select
  to authenticated
  using (
    profile_id = auth.uid()
    or public.is_super_admin()
    or public.can_access_campus(campus_id)
  );

create policy "members_insert_staff"
  on public.members for insert
  to authenticated
  with check (
    public.is_super_admin()
    or public.can_access_campus(campus_id)
  );

create policy "members_update_staff"
  on public.members for update
  to authenticated
  using (
    public.is_super_admin()
    or public.can_access_campus(campus_id)
  );

-- Groups
create policy "groups_select_staff_or_member"
  on public.groups for select
  to authenticated
  using (
    public.is_super_admin()
    or public.can_access_campus(campus_id)
    or public.is_group_member(id)
  );

create policy "groups_insert_staff"
  on public.groups for insert
  to authenticated
  with check (
    public.is_super_admin()
    or public.can_access_campus(campus_id)
  );

create policy "groups_update_staff_or_leader"
  on public.groups for update
  to authenticated
  using (
    public.is_super_admin()
    or public.can_access_campus(campus_id)
    or public.leads_group(id)
  );

-- Group members
create policy "group_members_select"
  on public.group_members for select
  to authenticated
  using (
    public.is_super_admin()
    or public.leads_group(group_id)
    or exists (
      select 1 from public.groups g
      where g.id = group_id and public.can_access_campus(g.campus_id)
    )
  );

create policy "group_members_manage_staff_or_leader"
  on public.group_members for all
  to authenticated
  using (
    public.is_super_admin()
    or public.leads_group(group_id)
    or exists (
      select 1 from public.groups g
      where g.id = group_id and public.can_access_campus(g.campus_id)
    )
  );

-- Broadcasts & songs: leaders of the group
create policy "broadcasts_select"
  on public.group_broadcasts for select
  to authenticated
  using (
    public.is_super_admin()
    or public.leads_group(group_id)
    or exists (
      select 1 from public.groups g
      where g.id = group_id and public.can_access_campus(g.campus_id)
    )
  );

create policy "broadcasts_manage_leader"
  on public.group_broadcasts for all
  to authenticated
  using (public.leads_group(group_id) or public.is_super_admin())
  with check (public.leads_group(group_id) or public.is_super_admin());

create policy "songs_select"
  on public.group_songs for select
  to authenticated
  using (
    public.is_super_admin()
    or public.is_group_member(group_id)
    or exists (
      select 1 from public.groups g
      where g.id = group_id and public.can_access_campus(g.campus_id)
    )
  );

create policy "songs_manage_leader"
  on public.group_songs for all
  to authenticated
  using (public.leads_group(group_id) or public.is_super_admin())
  with check (public.leads_group(group_id) or public.is_super_admin());

-- Follow-ups: staff by campus
create policy "follow_ups_staff"
  on public.follow_ups for all
  to authenticated
  using (
    public.is_super_admin()
    or public.can_access_campus(campus_id)
  )
  with check (
    public.is_super_admin()
    or public.can_access_campus(campus_id)
  );

-- Visitors & events: staff read/write; members read events
create policy "visitors_staff"
  on public.visitors for all
  to authenticated
  using (public.is_staff())
  with check (public.is_staff());

create policy "events_select_authenticated"
  on public.events for select
  to authenticated
  using (true);

create policy "events_manage_staff"
  on public.events for all
  to authenticated
  using (
    public.is_super_admin()
    or (campus_id is not null and public.can_access_campus(campus_id))
  )
  with check (
    public.is_super_admin()
    or (campus_id is not null and public.can_access_campus(campus_id))
  );

create policy "rsvps_insert_authenticated"
  on public.event_rsvps for insert
  to authenticated
  with check (true);

create policy "rsvps_select_staff_or_own"
  on public.event_rsvps for select
  to authenticated
  using (
    profile_id = auth.uid()
    or public.is_staff()
  );
