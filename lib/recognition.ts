import { ARTWORKS } from "@/lib/artworks";
import type { RecognitionResult } from "@/types";

/**
 * MVP mock recognition — replace with real vision API or on-device ML later.
 * Shuffles confidence scores so captures feel responsive during testing.
 */
export async function recognizeArtwork(
  _imageUri?: string
): Promise<RecognitionResult> {
  const matches = ARTWORKS.map((artwork) => ({
    artwork,
    confidence: Math.floor(Math.random() * 55) + 35,
  }));

  matches.sort((a, b) => b.confidence - a.confidence);

  const best = matches[0];
  return {
    matches: matches.slice(0, 3),
    bestMatch: best ?? null,
  };
}

export function simulateRecognitionDelay(): Promise<void> {
  return new Promise((resolve) =>
    setTimeout(resolve, 1500 + Math.random() * 500)
  );
}
