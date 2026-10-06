-- In-app notifications. Additive. Staging first. Do not run on live.

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles (id) on delete cascade,
  church_id text not null references public.churches (id),
  type text not null check (type in (
    'birthday','anniversary','broadcast','prayer','group','system'
  )),
  title text not null,
  body text,
  action_url text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_profile_read_idx
  on public.notifications (profile_id, read_at);

create index if not exists notifications_church_id_idx
  on public.notifications (church_id);

alter table public.notifications enable row level security;

drop policy if exists notifications_select_own on public.notifications;
create policy notifications_select_own
  on public.notifications
  for select
  to authenticated
  using (profile_id = auth.uid());

-- Writes are service-role only (no insert/update/delete policies).

create or replace function public.create_daily_celebration_notifications(for_date date default (timezone('Africa/Johannesburg', now()))::date)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted integer := 0;
  n integer;
begin
  insert into public.notifications (profile_id, church_id, type, title, body, action_url)
  select
    m.profile_id,
    m.church_id,
    'birthday',
    'Happy Birthday, ' || split_part(trim(m.full_name), ' ', 1) || '!',
    'Wishing you a blessed day from all of us at ' || coalesce(c.name, 'the church') || '.',
    '/member'
  from public.members m
  join public.churches c on c.id = m.church_id
  where m.profile_id is not null
    and m.date_of_birth is not null
    and extract(month from m.date_of_birth) = extract(month from for_date)
    and extract(day from m.date_of_birth) = extract(day from for_date)
    and not exists (
      select 1
      from public.notifications n
      where n.profile_id = m.profile_id
        and n.church_id = m.church_id
        and n.type = 'birthday'
        and (timezone('Africa/Johannesburg', n.created_at))::date = for_date
    );

  get diagnostics n = row_count;
  inserted := inserted + n;

  -- Anniversary skipped unless members.marriage_date exists.
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'members'
      and column_name = 'marriage_date'
  ) then
    execute $ann$
      insert into public.notifications (profile_id, church_id, type, title, body, action_url)
      select
        m.profile_id,
        m.church_id,
        'anniversary',
        'Happy Anniversary!',
        'Wishing you a blessed day from all of us at ' || coalesce(c.name, 'the church') || '.',
        '/member'
      from public.members m
      join public.churches c on c.id = m.church_id
      where m.profile_id is not null
        and m.marriage_date is not null
        and extract(month from m.marriage_date) = extract(month from $1)
        and extract(day from m.marriage_date) = extract(day from $1)
        and not exists (
          select 1
          from public.notifications n
          where n.profile_id = m.profile_id
            and n.church_id = m.church_id
            and n.type = 'anniversary'
            and (timezone('Africa/Johannesburg', n.created_at))::date = $1
        )
    $ann$ using for_date;
    get diagnostics n = row_count;
    inserted := inserted + n;
  end if;

  return inserted;
end;
$$;

-- 06:00 SAST = 04:00 UTC (South Africa has no DST).
do $$
begin
  perform cron.schedule(
    'celebration-notifications-sast',
    '0 4 * * *',
    $cron$select public.create_daily_celebration_notifications()$cron$
  );
exception
  when undefined_function then
    raise notice 'pg_cron not available; schedule skipped';
  when others then
    raise notice 'pg_cron schedule skipped: %', sqlerrm;
end;
$$;
