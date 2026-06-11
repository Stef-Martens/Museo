import { Image } from "expo-image";
import { Link } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { periodLabel } from "@/lib/gamification";
import { colors, fonts } from "@/constants/theme";
import type { Artwork } from "@/types";

interface ArtworkCardProps {
  artwork: Artwork;
  confidence?: number;
  scannedAt?: string;
  compact?: boolean;
}

export default function ArtworkCard({
  artwork,
  confidence,
  scannedAt,
  compact = false,
}: ArtworkCardProps) {
  return (
    <Link href={`/artwork/${artwork.id}`} asChild>
      <Pressable style={styles.card}>
        <View style={[styles.imageWrap, compact && styles.imageWrapCompact]}>
          <Image
            source={{ uri: artwork.imageUrl }}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
          />
          {confidence !== undefined && (
            <View style={styles.confidence}>
              <Text style={styles.confidenceText}>{confidence}%</Text>
            </View>
          )}
        </View>
        <View style={styles.meta}>
          <Text style={styles.title} numberOfLines={1}>
            {artwork.title}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {artwork.artist}
          </Text>
          {!compact && (
            <Text style={styles.period}>{periodLabel(artwork.period)}</Text>
          )}
          {scannedAt && (
            <Text style={styles.date}>
              {new Date(scannedAt).toLocaleDateString()}
            </Text>
          )}
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.mist,
    overflow: "hidden",
  },
  imageWrap: {
    aspectRatio: 4 / 3,
    backgroundColor: colors.mist,
  },
  imageWrapCompact: {
    aspectRatio: 1,
  },
  confidence: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(44,44,44,0.75)",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  confidenceText: {
    color: "#fff",
    fontSize: 11,
  },
  meta: {
    padding: 12,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 14,
    color: colors.ink,
  },
  artist: {
    fontSize: 12,
    color: colors.stone,
    marginTop: 2,
  },
  period: {
    fontSize: 11,
    color: colors.sage,
    marginTop: 6,
  },
  date: {
    fontSize: 11,
    color: colors.stone,
    marginTop: 4,
    opacity: 0.6,
  },
});
