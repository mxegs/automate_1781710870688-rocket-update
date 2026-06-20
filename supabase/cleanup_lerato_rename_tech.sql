-- Run in Supabase Dashboard → SQL Editor
-- 1) Remove Lerato Mthembu (member + profile + related rows)
-- 2) Rename super admin display from Pastor James → Tech

-- --- Remove Lerato (by email and phone) ---
delete from public.group_members
where member_phone in ('0735502014', '735502014');

-- Email is stored inside JSON on this table (not an email column)
delete from public.membership_applications
where phone in ('0735502014', '735502014')
   or lower(application_data->'personal'->>'email') = 'leratomethembu20@gmail.com'
   or lower(application_data->'personal'->>'fullName') like '%lerato%';

delete from public.members
where lower(email) = 'leratomethembu20@gmail.com'
   or phone in ('0735502014', '735502014')
   or lower(full_name) like '%lerato%';

delete from public.invites
where phone in ('0735502014', '735502014')
   or lower(email) = 'leratomethembu20@gmail.com';

delete from public.invite_requests
where phone in ('0735502014', '735502014')
   or lower(email) = 'leratomethembu20@gmail.com'
   or lower(full_name) like '%lerato%'
   or lower(surname) like '%mthembu%';

delete from public.profiles
where lower(email) = 'leratomethembu20@gmail.com'
   or phone in ('0735502014', '735502014')
   or lower(display_name) like '%lerato%'
   or lower(official_name) like '%lerato%';

-- --- Super admin: Pastor James → Tech ---
update public.profiles
set
  official_name = 'Tech',
  display_name = 'Tech',
  username = 'tech'
where role = 'super_admin'
   or phone = 'admin000001'
   or lower(email) = 'aiwealthlogic@gmail.com';

-- Verify
select 'profiles' as source, phone, email, role::text as detail, display_name as name
from public.profiles
union all
select 'members', phone, email, status::text, full_name
from public.members
order by source, phone;
