# Museo

**Pokémon Go for Art** — a native mobile app to scan artworks, identify them, and build your personal collection.

## Stack

- **Expo** (React Native) — iOS & Android
- **expo-router** — file-based navigation
- **expo-camera** — artwork capture
- **AsyncStorage** — local collection persistence

## Getting started

Uses **Expo SDK 54** — compatible with Expo Go on the App Store.

```bash
npm install
npm start
```

Then:
- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan the QR code with **Expo Go** on your phone

## App Store (later)

When ready to ship:

```bash
npx eas-cli build --platform ios
npx eas-cli submit --platform ios
```

Requires an [Expo account](https://expo.dev) and Apple Developer membership ($99/year).

## Project structure

```
app/           # Screens (expo-router)
  (tabs)/      # Discover, Collection, Profile
  artwork/     # Artwork detail
  demo.tsx     # Test artworks
components/    # Shared UI
lib/           # Artworks, recognition, storage, gamification
types/         # TypeScript types
constants/     # Theme colors
```

## Design

Museum-modern editorial aesthetic. See `.cursor/skills/museum-modern-design/SKILL.md`.

## MVP notes

- Recognition is **mocked** — replace `lib/recognition.ts` with a real vision API later
- You'll likely rewrite UI/UX once the shell is running — that's fine
