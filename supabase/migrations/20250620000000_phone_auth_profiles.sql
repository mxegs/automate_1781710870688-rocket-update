-- Allow profiles without Supabase Auth during phone-OTP demo testing.
-- When Supabase phone auth is enabled, auth_user_id links to auth.users.

alter table public.profiles
  drop constraint if exists profiles_id_fkey;

alter table public.profiles
  alter column id set default gen_random_uuid();

alter table public.profiles
  add column if not exists auth_user_id uuid unique references auth.users (id) on delete set null;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, auth_user_id, phone, role)
  values (
    gen_random_uuid(),
    new.id,
    coalesce(new.phone, new.raw_user_meta_data ->> 'phone', ''),
    coalesce((new.raw_user_meta_data ->> 'role')::public.user_role, 'visitor')
  )
  on conflict (auth_user_id) do update
    set phone = excluded.phone;
  return new;
end;
$$;
