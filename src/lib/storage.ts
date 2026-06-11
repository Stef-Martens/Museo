"use client";

import type { Artwork, Badge, UserCollection } from "@/types";
import {
  XP_PER_ARTWORK,
  calculateLevel,
  evaluateBadges,
} from "@/lib/gamification";

const STORAGE_KEY = "museo-collection";

const DEFAULT_COLLECTION: UserCollection = {
  userId: "local-user",
  artworks: [],
  xp: 0,
  level: 1,
  badges: [],
  scannedAt: {},
};

export function getCollection(): UserCollection {
  if (typeof window === "undefined") return DEFAULT_COLLECTION;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_COLLECTION;
    return { ...DEFAULT_COLLECTION, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_COLLECTION;
  }
}

export function saveCollection(collection: UserCollection): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
}

export function isInCollection(artworkId: string): boolean {
  return getCollection().artworks.some((a) => a.id === artworkId);
}

export function addToCollection(artwork: Artwork): UserCollection {
  const collection = getCollection();
  const alreadyOwned = collection.artworks.some((a) => a.id === artwork.id);

  if (alreadyOwned) return collection;

  const newArtworks = [...collection.artworks, artwork];
  const newXp = collection.xp + XP_PER_ARTWORK;
  const newBadges = evaluateBadges(newArtworks, collection.badges);

  const updated: UserCollection = {
    ...collection,
    artworks: newArtworks,
    xp: newXp,
    level: calculateLevel(newXp),
    badges: newBadges,
    scannedAt: {
      ...collection.scannedAt,
      [artwork.id]: new Date().toISOString(),
    },
  };

  saveCollection(updated);
  return updated;
}

export function getNewlyEarnedBadges(
  before: Badge[],
  after: Badge[]
): Badge[] {
  const beforeIds = new Set(before.map((b) => b.id));
  return after.filter((b) => !beforeIds.has(b.id));
}
