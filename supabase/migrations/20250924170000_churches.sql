-- Tenant root. One row per church. No foreign keys to other tables yet.

create table public.churches (
  id text primary key,
  name text not null,
  slug text not null unique,
  primary_color text,
  secondary_color text,
  logo_url text,
  app_name text,
  payfast_merchant_id text,
  payfast_vault_key_id uuid,
  yoco_public_key text,
  yoco_vault_secret_id uuid,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

insert into public.churches (id, name, slug, primary_color, secondary_color)
values ('ckc', 'Christ Kingdom Citizens', 'ckc-midrand', '#C5A073', '#0A0A0A');
