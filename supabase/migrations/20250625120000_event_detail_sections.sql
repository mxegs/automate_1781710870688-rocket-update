-- Extended event detail fields for accordion sections (Event Info, Venue, Important Info).

alter table public.events
  add column if not exists event_info text,
  add column if not exists venue_name text,
  add column if not exists venue_address text,
  add column if not exists venue_city text,
  add column if not exists venue_directions_url text,
  add column if not exists important_info text;
