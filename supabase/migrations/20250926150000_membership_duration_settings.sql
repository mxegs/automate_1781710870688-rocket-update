-- Per-church membership duration settings.
-- Duration 0 means membership never expires.
-- Additive: existing rows pick up the defaults (365 / 30 / 7 / false / 14).

alter table public.churches
  add column if not exists membership_duration_days integer not null default 365,
  add column if not exists renewal_reminder_days integer not null default 30,
  add column if not exists renewal_final_days integer not null default 7,
  add column if not exists auto_approve_renewals boolean not null default false,
  add column if not exists grace_period_days integer not null default 14;

alter table public.churches
  drop constraint if exists churches_membership_duration_days_nonneg,
  drop constraint if exists churches_renewal_reminder_days_nonneg,
  drop constraint if exists churches_renewal_final_days_nonneg,
  drop constraint if exists churches_grace_period_days_nonneg;

alter table public.churches
  add constraint churches_membership_duration_days_nonneg check (membership_duration_days >= 0),
  add constraint churches_renewal_reminder_days_nonneg check (renewal_reminder_days >= 0),
  add constraint churches_renewal_final_days_nonneg check (renewal_final_days >= 0),
  add constraint churches_grace_period_days_nonneg check (grace_period_days >= 0);
