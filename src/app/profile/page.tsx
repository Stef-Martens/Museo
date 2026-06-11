"use client";

import { useEffect, useState } from "react";
import BadgePanel from "@/components/BadgePanel";
import LevelBadge from "@/components/LevelBadge";
import { getCollection } from "@/lib/storage";
import type { UserCollection } from "@/types";

export default function ProfilePage() {
  const [collection, setCollection] = useState<UserCollection | null>(null);

  useEffect(() => {
    setCollection(getCollection());
  }, []);

  if (!collection) return null;

  return (
    <div className="px-4 py-6">
      <header className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-20 w-20 items-center justify-center rounded-full game-gradient text-3xl shadow-lg">
          🎨
        </div>
        <h1 className="text-2xl font-black text-white">Art Explorer</h1>
        <p className="text-sm text-white/50">
          {collection.artworks.length} discoveries · {collection.badges.length}{" "}
          badges
        </p>
      </header>

      <div className="space-y-4">
        <LevelBadge level={collection.level} xp={collection.xp} />
        <BadgePanel earnedBadges={collection.badges} />
      </div>
    </div>
  );
}
