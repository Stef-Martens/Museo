"use client";

import Image from "next/image";
import Link from "next/link";
import type { Artwork } from "@/types";
import { periodLabel } from "@/lib/gamification";

interface ArtworkCardProps {
  artwork: Artwork;
  confidence?: number;
  scannedAt?: string;
  compact?: boolean;
}

export default function ArtworkCard({
  artwork,
  confidence,
  scannedAt,
  compact = false,
}: ArtworkCardProps) {
  return (
    <Link
      href={`/artwork/${artwork.id}`}
      className={`block overflow-hidden rounded-2xl bg-museo-card card-glow transition-transform active:scale-[0.98] ${
        compact ? "" : "animate-fade-in"
      }`}
    >
      <div className={`relative ${compact ? "aspect-square" : "aspect-[4/3]"}`}>
        <Image
          src={artwork.imageUrl}
          alt={artwork.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, 200px"
        />
        {confidence !== undefined && (
          <span className="absolute right-2 top-2 rounded-full bg-museo-purple/90 px-2 py-0.5 text-xs font-bold text-white">
            {confidence}%
          </span>
        )}
      </div>
      <div className="p-3">
        <h3 className="truncate text-sm font-bold text-white">
          {artwork.title}
        </h3>
        <p className="truncate text-xs text-white/50">{artwork.artist}</p>
        {!compact && (
          <span className="mt-1 inline-block rounded-full bg-white/10 px-2 py-0.5 text-xs text-museo-gold">
            {periodLabel(artwork.period)}
          </span>
        )}
        {scannedAt && (
          <p className="mt-1 text-xs text-white/30">
            Scanned {new Date(scannedAt).toLocaleDateString()}
          </p>
        )}
      </div>
    </Link>
  );
}
