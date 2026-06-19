-- Demo staff & members for real-world testing (matches src/lib/auth/demo-users.ts)

insert into public.profiles (phone, role, campus_id, official_name, username, display_name) values
  ('735502014', 'super_admin', 'midrand', 'James Mokoena', 'pastor_james', 'Pastor James'),
  ('735502015', 'pastor', 'verulam', 'Sarah Ndlovu', 'pastor_sarah', 'Pastor Sarah'),
  ('735502016', 'leader', 'midrand', 'David Khumalo', 'david_k', 'David'),
  ('821112222', 'member', 'midrand', 'Thabo Mokoena', 'thabo', 'Thabo'),
  ('821113333', 'member', 'midrand', 'Nomsa Dlamini-Zulu', 'nomsa', 'Nomsa')
on conflict (phone) do nothing;

insert into public.invites (token, phone, official_name, username, status) values
  ('demo', '821114444', 'Lerato Mthembu', 'lerato', 'pending')
on conflict (token) do nothing;

-- Groups (only if empty)
do $$
declare
  worship_id uuid;
  kids_id uuid;
begin
  if not exists (select 1 from public.groups limit 1) then
    insert into public.groups (name, category, campus_id, description, leader_phone, leader_name, enable_song_library)
    values ('Worship Team', 'ministry', 'midrand', 'Band and vocalists for Sunday services', '735502016', 'David Khumalo', true)
    returning id into worship_id;

    insert into public.groups (name, category, campus_id, description, leader_phone, leader_name, enable_song_library)
    values ('Kids Church', 'ministry', 'midrand', 'Children''s ministry team', '821113333', 'Nomsa Dlamini-Zulu', false)
    returning id into kids_id;

    insert into public.groups (name, category, campus_id, description, leader_phone, leader_name, enable_song_library)
    values ('Women''s Ministry', 'community', 'verulam', 'Women fellowship and prayer', '735502015', 'Pastor Sarah Ndlovu', false);

    insert into public.group_members (group_id, member_phone, role) values
      (worship_id, '821112222', 'member'),
      (worship_id, '821113333', 'member'),
      (kids_id, '821112222', 'member');
  end if;
end $$;
