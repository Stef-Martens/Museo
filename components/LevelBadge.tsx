import { StyleSheet, Text, View } from "react-native";
import { getLevelTitle, xpProgressInLevel } from "@/lib/gamification";
import { colors, fonts } from "@/constants/theme";

interface LevelBadgeProps {
  level: number;
  xp: number;
}

export default function LevelBadge({ level, xp }: LevelBadgeProps) {
  const progress = xpProgressInLevel(xp);
  const title = getLevelTitle(level);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.label}>LEVEL</Text>
          <Text style={styles.level}>{level}</Text>
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{level}</Text>
        </View>
      </View>
      <View style={styles.progressSection}>
        <View style={styles.progressLabels}>
          <Text style={styles.progressText}>{progress.current} xp</Text>
          <Text style={styles.progressText}>
            {progress.needed - progress.current} to next
          </Text>
        </View>
        <View style={styles.track}>
          <View
            style={[styles.fill, { width: `${progress.percent}%` }]}
          />
        </View>
        <Text style={styles.total}>{xp} xp total</Text>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  label: {
    fontSize: 11,
    letterSpacing: 2,
    color: colors.stone,
    fontWeight: "500",
  },
  level: {
    fontFamily: fonts.display,
    fontSize: 36,
    color: colors.ink,
    marginTop: 4,
  },
  title: {
    fontSize: 14,
    color: colors.stone,
  },
  badge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.mist,
    backgroundColor: colors.canvas,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: {
    fontFamily: fonts.display,
    fontSize: 20,
    color: colors.ink,
  },
  progressSection: {
    marginTop: 20,
  },
  progressLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressText: {
    fontSize: 11,
    color: colors.stone,
  },
  track: {
    height: 4,
    backgroundColor: colors.mist,
    borderRadius: 2,
    marginTop: 8,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    backgroundColor: colors.accent,
    borderRadius: 2,
  },
  total: {
    fontSize: 11,
    color: colors.stone,
    textAlign: "right",
    marginTop: 8,
    opacity: 0.6,
  },
});
