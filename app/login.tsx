import { useAuth } from "@/contexts/AuthContext";
import { signInWithOAuth } from "@/lib/oauth";
import { colors, fonts } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
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
  const [loading, setLoading] = useState<"google" | "apple" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session) router.replace("/");
  }, [session, router]);

  const handleSignIn = async (provider: "google" | "apple") => {
    setError(null);
    setLoading(provider);
    try {
      const newSession = await signInWithOAuth(provider);
      if (newSession) {
        router.replace("/");
      } else {
        setError("Sign in cancelled");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign in failed";
      setError(msg);
      Alert.alert("Sign in failed", msg);
    } finally {
      setLoading(null);
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top + 48,
          paddingBottom: insets.bottom + 24,
        },
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
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
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
          <Ionicons name={icon} size={20} color={dark ? "#fff" : colors.ink} />
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
  hero: { flex: 1, justifyContent: "center" },
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
  },
  actions: { gap: 12 },
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
  oauthBtnDisabled: { opacity: 0.6 },
  oauthLabel: { fontSize: 15, fontWeight: "500", color: colors.ink },
  oauthLabelDark: { color: "#fff" },
  errorBox: {
    backgroundColor: colors.accentMuted,
    borderRadius: 8,
    padding: 12,
    marginTop: 4,
  },
  errorText: {
    fontSize: 13,
    color: colors.ink,
    textAlign: "center",
    lineHeight: 18,
  },
});
