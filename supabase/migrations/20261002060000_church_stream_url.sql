-- Optional live-stream URL for the member check-in hero.
-- Empty/null means the church has no stream button.

alter table public.churches
  add column if not exists stream_url text;
