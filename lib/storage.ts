import { getUserId } from "@/lib/auth";
import { mapArtworkRow, upsertArtwork, type ArtworkRow } from "@/lib/artworks";
import {
  ALL_BADGES,
  XP_PER_ARTWORK,
  calculateLevel,
  evaluateBadges,
} from "@/lib/gamification";
import { supabase } from "@/lib/supabase";
import type { Artwork, Badge, UserCollection } from "@/types";

const EMPTY_COLLECTION = (userId: string): UserCollection => ({
  userId,
  artworks: [],
  xp: 0,
  level: 1,
  badges: [],
  scannedAt: {},
});

function mapBadges(
  rows: { badge_id: string; earned_at: string }[]
): Badge[] {
  const badges: Badge[] = [];
  for (const row of rows) {
    const def = ALL_BADGES.find((b) => b.id === row.badge_id);
    if (def) badges.push({ ...def, earnedAt: row.earned_at });
  }
  return badges;
}

export async function getCollection(): Promise<UserCollection> {
  const userId = await getUserId();

  const [profileResult, collectionResult, badgesResult] = await Promise.all([
    supabase.from("profiles").select("xp").eq("id", userId).maybeSingle(),
    supabase
      .from("user_artworks")
      .select("scanned_at, artworks(*)")
      .eq("user_id", userId)
      .order("scanned_at", { ascending: false }),
    supabase
      .from("user_badges")
      .select("badge_id, earned_at")
      .eq("user_id", userId),
  ]);

  if (profileResult.error) throw profileResult.error;
  if (collectionResult.error) throw collectionResult.error;
  if (badgesResult.error) throw badgesResult.error;

  if (!profileResult.data) {
    const { error } = await supabase
      .from("profiles")
      .insert({ id: userId });
    if (error) throw error;
    return EMPTY_COLLECTION(userId);
  }

  const artworks: Artwork[] = [];
  const scannedAt: Record<string, string> = {};

  for (const row of collectionResult.data ?? []) {
    const artworkRow = row.artworks as unknown as ArtworkRow | null;
    if (!artworkRow) continue;
    const artwork = mapArtworkRow(artworkRow);
    artworks.push(artwork);
    scannedAt[artwork.id] = row.scanned_at;
  }

  const xp = profileResult.data.xp;
  return {
    userId,
    artworks,
    xp,
    level: calculateLevel(xp),
    badges: mapBadges(badgesResult.data ?? []),
    scannedAt,
  };
}

export async function isInCollection(artworkId: string): Promise<boolean> {
  const userId = await getUserId();
  const { data, error } = await supabase
    .from("user_artworks")
    .select("id")
    .eq("user_id", userId)
    .eq("artwork_id", artworkId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

export async function addToCollection(artwork: Artwork): Promise<UserCollection> {
  const userId = await getUserId();
  const before = await getCollection();

  if (before.artworks.some((a) => a.id === artwork.id)) {
    return before;
  }

  await upsertArtwork(artwork);

  const { error: insertError } = await supabase.from("user_artworks").insert({
    user_id: userId,
    artwork_id: artwork.id,
  });

  if (insertError) throw insertError;

  const newXp = before.xp + XP_PER_ARTWORK;
  const { error: xpError } = await supabase
    .from("profiles")
    .update({ xp: newXp, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (xpError) throw xpError;

  const newArtworks = [...before.artworks, artwork];
  const newBadges = evaluateBadges(newArtworks, before.badges);
  const earnedBadgeIds = newBadges
    .filter((b) => !before.badges.some((prev) => prev.id === b.id))
    .map((b) => b.id);

  if (earnedBadgeIds.length > 0) {
    const { error: badgeError } = await supabase.from("user_badges").insert(
      earnedBadgeIds.map((badge_id) => ({
        user_id: userId,
        badge_id,
      }))
    );
    if (badgeError) throw badgeError;
  }

  return getCollection();
}

export function getNewlyEarnedBadges(before: Badge[], after: Badge[]): Badge[] {
  const beforeIds = new Set(before.map((b) => b.id));
  return after.filter((b) => !beforeIds.has(b.id));
}
