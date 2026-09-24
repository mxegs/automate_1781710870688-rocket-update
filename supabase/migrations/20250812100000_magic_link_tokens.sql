-- Durable magic-link tokens for email sign-in (survives server restarts / multi-instance).
-- API uses service role only — no client policies.

create table if not exists public.magic_link_tokens (
  token_hash text primary key,
  email text not null,
  allow_visitor boolean not null default false,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists magic_link_tokens_email_idx
  on public.magic_link_tokens (lower(email));

create index if not exists magic_link_tokens_expires_idx
  on public.magic_link_tokens (expires_at);

alter table public.magic_link_tokens enable row level security;
