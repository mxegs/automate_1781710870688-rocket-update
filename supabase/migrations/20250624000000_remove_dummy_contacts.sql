-- Remove seeded demo contacts that may match real people's phone numbers or fake emails.
-- Safe to re-run.

-- Follow-up seeds from events_prayer_announcements migration
delete from public.follow_ups
where phone in (
  '0823331100', '0732229900', '0618887766', '0825554433', '0734445566'
);

-- Fake @email.com addresses from UI mock data — never real members
delete from public.members
where email is not null and email like '%@email.com';

-- Remove old demo SA mobile numbers if they slipped into members
delete from public.members
where phone in (
  '821112222', '821113333', '735502014', '735502015', '735502016', '821114444',
  '0712345678', '0823456789', '0734567890', '0645678901', '0796789012',
  '0837890123', '0768901234', '0619012345'
);

-- Super admin is login-only (profiles table) — never a broadcast/member recipient
delete from public.members
where phone = 'admin000001'
   or lower(email) = 'aiwealthlogic@gmail.com';
