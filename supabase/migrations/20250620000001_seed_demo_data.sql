-- Super admin (email sign-in) + placeholder staff phones — no real stranger numbers.
-- Run after initial schema + campuses seed.

insert into public.profiles (phone, role, campus_id, official_name, username, display_name, email) values
  ('admin000001', 'super_admin', 'midrand', 'Church Admin', 'church_admin', 'Admin', 'aiwealthlogic@gmail.com')
on conflict (phone) do update set
  role = excluded.role,
  email = excluded.email,
  official_name = excluded.official_name,
  display_name = excluded.display_name;

-- Optional campus staff placeholders (invite real pastors via admin when ready)
insert into public.profiles (phone, role, campus_id, official_name, username, display_name) values
  ('staff000002', 'pastor', 'verulam', 'Campus Pastor', 'campus_pastor', 'Pastor'),
  ('staff000003', 'leader', 'midrand', 'Ministry Leader', 'ministry_leader', 'Leader')
on conflict (phone) do nothing;
