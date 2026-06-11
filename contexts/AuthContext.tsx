import { createSessionFromUrl, isOAuthCallbackUrl } from "@/lib/oauth";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { colors, fonts } from "@/constants/theme";
import type { Session, User } from "@supabase/supabase-js";
import * as Linking from "expo-linking";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [configError, setConfigError] = useState<string | null>(null);

  const handleDeepLink = useCallback(async (url: string) => {
    if (!isOAuthCallbackUrl(url)) return;
    try {
      const newSession = await createSessionFromUrl(url);
      if (newSession) setSession(newSession);
    } catch {
      // Ignore unrelated deep links
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setConfigError(
        "Missing Supabase config. Copy .env.example to .env and add your project URL and publishable key."
      );
      setIsLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });

    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink(url);
    });

    const linkSub = Linking.addEventListener("url", ({ url }) => {
      handleDeepLink(url);
    });

    return () => {
      subscription.unsubscribe();
      linkSub.remove();
    };
  }, [handleDeepLink]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setSession(null);
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      isLoading,
      signOut,
    }),
    [session, isLoading, signOut]
  );

  if (configError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Setup required</Text>
        <Text style={styles.message}>{configError}</Text>
        <Text style={styles.hint}>
          1. Create a project at supabase.com{"\n"}
          2. Run supabase/schema.sql in the SQL editor{"\n"}
          3. Enable Google & Apple under Authentication → Providers{"\n"}
          4. Add redirect URLs (see README){"\n"}
          5. Add keys to .env and restart Expo
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.accent} size="large" />
        <Text style={styles.loading}>Loading…</Text>
      </View>
    );
  }

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.canvas,
    padding: 32,
  },
  title: {
    fontFamily: fonts.display,
    fontSize: 22,
    color: colors.ink,
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    color: colors.stone,
    textAlign: "center",
    lineHeight: 21,
  },
  hint: {
    fontSize: 13,
    color: colors.stone,
    marginTop: 20,
    lineHeight: 22,
    textAlign: "left",
  },
  loading: {
    marginTop: 16,
    fontSize: 14,
    color: colors.stone,
  },
});
