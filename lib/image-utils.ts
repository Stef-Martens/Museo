import type { CameraView } from "expo-camera";
import * as FileSystem from "expo-file-system/legacy";

export interface CameraFrame {
  base64: string;
  uri: string;
}

export async function imageUriToBase64(uri: string): Promise<string> {
  return FileSystem.readAsStringAsync(uri, { encoding: "base64" });
}

export async function captureCameraFrame(
  camera: CameraView
): Promise<CameraFrame> {
  const frame = await camera.takePictureAsync({
    quality: 0.8,
    base64: true,
    shutterSound: false,
  });

  if (!frame.uri) {
    throw new Error("Could not read captured frame");
  }

  const base64 = frame.base64 ?? (await imageUriToBase64(frame.uri));
  return { base64, uri: frame.uri };
}

/** @deprecated Use captureCameraFrame */
export async function captureCameraFrameBase64(
  camera: CameraView
): Promise<string> {
  const frame = await captureCameraFrame(camera);
  return frame.base64;
}
