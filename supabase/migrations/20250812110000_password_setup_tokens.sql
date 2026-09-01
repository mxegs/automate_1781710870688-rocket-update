-- One-time password setup / reset tokens (forgot password + first login set-password).
-- API uses service role only.

create table if not exists public.password_setup_tokens (
  token_hash text primary key,
  email text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists password_setup_tokens_email_idx
  on public.password_setup_tokens (lower(email));

create index if not exists password_setup_tokens_expires_idx
  on public.password_setup_tokens (expires_at);

alter table public.password_setup_tokens enable row level security;
