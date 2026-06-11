import {
  fetchReferenceImageUrl,
  validateImageUrl,
} from "@/lib/artwork-images";
import { scanLog } from "@/lib/scan-debug";
import { supabase } from "@/lib/supabase";
import type { ArtPeriod, Artwork, RecognitionResult } from "@/types";


const VALID_PERIODS: ArtPeriod[] = [
  "renaissance",
  "baroque",
  "impressionism",
  "modern",
  "contemporary",
];

interface VisionApiResponse {
  identified: boolean;
  confidence: number;
  reason?: string;
  visualNotes?: string;
  visibleTitle?: string | null;
  visibleArtist?: string | null;
  title?: string | null;
  artist?: string | null;
  year?: string | null;
  description?: string | null;
  period?: string | null;
  whyItMatters?: string | null;
  museum?: string | null;
  city?: string | null;
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  imageSearchQuery?: string | null;
  imageUrl?: string | null;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function artworkIdFrom(title: string, artist: string): string {
  const slug = `${slugify(artist)}-${slugify(title)}`.replace(/^-|-$/g, "");
  return slug || `artwork-${Date.now()}`;
}

/** AI often returns 0.95 for 95%; normalize to 0–100 integer. */
function normalizeConfidence(value: number): number {
  const scaled = value > 0 && value <= 1 ? value * 100 : value;
  return Math.round(Math.min(100, Math.max(0, scaled)));
}

function parsePeriod(value: string | null | undefined): ArtPeriod {
  if (value && VALID_PERIODS.includes(value as ArtPeriod)) {
    return value as ArtPeriod;
  }
  return "modern";
}

function parseVisionPayload(data: unknown): VisionApiResponse {
  const parsed =
    typeof data === "string"
      ? (JSON.parse(data) as Partial<VisionApiResponse>)
      : (data as Partial<VisionApiResponse>);

  return {
    identified: Boolean(parsed.identified),
    confidence:
      typeof parsed.confidence === "number"
        ? normalizeConfidence(parsed.confidence)
        : 0,
    reason: typeof parsed.reason === "string" ? parsed.reason : undefined,
    visualNotes:
      typeof parsed.visualNotes === "string" ? parsed.visualNotes : undefined,
    visibleTitle:
      typeof parsed.visibleTitle === "string" ? parsed.visibleTitle : null,
    visibleArtist:
      typeof parsed.visibleArtist === "string" ? parsed.visibleArtist : null,
    title: typeof parsed.title === "string" ? parsed.title : null,
    artist: typeof parsed.artist === "string" ? parsed.artist : null,
    year: typeof parsed.year === "string" ? parsed.year : null,
    description:
      typeof parsed.description === "string" ? parsed.description : null,
    period: typeof parsed.period === "string" ? parsed.period : null,
    whyItMatters:
      typeof parsed.whyItMatters === "string" ? parsed.whyItMatters : null,
    museum: typeof parsed.museum === "string" ? parsed.museum : null,
    city: typeof parsed.city === "string" ? parsed.city : null,
    country: typeof parsed.country === "string" ? parsed.country : null,
    latitude: typeof parsed.latitude === "number" ? parsed.latitude : null,
    longitude: typeof parsed.longitude === "number" ? parsed.longitude : null,
    imageSearchQuery:
      typeof parsed.imageSearchQuery === "string"
        ? parsed.imageSearchQuery
        : null,
    imageUrl: typeof parsed.imageUrl === "string" ? parsed.imageUrl : null,
  };
}

function visionToArtwork(
  vision: VisionApiResponse,
  referenceImageUrl: string
): Artwork | null {
  if (!vision.identified || !vision.title || !vision.artist) return null;

  const city = vision.city ?? "Unknown";
  const country = vision.country ?? "Unknown";

  return {
    id: artworkIdFrom(vision.title, vision.artist),
    title: vision.title,
    artist: vision.artist,
    year: vision.year ?? "Unknown",
    description: vision.description ?? "Identified by AI vision.",
    imageUrl: referenceImageUrl,
    museum: vision.museum ?? undefined,
    period: parsePeriod(vision.period),
    whyItMatters:
      vision.whyItMatters ?? "A notable work identified during your visit.",
    location: {
      latitude: vision.latitude ?? 0,
      longitude: vision.longitude ?? 0,
      city,
      country,
    },
  };
}

export async function identifyArtworkFromImage(
  imageBase64: string,
  scanImageUri?: string
): Promise<RecognitionResult> {
  const imageKb = Math.round((imageBase64.length * 3) / 4 / 1024);
  scanLog(`Sending frame to AI (${imageKb} KB)`);

  const { data, error } = await supabase.functions.invoke("recognize-artwork", {
    body: { imageBase64 },
  });

  if (error) {
    scanLog(`Edge function error: ${error.message}`);
    throw new Error(
      error.message ??
        "Recognition service unavailable. Deploy the recognize-artwork edge function."
    );
  }

  if (data && typeof data === "object" && "error" in data) {
    const msg = String((data as { error: string }).error);
    scanLog(`Edge function returned error: ${msg}`);
    throw new Error(msg);
  }

  if (!data) {
    scanLog("Edge function returned empty response");
    throw new Error("Recognition service returned an empty response");
  }

  scanLog(`AI raw: ${JSON.stringify(data).slice(0, 500)}`);

  const vision = parseVisionPayload(data);
  if (vision.visibleTitle || vision.visibleArtist) {
    scanLog(
      `Label text: "${vision.visibleTitle ?? "?"}" by ${vision.visibleArtist ?? "?"}`
    );
  }
  if (vision.visualNotes) {
    scanLog(`AI sees: ${vision.visualNotes.slice(0, 200)}`);
  }
  scanLog(
    `AI: identified=${vision.identified} confidence=${vision.confidence}% title=${vision.title ?? "none"}${vision.artist ? ` by ${vision.artist}` : ""}${vision.reason ? ` — ${vision.reason}` : ""}`
  );

  if (vision.visibleTitle?.trim()) vision.title = vision.visibleTitle.trim();
  if (vision.visibleArtist?.trim()) vision.artist = vision.visibleArtist.trim();

  if (!vision.identified || !vision.title || !vision.artist) {
    scanLog("No artwork identified");
    return { matches: [], bestMatch: null };
  }

  let referenceImageUrl = await validateImageUrl(vision.imageUrl);
  if (!referenceImageUrl) {
    referenceImageUrl = await fetchReferenceImageUrl(
      vision.title,
      vision.artist,
      vision.imageSearchQuery,
      null
    );
  }
  if (!referenceImageUrl && scanImageUri) {
    referenceImageUrl = scanImageUri;
    scanLog("Using scan photo (no reference image found)");
  } else if (referenceImageUrl) {
    scanLog(`Image: ${referenceImageUrl.slice(0, 80)}…`);
  } else {
    scanLog("No image available");
  }

  const artwork = visionToArtwork(vision, referenceImageUrl ?? "");

  scanLog(`Identified: ${artwork.title} by ${artwork.artist}`);

  const match = { artwork, confidence: vision.confidence };
  return {
    matches: [match],
    bestMatch: match,
  };
}
