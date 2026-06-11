const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

import { resolveReferenceImageUrl } from "./image-lookup.ts";

const VISION_MODEL = "gpt-4o";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const openaiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openaiKey) {
      return jsonResponse(
        {
          error:
            "OPENAI_API_KEY not set. Run: supabase secrets set OPENAI_API_KEY=sk-...",
        },
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

    const { imageBase64 } = await req.json();
    if (!imageBase64 || typeof imageBase64 !== "string") {
      return jsonResponse({ error: "imageBase64 is required" }, 400);
    }

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: VISION_MODEL,
        temperature: 0,
        response_format: { type: "json_object" },
        max_tokens: 800,
        messages: [
          {
            role: "system",
            content: `You identify artworks in museum visitor photos. Images may show paintings on walls, frames, posters, book covers, or screens.

Rules:
1. Read visible text first — title, artist, or wall label on the frame or plaque. If legible, set visibleTitle/visibleArtist and use that as primary evidence.
2. Describe the specific composition in visualNotes (figures, objects, setting, palette, brushwork, era) before naming anything.
3. Never guess from subject alone (e.g. "flowers" or "a portrait" is not enough). The exact scene, style, and period must match one known work.
4. Do not default to the most famous artwork that shares a subject — lesser-known works are common in homes and museums.
5. If uncertain between multiple works, set identified=false or confidence below 40.

confidence: integer 0–100. 90+ = composition and artist style clearly match; 65–89 = likely; below 65 = guessing.
period: one of renaissance, baroque, impressionism, modern, contemporary.

Respond with JSON only.`,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Return JSON:\n{"identified":boolean,"confidence":number,"reason":string,"visualNotes":string,"visibleTitle":string|null,"visibleArtist":string|null,"title":string|null,"artist":string|null,"year":string|null,"description":string|null,"period":string|null,"whyItMatters":string|null,"museum":string|null,"city":string|null,"country":string|null,"latitude":number|null,"longitude":number|null,"imageSearchQuery":string|null,"imageUrl":string|null}\n\nimageSearchQuery: artist name + exact title for reference image lookup. imageUrl: only a known upload.wikimedia.org URL, else null.`,
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`,
                  detail: "high",
                },
              },
            ],
          },
        ],
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
    const content = payload?.choices?.[0]?.message?.content;

    if (typeof content !== "string") {
      return jsonResponse({ error: "OpenAI returned an empty response" }, 502);
    }

    const result = JSON.parse(content) as Record<string, unknown>;

    const visibleTitle =
      typeof result.visibleTitle === "string" ? result.visibleTitle.trim() : "";
    const visibleArtist =
      typeof result.visibleArtist === "string" ? result.visibleArtist.trim() : "";

    if (visibleTitle) result.title = visibleTitle;
    if (visibleArtist) result.artist = visibleArtist;

    const title = typeof result.title === "string" ? result.title : null;
    const artist = typeof result.artist === "string" ? result.artist : null;

    if (result.identified && title && artist) {
      const referenceUrl = await resolveReferenceImageUrl(
        title,
        artist,
        typeof result.imageSearchQuery === "string"
          ? result.imageSearchQuery
          : null,
        typeof result.imageUrl === "string" ? result.imageUrl : null
      );
      result.imageUrl = referenceUrl;
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Recognition failed";
    return jsonResponse({ error: message }, 500);
  }
});

function jsonResponse(body: Record<string, string>, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
