-- Email-first auth: invites and requests store email; login uses email OTP (Resend).

alter table public.invite_requests
  add column if not exists email text;

alter table public.invites
  add column if not exists email text;

create index if not exists invite_requests_email_idx
  on public.invite_requests (lower(email))
  where email is not null;

create index if not exists invites_email_idx
  on public.invites (lower(email))
  where email is not null;
