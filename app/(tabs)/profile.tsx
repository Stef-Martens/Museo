import { useAuth } from "@/contexts/AuthContext";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import BadgePanel from "@/components/BadgePanel";
import LevelBadge from "@/components/LevelBadge";
import { colors, fonts } from "@/constants/theme";
import { getCollection } from "@/lib/storage";
import type { UserCollection } from "@/types";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const [collection, setCollection] = useState<UserCollection | null>(null);

  useFocusEffect(
    useCallback(() => {
      getCollection().then(setCollection);
    }, [])
  );

  if (!collection) return null;

  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>M</Text>
        </View>
        <Text style={styles.name}>Your profile</Text>
        {user?.email && (
          <Text style={styles.email}>{user.email}</Text>
        )}
        <Text style={styles.stats}>
          {collection.artworks.length} discoveries · {collection.badges.length}{" "}
          badges
        </Text>
      </View>

      <LevelBadge level={collection.level} xp={collection.xp} />
      <BadgePanel earnedBadges={collection.badges} />

      <Pressable style={styles.signOutBtn} onPress={signOut}>
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    padding: 16,
    gap: 16,
    paddingBottom: 32,
  },
  header: {
    alignItems: "center",
    paddingBottom: 8,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: colors.mist,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarText: {
    fontFamily: fonts.display,
    fontSize: 24,
    color: colors.ink,
  },
  name: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.ink,
  },
  email: {
    fontSize: 13,
    color: colors.stone,
    marginTop: 4,
  },
  stats: {
    fontSize: 14,
    color: colors.stone,
    marginTop: 4,
  },
  signOutBtn: {
    borderWidth: 1,
    borderColor: colors.mist,
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.stone,
  },
});
