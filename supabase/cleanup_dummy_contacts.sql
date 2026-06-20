-- Run in Supabase SQL Editor to remove dummy/stranger-risk contacts immediately.
-- Same as migration 20250624000000_remove_dummy_contacts.sql

delete from public.follow_ups
where phone in ('0823331100', '0732229900', '0618887766', '0825554433', '0734445566');

delete from public.members
where email is not null and email like '%@email.com';

delete from public.members
where phone in (
  '821112222', '821113333', '735502014', '735502015', '735502016', '821114444',
  '0712345678', '0823456789', '0734567890', '0645678901', '0796789012',
  '0837890123', '0768901234', '0619012345'
);

-- Super admin (aiwealthlogic@gmail.com) stays in profiles for login only — not in members/broadcast
delete from public.members
where phone = 'admin000001'
   or lower(email) = 'aiwealthlogic@gmail.com';

-- Audit: what remains (should only be real people you added)
-- NOTE: This table is NOT an error list — it shows survivors after deletes.
-- Expected rows you may still see:
--   profiles | admin000001 | aiwealthlogic@gmail.com  → super admin (login only) KEEP
--   members  | testbroadcast00* | xthembaa / sitholetv5 → Mailchimp test (optional remove)
--   profiles | staff000002/003 | NULL email            → demo placeholders (optional remove)
select 'profiles' as source, phone, email, role::text as detail, display_name as name from public.profiles
union all
select 'members', phone, email, status::text, full_name from public.members
union all
select 'follow_ups', phone, null, stage::text, name from public.follow_ups
order by source, phone;
