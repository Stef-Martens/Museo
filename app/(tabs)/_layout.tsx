import { Tabs } from "expo-router";
import CustomTabBar from "@/components/CustomTabBar";
import { colors } from "@/constants/theme";

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.ink,
        headerTitleStyle: { fontFamily: "Georgia" },
      }}
    >
      <Tabs.Screen name="index" options={{ title: "Home", headerShown: false }} />
      <Tabs.Screen name="map" options={{ title: "Map", headerShown: false }} />
      <Tabs.Screen name="scan" options={{ title: "Scan", headerShown: false }} />
      <Tabs.Screen name="collection" options={{ title: "Collection" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
    </Tabs>
  );
}
