import { Image } from "expo-image";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { fetchArtworks } from "@/lib/artworks";
import { colors, fonts } from "@/constants/theme";
import type { Artwork } from "@/types";

export default function DemoScreen() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchArtworks()
      .then(setArtworks)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
    >
      <Text style={styles.intro}>
        Display an artwork on another screen, then capture it with Scan.
      </Text>

      {artworks.map((artwork) => (
        <View key={artwork.id} style={styles.card}>
          <Image
            source={{ uri: artwork.imageUrl }}
            style={styles.image}
            contentFit="cover"
          />
          <View style={styles.row}>
            <View style={styles.meta}>
              <Text style={styles.title}>{artwork.title}</Text>
              <Text style={styles.artist}>{artwork.artist}</Text>
            </View>
            <Link href={`/artwork/${artwork.id}`} asChild>
              <Pressable style={styles.viewBtn}>
                <Text style={styles.viewBtnText}>View</Text>
              </Pressable>
            </Link>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.canvas },
  content: { padding: 16, gap: 16, paddingBottom: 32 },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.canvas,
    padding: 24,
  },
  error: { fontSize: 14, color: colors.stone, textAlign: "center" },
  intro: { fontSize: 14, color: colors.stone, lineHeight: 21 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.mist,
    overflow: "hidden",
  },
  image: { width: "100%", aspectRatio: 16 / 9 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  meta: { flex: 1, marginRight: 12 },
  title: { fontFamily: fonts.display, fontSize: 16, color: colors.ink },
  artist: { fontSize: 13, color: colors.stone, marginTop: 2 },
  viewBtn: {
    borderWidth: 1,
    borderColor: colors.mist,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  viewBtnText: { fontSize: 12, color: colors.stone, fontWeight: "500" },
});
