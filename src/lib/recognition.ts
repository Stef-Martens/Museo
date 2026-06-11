import { ARTWORKS } from "@/lib/artworks";
import type { RecognitionResult } from "@/types";

const SAMPLE_SIZE = 32;

interface ColorSignature {
  r: number;
  g: number;
  b: number;
  brightness: number;
  contrast: number;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function extractSignature(
  source: HTMLImageElement | HTMLCanvasElement | HTMLVideoElement
): ColorSignature {
  const canvas = document.createElement("canvas");
  canvas.width = SAMPLE_SIZE;
  canvas.height = SAMPLE_SIZE;
  const ctx = canvas.getContext("2d")!;

  let w: number, h: number;
  if (source instanceof HTMLVideoElement) {
    w = source.videoWidth;
    h = source.videoHeight;
  } else {
    w = source.width;
    h = source.height;
  }

  ctx.drawImage(source, 0, 0, w, h, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
  const data = ctx.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE).data;

  let r = 0,
    g = 0,
    b = 0,
    brightness = 0;
  const pixels = SAMPLE_SIZE * SAMPLE_SIZE;

  for (let i = 0; i < data.length; i += 4) {
    r += data[i];
    g += data[i + 1];
    b += data[i + 2];
    brightness += (data[i] + data[i + 1] + data[i + 2]) / 3;
  }

  r /= pixels;
  g /= pixels;
  b /= pixels;
  brightness /= pixels;

  let variance = 0;
  for (let i = 0; i < data.length; i += 4) {
    const px = (data[i] + data[i + 1] + data[i + 2]) / 3;
    variance += (px - brightness) ** 2;
  }
  const contrast = Math.sqrt(variance / pixels);

  return { r, g, b, brightness, contrast };
}

function compareSignatures(a: ColorSignature, b: ColorSignature): number {
  const colorDist = Math.sqrt(
    (a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2
  );
  const brightDist = Math.abs(a.brightness - b.brightness);
  const contrastDist = Math.abs(a.contrast - b.contrast);

  const totalDist = colorDist * 0.6 + brightDist * 0.25 + contrastDist * 0.15;
  const maxDist = 255;
  return Math.max(0, Math.min(100, Math.round((1 - totalDist / maxDist) * 100)));
}

const referenceCache = new Map<string, ColorSignature>();

async function getReferenceSignature(
  imageUrl: string
): Promise<ColorSignature | null> {
  if (referenceCache.has(imageUrl)) {
    return referenceCache.get(imageUrl)!;
  }
  try {
    const img = await loadImage(imageUrl);
    const sig = extractSignature(img);
    referenceCache.set(imageUrl, sig);
    return sig;
  } catch {
    return null;
  }
}

export async function recognizeArtwork(
  source: HTMLCanvasElement | HTMLVideoElement
): Promise<RecognitionResult> {
  const capturedSig = extractSignature(source);

  const matches = await Promise.all(
    ARTWORKS.map(async (artwork) => {
      const refSig = await getReferenceSignature(artwork.imageUrl);
      const confidence = refSig
        ? compareSignatures(capturedSig, refSig)
        : Math.floor(Math.random() * 30) + 10;

      return { artwork, confidence };
    })
  );

  matches.sort((a, b) => b.confidence - a.confidence);

  const best = matches[0];
  const bestMatch =
    best && best.confidence >= 25 ? best : null;

  return {
    matches: matches.slice(0, 3),
    bestMatch,
  };
}

export function simulateRecognitionDelay(): Promise<void> {
  return new Promise((resolve) =>
    setTimeout(resolve, 1800 + Math.random() * 700)
  );
}
