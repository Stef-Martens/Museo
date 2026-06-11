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

-- Seed artworks (idempotent)
insert into public.artworks (
  id, title, artist, year, description, image_url, museum, period,
  why_it_matters, latitude, longitude, city, country
) values
  (
    'mona-lisa', 'Mona Lisa', 'Leonardo da Vinci', '1503–1519',
    'Portrait of Lisa Gherardini, wife of Florentine merchant Francesco del Giocondo. Famous for her enigmatic smile and Leonardo''s sfumato technique.',
    'https://upload.wikimedia.org/wikipedia/commons/e/ec/Mona_Lisa%2C_by_Leonardo_da_Vinci%2C_from_C2RMF_retouched.jpg',
    'Louvre Museum, Paris', 'renaissance',
    'The most visited painting in the world. Leonardo''s mastery of light, anatomy, and psychology revolutionized portraiture and remains unmatched five centuries later.',
    48.8606, 2.3376, 'Paris', 'France'
  ),
  (
    'starry-night', 'The Starry Night', 'Vincent van Gogh', '1889',
    'Swirling night sky over a quiet village, painted from memory during Van Gogh''s stay at the Saint-Paul asylum in Saint-Rémy-de-Provence.',
    'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg/1280px-Van_Gogh_-_Starry_Night_-_Google_Art_Project.jpg',
    'Museum of Modern Art, New York', 'modern',
    'Van Gogh transformed personal turmoil into universal beauty. Its expressive brushwork and emotional intensity made it the defining image of modern art.',
    40.7614, -73.9776, 'New York', 'USA'
  ),
  (
    'girl-pearl-earring', 'Girl with a Pearl Earring', 'Johannes Vermeer', 'c. 1665',
    'A young woman in exotic dress turns to gaze at the viewer over her shoulder, her luminous pearl earring catching the light.',
    'https://upload.wikimedia.org/wikipedia/commons/0/0f/1665_Girl_with_a_Pearl_Earring.jpg',
    'Mauritshuis, The Hague', 'baroque',
    'Often called the Mona Lisa of the North. Vermeer''s intimate portrayal and masterful use of light created one of history''s most captivating gazes.',
    52.0804, 4.3142, 'The Hague', 'Netherlands'
  ),
  (
    'great-wave', 'The Great Wave off Kanagawa', 'Katsushika Hokusai', 'c. 1831',
    'A towering wave threatens boats off the coast of Kanagawa, with Mount Fuji visible in the background beneath the foam.',
    'https://upload.wikimedia.org/wikipedia/commons/a/a5/Tsunami_by_hokusai_19th_century.jpg',
    'British Museum, London', 'contemporary',
    'The most recognizable work of Japanese art. Hokusai''s dynamic composition and Prussian blue pigment influenced Impressionists and pop culture alike.',
    51.5194, -0.127, 'London', 'UK'
  ),
  (
    'persistence-memory', 'The Persistence of Memory', 'Salvador Dalí', '1931',
    'Melting clocks draped over a barren landscape, exploring the relativity of time and the subconscious mind.',
    'https://upload.wikimedia.org/wikipedia/en/d/dd/The_Persistence_of_Memory.jpg',
    'Museum of Modern Art, New York', 'modern',
    'Dalí''s surrealist masterpiece made the subconscious visible. Its melting clocks became the universal symbol of dream logic and artistic rebellion.',
    40.7614, -73.9776, 'New York', 'USA'
  ),
  (
    'birth-venus', 'The Birth of Venus', 'Sandro Botticelli', 'c. 1485',
    'Venus emerges from the sea on a shell, blown ashore by Zephyr and welcomed by a Hora with a flowered cloak.',
    'https://upload.wikimedia.org/wikipedia/commons/0/0b/Sandro_Botticelli_-_La_nascita_di_Venere_-_Google_Art_Project_-_edited.jpg',
    'Uffizi Gallery, Florence', 'renaissance',
    'Botticelli revived classical mythology for Renaissance Florence. Its graceful lines and mythological subject defined the ideal of beauty for an era.',
    43.7678, 11.2553, 'Florence', 'Italy'
  ),
  (
    'water-lilies', 'Water Lilies', 'Claude Monet', '1919',
    'Part of Monet''s monumental series depicting his flower garden at Giverny, focusing on light, reflection, and atmosphere.',
    'https://upload.wikimedia.org/wikipedia/commons/a/aa/Claude_Monet_-_Water_Lilies_-_1906%2C_Ryerson.jpg',
    'Art Institute of Chicago', 'impressionism',
    'Monet pushed Impressionism to its limits, dissolving form into pure color and light. These works paved the way for abstract art.',
    41.8796, -87.6237, 'Chicago', 'USA'
  ),
  (
    'scream', 'The Scream', 'Edvard Munch', '1893',
    'A figure stands on a bridge clutching its face, mouth agape, against a blood-red sky — an icon of existential anguish.',
    'https://upload.wikimedia.org/wikipedia/commons/c/c5/Edvard_Munch%2C_1893%2C_The_Scream%2C_National_Gallery_Oslo.jpg',
    'National Museum, Oslo', 'modern',
    'Munch captured modern anxiety before the world had words for it. The Scream became the face of human dread in the 20th century.',
    59.9169, 10.737, 'Oslo', 'Norway'
  )
on conflict (id) do nothing;
