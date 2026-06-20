-- Member password login (email + password after membership signup / approval).

alter table public.profiles
  add column if not exists password_hash text;

alter table public.membership_applications
  add column if not exists password_hash text;
