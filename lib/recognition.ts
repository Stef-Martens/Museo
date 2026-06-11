import { identifyArtworkFromImage } from "@/lib/vision";
import type { RecognitionResult } from "@/types";

export const RECOGNITION_CONFIDENCE_THRESHOLD = 65;

export async function recognizeArtwork(
  imageBase64: string,
  scanImageUri?: string
): Promise<RecognitionResult> {
  return identifyArtworkFromImage(imageBase64, scanImageUri);
}
