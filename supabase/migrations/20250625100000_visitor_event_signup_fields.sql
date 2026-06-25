-- Extended visitor fields for event registration and follow-up.

alter table public.visitors
  add column if not exists surname text,
  add column if not exists gender text check (gender in ('Male', 'Female')),
  add column if not exists marital_status text,
  add column if not exists accepted_jesus boolean,
  add column if not exists wants_to_join_church boolean,
  add column if not exists event_news_consent boolean not null default false;
