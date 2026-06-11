-- Museo Supabase schema
-- Run in Supabase SQL Editor after creating a project.
-- Enable OAuth providers: Authentication → Providers (Google, Apple, GitHub)

-- Artworks catalog (public read)
create table if not exists public.artworks (
  id text primary key,
  title text not null,
  artist text not null,
  year text not null,
  description text not null,
  image_url text not null,
  museum text,
  period text not null,
  why_it_matters text not null,
  latitude double precision not null,
  longitude double precision not null,
  city text not null,
  country text not null,
  created_at timestamptz not null default now()
);

-- User profiles (xp, linked to auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  xp integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- User collection
create table if not exists public.user_artworks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  artwork_id text not null references public.artworks (id) on delete cascade,
  scanned_at timestamptz not null default now(),
  unique (user_id, artwork_id)
);

-- Earned badges
create table if not exists public.user_badges (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  badge_id text not null,
  earned_at timestamptz not null default now(),
  unique (user_id, badge_id)
);

-- Auto-create profile on sign-up (anonymous or otherwise)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Row level security
alter table public.artworks enable row level security;
alter table public.profiles enable row level security;
alter table public.user_artworks enable row level security;
alter table public.user_badges enable row level security;

drop policy if exists "Artworks are publicly readable" on public.artworks;
create policy "Artworks are publicly readable"
  on public.artworks for select using (true);

drop policy if exists "Authenticated users can insert artworks" on public.artworks;
create policy "Authenticated users can insert artworks"
  on public.artworks for insert with check (auth.role() = 'authenticated');

drop policy if exists "Authenticated users can update artworks" on public.artworks;
create policy "Authenticated users can update artworks"
  on public.artworks for update using (auth.role() = 'authenticated');

drop policy if exists "Users read own profile" on public.profiles;
create policy "Users read own profile"
  on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users insert own profile" on public.profiles;
create policy "Users insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "Users update own profile" on public.profiles;
create policy "Users update own profile"
  on public.profiles for update using (auth.uid() = id);

drop policy if exists "Users read own collection" on public.user_artworks;
create policy "Users read own collection"
  on public.user_artworks for select using (auth.uid() = user_id);

drop policy if exists "Users insert own collection" on public.user_artworks;
create policy "Users insert own collection"
  on public.user_artworks for insert with check (auth.uid() = user_id);

drop policy if exists "Users read own badges" on public.user_badges;
create policy "Users read own badges"
  on public.user_badges for select using (auth.uid() = user_id);

drop policy if exists "Users insert own badges" on public.user_badges;
create policy "Users insert own badges"
  on public.user_badges for insert with check (auth.uid() = user_id);

-- Artworks are populated by AI scans (no seed data)
