-- Remove demo phone numbers that may belong to real people (live SMS is enabled).
-- Super admin signs in with email only; internal placeholder phones avoid accidental SMS.

delete from public.group_members
where member_phone in ('821112222', '821113333', '735502014', '735502015', '735502016');

update public.groups set leader_phone = 'staff000002' where leader_phone = '735502015';
update public.groups set leader_phone = 'staff000003' where leader_phone = '735502016';
update public.groups set leader_phone = 'staff000004' where leader_phone = '821113333';

delete from public.invites
where phone in ('821114444', '821112222', '821113333', '735502014', '735502015', '735502016');

delete from public.profiles
where phone in ('821112222', '821113333');

update public.profiles set
  phone = 'staff000002',
  email = null
where phone = '735502015';

update public.profiles set
  phone = 'staff000003',
  email = null
where phone = '735502016';

update public.profiles set
  phone = 'admin000001',
  email = 'aiwealthlogic@gmail.com',
  official_name = coalesce(nullif(official_name, ''), 'Church Admin'),
  display_name = coalesce(nullif(display_name, ''), 'Admin'),
  username = coalesce(nullif(username, ''), 'church_admin')
where role = 'super_admin' or phone = '735502014';

insert into public.profiles (phone, role, campus_id, official_name, username, display_name, email)
select
  'admin000001',
  'super_admin',
  'midrand',
  'Church Admin',
  'church_admin',
  'Admin',
  'aiwealthlogic@gmail.com'
where not exists (select 1 from public.profiles where role = 'super_admin');

create unique index if not exists profiles_email_unique_idx
  on public.profiles (lower(email))
  where email is not null;
