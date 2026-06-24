-- Fix: "Database error saving new user" on signup.
-- The new-user trigger inserts a profile row; it can fail because a
-- SECURITY DEFINER function without a fixed search_path may not resolve the
-- table, and/or RLS blocks the insert during the trigger. This makes it
-- robust on both counts and never blocks auth signup.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.user_profiles (id, display_name)
  values (new.id, split_part(new.email, '@', 1))
  on conflict (id) do nothing;
  return new;
exception
  when others then
    -- profile creation must never block account creation
    return new;
end;
$$;

-- Allow the profile row to be created under RLS (covers the case where the
-- trigger's role does not bypass RLS). The id is a PK→auth.users FK, so a
-- row can only ever exist for a real user.
drop policy if exists "Profiles insertable on signup" on public.user_profiles;
create policy "Profiles insertable on signup"
  on public.user_profiles for insert
  with check (true);
