import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

WebBrowser.maybeCompleteAuthSession();

export type OAuthProvider = "google" | "apple" | "github";

/**
 * Use expo-linking so Expo Go gets exp://LAN-IP:8081/--/auth/callback
 * and production builds get museo://auth/callback.
 */
export function getOAuthRedirectUri(): string {
  return Linking.createURL("/auth/callback");
}

export async function createSessionFromUrl(
  url: string
): Promise<Session | null> {
  const { params, errorCode } = QueryParams.getQueryParams(url);

  if (errorCode) throw new Error(errorCode);
  if (params.error_description) throw new Error(params.error_description);
  if (params.error) throw new Error(params.error);

  if (params.code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(
      params.code
    );
    if (error) throw error;
    return data.session;
  }

  const { access_token, refresh_token } = params;

  if (!access_token) return null;

  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });

  if (error) throw error;
  return data.session;
}

export async function signInWithOAuth(
  provider: OAuthProvider
): Promise<Session | null> {
  const redirectTo = getOAuthRedirectUri();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) throw error;
  if (!data.url) throw new Error("No OAuth URL returned");

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo, {
    showInRecents: true,
  });

  if (result.type === "success") {
    return createSessionFromUrl(result.url);
  }

  if (result.type === "cancel") {
    return null;
  }

  throw new Error("Sign in was dismissed or failed");
}
