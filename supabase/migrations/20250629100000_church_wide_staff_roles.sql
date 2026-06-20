-- Step 1 of 2: add enum values only.
-- PostgreSQL requires this to commit before the new values can appear in functions (see next migration).

alter type public.user_role add value if not exists 'senior_pastor';
alter type public.user_role add value if not exists 'administrative_manager';
