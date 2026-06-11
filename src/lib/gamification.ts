import type { ArtPeriod, Artwork, Badge } from "@/types";

export const XP_PER_ARTWORK = 100;
export const XP_PER_LEVEL = 300;

export const ALL_BADGES: Omit<Badge, "earnedAt">[] = [
  {
    id: "first-scan",
    name: "First Scan",
    description: "Discovered your first artwork",
    icon: "🎯",
  },
  {
    id: "renaissance-explorer",
    name: "Renaissance Explorer",
    description: "Discovered a Renaissance masterpiece",
    icon: "🏛️",
  },
  {
    id: "modern-art-starter",
    name: "Modern Art Starter",
    description: "Discovered a Modern art work",
    icon: "🎨",
  },
  {
    id: "art-collector",
    name: "Art Collector",
    description: "Collected 5 unique artworks",
    icon: "📚",
  },
  {
    id: "museum-master",
    name: "Museum Master",
    description: "Collected all available artworks",
    icon: "👑",
  },
];

export function calculateLevel(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function xpProgressInLevel(xp: number): {
  current: number;
  needed: number;
  percent: number;
} {
  const xpInLevel = xp % XP_PER_LEVEL;
  return {
    current: xpInLevel,
    needed: XP_PER_LEVEL,
    percent: Math.round((xpInLevel / XP_PER_LEVEL) * 100),
  };
}

export function getLevelTitle(level: number): string {
  if (level >= 10) return "Art Legend";
  if (level >= 7) return "Curator";
  if (level >= 5) return "Connoisseur";
  if (level >= 3) return "Art Enthusiast";
  if (level >= 2) return "Gallery Walker";
  return "Art Novice";
}

export function evaluateBadges(
  artworks: Artwork[],
  existingBadges: Badge[]
): Badge[] {
  const earnedIds = new Set(existingBadges.map((b) => b.id));
  const newBadges: Badge[] = [...existingBadges];
  const now = new Date().toISOString();

  const tryEarn = (id: string) => {
    if (earnedIds.has(id)) return;
    const def = ALL_BADGES.find((b) => b.id === id);
    if (def) {
      newBadges.push({ ...def, earnedAt: now });
      earnedIds.add(id);
    }
  };

  if (artworks.length >= 1) tryEarn("first-scan");
  if (artworks.length >= 5) tryEarn("art-collector");
  if (artworks.length >= 8) tryEarn("museum-master");

  const periods = new Set(artworks.map((a) => a.period));
  if (periods.has("renaissance")) tryEarn("renaissance-explorer");
  if (periods.has("modern")) tryEarn("modern-art-starter");

  return newBadges;
}

export function periodLabel(period: ArtPeriod): string {
  const labels: Record<ArtPeriod, string> = {
    renaissance: "Renaissance",
    baroque: "Baroque",
    impressionism: "Impressionism",
    modern: "Modern",
    contemporary: "Contemporary",
  };
  return labels[period];
}
