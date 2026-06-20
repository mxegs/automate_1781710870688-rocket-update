-- OPTIONAL — run only if you want to remove demo placeholder STAFF profiles.
-- Does NOT remove your super admin (aiwealthlogic@gmail.com) or real members.
-- Safe to re-run.

-- Demo pastor/leader placeholders from seed_demo_data (no email — can't sign in anyway)
delete from public.profiles
where phone in ('staff000002', 'staff000003');

-- Optional: remove Mailchimp broadcast test members (xthembaa, sitholetv5)
-- Uncomment the next 3 lines if you're done testing email broadcasts:
-- delete from public.members
-- where phone in ('testbroadcast002', 'testbroadcast003');

-- Optional: remove a specific test member — edit email/phone before running:
-- delete from public.members where lower(email) = 'leratomethembu20@gmail.com';
-- delete from public.profiles where lower(email) = 'leratomethembu20@gmail.com';

-- Audit what remains
select 'profiles' as source, phone, email, role::text as detail, display_name as name
from public.profiles
union all
select 'members', phone, email, status::text, full_name
from public.members
order by source, phone;
