-- Church carried by an invite link. Existing rows stay null until a church is set.

alter table public.invites
  add column if not exists church_id text references public.churches (id);

create index if not exists invites_church_id_idx on public.invites (church_id);
