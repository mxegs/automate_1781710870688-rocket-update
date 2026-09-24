# RLS Gap — Known Limitation and Future Fix

## Current State

The app uses custom authentication (password_hash on the profiles table).
It does NOT use Supabase Auth.

Because of this, auth.uid() is always NULL in database queries. The
tenant RLS policies from Phase 5 are written against auth.uid(), so
they never match. RLS is present but inert.

## What Actually Enforces Isolation Today

Only the API layer. Every API route reads church_id from the session
and filters all queries by it. If an API route forgets to filter,
data could leak. The database will not catch it.

## Conflicting Policies That Exist

These policies allow anyone signed in to read or write, bypassing
tenant isolation if RLS is ever activated:

  events.events_select_authenticated          SELECT  using (true)
  media_items.media_items_select_authenticated SELECT  using (true)
  announcements.announcements_select_authenticated SELECT using (true)
  event_rsvps.rsvps_insert_authenticated      INSERT  with check (true)

Postgres ORs policies together, so any one permissive policy defeats
all restrictive ones. These must be dropped when RLS is activated.

## The Fix

Migrate the app to Supabase Auth. This is a separate brief and must
be done on its own branch. It involves:

1. Create Supabase Auth users for every existing profile (migrate
   from password_hash to auth.users).
2. Replace login flow with supabase.auth.signInWithPassword.
3. Replace session storage with the Supabase session.
4. Once auth.uid() works, the existing tenant policies become active.
5. Drop the four conflicting policies above.

## Priority

Before onboarding the second paying church. Not before then.
The app is safe today because the API layer enforces isolation.