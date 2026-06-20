-- Add 2 test members for Broadcast → Email (Mailchimp).
-- Run in Supabase Dashboard → SQL Editor.
--
-- /broadcast reads from public.members — NOT Mailchimp contacts directly.

insert into public.members (campus_id, status, surname, full_name, phone, email, gender, age)
select 'midrand', 'active', 'Xthem', 'Xthem Ba', 'testbroadcast002', 'xthembaa@gmail.com', 'Male', 28
where not exists (select 1 from public.members where phone = 'testbroadcast002');

insert into public.members (campus_id, status, surname, full_name, phone, email, gender, age)
select 'verulam', 'active', 'Sithole', 'Sithole TV', 'testbroadcast003', 'sitholetv5@gmail.com', 'Male', 30
where not exists (select 1 from public.members where phone = 'testbroadcast003');

-- Verify (should show your super-admin email + these 2 = 3 rows)
select full_name, email, phone, campus_id, status
from public.members
where email is not null and email like '%@%'
order by full_name;
