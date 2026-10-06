-- Staging first. Do not run on live.

alter table public.members
  add column if not exists marriage_date date;

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

  insert into public.notifications (profile_id, church_id, type, title, body, action_url)
  select
    m.profile_id,
    m.church_id,
    'anniversary',
    'Happy ' || (extract(year from for_date)::int - extract(year from m.marriage_date)::int)::text
      || ' year anniversary, ' || split_part(trim(m.full_name), ' ', 1) || '!',
    'Celebrating ' || (extract(year from for_date)::int - extract(year from m.marriage_date)::int)::text
      || ' years with you today from all of us at ' || coalesce(c.name, 'the church') || '.',
    '/member/profile'
  from public.members m
  join public.churches c on c.id = m.church_id
  where m.profile_id is not null
    and m.marriage_date is not null
    and extract(month from m.marriage_date) = extract(month from for_date)
    and extract(day from m.marriage_date) = extract(day from for_date)
    and not exists (
      select 1
      from public.notifications n
      where n.profile_id = m.profile_id
        and n.church_id = m.church_id
        and n.type = 'anniversary'
        and (timezone('Africa/Johannesburg', n.created_at))::date = for_date
    );

  get diagnostics n = row_count;
  inserted := inserted + n;

  return inserted;
end;
$$;
