const IMAGE_EXTENSIONS = /\.(jpe?g|png|webp)$/i;
const WIKIMEDIA_API = "https://commons.wikimedia.org/w/api.php";
const WIKIPEDIA_API = "https://en.wikipedia.org/w/api.php";
const STOP_WORDS = new Set(["the", "and", "with", "from", "von", "van", "de"]);

interface CommonsPage {
  title?: string;
  index?: number;
  imageinfo?: { thumburl?: string; url?: string }[];
}

interface WikiPage {
  title?: string;
  thumbnail?: { source?: string };
}

function artistLastName(artist: string): string {
  const parts = artist.trim().split(/\s+/).filter(Boolean);
  return parts[parts.length - 1] ?? artist;
}

function titleKeywords(title: string): string[] {
  return title
    .toLowerCase()
    .split(/[^\p{L}\p{N}]+/u)
    .filter((word) => word.length > 2 && !STOP_WORDS.has(word));
}

function countTitleMatches(text: string, title: string): number {
  const haystack = text.toLowerCase();
  return titleKeywords(title).filter((word) => haystack.includes(word)).length;
}

async function isReachableImageUrl(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD" });
    const type = res.headers.get("content-type") ?? "";
    if (res.ok && (type.startsWith("image/") || type === "")) return true;
  } catch {
    // fall through
  }

  try {
    const res = await fetch(url, {
      method: "GET",
      headers: { Range: "bytes=0-0" },
    });
    return res.ok || res.status === 206;
  } catch {
    return false;
  }
}

async function fetchWikipediaImageByTitle(
  title: string,
  artist: string
): Promise<string | null> {
  if (titleKeywords(title).length < 2) return null;

  const params = new URLSearchParams({
    action: "query",
    titles: title,
    redirects: "1",
    prop: "pageimages",
    piprop: "thumbnail",
    pithumbsize: "1200",
    format: "json",
  });

  const res = await fetch(`${WIKIPEDIA_API}?${params}`);
  if (!res.ok) return null;

  const data = (await res.json()) as { query?: { pages?: Record<string, WikiPage> } };
  for (const page of Object.values(data.query?.pages ?? {})) {
    const pageTitle = page.title ?? "";
    const score = scoreWikipediaPage(pageTitle, title, artist);
    const url = page.thumbnail?.source;
    if (url && score >= 50) return url;
  }
  return null;
}

function scoreWikipediaPage(
  pageTitle: string,
  artworkTitle: string,
  artist: string
): number {
  const page = pageTitle.toLowerCase();
  const title = artworkTitle.toLowerCase();
  const lastName = artistLastName(artist).toLowerCase();
  const keywords = titleKeywords(artworkTitle);
  let score = 0;

  if (page === title) score += 60;
  if (page.startsWith(title + " (")) score += 50;
  if (keywords.filter((w) => page.includes(w)).length >= 2) score += 25;
  if (keywords.some((w) => page.includes(w))) score += 10;
  if (lastName && page.includes(lastName)) score += 15;
  if (page === artist.toLowerCase() || page === lastName) score -= 40;

  return score;
}

async function fetchWikipediaImage(
  title: string,
  artist: string
): Promise<string | null> {
  const byTitle = await fetchWikipediaImageByTitle(title, artist);
  if (byTitle) return byTitle;

  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: `"${title}" ${artist}`,
    gsrnamespace: "0",
    gsrlimit: "8",
    prop: "pageimages",
    piprop: "thumbnail",
    pithumbsize: "1200",
    format: "json",
  });

  const res = await fetch(`${WIKIPEDIA_API}?${params}`);
  if (!res.ok) return null;

  const data = (await res.json()) as {
    query?: { pages?: Record<string, WikiPage> };
  };

  let bestUrl: string | null = null;
  let bestScore = 0;

  for (const page of Object.values(data.query?.pages ?? {})) {
    const pageTitle = page.title ?? "";
    const score = scoreWikipediaPage(pageTitle, title, artist);
    const url = page.thumbnail?.source;
    if (url && score > bestScore) {
      bestScore = score;
      bestUrl = url;
    }
  }

  return bestScore >= 10 ? bestUrl : null;
}

function scoreCommonsFile(
  fileTitle: string,
  artworkTitle: string,
  artist: string,
  relaxed: boolean
): number {
  const file = fileTitle.toLowerCase();
  if (file.includes(".pdf")) return -1000;
  if (!IMAGE_EXTENSIONS.test(file)) return -500;

  const lastName = artistLastName(artist).toLowerCase();
  const titleMatches = countTitleMatches(file, artworkTitle);
  const hasArtist = Boolean(lastName && file.includes(lastName));
  let score = titleMatches * 15;

  if (hasArtist) score += 25;
  if (file.includes("portrait") && titleMatches === 0) score -= 40;

  if (relaxed) {
    if (hasArtist && titleMatches === 0) score += 10;
    return score >= 20 ? score : -100;
  }

  if (titleMatches >= 2) return score;
  if (hasArtist && titleMatches >= 1) return score;
  return -100;
}

async function fetchCommonsBestImage(
  query: string,
  title: string,
  artist: string,
  relaxed = false
): Promise<string | null> {
  const params = new URLSearchParams({
    action: "query",
    generator: "search",
    gsrsearch: query,
    gsrnamespace: "6",
    gsrlimit: "10",
    prop: "imageinfo",
    iiprop: "url",
    iiurlwidth: "1200",
    format: "json",
  });

  const res = await fetch(`${WIKIMEDIA_API}?${params}`);
  if (!res.ok) return null;

  const data = (await res.json()) as {
    query?: { pages?: Record<string, CommonsPage> };
  };

  const pages = Object.values(data.query?.pages ?? {}).sort(
    (a, b) => (a.index ?? 99) - (b.index ?? 99)
  );

  let bestUrl: string | null = null;
  let bestScore = 0;

  for (const page of pages) {
    const fileTitle = page.title ?? "";
    const score = scoreCommonsFile(fileTitle, title, artist, relaxed);
    const url = page.imageinfo?.[0]?.thumburl ?? page.imageinfo?.[0]?.url;
    if (score > bestScore && url) {
      bestScore = score;
      bestUrl = url;
    }
  }

  return bestScore >= 20 ? bestUrl : null;
}

function buildSearchQueries(
  title: string,
  artist: string,
  imageSearchQuery?: string | null
): string[] {
  const lastName = artistLastName(artist);

  return [
    imageSearchQuery,
    `"${title}" ${artist}`,
    `"${title}" ${lastName}`,
    `${artist} ${title}`,
    `${lastName} ${title}`,
  ].filter((q): q is string => Boolean(q?.trim()));
}

export async function resolveReferenceImageUrl(
  title: string,
  artist: string,
  imageSearchQuery?: string | null,
  suggestedUrl?: string | null
): Promise<string | null> {
  if (suggestedUrl && (await isReachableImageUrl(suggestedUrl))) {
    return suggestedUrl;
  }

  const wikiUrl = await fetchWikipediaImage(title, artist);
  if (wikiUrl) return wikiUrl;

  const uniqueQueries = [
    ...new Set(buildSearchQueries(title, artist, imageSearchQuery)),
  ];

  for (const query of uniqueQueries) {
    const relaxed = query.includes(artist) || query === imageSearchQuery;
    const url = await fetchCommonsBestImage(query, title, artist, relaxed);
    if (url) return url;
  }

  return null;
}
