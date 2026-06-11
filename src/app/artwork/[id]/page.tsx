"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getArtworkById } from "@/lib/artworks";
import { periodLabel } from "@/lib/gamification";
import {
  addToCollection,
  getCollection,
  isInCollection,
} from "@/lib/storage";
import type { Artwork } from "@/types";

export default function ArtworkDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const artwork = getArtworkById(id);
  const [saved, setSaved] = useState(false);
  const [scannedAt, setScannedAt] = useState<string | null>(null);

  useEffect(() => {
    if (artwork) {
      setSaved(isInCollection(artwork.id));
      const collection = getCollection();
      setScannedAt(collection.scannedAt[artwork.id] ?? null);
    }
  }, [artwork]);

  if (!artwork) {
    return (
      <div className="flex flex-col items-center justify-center px-4 py-20 text-center">
        <span className="text-5xl">❓</span>
        <h2 className="mt-4 text-xl font-bold">Artwork not found</h2>
        <Link href="/collection" className="mt-4 text-museo-purple">
          Back to Collection
        </Link>
      </div>
    );
  }

  const handleSave = () => {
    if (saved) return;
    addToCollection(artwork);
    setSaved(true);
    setScannedAt(new Date().toISOString());
  };

  return (
    <div className="pb-24">
      <div className="relative aspect-[4/3] w-full">
        <Image
          src={artwork.imageUrl}
          alt={artwork.title}
          fill
          className="object-cover"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-museo-dark via-transparent to-transparent" />
        <Link
          href="/collection"
          className="absolute left-4 top-4 rounded-full bg-black/50 px-3 py-1.5 text-sm text-white backdrop-blur-sm"
        >
          ← Back
        </Link>
      </div>

      <div className="space-y-4 px-4 pt-4">
        <div>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-museo-gold">
            {periodLabel(artwork.period)}
          </span>
          <h1 className="mt-2 text-2xl font-black text-white">
            {artwork.title}
          </h1>
          <p className="text-white/60">
            {artwork.artist} · {artwork.year}
          </p>
          {artwork.museum && (
            <p className="mt-1 text-sm text-white/40">📍 {artwork.museum}</p>
          )}
          {scannedAt && (
            <p className="mt-1 text-xs text-white/30">
              Scanned {new Date(scannedAt).toLocaleDateString()}
            </p>
          )}
        </div>

        <p className="text-sm leading-relaxed text-white/80">
          {artwork.description}
        </p>

        <div className="rounded-xl bg-white/5 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-museo-gold">
            Why it matters
          </p>
          <p className="mt-2 text-sm leading-relaxed text-white/70">
            {artwork.whyItMatters}
          </p>
        </div>

        {!saved && (
          <button
            onClick={handleSave}
            className="w-full rounded-2xl py-4 font-bold game-gradient text-white active:scale-[0.98]"
          >
            + Add to My Collection
          </button>
        )}
        {saved && (
          <p className="text-center text-sm font-bold text-green-400">
            ✓ In your collection
          </p>
        )}
      </div>
    </div>
  );
}
