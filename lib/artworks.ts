import { supabase } from "@/lib/supabase";
import type { ArtPeriod, Artwork } from "@/types";

export interface ArtworkRow {
  id: string;
  title: string;
  artist: string;
  year: string;
  description: string;
  image_url: string;
  museum: string | null;
  period: string;
  why_it_matters: string;
  latitude: number;
  longitude: number;
  city: string;
  country: string;
}

export function mapArtworkRow(row: ArtworkRow): Artwork {
  return {
    id: row.id,
    title: row.title,
    artist: row.artist,
    year: row.year,
    description: row.description,
    imageUrl: row.image_url,
    museum: row.museum ?? undefined,
    period: row.period as ArtPeriod,
    whyItMatters: row.why_it_matters,
    location: {
      latitude: row.latitude,
      longitude: row.longitude,
      city: row.city,
      country: row.country,
    },
  };
}

export async function fetchArtworks(): Promise<Artwork[]> {
  const { data, error } = await supabase
    .from("artworks")
    .select("*")
    .order("title");

  if (error) throw error;
  return (data as ArtworkRow[]).map(mapArtworkRow);
}

export function artworkToRow(artwork: Artwork): ArtworkRow {
  return {
    id: artwork.id,
    title: artwork.title,
    artist: artwork.artist,
    year: artwork.year,
    description: artwork.description,
    image_url: artwork.imageUrl,
    museum: artwork.museum ?? null,
    period: artwork.period,
    why_it_matters: artwork.whyItMatters,
    latitude: artwork.location.latitude,
    longitude: artwork.location.longitude,
    city: artwork.location.city,
    country: artwork.location.country,
  };
}

export async function upsertArtwork(artwork: Artwork): Promise<void> {
  const { error } = await supabase
    .from("artworks")
    .upsert(artworkToRow(artwork));

  if (error) throw error;
}

export async function getArtworkById(id: string): Promise<Artwork | null> {
  const { data, error } = await supabase
    .from("artworks")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  return mapArtworkRow(data as ArtworkRow);
}
