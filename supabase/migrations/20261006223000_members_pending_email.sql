-- Staging first. Do not run on live.

alter table public.members
  add column if not exists pending_email text;

alter table public.members
  add column if not exists pending_email_token text;

alter table public.members
  add column if not exists pending_email_expires_at timestamptz;
