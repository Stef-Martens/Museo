import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { colors } from "@/constants/theme";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: colors.surface },
          headerTintColor: colors.ink,
          headerTitleStyle: { fontFamily: "Georgia" },
          contentStyle: { backgroundColor: colors.canvas },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="artwork/[id]"
          options={{ title: "Artwork", headerBackTitle: "Back" }}
        />
        <Stack.Screen name="demo" options={{ title: "Demo works" }} />
      </Stack>
    </>
  );
}
