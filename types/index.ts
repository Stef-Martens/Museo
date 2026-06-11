export type ArtPeriod =
  | "renaissance"
  | "baroque"
  | "impressionism"
  | "modern"
  | "contemporary";

export interface ArtworkLocation {
  latitude: number;
  longitude: number;
  city: string;
  country: string;
}

export interface Artwork {
  id: string;
  title: string;
  artist: string;
  year: string;
  description: string;
  imageUrl: string;
  museum?: string;
  location: ArtworkLocation;
  period: ArtPeriod;
  whyItMatters: string;
}

export interface RecognitionMatch {
  artwork: Artwork;
  confidence: number;
}

export interface RecognitionResult {
  matches: RecognitionMatch[];
  bestMatch: RecognitionMatch | null;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt?: string;
}

export interface UserCollection {
  userId: string;
  artworks: Artwork[];
  xp: number;
  level: number;
  badges: Badge[];
  scannedAt: Record<string, string>;
}
