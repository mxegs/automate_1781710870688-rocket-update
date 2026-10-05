-- Pre-login intro/welcome copy. Additive. Staging first.

alter table public.churches
  add column if not exists tagline text,
  add column if not exists welcome_message text,
  add column if not exists hero_url text;
