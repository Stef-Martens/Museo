import { CameraView, useCameraPermissions } from "expo-camera";
import * as Haptics from "expo-haptics";
import { Image } from "expo-image";
import { Link } from "expo-router";
import { useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import ArtworkCard from "@/components/ArtworkCard";
import { colors, fonts } from "@/constants/theme";
import { recognizeArtwork, simulateRecognitionDelay } from "@/lib/recognition";
import {
  addToCollection,
  getCollection,
  getNewlyEarnedBadges,
  isInCollection,
} from "@/lib/storage";
import type { RecognitionResult } from "@/types";

type ScreenMode = "camera" | "scanning" | "result";

export default function ScanScreen() {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [mode, setMode] = useState<ScreenMode>("camera");
  const [result, setResult] = useState<RecognitionResult | null>(null);
  const [capturedUri, setCapturedUri] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [xpGained, setXpGained] = useState(0);
  const [newBadges, setNewBadges] = useState<string[]>([]);

  const capture = async () => {
    if (!cameraRef.current || mode === "scanning") return;

    const photo = await cameraRef.current.takePictureAsync({ quality: 0.7 });
    if (!photo?.uri) return;

    setCapturedUri(photo.uri);
    setMode("scanning");
    setResult(null);
    setSaved(false);
    setXpGained(0);
    setNewBadges([]);

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    const [recognitionResult] = await Promise.all([
      recognizeArtwork(photo.uri),
      simulateRecognitionDelay(),
    ]);

    if (recognitionResult.bestMatch) {
      const owned = await isInCollection(recognitionResult.bestMatch.artwork.id);
      setSaved(owned);
    }

    setResult(recognitionResult);
    setMode("result");
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  const reset = () => {
    setMode("camera");
    setResult(null);
    setCapturedUri(null);
    setSaved(false);
    setXpGained(0);
    setNewBadges([]);
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
        {capturedUri && (
          <Image source={{ uri: capturedUri }} style={styles.capturedPreview} />
        )}
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
                <Image
                  source={{ uri: bestMatch.artwork.imageUrl }}
                  style={styles.artworkImage}
                  contentFit="cover"
                />
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
            <Text style={styles.secondaryBtnText}>Scan another</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={styles.cameraScreen}>
      <View style={styles.topBar}>
        <Text style={styles.scanLabel}>Scan artwork</Text>
        <Link href="/demo" asChild>
          <Pressable style={styles.demoBtn}>
            <Text style={styles.demoBtnText}>Demo</Text>
          </Pressable>
        </Link>
      </View>

      <View style={styles.cameraWrap}>
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFillObject} facing="back" />
        <View style={styles.overlay}>
          <View style={styles.frame} />
          {mode === "scanning" && (
            <View style={styles.scanningPill}>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.scanningText}>Identifying artwork…</Text>
            </View>
          )}
          {mode === "camera" && (
            <Text style={styles.hint}>Frame the artwork, then capture</Text>
          )}
        </View>
      </View>

      <View style={styles.captureBar}>
        <Pressable
          style={styles.captureBtn}
          onPress={capture}
          disabled={mode === "scanning"}
        >
          <View
            style={[
              styles.captureInner,
              mode === "scanning" && styles.captureInnerScanning,
            ]}
          />
        </Pressable>
      </View>
    </View>
  );
}

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
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.mist,
  },
  scanLabel: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.ink,
  },
  demoBtn: {
    borderWidth: 1,
    borderColor: colors.mist,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  demoBtnText: {
    fontSize: 12,
    color: colors.stone,
    fontWeight: "500",
  },
  cameraWrap: { flex: 1, position: "relative" },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  frame: {
    width: "80%",
    aspectRatio: 4 / 5,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.5)",
  },
  hint: {
    position: "absolute",
    top: 40,
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
    backgroundColor: "rgba(44,44,44,0.5)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    overflow: "hidden",
  },
  scanningPill: {
    position: "absolute",
    bottom: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(44,44,44,0.8)",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
  },
  scanningText: { color: "#fff", fontSize: 14 },
  captureBar: {
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: colors.charcoal,
  },
  captureBtn: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  captureInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
  },
  captureInnerScanning: {
    backgroundColor: "rgba(255,255,255,0.3)",
  },
  resultScroll: { flex: 1, backgroundColor: colors.canvas },
  capturedPreview: { width: "100%", height: 160, opacity: 0.7 },
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
  artworkImage: { width: "100%", aspectRatio: 16 / 9 },
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
