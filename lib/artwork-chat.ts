import { supabase } from "@/lib/supabase";
import type { Artwork, ChatMessage } from "@/types";

export async function askAboutArtwork(
  artwork: Artwork,
  history: ChatMessage[],
  question: string
): Promise<string> {
  const { data, error } = await supabase.functions.invoke("ask-artwork", {
    body: { artwork, messages: history, question },
  });

  if (error) {
    throw new Error(
      error.message ?? "Chat unavailable. Deploy the ask-artwork edge function."
    );
  }

  if (data && typeof data === "object" && "error" in data) {
    throw new Error(String((data as { error: string }).error));
  }

  if (
    !data ||
    typeof data !== "object" ||
    typeof (data as { reply?: string }).reply !== "string"
  ) {
    throw new Error("Chat returned an empty response");
  }

  return (data as { reply: string }).reply;
}
