import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import AuthGate from "@/components/AuthGate";
import { AuthProvider } from "@/contexts/AuthContext";
import { colors } from "@/constants/theme";

export default function RootLayout() {
  return (
    <AuthProvider>
      <AuthGate>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.surface },
            headerTintColor: colors.ink,
            headerTitleStyle: { fontFamily: "Georgia" },
            contentStyle: { backgroundColor: colors.canvas },
          }}
        >
          <Stack.Screen name="login" options={{ headerShown: false }} />
          <Stack.Screen
            name="auth/callback"
            options={{ headerShown: false }}
          />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="artwork/[id]"
            options={{ title: "Artwork", headerBackTitle: "Back" }}
          />
        </Stack>
      </AuthGate>
    </AuthProvider>
  );
}
