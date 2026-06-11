import { makeRedirectUri } from "expo-auth-session";
import * as QueryParams from "expo-auth-session/build/QueryParams";
import * as WebBrowser from "expo-web-browser";
import { authLog } from "@/lib/auth-debug";
import { supabase } from "@/lib/supabase";
import type { Session } from "@supabase/supabase-js";

WebBrowser.maybeCompleteAuthSession();

export type OAuthProvider = "google" | "apple";

/** True when URL carries OAuth tokens/code (not the bare Expo Go launch link). */
export function isOAuthCallbackUrl(url: string): boolean {
  try {
    const { params, errorCode } = QueryParams.getQueryParams(url);
    if (errorCode || params.error || params.error_description) return true;
    return Boolean(params.code || params.access_token);
  } catch {
    return false;
  }
}

export function getOAuthRedirectUri(): string {
  return makeRedirectUri({ path: "auth/callback" });
}

function logOAuthStartUrl(oauthUrl: string, redirectTo: string): void {
  try {
    const parsed = new URL(oauthUrl);
    const redirectParam = parsed.searchParams.get("redirect_to");
    authLog(`Supabase redirect_to: ${redirectParam ?? "(missing)"}`);
    if (redirectParam && redirectParam !== redirectTo) {
      authLog("WARNING: redirect_to does not match app redirect URI");
    }
    if (redirectParam?.startsWith("museo://")) {
      authLog(
        "WARNING: Supabase is using museo:// — change Site URL in Supabase to your exp:// URI for Expo Go"
      );
    }
  } catch {
    authLog("Could not parse Supabase OAuth URL");
  }
}

export async function createSessionFromUrl(
  url: string
): Promise<Session | null> {
  authLog(`Callback URL: ${url}`);

  const { params, errorCode } = QueryParams.getQueryParams(url);
  authLog(`Params: ${JSON.stringify(params)}`);

  if (errorCode) throw new Error(errorCode);
  if (params.error_description) throw new Error(String(params.error_description));
  if (params.error) throw new Error(String(params.error));

  if (params.code) {
    authLog("Exchanging code for session…");
    const { data, error } = await supabase.auth.exchangeCodeForSession(
      params.code
    );
    if (error) {
      authLog(`Exchange error: ${error.message}`);
      throw error;
    }
    authLog("Session created via code exchange");
    return data.session;
  }

  const { access_token, refresh_token } = params;

  if (!access_token) {
    authLog("No code or access_token in callback");
    return null;
  }

  const { data, error } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });

  if (error) {
    authLog(`setSession error: ${error.message}`);
    throw error;
  }

  authLog("Session created via tokens");
  return data.session;
}

export async function signInWithOAuth(
  provider: OAuthProvider
): Promise<Session | null> {
  const redirectTo = getOAuthRedirectUri();
  authLog(`Starting ${provider} sign-in`);
  authLog(`Redirect URI: ${redirectTo}`);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    authLog(`Supabase OAuth error: ${error.message}`);
    throw error;
  }
  if (!data.url) throw new Error("No OAuth URL returned");

  logOAuthStartUrl(data.url, redirectTo);
  authLog("Opening browser…");
  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo, {
    showInRecents: true,
  });

  authLog(`Browser result: ${result.type}`);

  if (result.type === "success") {
    authLog(`Success URL: ${result.url}`);
    return createSessionFromUrl(result.url);
  }

  if (result.type === "cancel") {
    authLog("User cancelled sign-in");
    return null;
  }

  if (result.type === "dismiss") {
    authLog("Browser dismissed");
    return null;
  }

  throw new Error(`Browser returned: ${result.type}`);
}
