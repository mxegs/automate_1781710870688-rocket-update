-- Step 2 of 2: run AFTER 20250629100000_church_wide_staff_roles.sql has committed.

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in (
        'super_admin',
        'senior_pastor',
        'administrative_manager',
        'admin',
        'pastor',
        'leader'
      )
  );
$$;

create or replace function public.can_access_campus(target_campus text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.is_super_admin()
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role in ('senior_pastor', 'administrative_manager')
    )
    or exists (
      select 1 from public.profiles p
      where p.id = auth.uid()
        and p.role in ('admin', 'pastor')
        and p.campus_id = target_campus
    );
$$;
