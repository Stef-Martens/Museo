import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import ArtworkCard from "@/components/ArtworkCard";
import { colors, fonts } from "@/constants/theme";
import { getCollection } from "@/lib/storage";
import type { UserCollection } from "@/types";

export default function CollectionScreen() {
  const [collection, setCollection] = useState<UserCollection | null>(null);

  useFocusEffect(
    useCallback(() => {
      getCollection().then(setCollection);
    }, [])
  );

  const artworks = collection?.artworks ?? [];
  const scannedAt = collection?.scannedAt ?? {};

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>
        {artworks.length} work{artworks.length !== 1 ? "s" : ""} discovered
      </Text>

      {artworks.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Nothing here yet</Text>
          <Text style={styles.emptyText}>
            Use Discover to identify an artwork and it will appear here.
          </Text>
        </View>
      ) : (
        <View style={styles.grid}>
          {artworks.map((artwork) => (
            <View key={artwork.id} style={styles.gridItem}>
              <ArtworkCard
                artwork={artwork}
                scannedAt={scannedAt[artwork.id]}
              />
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
    padding: 16,
  },
  subtitle: {
    fontSize: 14,
    color: colors.stone,
    marginBottom: 16,
  },
  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontFamily: fonts.display,
    fontSize: 18,
    color: colors.ink,
  },
  emptyText: {
    fontSize: 14,
    color: colors.stone,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 21,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  gridItem: {
    width: "47%",
  },
});
