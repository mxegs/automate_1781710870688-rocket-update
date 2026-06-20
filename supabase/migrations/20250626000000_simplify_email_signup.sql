-- Simpler email-first signup: phone optional on requests/invites (collected on membership form for broadcasts).

alter table public.invite_requests
  alter column phone drop not null;

alter table public.invite_requests
  alter column campus_id drop not null;

alter table public.invites
  alter column phone drop not null;

create index if not exists invite_requests_email_pending_idx
  on public.invite_requests (lower(email))
  where status = 'pending' and email is not null;
