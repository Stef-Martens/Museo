import { Image } from "expo-image";
import { Link, useFocusEffect } from "expo-router";
import { useCallback, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors, fonts } from "@/constants/theme";
import { getCollection } from "@/lib/storage";
import type { Artwork, UserCollection } from "@/types";

const WORLD_REGION = {
  latitude: 25,
  longitude: 10,
  latitudeDelta: 120,
  longitudeDelta: 120,
};

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const [collection, setCollection] = useState<UserCollection | null>(null);
  const [selected, setSelected] = useState<Artwork | null>(null);

  useFocusEffect(
    useCallback(() => {
      getCollection().then(setCollection);
    }, [])
  );

  const markers = collection?.artworks ?? [];
  const scannedAt = collection?.scannedAt ?? {};

  const fitToMarkers = () => {
    if (markers.length === 0 || !mapRef.current) return;
    mapRef.current.fitToCoordinates(
      markers.map((a) => ({
        latitude: a.location.latitude,
        longitude: a.location.longitude,
      })),
      {
        edgePadding: { top: 100, right: 50, bottom: 150, left: 50 },
        animated: true,
      }
    );
  };

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View>
          <Text style={styles.title}>World map</Text>
          <Text style={styles.subtitle}>
            {markers.length === 0
              ? "Your discoveries will appear here"
              : `${markers.length} discovery${markers.length !== 1 ? "ies" : ""} on the map`}
          </Text>
        </View>
        {markers.length > 0 && (
          <Pressable style={styles.fitBtn} onPress={fitToMarkers}>
            <Text style={styles.fitBtnText}>Fit all</Text>
          </Pressable>
        )}
      </View>

      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_DEFAULT}
        initialRegion={WORLD_REGION}
        mapType={Platform.OS === "ios" ? "hybrid" : "standard"}
        showsUserLocation={false}
        onPress={() => setSelected(null)}
      >
        {markers.map((artwork) => (
          <Marker
            key={artwork.id}
            coordinate={{
              latitude: artwork.location.latitude,
              longitude: artwork.location.longitude,
            }}
            title={artwork.title}
            description={`${artwork.location.city} · ${artwork.museum}`}
            onPress={(e) => {
              e.stopPropagation();
              setSelected(artwork);
            }}
          >
            <View style={styles.marker}>
              <View style={styles.markerDot} />
            </View>
          </Marker>
        ))}
      </MapView>

      {markers.length === 0 && (
        <View style={styles.emptyOverlay}>
          <Text style={styles.emptyTitle}>Nothing on the map yet</Text>
          <Text style={styles.emptyText}>
            Scan artworks to pin them to museums around the world.
          </Text>
          <Link href="/scan" asChild>
            <Pressable style={styles.scanLink}>
              <Text style={styles.scanLinkText}>Go scan</Text>
            </Pressable>
          </Link>
        </View>
      )}

      {selected && (
        <View style={styles.card}>
          <Image
            source={{ uri: selected.imageUrl }}
            style={styles.cardImage}
            contentFit="cover"
          />
          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>{selected.title}</Text>
            <Text style={styles.cardArtist}>{selected.artist}</Text>
            <Text style={styles.cardLocation}>
              {selected.location.city}, {selected.location.country}
            </Text>
            {scannedAt[selected.id] && (
              <Text style={styles.cardDate}>
                Discovered{" "}
                {new Date(scannedAt[selected.id]).toLocaleDateString()}
              </Text>
            )}
            <Link href={`/artwork/${selected.id}`} asChild>
              <Pressable style={styles.cardBtn}>
                <Text style={styles.cardBtnText}>View details</Text>
              </Pressable>
            </Link>
          </View>
          <Pressable style={styles.closeBtn} onPress={() => setSelected(null)}>
            <Text style={styles.closeBtnText}>✕</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.canvas },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.mist,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.ink,
  },
  subtitle: {
    fontSize: 13,
    color: colors.stone,
    marginTop: 2,
  },
  fitBtn: {
    borderWidth: 1,
    borderColor: colors.mist,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  fitBtnText: {
    fontSize: 12,
    color: colors.stone,
    fontWeight: "500",
  },
  map: { flex: 1 },
  marker: {
    alignItems: "center",
    justifyContent: "center",
  },
  markerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: colors.accent,
    borderWidth: 2,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  emptyOverlay: {
    position: "absolute",
    bottom: 100,
    left: 16,
    right: 16,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.mist,
    padding: 20,
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
    marginTop: 6,
    lineHeight: 20,
  },
  scanLink: {
    marginTop: 14,
    backgroundColor: colors.accent,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  scanLinkText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  card: {
    position: "absolute",
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.mist,
    overflow: "hidden",
    flexDirection: "row",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 8,
  },
  cardImage: {
    width: 100,
    height: 120,
    backgroundColor: colors.mist,
  },
  cardBody: {
    flex: 1,
    padding: 12,
    justifyContent: "center",
  },
  cardTitle: {
    fontFamily: fonts.display,
    fontSize: 16,
    color: colors.ink,
  },
  cardArtist: {
    fontSize: 13,
    color: colors.stone,
    marginTop: 2,
  },
  cardLocation: {
    fontSize: 12,
    color: colors.sage,
    marginTop: 4,
  },
  cardDate: {
    fontSize: 11,
    color: colors.stone,
    opacity: 0.6,
    marginTop: 2,
  },
  cardBtn: {
    alignSelf: "flex-start",
    marginTop: 8,
    backgroundColor: colors.accentMuted,
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  cardBtnText: {
    fontSize: 12,
    color: colors.accent,
    fontWeight: "600",
  },
  closeBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnText: {
    fontSize: 14,
    color: colors.stone,
  },
});
