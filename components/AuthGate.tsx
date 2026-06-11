import { useAuth } from "@/contexts/AuthContext";
import { useRouter, useSegments } from "expo-router";
import { useEffect } from "react";

export default function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const onLogin = segments[0] === "login";
    const onAuthCallback =
      segments[0] === "auth" && segments[1] === "callback";

    if (!session && !onLogin && !onAuthCallback) {
      router.replace("/login");
    } else if (session && onLogin) {
      router.replace("/");
    }
  }, [session, isLoading, segments, router]);

  return <>{children}</>;
}
