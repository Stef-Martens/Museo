import { StyleSheet, Text, View } from "react-native";
import { ALL_BADGES } from "@/lib/gamification";
import { colors } from "@/constants/theme";
import type { Badge } from "@/types";

interface BadgePanelProps {
  earnedBadges: Badge[];
}

export default function BadgePanel({ earnedBadges }: BadgePanelProps) {
  const earnedIds = new Set(earnedBadges.map((b) => b.id));

  return (
    <View style={styles.card}>
      <Text style={styles.heading}>BADGES</Text>
      <View style={styles.grid}>
        {ALL_BADGES.map((badge) => {
          const earned = earnedIds.has(badge.id);
          const earnedBadge = earnedBadges.find((b) => b.id === badge.id);
          return (
            <View
              key={badge.id}
              style={[
                styles.badge,
                earned ? styles.badgeEarned : styles.badgeLocked,
              ]}
            >
              <Text style={styles.icon}>{badge.icon}</Text>
              <Text style={styles.name}>{badge.name}</Text>
              <Text style={styles.description}>{badge.description}</Text>
              {earnedBadge?.earnedAt && (
                <Text style={styles.date}>
                  {new Date(earnedBadge.earnedAt).toLocaleDateString()}
                </Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.mist,
    padding: 20,
  },
  heading: {
    fontSize: 11,
    letterSpacing: 2,
    color: colors.stone,
    fontWeight: "500",
    marginBottom: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  badge: {
    width: "47%",
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    alignItems: "center",
  },
  badgeEarned: {
    borderColor: "rgba(184,67,47,0.3)",
    backgroundColor: colors.accentMuted,
  },
  badgeLocked: {
    borderColor: colors.mist,
    backgroundColor: colors.canvas,
    opacity: 0.5,
  },
  icon: {
    fontSize: 22,
  },
  name: {
    fontSize: 12,
    fontWeight: "500",
    color: colors.ink,
    marginTop: 6,
    textAlign: "center",
  },
  description: {
    fontSize: 11,
    color: colors.stone,
    marginTop: 4,
    textAlign: "center",
  },
  date: {
    fontSize: 10,
    color: colors.stone,
    marginTop: 4,
    opacity: 0.6,
  },
});
