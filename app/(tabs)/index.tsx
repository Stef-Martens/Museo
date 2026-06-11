import { Image } from "expo-image";
import { Link, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts } from "@/constants/theme";
import { getLevelTitle } from "@/lib/gamification";
import { getCollection } from "@/lib/storage";
import type { Artwork, UserCollection } from "@/types";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function getRecentArtworks(
  collection: UserCollection
): { artwork: Artwork; scannedAt: string }[] {
  return collection.artworks
    .map((artwork) => ({
      artwork,
      scannedAt: collection.scannedAt[artwork.id] ?? "",
    }))
    .filter((item) => item.scannedAt)
    .sort(
      (a, b) =>
        new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime()
    )
    .slice(0, 5);
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const [collection, setCollection] = useState<UserCollection | null>(null);

  useFocusEffect(
    useCallback(() => {
      getCollection().then(setCollection);
    }, [])
  );

  const recent = collection ? getRecentArtworks(collection) : [];
  const levelTitle = collection
    ? getLevelTitle(collection.level)
    : "Art Novice";

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 16 },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>{getGreeting()}</Text>
        <Text style={styles.brand}>Museo</Text>
        <Text style={styles.subtitle}>Your art journal</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{collection?.level ?? 1}</Text>
          <Text style={styles.statLabel}>Level</Text>
          <Text style={styles.statMeta}>{levelTitle}</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>
            {collection?.artworks.length ?? 0}
          </Text>
          <Text style={styles.statLabel}>Discovered</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{collection?.badges.length ?? 0}</Text>
          <Text style={styles.statLabel}>Badges</Text>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent activity</Text>
          {recent.length > 0 && (
            <Link href="/collection" asChild>
              <Pressable>
                <Text style={styles.sectionLink}>See all</Text>
              </Pressable>
            </Link>
          )}
        </View>

        {recent.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No discoveries yet</Text>
            <Text style={styles.emptyText}>
              Tap the scan button below to identify your first artwork.
            </Text>
            <Link href="/scan" asChild>
              <Pressable style={styles.ctaBtn}>
                <Text style={styles.ctaBtnText}>Start scanning</Text>
              </Pressable>
            </Link>
          </View>
        ) : (
          recent.map(({ artwork, scannedAt }) => (
            <Link key={artwork.id} href={`/artwork/${artwork.id}`} asChild>
              <Pressable style={styles.activityRow}>
                <Image
                  source={{ uri: artwork.imageUrl }}
                  style={styles.thumb}
                  contentFit="cover"
                />
                <View style={styles.activityMeta}>
                  <Text style={styles.activityTitle} numberOfLines={1}>
                    {artwork.title}
                  </Text>
                  <Text style={styles.activitySub} numberOfLines={1}>
                    {artwork.location.city}, {artwork.location.country}
                  </Text>
                  <Text style={styles.activityDate}>
                    {new Date(scannedAt).toLocaleDateString(undefined, {
                      month: "short",
                      day: "numeric",
                    })}
                  </Text>
                </View>
              </Pressable>
            </Link>
          ))
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Explore</Text>
        <View style={styles.exploreRow}>
          <Link href="/map" asChild>
            <Pressable style={styles.exploreCard}>
              <Text style={styles.exploreEmoji}>🌍</Text>
              <Text style={styles.exploreLabel}>World map</Text>
              <Text style={styles.exploreSub}>See where you've been</Text>
            </Pressable>
          </Link>
          <Link href="/collection" asChild>
            <Pressable style={styles.exploreCard}>
              <Text style={styles.exploreEmoji}>🖼</Text>
              <Text style={styles.exploreLabel}>Collection</Text>
              <Text style={styles.exploreSub}>All your works</Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.canvas },
  content: { paddingHorizontal: 16, paddingBottom: 32 },
  header: { marginBottom: 24 },
  greeting: {
    fontSize: 14,
    color: colors.stone,
    marginBottom: 4,
  },
  brand: {
    fontFamily: fonts.display,
    fontSize: 32,
    color: colors.ink,
  },
  subtitle: {
    fontSize: 14,
    color: colors.stone,
    marginTop: 4,
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.mist,
    padding: 14,
  },
  statValue: {
    fontFamily: fonts.display,
    fontSize: 28,
    color: colors.ink,
  },
  statLabel: {
    fontSize: 11,
    letterSpacing: 1,
    color: colors.stone,
    marginTop: 2,
    textTransform: "uppercase",
  },
  statMeta: {
    fontSize: 11,
    color: colors.sage,
    marginTop: 4,
  },
  section: { marginBottom: 28 },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.ink,
  },
  sectionLink: {
    fontSize: 13,
    color: colors.accent,
    fontWeight: "500",
  },
  emptyCard: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.mist,
    padding: 24,
    alignItems: "center",
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
  ctaBtn: {
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 16,
  },
  ctaBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  activityRow: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.mist,
    marginBottom: 10,
    overflow: "hidden",
  },
  thumb: {
    width: 72,
    height: 72,
    backgroundColor: colors.mist,
  },
  activityMeta: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  activityTitle: {
    fontFamily: fonts.display,
    fontSize: 15,
    color: colors.ink,
  },
  activitySub: {
    fontSize: 12,
    color: colors.stone,
    marginTop: 2,
  },
  activityDate: {
    fontSize: 11,
    color: colors.stone,
    opacity: 0.6,
    marginTop: 4,
  },
  exploreRow: {
    flexDirection: "row",
    gap: 10,
  },
  exploreCard: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.mist,
    padding: 16,
  },
  exploreEmoji: { fontSize: 24, marginBottom: 8 },
  exploreLabel: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.ink,
  },
  exploreSub: {
    fontSize: 12,
    color: colors.stone,
    marginTop: 2,
  },
});
