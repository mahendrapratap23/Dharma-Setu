/**
 * Dharma Setu - Cloudflare Worker Backend
 * AI-powered explorer for Hindu Dharma via Gemini API.
 */

export const SYSTEM_PROMPT = `You are Dharma Setu, a guide to Hindu Dharma. Reply ONLY with JSON matching the schema.

First interpret the user's query. Users misspell, abbreviate, or transliterate names (e.g. drapati/draupadi/droupadi/panchali = Draupadi). Resolve to the most likely canonical topic and answer it directly. Never refuse spelling or transliteration mistakes. Only decline truly unrelated or hateful/political queries.

1) Reply in the user's chosen language:
   - hinglish: Hindi written in Roman script (conversational, simple sentences).
   - hi: Devanagari Hindi (pure, respectful, simple sentences).
   - en: English (simple, respectful).
2) "interpreted_as": The canonical topic name or resolved question title (e.g., "Draupadi").
3) "did_you_mean": Up to 3 alternative spellings, titles, or related topics (e.g., ["Draupadi", "Panchali", "Yajnaseni"]).
4) "speech_text": A clean, natural narration of the answer (max ~120 words). Write speech_text in Devanagari script when lang is 'hinglish' or 'hi' (for accurate voice pronunciation), and in English when lang is 'en'.
5) Every claim needs a scripture source (text + kand/parva/adhyaya). If unsure, say so and set confidence to low. Never invent verses or sources.
6) Keep Valmiki Ramayana, Ramcharitmanas, Puranas and folk tradition clearly separate. Where traditions differ, say 'in some traditions...' and never call a tradition wrong.
7) Only include connections found in scriptures or well-known tradition.
8) If the question is truly unrelated to Hindu Dharma, or hateful/political, politely decline in the same JSON format with confidence low.
9) Be respectful and neutral.`;

export const GEMINI_SCHEMA = {
  type: "OBJECT",
  properties: {
    title: { type: "STRING" },
    interpreted_as: { type: "STRING" },
    did_you_mean: {
      type: "ARRAY",
      items: { type: "STRING" }
    },
    speech_text: { type: "STRING" },
    type: {
      type: "STRING",
      enum: ["person", "scripture", "event", "tradition", "place", "concept"]
    },
    summary: { type: "STRING" },
    story: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          tab: { type: "STRING" },
          text: { type: "STRING" }
        },
        required: ["tab", "text"]
      }
    },
    sources: {
      type: "ARRAY",
      items: { type: "STRING" }
    },
    real_life: { type: "STRING" },
    traditions_differ: { type: "STRING" },
    connections: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          type: {
            type: "STRING",
            enum: ["person", "scripture", "event", "tradition", "place", "concept"]
          },
          relation: { type: "STRING" },
          source: { type: "STRING" }
        },
        required: ["name", "type", "relation", "source"]
      }
    },
    follow_ups: {
      type: "ARRAY",
      items: { type: "STRING" }
    },
    confidence: {
      type: "STRING",
      enum: ["high", "medium", "low"]
    }
  },
  required: [
    "title",
    "interpreted_as",
    "did_you_mean",
    "speech_text",
    "type",
    "summary",
    "sources",
    "real_life",
    "traditions_differ",
    "connections",
    "follow_ups",
    "confidence"
  ]
};

const ALLOWED_LANGUAGES = new Set(["hinglish", "hi", "en"]);
const RATE_LIMIT_PER_MINUTE = 20;
const CACHE_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

/**
 * Normalizes user query for consistent KV caching.
 */
export function normalizeQuery(q) {
  return (q || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

/**
 * Strips markdown code fences and safely parses JSON.
 */
export function extractAndParseJson(rawText) {
  if (!rawText || typeof rawText !== "string") {
    throw new Error("Empty candidate text from Gemini");
  }
  let cleaned = rawText.trim();
  // Strip Markdown code fences if present (```json ... ``` or ``` ... ```)
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
  }
  // Locate outermost JSON braces
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }
  return JSON.parse(cleaned);
}

/**
 * Helper to build CORS headers.
 */
export function getCorsHeaders(request, env) {
  const allowedOrigin = env?.ALLOWED_ORIGIN || "*";
  const requestOrigin = request.headers.get("Origin");

  let allowOriginHeader = "*";
  if (allowedOrigin === "*") {
    allowOriginHeader = requestOrigin || "*";
  } else if (requestOrigin && requestOrigin === allowedOrigin) {
    allowOriginHeader = requestOrigin;
  } else {
    allowOriginHeader = allowedOrigin;
  }

  return {
    "Access-Control-Allow-Origin": allowOriginHeader,
    "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400"
  };
}

/**
 * Creates a JSON response with CORS headers.
 */
export function jsonResponse(data, status = 200, extraHeaders = {}, corsHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      ...corsHeaders,
      ...extraHeaders
    }
  });
}

/**
 * Check and increment IP rate limit counter.
 */
async function checkRateLimit(request, env) {
  if (!env?.CACHE) return true; // Bypass rate limit if KV not bound (e.g. dev mock)

  const ip =
    request.headers.get("CF-Connecting-IP") ||
    request.headers.get("X-Forwarded-For")?.split(",")[0]?.trim() ||
    "unknown-ip";

  const minuteWindow = Math.floor(Date.now() / 60000);
  const rateLimitKey = `ratelimit:${ip}:${minuteWindow}`;

  try {
    const current = await env.CACHE.get(rateLimitKey);
    const count = current ? parseInt(current, 10) : 0;

    if (count >= RATE_LIMIT_PER_MINUTE) {
      return false;
    }

    await env.CACHE.put(rateLimitKey, String(count + 1), { expirationTtl: 120 });
    return true;
  } catch (err) {
    console.error("Rate limit check error:", err);
    return true;
  }
}

/**
 * Calls Gemini REST API with retry on 429/5xx and JSON parse retry.
 */
async function callGeminiApi({ q, lang, context, wiki_context }, env) {
  const apiKey = env?.GEMINI_API_KEY;
  if (!apiKey) {
    throw { status: 500, message: "GEMINI_API_KEY is not configured on the server." };
  }

  const model = env?.GEMINI_MODEL || "gemini-3.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  const buildPayload = (extraReminder = false) => {
    let promptText = `User Question: "${q}"\nSelected Language: "${lang}"`;
    if (context && typeof context === "string" && context.trim().length > 0) {
      promptText += `\nContext/Previous Topic: "${context.trim().slice(0, 200)}"`;
    }
    if (wiki_context && (wiki_context.extract || typeof wiki_context === "string")) {
      const extractText = (wiki_context.extract || wiki_context).slice(0, 1000);
      const titleText = wiki_context.title || q;
      promptText += `\n\nReference Context from Wikipedia (Title: "${titleText}"):\n"${extractText}"\nInstruction for Reference Context: Use this as reference context. Prefer it for facts about the person; add scripture sources, connections, traditions and real-life relevance. If the context conflicts with scriptures, mention both.`;
    }
    if (extraReminder) {
      promptText += `\nCRITICAL: Output MUST be strictly valid JSON adhering to the schema. No markdown code blocks, no trailing comments.`;
    }

    return {
      systemInstruction: {
        parts: [{ text: SYSTEM_PROMPT }]
      },
      contents: [
        {
          role: "user",
          parts: [{ text: promptText }]
        }
      ],
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 4096, // High token limit to prevent thinking token exhaustion
        responseMimeType: "application/json",
        responseSchema: GEMINI_SCHEMA
      }
    };
  };

  const executeCall = async (payload, targetModel = model) => {
    const targetUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(targetModel)}:generateContent`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 14000); // 14s timeout

    try {
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: {
          "x-goog-api-key": apiKey,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response;
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  };

  let response;
  try {
    response = await executeCall(buildPayload(false));
  } catch (err) {
    console.warn("First Gemini attempt failed (network/timeout), retrying in 800ms...", err);
    await new Promise((resolve) => setTimeout(resolve, 800));
    try {
      response = await executeCall(buildPayload(false));
    } catch (retryErr) {
      console.error("Gemini call failed after network retry:", retryErr);
      throw { status: 502, error: "busy" };
    }
  }

  // Handle upstream HTTP response status with automatic fallback model
  const fallbackModel = model === "gemini-3.5-flash" ? "gemini-3.5-flash-lite" : "gemini-3.5-flash";

  if (!response.ok) {
    const upstreamStatus = response.status;
    const errorBody = await response.text().catch(() => "");
    // Log upstream status and body to console (visible via wrangler tail) but never leak to user
    console.error(`Upstream Gemini error (${model}): HTTP ${upstreamStatus} - Response: ${errorBody}`);

    if (upstreamStatus === 429 || upstreamStatus >= 500) {
      console.warn(`Upstream returned ${upstreamStatus}, attempting resilient fallback model ${fallbackModel}...`);
      await new Promise((resolve) => setTimeout(resolve, 800));
      try {
        const retryResponse = await executeCall(buildPayload(false), fallbackModel);
        if (retryResponse.ok) {
          response = retryResponse;
        } else {
          const retryErrorBody = await retryResponse.text().catch(() => "");
          console.error(`Fallback model (${fallbackModel}) returned HTTP ${retryResponse.status} - Response: ${retryErrorBody}`);
          throw { status: retryResponse.status === 429 ? 429 : 502, error: "busy" };
        }
      } catch (e) {
        throw { status: upstreamStatus === 429 ? 429 : 502, error: "busy" };
      }
    } else {
      throw { status: 502, error: "busy" };
    }
  }

  const result = await response.json();
  const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    console.error("Empty candidate in Gemini response:", JSON.stringify(result));
    throw { status: 502, error: "busy" };
  }

  // Robust JSON parse attempt
  try {
    return extractAndParseJson(rawText);
  } catch (parseErr) {
    console.warn("Initial JSON parse failed. Retrying with 'valid JSON only' reminder...", parseErr);
    try {
      const secondCall = await executeCall(buildPayload(true));
      if (!secondCall.ok) {
        throw new Error(`Second attempt failed with status ${secondCall.status}`);
      }
      const secondResult = await secondCall.json();
      const secondRawText = secondResult?.candidates?.[0]?.content?.parts?.[0]?.text;
      return extractAndParseJson(secondRawText);
    } catch (retryParseErr) {
      console.error("Failed to parse Gemini response as JSON after retry:", retryParseErr, rawText);
      throw { status: 502, error: "busy" };
    }
  }
}

const DHARMA_KEYWORDS = [
  "hindu", "mahabharata", "ramayana", "deity", "goddess", "god",
  "avatar", "temple", "sanskrit", "epic", "festival", "purana",
  "vedic", "dharma", "lunar", "india", "sacred"
];

const WIKI_USER_AGENT = "DharmaSetu/1.0 (https://dharmasetu.org; feedback@dharmasetu.org)";
const WIKI_CACHE_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

/**
 * Searches and fetches Wikipedia summary for a topic.
 * Resolves misspellings (e.g. drapati -> Draupadi).
 */
export async function getWikiSummary(env, query, lang = "en") {
  if (!query || typeof query !== "string") return { found: false };
  const trimmed = query.trim();
  if (!trimmed) return { found: false };

  const normalized = normalizeQuery(trimmed);
  const cacheKey = `wiki:${lang}:${normalized}`;

  // 1. Check KV cache (30 days TTL)
  if (env?.CACHE) {
    try {
      const cached = await env.CACHE.get(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      console.warn("KV wiki cache read error:", e);
    }
  }

  try {
    let searchQ = trimmed;
    // Map common aliases where Wikipedia article is differently named
    if (normalized === "ram") searchQ = "Rama";

    // Call MediaWiki title search
    const searchUrl = `https://en.wikipedia.org/w/rest.php/v1/search/title?q=${encodeURIComponent(searchQ)}&limit=5`;
    const searchRes = await fetch(searchUrl, {
      headers: { "User-Agent": WIKI_USER_AGENT }
    });

    if (!searchRes.ok) {
      return { found: false };
    }

    const searchData = await searchRes.json();
    const pages = searchData.pages || [];
    if (pages.length === 0) {
      return { found: false };
    }

    // Rank candidates: prioritize exact matches and dharmic relevance
    pages.sort((a, b) => {
      const score = (p) => {
        let s = 0;
        const t = (p.title || "").toLowerCase();
        const qLower = normalized;
        if (t === qLower) s += 100;
        else if (t.startsWith(qLower) || qLower.startsWith(t)) s += 50;
        else if (t.includes(qLower)) s += 25;
        const desc = (p.description || "").toLowerCase();
        if (DHARMA_KEYWORDS.some(k => desc.includes(k))) s += 40;
        return s;
      };
      return score(b) - score(a);
    });

    // Try candidates in order
    let bestEnSummary = null;
    for (const page of pages) {
      const sumUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(page.key || page.title)}`;
      const sumRes = await fetch(sumUrl, {
        headers: { "User-Agent": WIKI_USER_AGENT }
      });
      if (!sumRes.ok) continue;
      const sum = await sumRes.json();
      if (sum.type === "disambiguation" || !sum.extract) continue;
      bestEnSummary = sum;
      break;
    }

    if (!bestEnSummary) {
      return { found: false };
    }

    let finalTitle = bestEnSummary.title;
    let finalExtract = bestEnSummary.extract;
    let finalPageUrl = bestEnSummary.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(bestEnSummary.title)}`;
    let finalImageUrl = bestEnSummary.originalimage?.source || bestEnSummary.thumbnail?.source || null;
    let finalWikiLang = "en";

    // If lang is "hi" or "hinglish", try Hindi Wikipedia summary
    if (lang === "hi" || lang === "hinglish") {
      try {
        const llUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=langlinks&lllang=hi&titles=${encodeURIComponent(bestEnSummary.title)}&format=json`;
        const llRes = await fetch(llUrl, {
          headers: { "User-Agent": WIKI_USER_AGENT }
        });
        if (llRes.ok) {
          const llData = await llRes.json();
          const queryPages = llData.query?.pages || {};
          let hiTitle = null;
          for (const id in queryPages) {
            if (queryPages[id].langlinks && queryPages[id].langlinks.length > 0) {
              hiTitle = queryPages[id].langlinks[0]["*"];
              break;
            }
          }
          if (hiTitle) {
            const hiSumUrl = `https://hi.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(hiTitle)}`;
            const hiSumRes = await fetch(hiSumUrl, {
              headers: { "User-Agent": WIKI_USER_AGENT }
            });
            if (hiSumRes.ok) {
              const hiSum = await hiSumRes.json();
              if (hiSum.type !== "disambiguation" && hiSum.extract) {
                finalTitle = hiSum.title;
                finalExtract = hiSum.extract;
                finalPageUrl = hiSum.content_urls?.desktop?.page || `https://hi.wikipedia.org/wiki/${encodeURIComponent(hiTitle)}`;
                finalWikiLang = "hi";
                if (!finalImageUrl && hiSum.thumbnail?.source) {
                  finalImageUrl = hiSum.thumbnail.source;
                }
              }
            }
          }
        }
      } catch (hiErr) {
        console.warn("Hindi Wikipedia summary fetch error:", hiErr);
      }
    }

    const result = {
      found: true,
      title: finalTitle,
      extract: finalExtract,
      imageUrl: finalImageUrl,
      pageUrl: finalPageUrl,
      wikiLang: finalWikiLang
    };

    // Cache in KV for 30 days
    if (env?.CACHE) {
      try {
        await env.CACHE.put(cacheKey, JSON.stringify(result), {
          expirationTtl: WIKI_CACHE_TTL_SECONDS
        });
      } catch (putErr) {
        console.warn("KV wiki cache write error:", putErr);
      }
    }

    return result;
  } catch (err) {
    console.error("Wikipedia search error:", err);
    return { found: false };
  }
}

/**
 * Handle GET /api/wiki
 */
async function handleWiki(request, env, corsHeaders) {
  const url = new URL(request.url);
  const q = url.searchParams.get("q");
  const lang = url.searchParams.get("lang") || "hinglish";

  if (!q || q.trim().length === 0 || q.length > 200) {
    return jsonResponse({ error: "Invalid 'q' parameter." }, 400, {}, corsHeaders);
  }

  const normalized = normalizeQuery(q);
  const cacheKey = `wiki:${lang}:${normalized}`;
  let isCached = false;
  if (env?.CACHE) {
    try {
      const hit = await env.CACHE.get(cacheKey);
      if (hit) isCached = true;
    } catch (e) {}
  }

  const result = await getWikiSummary(env, q, lang);
  return jsonResponse(
    result,
    200,
    { "X-Dharma-Wiki-Cache": isCached ? "HIT" : "MISS" },
    corsHeaders
  );
}

/**
 * Handle POST /api/explain
 */
async function handleExplain(request, env, corsHeaders) {
  // Rate limiting check
  const allowed = await checkRateLimit(request, env);
  if (!allowed) {
    return jsonResponse(
      { error: "Too many requests. Please wait a minute before making another query." },
      429,
      { "Retry-After": "60" },
      corsHeaders
    );
  }

  // Parse JSON body
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(
      { error: "Invalid JSON body." },
      400,
      {},
      corsHeaders
    );
  }

  const { q, lang, context, wiki_context } = body || {};

  // Validation: q must be 1-200 chars
  if (!q || typeof q !== "string" || q.trim().length < 1 || q.trim().length > 200) {
    return jsonResponse(
      { error: "Invalid question 'q'. Must be between 1 and 200 characters." },
      400,
      {},
      corsHeaders
    );
  }

  // Validation: lang must be "hinglish" | "hi" | "en"
  if (!lang || !ALLOWED_LANGUAGES.has(lang)) {
    return jsonResponse(
      { error: "Invalid 'lang'. Must be one of: 'hinglish', 'hi', 'en'." },
      400,
      {},
      corsHeaders
    );
  }

  const normalized = normalizeQuery(q);
  // If context is present, include in cache key so contextual follow-ups cache accurately
  const cacheKey = context && typeof context === "string" && context.trim().length > 0
    ? `cache:${lang}:${normalized}:${normalizeQuery(context.slice(0, 50))}`
    : `cache:${lang}:${normalized}`;

  // Check KV cache
  if (env?.CACHE) {
    try {
      const cached = await env.CACHE.get(cacheKey);
      if (cached) {
        const cachedJson = JSON.parse(cached);
        // Ensure cached item is not low confidence or malformed
        if (cachedJson && cachedJson.title && cachedJson.confidence !== "low") {
          return jsonResponse(
            cachedJson,
            200,
            { "X-Dharma-Cache": "HIT" },
            corsHeaders
          );
        }
      }
    } catch (cacheErr) {
      console.warn("KV Cache read error:", cacheErr);
    }
  }

  // Grounding reference context
  let wikiContext = wiki_context;
  if (!wikiContext) {
    try {
      const autoWiki = await getWikiSummary(env, q.trim(), lang);
      if (autoWiki && autoWiki.title && autoWiki.extract) {
        wikiContext = autoWiki;
      }
    } catch (e) {
      console.warn("Auto-wiki fetch error in explain:", e);
    }
  }

  // Call Gemini REST API
  try {
    const data = await callGeminiApi({ q: q.trim(), lang, context, wiki_context: wikiContext }, env);

    // Rule: Never cache error, empty or confidence:"low" results!
    const shouldCache = data && data.title && data.confidence !== "low";

    if (env?.CACHE && shouldCache) {
      try {
        await env.CACHE.put(cacheKey, JSON.stringify(data), {
          expirationTtl: CACHE_TTL_SECONDS
        });
      } catch (cachePutErr) {
        console.warn("KV Cache write error:", cachePutErr);
      }
    }

    return jsonResponse(
      data,
      200,
      { "X-Dharma-Cache": "MISS" },
      corsHeaders
    );
  } catch (err) {
    if (err && err.error === "busy") {
      return jsonResponse(
        { error: "busy", message: "Server is currently experiencing high load. Please try again shortly." },
        err.status || 502,
        {},
        corsHeaders
      );
    }
    if (err && err.status === 500) {
      return jsonResponse({ error: "Server configuration error" }, 500, {}, corsHeaders);
    }
    return jsonResponse(
      { error: "busy", message: "Server is temporarily unavailable. Please try again." },
      502,
      {},
      corsHeaders
    );
  }
}

/**
 * Cloudflare Worker Export
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const corsHeaders = getCorsHeaders(request, env);

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    // Health check endpoint
    if (url.pathname === "/api/health") {
      return jsonResponse({ status: "ok", app: "Dharma Setu" }, 200, {}, corsHeaders);
    }

    // Worker wiki endpoint: GET /api/wiki?q=...&lang=...
    if (url.pathname === "/api/wiki") {
      if (request.method !== "GET") {
        return jsonResponse({ error: "Method not allowed. Use GET." }, 405, {}, corsHeaders);
      }
      return handleWiki(request, env, corsHeaders);
    }

    // Worker explain endpoint: POST /api/explain
    if (url.pathname === "/api/explain") {
      if (request.method !== "POST") {
        return jsonResponse({ error: "Method not allowed. Use POST." }, 405, {}, corsHeaders);
      }
      return handleExplain(request, env, corsHeaders);
    }

    // Serve static assets if binding exists
    if (env?.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response("Not Found", { status: 404 });
  }
};
