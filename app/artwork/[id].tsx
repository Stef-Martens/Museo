import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import ArtworkChat from "@/components/ArtworkChat";
import { getArtworkById } from "@/lib/artworks";
import { periodLabel } from "@/lib/gamification";
import {
  addToCollection,
  getCollection,
  isInCollection,
} from "@/lib/storage";
import { colors, fonts } from "@/constants/theme";
import type { Artwork } from "@/types";

export default function ArtworkDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [scannedAt, setScannedAt] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getArtworkById(id)
      .then((data) => {
        setArtwork(data);
        if (!data) return;
        return Promise.all([
          isInCollection(data.id),
          getCollection(),
        ]).then(([owned, collection]) => {
          setSaved(owned);
          setScannedAt(collection.scannedAt[data.id] ?? null);
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (!artwork) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Artwork not found</Text>
      </View>
    );
  }

  const handleSave = async () => {
    if (saved) return;
    await addToCollection(artwork);
    setSaved(true);
    setScannedAt(new Date().toISOString());
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
      <Image
        source={{ uri: artwork.imageUrl }}
        style={styles.hero}
        contentFit="cover"
      />
      <View style={styles.body}>
        <Text style={styles.period}>{periodLabel(artwork.period)}</Text>
        <Text style={styles.title}>{artwork.title}</Text>
        <Text style={styles.artist}>
          {artwork.artist} · {artwork.year}
        </Text>
        {artwork.museum && (
          <Text style={styles.museum}>{artwork.museum}</Text>
        )}
        <Text style={styles.museum}>
          {artwork.location.city}, {artwork.location.country}
        </Text>
        {scannedAt && (
          <Text style={styles.date}>
            Discovered {new Date(scannedAt).toLocaleDateString()}
          </Text>
        )}

        <Text style={styles.description}>{artwork.description}</Text>

        <Text style={styles.sectionLabel}>WHY IT MATTERS</Text>
        <Text style={styles.description}>{artwork.whyItMatters}</Text>

        <ArtworkChat artwork={artwork} />

        {!saved ? (
          <Pressable style={styles.primaryBtn} onPress={handleSave}>
            <Text style={styles.primaryBtnText}>Add to collection</Text>
          </Pressable>
        ) : (
          <Text style={styles.saved}>In your collection</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingBottom: 32 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.canvas,
  },
  hero: { width: "100%", aspectRatio: 4 / 3 },
  body: { padding: 16, gap: 8 },
  period: {
    fontSize: 11,
    color: colors.sage,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    overflow: "hidden",
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.ink,
    marginTop: 4,
  },
  artist: { fontSize: 15, color: colors.stone },
  museum: { fontSize: 13, color: colors.stone },
  date: { fontSize: 11, color: colors.stone, opacity: 0.6 },
  description: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.stone,
    marginTop: 8,
  },
  sectionLabel: {
    fontSize: 11,
    letterSpacing: 2,
    color: colors.stone,
    fontWeight: "500",
    marginTop: 12,
  },
  primaryBtn: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },
  primaryBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  saved: {
    textAlign: "center",
    color: colors.sage,
    fontSize: 14,
    marginTop: 16,
  },
});
