# Museo

**Pokémon Go for Art** — scan artworks, build your collection, and explore them on a world map.

## Stack

- **Expo** (React Native) — iOS & Android
- **Supabase** — auth, artworks catalog, collections, XP & badges
- **expo-camera** — artwork capture
- **react-native-maps** — discovery map

## Supabase setup

### 1. Database

1. Create a project at [supabase.com](https://supabase.com)
2. SQL Editor → run [`supabase/schema.sql`](supabase/schema.sql)

### 2. Environment

```bash
cp .env.example .env
```

```env
EXPO_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

Restart Expo after changing `.env`.

### 3. Artwork recognition (Edge Function)

The OpenAI key stays **private** on Supabase — never put it in `.env` or use `EXPO_PUBLIC_`.

1. Get an API key at [platform.openai.com](https://platform.openai.com/api-keys)
2. Install the [Supabase CLI](https://supabase.com/docs/guides/cli) and link your project:

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

3. Set the secret and deploy:

```bash
supabase secrets set OPENAI_API_KEY=sk-...
supabase functions deploy recognize-artwork
```

Scanning calls `recognize-artwork` (GPT-4o mini vision) to identify any artwork in view. Discovered works are saved to your collection automatically.

### 4. OAuth providers

In **Authentication → Providers**, enable:

- **Google** — add Client ID & Secret from [Google Cloud Console](https://console.cloud.google.com/)
- **Apple** — configure in Apple Developer + Supabase
- **GitHub** (optional) — add OAuth app credentials

### 5. Redirect URLs

In **Authentication → URL Configuration → Redirect URLs**, add:

```
museo://auth/callback
```

For **Expo Go** during development, also add the redirect shown at the bottom of the login screen in dev mode (looks like `exp://192.168.x.x:8081/--/auth/callback`).

In **Site URL**, you can set `museo://auth/callback` for mobile.

## Run locally

```bash
npm install
npx expo start
```

## Auth flow

- App opens on **login screen** (Google, Apple, GitHub)
- OAuth via in-app browser → redirects back to Museo
- Profile tab has **Sign out**
- Anonymous auth is **not** used

## Data model

| Table | Purpose |
|-------|---------|
| `artworks` | Museum catalog (public read) |
| `profiles` | User XP (auto-created on sign-up) |
| `user_artworks` | Collection + scan timestamps |
| `user_badges` | Earned badges |

## Notes

- Artwork recognition uses open AI vision (any artwork, not a fixed catalog)
- Apple Sign In requires extra setup in Apple Developer for production builds
