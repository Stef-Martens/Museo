import { Tabs } from "expo-router";
import { colors } from "@/constants/theme";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.ink,
        headerTitleStyle: { fontFamily: "Georgia" },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.mist,
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.stone,
        tabBarLabelStyle: { fontSize: 11, fontWeight: "500" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: "Discover", headerShown: false }}
      />
      <Tabs.Screen name="collection" options={{ title: "Collection" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
