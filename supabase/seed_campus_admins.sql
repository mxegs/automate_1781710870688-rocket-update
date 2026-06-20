-- Assign campus admins from existing broadcast test members.
-- Run in Supabase SQL Editor after members exist with these emails.

insert into public.profiles (phone, role, campus_id, official_name, display_name, username, email)
select 'staff000005', 'admin', 'midrand', 'Xthem Ba', 'Xthem Ba', 'xthem_ba', 'xthembaa@gmail.com'
where not exists (select 1 from public.profiles where lower(email) = 'xthembaa@gmail.com');

insert into public.profiles (phone, role, campus_id, official_name, display_name, username, email)
select 'staff000006', 'admin', 'verulam', 'Sithole TV', 'Sithole TV', 'sithole_tv', 'sitholetv5@gmail.com'
where not exists (select 1 from public.profiles where lower(email) = 'sitholetv5@gmail.com');

-- If profile already exists (e.g. as member), promote instead:
update public.profiles
set role = 'admin', campus_id = 'midrand', display_name = 'Xthem Ba', official_name = 'Xthem Ba'
where lower(email) = 'xthembaa@gmail.com' and role <> 'super_admin';

update public.profiles
set role = 'admin', campus_id = 'verulam', display_name = 'Sithole TV', official_name = 'Sithole TV'
where lower(email) = 'sitholetv5@gmail.com' and role <> 'super_admin';

select email, role, campus_id, display_name from public.profiles
where role in ('super_admin', 'admin', 'pastor', 'leader')
order by role, campus_id;
