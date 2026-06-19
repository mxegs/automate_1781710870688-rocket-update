-- Sermons / media catalog (links to YouTube, Spotify, etc. — not hosted in-app)

create type public.media_type as enum ('sermon', 'audio', 'book', 'special_message');
create type public.content_visibility as enum ('campus_only', 'church_wide', 'members_only');

create table public.media_items (
  id uuid primary key default gen_random_uuid(),
  campus_id text not null references public.campuses (id),
  visibility public.content_visibility not null default 'campus_only',
  media_type public.media_type not null default 'sermon',
  title text not null,
  preacher text not null,
  preached_at date not null,
  category text not null default 'Sunday Service',
  series text,
  description text,
  duration text,
  youtube_id text,
  external_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint media_has_link check (youtube_id is not null or external_url is not null)
);

create index media_items_campus_id_idx on public.media_items (campus_id);
create index media_items_visibility_idx on public.media_items (visibility);
create index media_items_preached_at_idx on public.media_items (preached_at desc);
create index media_items_media_type_idx on public.media_items (media_type);

create trigger media_items_updated_at
  before update on public.media_items
  for each row execute function public.set_updated_at();

alter table public.media_items enable row level security;

create policy "media_items_select_authenticated"
  on public.media_items for select
  to authenticated
  using (true);

-- Admins add sermons via /sermons — no seed data
