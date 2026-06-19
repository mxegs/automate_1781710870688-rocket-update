-- Seed campuses (matches src/lib/church/constants.ts)
insert into public.campuses (id, label) values
  ('midrand', 'Midrand Campus'),
  ('verulam', 'Verulam Campus')
on conflict (id) do nothing;
