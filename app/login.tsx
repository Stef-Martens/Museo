import { useAuth } from "@/contexts/AuthContext";
import { getOAuthRedirectUri, signInWithOAuth } from "@/lib/oauth";
import { colors, fonts } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session } = useAuth();
  const [loading, setLoading] = useState<"google" | "apple" | "github" | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session) router.replace("/");
  }, [session, router]);

  const handleSignIn = async (provider: "google" | "apple" | "github") => {
    setError(null);
    setLoading(provider);
    try {
      const newSession = await signInWithOAuth(provider);
      if (newSession) router.replace("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign in failed");
    } finally {
      setLoading(null);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
      ]}
    >
      <View style={styles.hero}>
        <Text style={styles.brand}>Museo</Text>
        <Text style={styles.tagline}>
          Discover art. Build your collection. Explore the world.
        </Text>
      </View>

      <View style={styles.actions}>
        <OAuthButton
          label="Continue with Google"
          icon="logo-google"
          onPress={() => handleSignIn("google")}
          loading={loading === "google"}
          disabled={loading !== null}
        />

        <OAuthButton
          label="Continue with Apple"
          icon="logo-apple"
          onPress={() => handleSignIn("apple")}
          loading={loading === "apple"}
          disabled={loading !== null}
          dark
        />

        <OAuthButton
          label="Continue with GitHub"
          icon="logo-github"
          onPress={() => handleSignIn("github")}
          loading={loading === "github"}
          disabled={loading !== null}
        />

        {error && <Text style={styles.error}>{error}</Text>}
      </View>

      <Text style={styles.footer}>
        By continuing, you agree to our terms of service.
      </Text>

      <View style={styles.redirectBox}>
        <Text style={styles.redirectLabel}>
          Add to Supabase → Authentication → Redirect URLs:
        </Text>
        <Text style={styles.redirectUri} selectable>
          {getOAuthRedirectUri()}
        </Text>
        <Text style={styles.redirectHint}>
          Or use wildcard: exp://**
        </Text>
        {getOAuthRedirectUri().includes("127.0.0.1") && (
          <Text style={styles.redirectWarn}>
            This URL uses 127.0.0.1 — won't work on a physical phone. Run{" "}
            `npx expo start` (LAN mode) with phone on same Wi‑Fi.
          </Text>
        )}
      </View>
    </View>
  );
}

function OAuthButton({
  label,
  icon,
  onPress,
  loading,
  disabled,
  dark = false,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  loading: boolean;
  disabled: boolean;
  dark?: boolean;
}) {
  return (
    <Pressable
      style={[
        styles.oauthBtn,
        dark && styles.oauthBtnDark,
        disabled && styles.oauthBtnDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      {loading ? (
        <ActivityIndicator color={dark ? "#fff" : colors.ink} />
      ) : (
        <>
          <Ionicons
            name={icon}
            size={20}
            color={dark ? "#fff" : colors.ink}
          />
          <Text style={[styles.oauthLabel, dark && styles.oauthLabelDark]}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
  hero: {
    flex: 1,
    justifyContent: "center",
  },
  brand: {
    fontFamily: fonts.display,
    fontSize: 48,
    color: colors.ink,
  },
  tagline: {
    fontSize: 16,
    lineHeight: 24,
    color: colors.stone,
    marginTop: 12,
    maxWidth: 280,
  },
  actions: {
    gap: 12,
  },
  oauthBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.mist,
    borderRadius: 8,
    paddingVertical: 14,
    minHeight: 52,
  },
  oauthBtnDark: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  oauthBtnDisabled: {
    opacity: 0.6,
  },
  oauthLabel: {
    fontSize: 15,
    fontWeight: "500",
    color: colors.ink,
  },
  oauthLabelDark: {
    color: "#fff",
  },
  error: {
    fontSize: 13,
    color: colors.accent,
    textAlign: "center",
    marginTop: 4,
  },
  footer: {
    fontSize: 12,
    color: colors.stone,
    textAlign: "center",
    marginTop: 24,
    opacity: 0.7,
  },
  redirectBox: {
    marginTop: 20,
    padding: 12,
    backgroundColor: colors.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.mist,
  },
  redirectLabel: {
    fontSize: 11,
    color: colors.stone,
    marginBottom: 6,
  },
  redirectUri: {
    fontSize: 11,
    color: colors.ink,
    fontFamily: "Menlo",
  },
  redirectHint: {
    fontSize: 11,
    color: colors.stone,
    marginTop: 8,
  },
  redirectWarn: {
    fontSize: 11,
    color: colors.accent,
    marginTop: 8,
    lineHeight: 16,
  },
});
