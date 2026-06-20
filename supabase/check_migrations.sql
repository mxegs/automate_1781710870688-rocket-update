-- Run in Supabase Dashboard → SQL Editor
-- Shows which app migrations appear applied (✓ = run, ✗ = still needed)

select
  '20250619000000_initial_schema' as migration,
  case when exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'profiles'
  ) then '✓ RUN' else '✗ MISSING — run initial_schema.sql' end as status

union all select
  '20250619000001_seed_campuses',
  case when (select count(*) from public.campuses) >= 2 then '✓ RUN' else '✗ MISSING — run seed_campuses.sql' end

union all select
  '20250620000000_phone_auth_profiles',
  case when exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles' and column_name = 'auth_user_id'
  ) then '✓ RUN' else '✗ MISSING — run phone_auth_profiles.sql' end

union all select
  '20250620000001_seed_demo_data',
  case when exists (
    select 1 from public.profiles where phone = 'admin000001'
  ) then '✓ RUN' else '✗ MISSING — run seed_demo_data.sql' end

union all select
  '20250621000000_media_items',
  case when exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'media_items'
  ) then '✓ RUN' else '✗ MISSING — run media_items.sql' end

union all select
  '20250622000000_events_prayer_announcements',
  case when exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'prayer_requests'
  ) and exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'announcements'
  ) and exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'events' and column_name = 'yoco_payment_link'
  ) then '✓ RUN' else '✗ MISSING — run events_prayer_announcements.sql' end

union all select
  '20250622000001_rename_loco_to_yoco',
  case when exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'events' and column_name = 'yoco_payment_link'
  ) and not exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'events' and column_name = 'loco_payment_link'
  ) then '✓ RUN' else '✗ MISSING — run rename_loco_to_yoco.sql' end

union all select
  '20250623000000_super_admin_email',
  case when exists (
    select 1 from public.profiles
    where phone = 'admin000001' and email is not null and email <> ''
  ) then '✓ RUN' else '✗ MISSING — run super_admin_email_remove_demo_phones.sql' end

union all select
  '20250623100000_trusted_devices',
  case when exists (
    select 1 from information_schema.tables
    where table_schema = 'public' and table_name = 'trusted_devices'
  ) then '✓ RUN' else '✗ MISSING — run trusted_devices.sql' end

union all select
  '20250624000000_remove_dummy_contacts',
  case when not exists (
    select 1 from public.members where phone = 'admin000001'
  ) then '✓ RUN' else '✗ MISSING — run remove_dummy_contacts.sql' end

union all select
  '20250625000000_email_auth_invites',
  case when exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'invites' and column_name = 'email'
  ) then '✓ RUN' else '✗ MISSING — run email_auth_invites.sql' end

union all select
  '20250626000000_simplify_email_signup',
  case when exists (
    select 1 from information_schema.columns
    where table_schema = 'public' and table_name = 'invite_requests'
      and column_name = 'phone' and is_nullable = 'YES'
  ) then '✓ RUN' else '✗ MISSING — run simplify_email_signup.sql' end

order by migration;

-- Broadcast email readiness (members with email addresses)
select
  count(*) filter (where status = 'active') as active_members,
  count(*) filter (where status = 'active' and email is not null and email like '%@%') as active_with_email
from public.members;
