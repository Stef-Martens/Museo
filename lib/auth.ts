import { supabase } from "@/lib/supabase";

export async function getUserId(): Promise<string> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user?.id) {
    throw new Error("Not signed in");
  }

  return session.user.id;
}
