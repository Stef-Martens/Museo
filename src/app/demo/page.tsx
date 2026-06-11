"use client";

import Image from "next/image";
import Link from "next/link";
import { ARTWORKS } from "@/lib/artworks";

export default function DemoPage() {
  return (
    <div className="px-4 py-6 pb-24">
      <header className="mb-6">
        <h1 className="text-2xl font-black text-white">Demo Artworks</h1>
        <p className="text-sm text-white/50">
          Open an artwork full-screen on another device, then scan it with the
          camera.
        </p>
      </header>

      <div className="space-y-4">
        {ARTWORKS.map((artwork) => (
          <div
            key={artwork.id}
            className="overflow-hidden rounded-2xl bg-museo-card card-glow"
          >
            <div className="relative aspect-video">
              <Image
                src={artwork.imageUrl}
                alt={artwork.title}
                fill
                className="object-cover"
                sizes="100vw"
              />
            </div>
            <div className="flex items-center justify-between p-4">
              <div>
                <h3 className="font-bold text-white">{artwork.title}</h3>
                <p className="text-sm text-white/50">{artwork.artist}</p>
              </div>
              <Link
                href={`/artwork/${artwork.id}`}
                className="rounded-full bg-museo-purple/30 px-3 py-1.5 text-xs font-bold text-museo-purple"
              >
                Details
              </Link>
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/"
        className="mt-6 block w-full rounded-2xl py-4 text-center font-bold game-gradient text-white"
      >
        Back to Scan
      </Link>
    </div>
  );
}
