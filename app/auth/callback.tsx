import { authLog } from "@/lib/auth-debug";
import { createSessionFromUrl, isOAuthCallbackUrl } from "@/lib/oauth";
import { colors } from "@/constants/theme";
import { useRouter } from "expo-router";
import * as Linking from "expo-linking";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function AuthCallbackScreen() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const finish = async () => {
      try {
        authLog("Auth callback screen opened");
        const url = await Linking.getInitialURL();
        if (!url || !isOAuthCallbackUrl(url)) {
          authLog("Callback: waiting for OAuth deep link…");
          setError("No OAuth callback received. Try signing in again.");
          return;
        }
        const session = await createSessionFromUrl(url);
        if (session) {
          router.replace("/");
        } else {
          setError("Could not complete sign in");
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Sign in failed";
        authLog(`Callback error: ${msg}`);
        setError(msg);
      }
    };

    finish();
  }, [router]);

  return (
    <View style={styles.container}>
      {error ? (
        <>
          <Text style={styles.error}>{error}</Text>
          <Text style={styles.link} onPress={() => router.replace("/login")}>
            Back to login
          </Text>
        </>
      ) : (
        <>
          <ActivityIndicator color={colors.accent} size="large" />
          <Text style={styles.text}>Signing you in…</Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.canvas,
    padding: 24,
    gap: 16,
  },
  text: { fontSize: 14, color: colors.stone },
  error: { fontSize: 14, color: colors.accent, textAlign: "center" },
  link: { fontSize: 14, color: colors.stone, textDecorationLine: "underline" },
});
