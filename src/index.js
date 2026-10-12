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

// --- Wikipedia Resolver Constants ---

const DHARMA_KEYWORDS = [
  "hindu", "hinduism", "mahabharata", "ramayana", "deity", "goddess", "god",
  "avatar", "avatara", "temple", "sanskrit", "epic", "festival", "purana",
  "vedic", "veda", "dharma", "sacred", "mythology", "mythological",
  "brahma", "vishnu", "shiva", "lakshmi", "durga", "saraswati",
  "pandava", "kaurava", "arjuna", "krishna", "rama", "sita",
  "india", "indian", "scriptural", "scripture", "bhagavad"
];

// Reject pages that are clearly films, songs, media, or non-Dharmic topics
const MEDIA_REJECT_PATTERN = /\b(film|movie|album|song|tv series|television series|actor|actress|novel|video game|band|footballer|cricketer|musician|singer|rapper|character from|2[0-9]{3} film|2[0-9]{3} album|animated series|web series|streaming|bollywood|tollywood|box office)\b/i;

const WIKI_USER_AGENT = "DharmaSetu/1.0 (https://dharmasetu.org; feedback@dharmasetu.org)";
const WIKI_CACHE_TTL_SECONDS = 30 * 24 * 60 * 60; // 30 days

// Minimal JSON schema for the Gemini query-interpretation call
const INTERPRET_SCHEMA = {
  type: "OBJECT",
  properties: {
    in_scope: { type: "BOOLEAN" },
    canonical_name: { type: "STRING" },
    wiki_title: { type: "STRING" },
    alt_titles: { type: "ARRAY", items: { type: "STRING" } },
    topic_type: { type: "STRING" },
    corrected_from: { type: "STRING" }
  },
  required: ["in_scope", "canonical_name", "wiki_title", "alt_titles", "topic_type"]
};

const INTERPRET_PROMPT = `You are a Hindu Dharma scholar. Given a user query (which may be misspelled, transliterated, or abbreviated), interpret it and return JSON.

Rules:
- Fix common transliterations: ashwathama/aswatthama = Ashwatthama, drapati/droupadi/draupdi = Draupadi, krishn = Krishna, etc.
- wiki_title MUST be the exact English Wikipedia article title for the main Dharma topic (person, deity, event, scripture, place, concept).
- alt_titles: up to 3 alternative Wikipedia titles to try if the main one fails.
- in_scope: true only if the query relates to Hindu Dharma, Vedic tradition, Indian epics (Mahabharata, Ramayana), Puranas, deities, temples, Sanskrit texts, or related philosophy.
- topic_type: one of "person", "deity", "scripture", "event", "place", "concept", "tradition".
- corrected_from: original misspelling if you corrected it, otherwise empty string.

Examples:
- "ashwathama" → wiki_title: "Ashwatthama", canonical_name: "Ashwatthama"
- "drapati" → wiki_title: "Draupadi", canonical_name: "Draupadi"
- "krishna" → wiki_title: "Krishna", canonical_name: "Krishna"
- "gita" → wiki_title: "Bhagavad Gita", canonical_name: "Bhagavad Gita"
- "Messi" → in_scope: false`;

/**
 * Calls Gemini with a minimal schema to interpret the user query and get candidate Wikipedia titles.
 * Returns { in_scope, canonical_name, wiki_title, alt_titles, topic_type, corrected_from }
 */
async function interpretQueryWithGemini(query, apiKey, model = "gemini-3.5-flash-lite") {
  if (!apiKey) return null;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;
  const payload = {
    systemInstruction: { parts: [{ text: INTERPRET_PROMPT }] },
    contents: [{ role: "user", parts: [{ text: `Query: "${query}"` }] }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 256,
      responseMimeType: "application/json",
      responseSchema: INTERPRET_SCHEMA
    }
  };

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000); // 6s timeout for fast pre-call

    const res = await fetch(url, {
      method: "POST",
      headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      signal: controller.signal
    });
    clearTimeout(timeout);

    if (!res.ok) {
      console.warn(`Gemini interpret call failed with HTTP ${res.status}`);
      return null;
    }

    const result = await res.json();
    const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return null;

    return extractAndParseJson(rawText);
  } catch (err) {
    console.warn("interpretQueryWithGemini error (non-fatal):", err?.message || err);
    return null;
  }
}

/**
 * Validates a Wikipedia summary object: rejects disambiguation, media/entertainment pages,
 * and pages with no Dharmic content.
 * Returns true if the page is a valid Dharmic topic.
 */
function isValidDharmicPage(sum) {
  if (!sum || sum.type === "disambiguation" || !sum.extract) return false;

  // Reject media/entertainment pages
  const descAndExtract = `${sum.description || ""} ${sum.extract || ""}`;
  if (MEDIA_REJECT_PATTERN.test(descAndExtract)) {
    console.log(`  [Wiki Validator] Rejected "${sum.title}" — media/entertainment match`);
    return false;
  }

  // Must have at least one Dharma keyword in description or extract
  const combined = descAndExtract.toLowerCase();
  const hasDharmaKeyword = DHARMA_KEYWORDS.some(k => combined.includes(k));
  if (!hasDharmaKeyword) {
    console.log(`  [Wiki Validator] Rejected "${sum.title}" — no Dharma keywords found`);
    return false;
  }

  return true;
}

/**
 * Fetches a Wikipedia REST v1 summary for a given exact title.
 * Returns the summary JSON or null on failure.
 */
async function fetchWikiSummaryByTitle(title) {
  if (!title) return null;
  try {
    const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
    const res = await fetch(url, { headers: { "User-Agent": WIKI_USER_AGENT } });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    console.warn(`fetchWikiSummaryByTitle error for "${title}":`, e?.message);
    return null;
  }
}

/**
 * Searches Wikipedia title search API and returns ranked page list.
 */
async function searchWikiTitles(searchQ, limit = 5) {
  try {
    const url = `https://en.wikipedia.org/w/rest.php/v1/search/title?q=${encodeURIComponent(searchQ)}&limit=${limit}`;
    const res = await fetch(url, { headers: { "User-Agent": WIKI_USER_AGENT } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.pages || [];
  } catch (e) {
    console.warn("searchWikiTitles error:", e?.message);
    return [];
  }
}

/**
 * Validates an image URL — only allow common image extensions.
 */
function isValidImageUrl(url) {
  if (!url || typeof url !== "string") return false;
  return /\.(jpg|jpeg|png|webp|gif|svg)(\?.*)?$/i.test(url.split("#")[0]);
}

/**
 * Resolves and fetches a Wikipedia summary for a Dharmic topic.
 * Strategy:
 *   1. Check KV cache
 *   2. Ask Gemini to interpret the query → get exact wiki_title + alt_titles
 *   3. Try each title: fetch summary → validate (no media, has Dharma keywords)
 *   4. Last resort: Wikipedia fuzzy search for "{query} Hindu mythology"
 *   5. Store in KV cache (30 days)
 */
export async function getWikiSummary(env, query, lang = "en") {
  if (!query || typeof query !== "string") return { found: false };
  const trimmed = query.trim();
  if (!trimmed) return { found: false };

  const normalized = normalizeQuery(trimmed);
  const cacheKey = `wiki2:${lang}:${normalized}`; // wiki2 prefix for new resolver

  // 1. Check KV cache
  if (env?.CACHE) {
    try {
      const cached = await env.CACHE.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch (e) {
      console.warn("KV wiki cache read error:", e);
    }
  }

  let candidateTitles = [];

  // 2. Ask Gemini to interpret the query (non-fatal if it fails)
  // Use lite model for speed; fall back to configured model if lite unavailable
  const interpretModel = env?.GEMINI_MODEL
    ? (env.GEMINI_MODEL === "gemini-3.5-flash" ? "gemini-3.5-flash-lite" : env.GEMINI_MODEL)
    : "gemini-3.5-flash-lite";
  const interpretation = await interpretQueryWithGemini(trimmed, env?.GEMINI_API_KEY, interpretModel);
  console.log(`[Wiki Resolver] Query: "${trimmed}" → Gemini interpretation:`, JSON.stringify(interpretation));

  if (interpretation) {
    if (!interpretation.in_scope) {
      // Explicitly out of scope (e.g. "Messi")
      const result = { found: false };
      if (env?.CACHE) {
        try { await env.CACHE.put(cacheKey, JSON.stringify(result), { expirationTtl: WIKI_CACHE_TTL_SECONDS }); } catch (_) {}
      }
      return result;
    }

    // Build candidate list from Gemini's response
    if (interpretation.wiki_title) candidateTitles.push(interpretation.wiki_title);
    if (Array.isArray(interpretation.alt_titles)) {
      interpretation.alt_titles.forEach(t => { if (t && !candidateTitles.includes(t)) candidateTitles.push(t); });
    }
    // Also add canonical_name as a fallback candidate
    if (interpretation.canonical_name && !candidateTitles.includes(interpretation.canonical_name)) {
      candidateTitles.push(interpretation.canonical_name);
    }
  } else {
    // Gemini unavailable — do a fuzzy Wikipedia title search as fallback
    const fuzzyPages = await searchWikiTitles(trimmed, 5);
    fuzzyPages.forEach(p => {
      const t = p.key || p.title;
      if (t && !candidateTitles.includes(t)) candidateTitles.push(t);
    });
    // Always include basic alias
    if (normalized === "ram" && !candidateTitles.includes("Rama")) candidateTitles.push("Rama");
  }

  // 3. Try each candidate title directly
  let bestSummary = null;
  for (const title of candidateTitles) {
    const sum = await fetchWikiSummaryByTitle(title);
    if (isValidDharmicPage(sum)) {
      bestSummary = sum;
      console.log(`[Wiki Resolver] ✅ Accepted: "${sum.title}"`);
      break;
    } else if (sum) {
      console.log(`[Wiki Resolver] ❌ Rejected candidate: "${title}"`);
    }
  }

  // 4. Last-resort: fuzzy Wikipedia title search (without Gemini's guidance)
  if (!bestSummary) {
    const searchTerm = interpretation?.canonical_name || trimmed;
    // Try plain fuzzy search first
    console.log(`[Wiki Resolver] Trying last-resort fuzzy search for "${searchTerm}"...`);
    const fallbackPages = await searchWikiTitles(searchTerm, 5);
    for (const page of fallbackPages) {
      const t = page.key || page.title;
      if (candidateTitles.includes(t)) continue; // already tried
      const sum = await fetchWikiSummaryByTitle(t);
      if (isValidDharmicPage(sum)) {
        bestSummary = sum;
        console.log(`[Wiki Resolver] ✅ Accepted from fallback fuzzy search: "${sum.title}"`);
        break;
      }
    }
  }

  // 5. Even-last-resort: search with "Hindu mythology" appended
  if (!bestSummary) {
    const searchTerm = interpretation?.canonical_name || trimmed;
    console.log(`[Wiki Resolver] Trying mythology-augmented search for "${searchTerm} Hindu mythology"...`);
    const mythPages = await searchWikiTitles(`${searchTerm} Hindu mythology`, 5);
    for (const page of mythPages) {
      const sum = await fetchWikiSummaryByTitle(page.key || page.title);
      if (isValidDharmicPage(sum)) {
        bestSummary = sum;
        console.log(`[Wiki Resolver] ✅ Accepted from mythology-augmented search: "${sum.title}"`);
        break;
      }
    }
  }

  if (!bestSummary) {
    console.log(`[Wiki Resolver] No valid Dharmic Wikipedia page found for: "${trimmed}"`);
    const result = { found: false };
    if (env?.CACHE) {
      try { await env.CACHE.put(cacheKey, JSON.stringify(result), { expirationTtl: 60 * 60 }); } catch (_) {} // cache miss for 1h
    }
    return result;
  }

  // 5. Build the result
  let finalTitle = bestSummary.title;
  let finalExtract = bestSummary.extract;
  let finalPageUrl = bestSummary.content_urls?.desktop?.page
    || `https://en.wikipedia.org/wiki/${encodeURIComponent(bestSummary.title)}`;
  let finalImageUrl = null;
  let finalWikiLang = "en";

  // Prefer originalimage > thumbnail, and validate the URL
  const rawImageUrl = bestSummary.originalimage?.source || bestSummary.thumbnail?.source || null;
  if (isValidImageUrl(rawImageUrl)) {
    finalImageUrl = rawImageUrl;
  }

  // 6. Try Hindi Wikipedia if requested
  if (lang === "hi" || lang === "hinglish") {
    try {
      const llUrl = `https://en.wikipedia.org/w/api.php?action=query&prop=langlinks&lllang=hi&titles=${encodeURIComponent(bestSummary.title)}&format=json`;
      const llRes = await fetch(llUrl, { headers: { "User-Agent": WIKI_USER_AGENT } });
      if (llRes.ok) {
        const llData = await llRes.json();
        const queryPages = llData.query?.pages || {};
        let hiTitle = null;
        for (const id in queryPages) {
          if (queryPages[id].langlinks?.length > 0) {
            hiTitle = queryPages[id].langlinks[0]["*"];
            break;
          }
        }
        if (hiTitle) {
          const hiSumUrl = `https://hi.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(hiTitle)}`;
          const hiSumRes = await fetch(hiSumUrl, { headers: { "User-Agent": WIKI_USER_AGENT } });
          if (hiSumRes.ok) {
            const hiSum = await hiSumRes.json();
            if (hiSum.type !== "disambiguation" && hiSum.extract) {
              finalTitle = hiSum.title;
              finalExtract = hiSum.extract;
              finalPageUrl = hiSum.content_urls?.desktop?.page || `https://hi.wikipedia.org/wiki/${encodeURIComponent(hiTitle)}`;
              finalWikiLang = "hi";
              // Keep English image if Hindi has none or an invalid one
              const hiImg = hiSum.originalimage?.source || hiSum.thumbnail?.source;
              if (!finalImageUrl && isValidImageUrl(hiImg)) {
                finalImageUrl = hiImg;
              }
            }
          }
        }
      }
    } catch (hiErr) {
      console.warn("Hindi Wikipedia fetch error (non-fatal):", hiErr?.message);
    }
  }

  const result = {
    found: true,
    title: finalTitle,
    extract: finalExtract,
    imageUrl: finalImageUrl,
    pageUrl: finalPageUrl,
    wikiLang: finalWikiLang,
    canonicalName: interpretation?.canonical_name || finalTitle
  };

  // 7. Cache in KV (30 days)
  if (env?.CACHE) {
    try {
      await env.CACHE.put(cacheKey, JSON.stringify(result), { expirationTtl: WIKI_CACHE_TTL_SECONDS });
    } catch (putErr) {
      console.warn("KV wiki cache write error:", putErr);
    }
  }

  return result;
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
  // Use wiki2: prefix (matches the new resolver's cache key)
  const cacheKey = `wiki2:${lang}:${normalized}`;
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
