/**
 * Dharma Setu - Cloudflare Worker Backend
 * AI-powered explorer for Hindu Dharma via Gemini API.
 */

export const SYSTEM_PROMPT = `You are Dharma Setu, a guide to Hindu Dharma. Reply ONLY with JSON matching the schema.
1) Reply in the user's chosen language: hinglish = Hindi written in Roman script, hi = Devanagari Hindi, en = English. Use simple short sentences.
2) Every claim needs a source (text + kand/parva/adhyaya). If unsure, say so and set confidence to low. Never invent verses or sources.
3) Keep Valmiki Ramayana, Ramcharitmanas, Puranas and folk tradition clearly separate. Where traditions differ, say 'in some traditions...' and never call a tradition wrong.
4) Only include connections found in scriptures or well-known tradition.
5) If the question is unrelated to Hindu Dharma, or hateful/political, politely decline in the same JSON format with confidence low.
6) Be respectful and neutral.`;

export const GEMINI_SCHEMA = {
  type: "OBJECT",
  properties: {
    title: { type: "STRING" },
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
    // In case of KV read error, log and allow request through
    console.error("Rate limit check error:", err);
    return true;
  }
}

/**
 * Calls Gemini REST API with retry on 429/5xx.
 */
async function callGeminiApi({ q, lang, context }, env) {
  const apiKey = env?.GEMINI_API_KEY;
  if (!apiKey) {
    throw { status: 500, message: "GEMINI_API_KEY is not configured on the server." };
  }

  const model = env?.GEMINI_MODEL || "gemini-2.5-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`;

  let promptText = `User Question: "${q}"\nSelected Language: "${lang}"`;
  if (context && typeof context === "string" && context.trim().length > 0) {
    promptText += `\nContext/Previous Topic: "${context.trim().slice(0, 200)}"`;
  }

  const payload = {
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
      maxOutputTokens: 1500,
      responseMimeType: "application/json",
      responseSchema: GEMINI_SCHEMA
    }
  };

  const executeCall = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

    try {
      const response = await fetch(url, {
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
    response = await executeCall();
  } catch (err) {
    // First attempt failed (timeout or network error) -> retry once with backoff
    console.warn("First Gemini attempt failed, retrying in 800ms...", err);
    await new Promise((resolve) => setTimeout(resolve, 800));
    try {
      response = await executeCall();
    } catch (retryErr) {
      console.error("Gemini call failed after retry:", retryErr);
      throw { status: 502, error: "busy" };
    }
  }

  // Handle upstream HTTP response status
  if (!response.ok) {
    const upstreamStatus = response.status;
    if (upstreamStatus === 429 || upstreamStatus >= 500) {
      console.warn(`Upstream returned ${upstreamStatus}, retrying once in 800ms...`);
      await new Promise((resolve) => setTimeout(resolve, 800));
      try {
        const retryResponse = await executeCall();
        if (retryResponse.ok) {
          response = retryResponse;
        } else {
          throw { status: retryResponse.status === 429 ? 429 : 502, error: "busy" };
        }
      } catch (e) {
        throw { status: upstreamStatus === 429 ? 429 : 502, error: "busy" };
      }
    } else {
      console.error(`Upstream Gemini error: HTTP ${upstreamStatus}`);
      throw { status: 502, error: "busy" };
    }
  }

  const result = await response.json();
  const rawText = result?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!rawText) {
    console.error("Empty or invalid candidate in Gemini response");
    throw { status: 502, error: "busy" };
  }

  try {
    return JSON.parse(rawText);
  } catch (parseErr) {
    console.error("Failed to parse Gemini response as JSON:", rawText);
    throw { status: 502, error: "busy" };
  }
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

  const { q, lang, context } = body || {};

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
        return jsonResponse(
          cachedJson,
          200,
          { "X-Dharma-Cache": "HIT" },
          corsHeaders
        );
      }
    } catch (cacheErr) {
      console.warn("KV Cache read error:", cacheErr);
    }
  }

  // Call Gemini REST API
  try {
    const data = await callGeminiApi({ q: q.trim(), lang, context }, env);

    // Save to KV cache if CACHE is available
    if (env?.CACHE) {
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
      return jsonResponse({ error: "busy" }, err.status || 502, {}, corsHeaders);
    }
    if (err && err.status === 500) {
      return jsonResponse({ error: "Server configuration error" }, 500, {}, corsHeaders);
    }
    return jsonResponse({ error: "busy" }, 502, {}, corsHeaders);
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

    // Worker explain endpoint
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
