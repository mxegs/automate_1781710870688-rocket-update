-- Trusted devices: skip SMS OTP on return visits (same phone + device token).
-- Used by web now and Expo later (store token in SecureStore).

create table if not exists public.trusted_devices (
  id uuid primary key default gen_random_uuid(),
  phone text,
  email text,
  token_hash text not null unique,
  user_agent text,
  expires_at timestamptz not null,
  last_used_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  constraint trusted_devices_identity_check check (phone is not null or email is not null)
);

create index if not exists trusted_devices_phone_idx on public.trusted_devices (phone) where phone is not null;
create index if not exists trusted_devices_email_idx on public.trusted_devices (lower(email)) where email is not null;

alter table public.trusted_devices enable row level security;

-- No client policies — API uses service role only.
