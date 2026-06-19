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

-- Seed sample messages (only if table is empty)
do $$
begin
  if not exists (select 1 from public.media_items limit 1) then
    insert into public.media_items (
      campus_id, visibility, media_type, title, preacher, preached_at, category, series, description, duration, youtube_id
    ) values
      ('midrand', 'campus_only', 'sermon', 'Walking in Purpose', 'Pastor James Mokoena', '2025-06-15', 'Sunday Service', 'Purpose Series', 'Discovering God''s purpose for your life.', '52 min', 'dQw4w9WgXcQ'),
      ('midrand', 'campus_only', 'sermon', 'Faith Over Fear', 'Pastor James Mokoena', '2025-06-08', 'Sunday Service', 'Purpose Series', 'Overcoming fear through faith.', '48 min', 'L_jWHffIx5E'),
      ('midrand', 'campus_only', 'audio', 'The Power of Prayer', 'Pastor James Mokoena', '2025-06-01', 'Prayer Meeting', null, 'The transformative power of prayer.', '38 min', 'OPf0YbXqDm0'),
      ('verulam', 'campus_only', 'sermon', 'Knowing God Deeply', 'Pastor Sarah Ndlovu', '2025-05-25', 'Sunday Service', null, 'Intimacy with God through Word and Spirit.', '44 min', 'hT_nvWreIhg'),
      ('verulam', 'campus_only', 'audio', 'The Fruit of the Spirit', 'Elder Ruth Khumalo', '2025-04-06', 'Midweek Service', null, 'Growing in the fruits of the Spirit.', '41 min', 'PT2_F-1esPk'),
      ('midrand', 'church_wide', 'special_message', 'Easter Sunday — He Is Risen!', 'Pastor James Mokoena', '2025-04-20', 'Easter', 'Easter 2025', 'Celebrating the resurrection — all CKC campuses.', '58 min', 'YQHsXMglC9A'),
      ('midrand', 'church_wide', 'special_message', 'Rise Up — Youth Conference 2025', 'Evangelist Thabo Sithole', '2025-04-05', 'Youth Conference', 'Youth Conference 2025', 'A message for the next generation.', '55 min', 'fJ9rUzIMcZQ'),
      ('midrand', 'members_only', 'book', 'Discipleship: The Call to Follow', 'Pastor James Mokoena', '2025-05-04', 'Bible Study', null, 'Study companion — members only.', '35 min', 'RgKAFK5djSk');
  end if;
end $$;
