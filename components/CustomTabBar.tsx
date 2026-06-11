import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/constants/theme";

type TabIcon = keyof typeof Ionicons.glyphMap;

const TABS: Record<
  string,
  { label: string; icon: TabIcon; activeIcon: TabIcon }
> = {
  index: { label: "Home", icon: "home-outline", activeIcon: "home" },
  map: { label: "Map", icon: "globe-outline", activeIcon: "globe" },
  scan: { label: "Scan", icon: "scan-outline", activeIcon: "scan" },
  collection: { label: "Collection", icon: "grid-outline", activeIcon: "grid" },
  profile: { label: "Profile", icon: "person-outline", activeIcon: "person" },
};

export default function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        const isScan = route.name === "scan";
        const tab = TABS[route.name];

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        if (isScan) {
          return (
            <Pressable key={route.key} onPress={onPress} style={styles.scanSlot}>
              <View style={[styles.scanBtn, isFocused && styles.scanBtnActive]}>
                <Ionicons name="scan" size={26} color="#fff" />
              </View>
            </Pressable>
          );
        }

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={styles.tab}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
          >
            <Ionicons
              name={isFocused ? tab.activeIcon : tab.icon}
              size={22}
              color={isFocused ? colors.accent : colors.stone}
            />
            <Text style={[styles.label, isFocused && styles.labelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.mist,
    paddingTop: 8,
    paddingHorizontal: 4,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    gap: 2,
    paddingVertical: 4,
  },
  label: {
    fontSize: 10,
    fontWeight: "500",
    color: colors.stone,
  },
  labelActive: {
    color: colors.accent,
  },
  scanSlot: {
    flex: 1,
    alignItems: "center",
    marginTop: -20,
  },
  scanBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  scanBtnActive: {
    transform: [{ scale: 1.05 }],
  },
});
