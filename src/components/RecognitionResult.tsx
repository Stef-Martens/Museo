"use client";

import Image from "next/image";
import { useState } from "react";
import ArtworkCard from "@/components/ArtworkCard";
import {
  addToCollection,
  getCollection,
  getNewlyEarnedBadges,
  isInCollection,
} from "@/lib/storage";
import type { RecognitionResult as RecognitionResultType } from "@/types";

interface RecognitionResultProps {
  result: RecognitionResultType;
  capturedImage: string | null;
  onScanAgain: () => void;
}

export default function RecognitionResult({
  result,
  capturedImage,
  onScanAgain,
}: RecognitionResultProps) {
  const { bestMatch, matches } = result;
  const [saved, setSaved] = useState(
    bestMatch ? isInCollection(bestMatch.artwork.id) : false
  );
  const [newBadges, setNewBadges] = useState<string[]>([]);
  const [xpGained, setXpGained] = useState(0);

  const handleSave = () => {
    if (!bestMatch || saved) return;
    const before = getCollection();
    const after = addToCollection(bestMatch.artwork);
    const earned = getNewlyEarnedBadges(before.badges, after.badges);
    setXpGained(after.xp - before.xp);
    setNewBadges(earned.map((b) => b.name));
    setSaved(true);

    if ("vibrate" in navigator) {
      navigator.vibrate([50, 30, 50]);
    }
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto pb-24">
      {capturedImage && (
        <div className="relative h-48 w-full shrink-0">
          <Image
            src={capturedImage}
            alt="Captured scan"
            fill
            className="object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-museo-dark" />
        </div>
      )}

      <div className="flex flex-1 flex-col gap-4 px-4 pt-4">
        {bestMatch ? (
          <>
            <div className="text-center">
              <p className="text-xs font-medium uppercase tracking-widest text-museo-gold">
                Artwork Identified
              </p>
              <h2 className="mt-1 text-2xl font-bold text-white">
                {bestMatch.artwork.title}
              </h2>
              <p className="text-white/60">{bestMatch.artwork.artist}</p>
              <span className="mt-2 inline-block rounded-full bg-museo-purple/30 px-3 py-1 text-sm font-bold text-museo-purple">
                {bestMatch.confidence}% match
              </span>
            </div>

            <div className="overflow-hidden rounded-2xl card-glow">
              <div className="relative aspect-video">
                <Image
                  src={bestMatch.artwork.imageUrl}
                  alt={bestMatch.artwork.title}
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
              </div>
              <div className="space-y-3 p-4">
                <div className="flex gap-4 text-sm text-white/60">
                  <span>{bestMatch.artwork.year}</span>
                  {bestMatch.artwork.museum && (
                    <span>· {bestMatch.artwork.museum}</span>
                  )}
                </div>
                <p className="text-sm leading-relaxed text-white/80">
                  {bestMatch.artwork.description}
                </p>
                <div className="rounded-xl bg-white/5 p-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-museo-gold">
                    Why it matters
                  </p>
                  <p className="mt-1 text-sm text-white/70">
                    {bestMatch.artwork.whyItMatters}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={handleSave}
              disabled={saved}
              className={`w-full rounded-2xl py-4 text-center font-bold transition-all active:scale-[0.98] ${
                saved
                  ? "bg-green-500/20 text-green-400"
                  : "game-gradient text-white shadow-lg"
              }`}
            >
              {saved ? "✓ Added to Collection" : "+ Add to My Collection"}
            </button>

            {xpGained > 0 && (
              <p className="text-center text-sm font-bold text-museo-gold animate-fade-in">
                +{xpGained} XP earned!
              </p>
            )}

            {newBadges.length > 0 && (
              <div className="rounded-xl bg-museo-purple/20 p-3 text-center animate-fade-in">
                <p className="text-xs text-white/60">New badge unlocked!</p>
                {newBadges.map((name) => (
                  <p key={name} className="font-bold text-museo-gold">
                    🏅 {name}
                  </p>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="py-8 text-center">
            <span className="text-5xl">🔍</span>
            <h2 className="mt-4 text-xl font-bold text-white">
              No match found
            </h2>
            <p className="mt-2 text-sm text-white/60">
              Try getting closer to the artwork or improving lighting.
            </p>
          </div>
        )}

        {matches.length > 1 && (
          <div>
            <h3 className="mb-3 text-sm font-bold text-white/60">
              Closest matches
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {matches.slice(bestMatch ? 1 : 0, 3).map((m) => (
                <ArtworkCard
                  key={m.artwork.id}
                  artwork={m.artwork}
                  confidence={m.confidence}
                  compact
                />
              ))}
            </div>
          </div>
        )}

        <button
          onClick={onScanAgain}
          className="mt-2 w-full rounded-2xl border border-white/20 py-3 text-center font-medium text-white/80 transition-all active:scale-[0.98]"
        >
          Scan Again
        </button>
      </div>
    </div>
  );
}
