import AsyncStorage from "@react-native-async-storage/async-storage";
import { getArtworkById } from "@/lib/artworks";
import type { Artwork, Badge, UserCollection } from "@/types";
import {
  XP_PER_ARTWORK,
  calculateLevel,
  evaluateBadges,
} from "@/lib/gamification";

function hydrateArtwork(stored: Artwork): Artwork {
  const canonical = getArtworkById(stored.id);
  if (!canonical) return stored;
  return {
    ...canonical,
    ...stored,
    location: stored.location ?? canonical.location,
  };
}

function normalizeCollection(collection: UserCollection): UserCollection {
  return {
    ...collection,
    artworks: collection.artworks.map(hydrateArtwork),
  };
}

const STORAGE_KEY = "museo-collection";

const DEFAULT_COLLECTION: UserCollection = {
  userId: "local-user",
  artworks: [],
  xp: 0,
  level: 1,
  badges: [],
  scannedAt: {},
};

export async function getCollection(): Promise<UserCollection> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_COLLECTION;
    const parsed = { ...DEFAULT_COLLECTION, ...JSON.parse(raw) };
    const collection = normalizeCollection(parsed);
    const needsMigration = parsed.artworks.some(
      (a: Artwork) => !a.location
    );
    if (needsMigration) await saveCollection(collection);
    return collection;
  } catch {
    return DEFAULT_COLLECTION;
  }
}

export async function saveCollection(collection: UserCollection): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
}

export async function isInCollection(artworkId: string): Promise<boolean> {
  const collection = await getCollection();
  return collection.artworks.some((a) => a.id === artworkId);
}

export async function addToCollection(artwork: Artwork): Promise<UserCollection> {
  const collection = await getCollection();
  const alreadyOwned = collection.artworks.some((a) => a.id === artwork.id);

  if (alreadyOwned) return collection;

  const canonical = getArtworkById(artwork.id) ?? artwork;
  const newArtworks = [...collection.artworks, canonical];
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

  await saveCollection(updated);
  return updated;
}

export function getNewlyEarnedBadges(before: Badge[], after: Badge[]): Badge[] {
  const beforeIds = new Set(before.map((b) => b.id));
  return after.filter((b) => !beforeIds.has(b.id));
}
