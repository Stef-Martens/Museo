import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { useIsFocused } from "@react-navigation/native";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import ArtworkCard from "@/components/ArtworkCard";
import ArtworkChat from "@/components/ArtworkChat";
import { colors, fonts } from "@/constants/theme";
import { captureCameraFrame } from "@/lib/image-utils";
import { scanLog } from "@/lib/scan-debug";
import {
  RECOGNITION_CONFIDENCE_THRESHOLD,
  recognizeArtwork,
} from "@/lib/recognition";
import {
  addToCollection,
  getCollection,
  getNewlyEarnedBadges,
  isInCollection,
} from "@/lib/storage";
import type { RecognitionResult } from "@/types";

const CAMERA_WARMUP_MS = 1500;
const SCAN_COOLDOWN_MS = 4000;
const SCAN_TIMEOUT_MS = 45000;

type ScreenMode = "scanning" | "result";

function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`${label} timed out. Try again.`)),
      ms
    );
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

export default function ScanScreen() {
  const cameraRef = useRef<CameraView>(null);
  const scanLockRef = useRef(false);
  const scanLineAnim = useRef(new Animated.Value(0)).current;
  const isFocused = useIsFocused();
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraReady, setCameraReady] = useState(false);
  const [mode, setMode] = useState<ScreenMode>("scanning");
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [xpGained, setXpGained] = useState(0);
  const [newBadges, setNewBadges] = useState<string[]>([]);

  useEffect(() => {
    if (!isFocused) setCameraReady(false);
  }, [isFocused]);

  useEffect(() => {
    if (mode !== "scanning") return;

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scanLineAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(scanLineAnim, {
          toValue: 0,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [mode, scanLineAnim]);

  useEffect(() => {
    if (mode !== "scanning" || !cameraReady || !isFocused) return;

    let cancelled = false;

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => setTimeout(resolve, ms));

    const scanLoop = async () => {
      scanLog("Scan loop started");
      await sleep(CAMERA_WARMUP_MS);
      let captureFailures = 0;
      let attempt = 0;

      while (!cancelled) {
        const camera = cameraRef.current;
        if (!camera) {
          await sleep(400);
          continue;
        }

        attempt += 1;
        scanLockRef.current = true;
        scanLog(`Attempt ${attempt}: capturing frame…`);

        try {
          const frame = await withTimeout(
            captureCameraFrame(camera),
            15000,
            "Camera capture"
          );

          if (cancelled) break;

          captureFailures = 0;
          setScanError(null);
          scanLog(`Attempt ${attempt}: frame captured, calling AI…`);

          const recognitionResult = await withTimeout(
            recognizeArtwork(frame.base64, frame.uri),
            SCAN_TIMEOUT_MS,
            "Recognition"
          );
          if (cancelled) break;

          const match = recognitionResult.bestMatch;

          if (
            match &&
            match.confidence >= RECOGNITION_CONFIDENCE_THRESHOLD
          ) {
            scanLog(
              `Match accepted: ${match.artwork.title} (${match.confidence}%)`
            );
            const owned = await isInCollection(match.artwork.id);
            setSaved(owned);
            setResult(recognitionResult);
            setMode("result");
            await Haptics.notificationAsync(
              Haptics.NotificationFeedbackType.Success
            );
            break;
          }

          if (match) {
            scanLog(
              `Below threshold: ${match.artwork.title} ${match.confidence}% (need ${RECOGNITION_CONFIDENCE_THRESHOLD}%+)`
            );
          } else {
            scanLog("No match this attempt — retrying…");
          }
        } catch (err) {
          if (!cancelled) {
            const msg =
              err instanceof Error ? err.message : "Recognition failed";
            scanLog(`Attempt ${attempt} failed: ${msg}`);
            const isCaptureError =
              msg.toLowerCase().includes("capture") ||
              msg.toLowerCase().includes("camera");
            if (isCaptureError) {
              captureFailures += 1;
              if (captureFailures >= 2) setScanError(msg);
            } else {
              setScanError(msg);
            }
          }
        } finally {
          scanLockRef.current = false;
        }

        if (!cancelled) {
          scanLog(`Waiting ${SCAN_COOLDOWN_MS / 1000}s before next attempt…`);
          await sleep(SCAN_COOLDOWN_MS);
        }
      }

      scanLog("Scan loop stopped");
    };

    scanLoop();

    return () => {
      cancelled = true;
      scanLockRef.current = false;
    };
  }, [mode, cameraReady, isFocused]);

  const reset = () => {
    setMode("scanning");
    setResult(null);
    setSaved(false);
    setXpGained(0);
    setNewBadges([]);
    setScanError(null);
  };

  const handleSave = async () => {
    if (!result?.bestMatch || saved) return;
    const before = await getCollection();
    const after = await addToCollection(result.bestMatch.artwork);
    const earned = getNewlyEarnedBadges(before.badges, after.badges);
    setXpGained(after.xp - before.xp);
    setNewBadges(earned.map((b) => b.name));
    setSaved(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={[styles.centered, styles.permission]}>
        <Text style={styles.permissionTitle}>Camera access needed</Text>
        <Text style={styles.permissionText}>
          Museo uses your camera to identify artworks.
        </Text>
        <Pressable style={styles.primaryBtn} onPress={requestPermission}>
          <Text style={styles.primaryBtnText}>Allow camera</Text>
        </Pressable>
      </View>
    );
  }

  if (mode === "result" && result) {
    const { bestMatch, matches } = result;
    return (
      <ScrollView
        style={styles.resultScroll}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        <View style={styles.resultBody}>
          {bestMatch ? (
            <>
              <Text style={styles.identifiedLabel}>IDENTIFIED</Text>
              <Text style={styles.resultTitle}>{bestMatch.artwork.title}</Text>
              <Text style={styles.resultArtist}>{bestMatch.artwork.artist}</Text>
              <Text style={styles.confidencePill}>
                {bestMatch.confidence}% confidence
              </Text>

              <View style={styles.detailCard}>
                <View style={styles.artworkImageWrap}>
                  {bestMatch.artwork.imageUrl ? (
                    <Image
                      source={{ uri: bestMatch.artwork.imageUrl }}
                      style={StyleSheet.absoluteFill}
                      contentFit="cover"
                      onError={() =>
                        scanLog(
                          `Image failed to load: ${bestMatch.artwork.imageUrl.slice(0, 80)}`
                        )
                      }
                    />
                  ) : (
                    <View style={styles.artworkImageFallback}>
                      <Text style={styles.artworkImageFallbackText}>
                        No preview available
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.detailMeta}>
                  <Text style={styles.metaLine}>
                    {bestMatch.artwork.year}
                    {bestMatch.artwork.museum
                      ? ` · ${bestMatch.artwork.museum}`
                      : ""}
                  </Text>
                  <Text style={styles.description}>
                    {bestMatch.artwork.description}
                  </Text>
                  <Text style={styles.sectionLabel}>WHY IT MATTERS</Text>
                  <Text style={styles.description}>
                    {bestMatch.artwork.whyItMatters}
                  </Text>
                </View>
              </View>

              <ArtworkChat artwork={bestMatch.artwork} />

              <Pressable
                style={[styles.primaryBtn, saved && styles.savedBtn]}
                onPress={handleSave}
                disabled={saved}
              >
                <Text
                  style={[styles.primaryBtnText, saved && styles.savedBtnText]}
                >
                  {saved ? "Added to collection" : "Add to collection"}
                </Text>
              </Pressable>

              {xpGained > 0 && (
                <Text style={styles.xpText}>+{xpGained} experience</Text>
              )}
              {newBadges.map((name) => (
                <Text key={name} style={styles.badgeText}>
                  Badge earned: {name}
                </Text>
              ))}
            </>
          ) : (
            <View style={styles.noMatch}>
              <Text style={styles.resultTitle}>No match found</Text>
              <Text style={styles.description}>
                Move closer or improve lighting, then try again.
              </Text>
            </View>
          )}

          {matches.length > 1 && (
            <>
              <Text style={styles.sectionLabel}>SIMILAR WORKS</Text>
              <View style={styles.similarGrid}>
                {matches.slice(bestMatch ? 1 : 0, 3).map((m) => (
                  <View key={m.artwork.id} style={styles.similarItem}>
                    <ArtworkCard
                      artwork={m.artwork}
                      confidence={m.confidence}
                      compact
                    />
                  </View>
                ))}
              </View>
            </>
          )}

          <Pressable style={styles.secondaryBtn} onPress={reset}>
            <Text style={styles.secondaryBtnText}>Scan again</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  const scanLineTranslate = scanLineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "88%"],
  });

  const statusLabel = !cameraReady
    ? "Starting camera…"
    : "Identifying artwork…";

  return (
    <View style={styles.cameraScreen}>
      <CameraView
        ref={cameraRef}
        style={StyleSheet.absoluteFillObject}
        facing="back"
        animateShutter={false}
        onCameraReady={() => {
          scanLog("Camera ready");
          setCameraReady(true);
          setScanError(null);
        }}
        onMountError={({ message }) =>
          setScanError(message || "Camera failed to start")
        }
      />

      <View style={styles.overlay} pointerEvents="none">
        <View style={styles.frame}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
          <Animated.View
            style={[
              styles.scanLine,
              { transform: [{ translateY: scanLineTranslate }] },
            ]}
          />
        </View>

        <View style={styles.statusPill}>
          <ActivityIndicator color="#fff" size="small" />
          <Text style={styles.statusText}>{statusLabel}</Text>
        </View>
      </View>

      {scanError && (
        <View style={styles.errorOverlay}>
          <Text style={styles.scanError}>{scanError}</Text>
        </View>
      )}
    </View>
  );
}

const FRAME_SIZE = "78%";
const CORNER_SIZE = 22;
const CORNER_WIDTH = 2;

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.canvas,
    padding: 24,
  },
  permission: { gap: 12 },
  permissionTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.ink,
  },
  permissionText: {
    fontSize: 14,
    color: colors.stone,
    textAlign: "center",
  },
  cameraScreen: {
    flex: 1,
    backgroundColor: colors.charcoal,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  frame: {
    width: FRAME_SIZE,
    aspectRatio: 4 / 5,
    overflow: "hidden",
  },
  corner: {
    position: "absolute",
    width: CORNER_SIZE,
    height: CORNER_SIZE,
    borderColor: "rgba(255,255,255,0.85)",
  },
  cornerTL: {
    top: 0,
    left: 0,
    borderTopWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
  },
  cornerTR: {
    top: 0,
    right: 0,
    borderTopWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
  },
  cornerBL: {
    bottom: 0,
    left: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderLeftWidth: CORNER_WIDTH,
  },
  cornerBR: {
    bottom: 0,
    right: 0,
    borderBottomWidth: CORNER_WIDTH,
    borderRightWidth: CORNER_WIDTH,
  },
  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colors.accent,
    opacity: 0.85,
  },
  statusPill: {
    position: "absolute",
    bottom: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(44,44,44,0.75)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
  },
  statusText: { color: "#fff", fontSize: 14 },
  errorOverlay: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 100,
  },
  scanError: {
    color: "#fff",
    fontSize: 13,
    textAlign: "center",
    backgroundColor: "rgba(184,67,47,0.9)",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 8,
    overflow: "hidden",
  },
  resultScroll: { flex: 1, backgroundColor: colors.canvas },
  resultBody: { padding: 16, gap: 12 },
  identifiedLabel: {
    fontSize: 11,
    letterSpacing: 2,
    color: colors.stone,
    textAlign: "center",
  },
  resultTitle: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.ink,
    textAlign: "center",
  },
  resultArtist: { fontSize: 15, color: colors.stone, textAlign: "center" },
  confidencePill: {
    alignSelf: "center",
    backgroundColor: colors.accentMuted,
    color: colors.accent,
    fontSize: 12,
    fontWeight: "500",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    overflow: "hidden",
  },
  detailCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.mist,
    overflow: "hidden",
  },
  artworkImageWrap: {
    width: "100%",
    aspectRatio: 4 / 3,
    backgroundColor: colors.mist,
  },
  artworkImageFallback: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  artworkImageFallbackText: {
    fontSize: 13,
    color: colors.stone,
  },
  detailMeta: { padding: 16, gap: 8 },
  metaLine: { fontSize: 13, color: colors.stone },
  description: { fontSize: 14, lineHeight: 21, color: colors.stone },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 2,
    color: colors.stone,
    fontWeight: "500",
    marginTop: 8,
  },
  primaryBtn: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  primaryBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  savedBtn: {
    backgroundColor: "rgba(92,107,90,0.1)",
    borderWidth: 1,
    borderColor: "rgba(92,107,90,0.3)",
  },
  savedBtnText: { color: colors.sage },
  xpText: { textAlign: "center", color: colors.stone, fontSize: 13 },
  badgeText: {
    textAlign: "center",
    fontFamily: fonts.display,
    color: colors.ink,
    fontSize: 14,
  },
  noMatch: { alignItems: "center", paddingVertical: 32, gap: 8 },
  similarGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  similarItem: { width: "47%" },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: colors.mist,
    backgroundColor: colors.surface,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  secondaryBtnText: { color: colors.ink, fontSize: 14, fontWeight: "500" },
});
