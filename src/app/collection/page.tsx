"use client";

import { useEffect, useState } from "react";
import ArtworkCard from "@/components/ArtworkCard";
import { getCollection } from "@/lib/storage";
import type { UserCollection } from "@/types";

export default function CollectionPage() {
  const [collection, setCollection] = useState<UserCollection | null>(null);

  useEffect(() => {
    setCollection(getCollection());
  }, []);

  const artworks = collection?.artworks ?? [];
  const scannedAt = collection?.scannedAt ?? {};

  return (
    <div className="px-4 py-6">
      <header className="mb-6">
        <h1 className="text-2xl font-black text-white">My Collection</h1>
        <p className="text-sm text-white/50">
          {artworks.length} artwork{artworks.length !== 1 ? "s" : ""}{" "}
          discovered
        </p>
      </header>

      {artworks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <span className="text-6xl">🖼️</span>
          <h2 className="mt-4 text-lg font-bold text-white">
            No artworks yet
          </h2>
          <p className="mt-2 max-w-xs text-sm text-white/50">
            Head to the Scan tab and point your camera at a painting to start
            your collection.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {artworks.map((artwork) => (
            <ArtworkCard
              key={artwork.id}
              artwork={artwork}
              scannedAt={scannedAt[artwork.id]}
            />
          ))}
        </div>
      )}
    </div>
  );
}
