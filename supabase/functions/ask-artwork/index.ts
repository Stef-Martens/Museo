const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const CHAT_MODEL = "gpt-4o-mini";
const MAX_HISTORY = 12;

interface ArtworkContext {
  title: string;
  artist: string;
  year: string;
  description: string;
  period: string;
  whyItMatters: string;
  museum?: string;
  city: string;
  country: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return jsonResponse(
        { error: "OPENAI_API_KEY not set on Supabase secrets." },
        500
      );
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const { createClient } = await import("npm:@supabase/supabase-js@2");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const body = await req.json();
    const artwork = parseArtwork(body?.artwork);
    const messages = parseMessages(body?.messages);
    const question =
      typeof body?.question === "string" ? body.question.trim() : "";

    if (!artwork) {
      return jsonResponse({ error: "artwork context is required" }, 400);
    }
    if (!question) {
      return jsonResponse({ error: "question is required" }, 400);
    }

    const history = messages.slice(-MAX_HISTORY);
    const openaiMessages = [
      {
        role: "system",
        content: buildSystemPrompt(artwork),
      },
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: question },
    ];

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: CHAT_MODEL,
        temperature: 0.4,
        max_tokens: 600,
        messages: openaiMessages,
      }),
    });

    if (!openaiRes.ok) {
      const errBody = await openaiRes.text();
      return jsonResponse(
        { error: `OpenAI error (${openaiRes.status}): ${errBody.slice(0, 200)}` },
        502
      );
    }

    const payload = await openaiRes.json();
    const reply = payload?.choices?.[0]?.message?.content;

    if (typeof reply !== "string" || !reply.trim()) {
      return jsonResponse({ error: "Empty response from AI" }, 502);
    }

    return new Response(JSON.stringify({ reply: reply.trim() }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Chat failed";
    return jsonResponse({ error: message }, 500);
  }
});

function buildSystemPrompt(artwork: ArtworkContext): string {
  const location = [artwork.museum, artwork.city, artwork.country]
    .filter(Boolean)
    .join(" · ");

  return `You are Museo, a knowledgeable museum guide helping a visitor learn about one artwork they scanned.

Artwork context (use as primary facts; say when uncertain):
- Title: ${artwork.title}
- Artist: ${artwork.artist}
- Year: ${artwork.year}
- Period: ${artwork.period}
- Location: ${location || "Unknown"}
- Description: ${artwork.description}
- Why it matters: ${artwork.whyItMatters}

Answer clearly in 2–4 short paragraphs max. Be engaging but accurate. If asked something outside this artwork, gently redirect. Do not invent specific provenance or museum holdings unless in the context above.`;
}

function parseArtwork(value: unknown): ArtworkContext | null {
  if (!value || typeof value !== "object") return null;
  const a = value as Record<string, unknown>;
  const location =
    a.location && typeof a.location === "object"
      ? (a.location as Record<string, unknown>)
      : null;

  const title = typeof a.title === "string" ? a.title.trim() : "";
  const artist = typeof a.artist === "string" ? a.artist.trim() : "";
  if (!title || !artist) return null;

  return {
    title,
    artist,
    year: typeof a.year === "string" ? a.year : "Unknown",
    description:
      typeof a.description === "string" ? a.description : "No description.",
    period: typeof a.period === "string" ? a.period : "modern",
    whyItMatters:
      typeof a.whyItMatters === "string"
        ? a.whyItMatters
        : "A notable artwork.",
    museum: typeof a.museum === "string" ? a.museum : undefined,
    city:
      location && typeof location.city === "string"
        ? location.city
        : "Unknown",
    country:
      location && typeof location.country === "string"
        ? location.country
        : "Unknown",
  };
}

function parseMessages(value: unknown): ChatMessage[] {
  if (!Array.isArray(value)) return [];
  const out: ChatMessage[] = [];
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const m = item as Record<string, unknown>;
    const role = m.role === "user" || m.role === "assistant" ? m.role : null;
    const content = typeof m.content === "string" ? m.content.trim() : "";
    if (role && content) out.push({ role, content });
  }
  return out;
}

function jsonResponse(body: Record<string, string>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
