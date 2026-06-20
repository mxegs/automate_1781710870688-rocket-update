-- Separate first name and surname on invites (admin send-invite form).

alter table public.invites
  add column if not exists given_name text;

alter table public.invites
  add column if not exists surname text;
