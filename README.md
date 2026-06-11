# Museo

**Pokémon Go for Art** — a mobile-first web app that lets you scan artworks, identify them with AI, and build your personal art collection.

## Features

- **Camera scan** — point your phone at a painting and capture
- **Artwork recognition** — mock recognition pipeline with confidence scores (swap in real API later)
- **Artwork details** — title, artist, year, description, museum, and "why it matters"
- **Collection** — save discoveries to local storage
- **Gamification** — XP, art levels, and badges (First Scan, Renaissance Explorer, Modern Art Starter, etc.)
- **AR feel** — scan frame overlay, glow animation, haptic feedback

## Tech Stack

- Next.js 15 (App Router)
- React 19
- TailwindCSS
- localStorage for MVP persistence

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on your phone or in mobile dev tools.

## How Recognition Works (MVP)

The mock recognition service compares color signatures of your captured image against a dataset of 8 famous artworks. For best results, point your camera at an artwork image on screen or in a book.

Future: swap `src/lib/recognition.ts` with Google Vision, OpenAI Vision, or a custom embeddings database.

## Data Model

```ts
Artwork: { id, title, artist, year, description, imageUrl, museum?, period, whyItMatters }
UserCollection: { userId, artworks[], xp, level, badges[], scannedAt }
```

## Project Structure

```
src/
  app/           # Pages (scan, collection, profile, artwork detail)
  components/    # UI components
  lib/           # Artworks dataset, recognition, storage, gamification
  types/         # TypeScript types
```
