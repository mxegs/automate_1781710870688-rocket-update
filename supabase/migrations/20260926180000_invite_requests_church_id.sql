-- Additive: bind public invite requests to a church (slug-resolved on insert).
alter table public.invite_requests
  add column if not exists church_id text references public.churches (id);
create index if not exists invite_requests_church_id_idx on public.invite_requests (church_id);
