/**
 * Dharma Setu Backend Automated Test Script
 * Verifies validation, CORS, rate limiting, and caching behavior.
 */

import worker, { normalizeQuery, GEMINI_SCHEMA, SYSTEM_PROMPT } from "../src/index.js";
import assert from "node:assert";

class MockKV {
  constructor() {
    this.store = new Map();
  }
  async get(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }
  async put(key, value) {
    this.store.set(key, value);
  }
}

async function runTests() {
  console.log("🕉️  Testing Dharma Setu Worker Backend (Phase 1)...\n");

  // Test 1: Query Normalization
  console.log("1. Testing query normalization...");
  assert.strictEqual(normalizeQuery("  Ram   Chandra  "), "ram chandra");
  assert.strictEqual(normalizeQuery("BHAGAVAD GITA"), "bhagavad gita");
  console.log("   ✅ Normalization passes.");

  // Test 2: CORS Preflight
  console.log("2. Testing CORS preflight (OPTIONS /api/explain)...");
  const optionsReq = new Request("http://localhost/api/explain", {
    method: "OPTIONS",
    headers: { Origin: "http://localhost:8787" }
  });
  const optionsRes = await worker.fetch(optionsReq, { ALLOWED_ORIGIN: "*" });
  assert.strictEqual(optionsRes.status, 204);
  assert.strictEqual(optionsRes.headers.get("Access-Control-Allow-Origin"), "http://localhost:8787");
  console.log("   ✅ CORS preflight headers verified.");

  // Test 3: Validation: missing q
  console.log("3. Testing input validation: missing 'q'...");
  const invalidReq1 = new Request("http://localhost/api/explain", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lang: "hi" })
  });
  const res1 = await worker.fetch(invalidReq1, {});
  assert.strictEqual(res1.status, 400);
  const data1 = await res1.json();
  assert.ok(data1.error.includes("Invalid question"));
  console.log("   ✅ Rejection of missing 'q' passes.");

  // Test 4: Validation: invalid lang
  console.log("4. Testing input validation: invalid 'lang'...");
  const invalidReq2 = new Request("http://localhost/api/explain", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: "Ram", lang: "french" })
  });
  const res2 = await worker.fetch(invalidReq2, {});
  assert.strictEqual(res2.status, 400);
  const data2 = await res2.json();
  assert.ok(data2.error.includes("Invalid 'lang'"));
  console.log("   ✅ Rejection of invalid 'lang' passes.");

  // Test 5: Validation: q > 200 characters
  console.log("5. Testing input validation: 'q' exceeding 200 characters...");
  const invalidReq3 = new Request("http://localhost/api/explain", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: "A".repeat(201), lang: "en" })
  });
  const res3 = await worker.fetch(invalidReq3, {});
  assert.strictEqual(res3.status, 400);
  console.log("   ✅ Rejection of > 200 chars passes.");

  // Test 6: KV Cache Hit simulation
  console.log("6. Testing KV Cache hit...");
  const mockKV = new MockKV();
  const sampleResponse = {
    title: "Ram",
    type: "person",
    summary: "Shri Ram is the seventh avatar of Vishnu and central figure of the Ramayana.",
    story: [{ tab: "Avatar", text: "Maryada Purushottam Ram" }],
    sources: ["Valmiki Ramayana, Bal Kanda"],
    real_life: "Celebrated on Ram Navami and Diwali",
    traditions_differ: "",
    connections: [{ name: "Sita", type: "person", relation: "Consort", source: "Ramayana" }],
    follow_ups: ["Who is Lakshman?", "What is Ram Setu?", "Tell about Ayodhya"],
    confidence: "high"
  };

  await mockKV.put("cache:en:ram", JSON.stringify(sampleResponse));

  const cacheReq = new Request("http://localhost/api/explain", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ q: "Ram", lang: "en" })
  });
  const cacheRes = await worker.fetch(cacheReq, { CACHE: mockKV });
  assert.strictEqual(cacheRes.status, 200);
  assert.strictEqual(cacheRes.headers.get("X-Dharma-Cache"), "HIT");
  const cacheData = await cacheRes.json();
  assert.strictEqual(cacheData.title, "Ram");
  console.log("   ✅ KV Cache HIT verification passes.");

  // Test 7: Rate limiting simulation
  console.log("7. Testing rate limit (20 req/min)...");
  const rateLimitKV = new MockKV();
  await rateLimitKV.put("cache:en:ram", JSON.stringify(sampleResponse));
  for (let i = 0; i < 20; i++) {
    const r = new Request("http://localhost/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json", "CF-Connecting-IP": "198.51.100.1" },
      body: JSON.stringify({ q: "Ram", lang: "en" })
    });
    const resp = await worker.fetch(r, { CACHE: rateLimitKV });
    // All 20 should succeed (cache hit)
    assert.strictEqual(resp.status, 200);
  }
  // 21st request should be rejected with 429
  const rateExceededReq = new Request("http://localhost/api/explain", {
    method: "POST",
    headers: { "Content-Type": "application/json", "CF-Connecting-IP": "198.51.100.1" },
    body: JSON.stringify({ q: "Ram", lang: "en" })
  });
  const rateExceededRes = await worker.fetch(rateExceededReq, { CACHE: rateLimitKV });
  assert.strictEqual(rateExceededRes.status, 429);
  console.log("   ✅ Rate limit correctly blocks after 20 req/min with HTTP 429.");

  // Test 8: extractAndParseJson tests
  console.log("8. Testing robust JSON parser (extractAndParseJson)...");
  const { extractAndParseJson } = await import("../src/index.js");
  const fenced = "```json\n{\"title\": \"Draupadi\", \"interpreted_as\": \"Draupadi\"}\n```";
  const parsedFenced = extractAndParseJson(fenced);
  assert.strictEqual(parsedFenced.title, "Draupadi");
  assert.strictEqual(parsedFenced.interpreted_as, "Draupadi");

  const noisy = "Here is the response: {\"title\": \"Sita\", \"confidence\": \"high\"} hope it helps!";
  const parsedNoisy = extractAndParseJson(noisy);
  assert.strictEqual(parsedNoisy.title, "Sita");
  console.log("   ✅ extractAndParseJson handles fences and trailing text correctly.");

  // Test 9: Live Gemini API check if GEMINI_API_KEY is available
  let testApiKey = process.env.GEMINI_API_KEY;
  if (!testApiKey) {
    const fs = await import("node:fs");
    if (fs.existsSync(".dev.vars")) {
      const devContent = fs.readFileSync(".dev.vars", "utf8");
      const match = devContent.match(/GEMINI_API_KEY\s*=\s*["']?([^"'\r\n]+)/);
      if (match) testApiKey = match[1];
    }
  }

  if (testApiKey) {
    console.log("9. Testing LIVE Gemini API call with misspelling 'drapati'...");
    const liveReq = new Request("http://localhost/api/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: "drapati", lang: "hinglish" })
    });
    const liveRes = await worker.fetch(liveReq, {
      GEMINI_API_KEY: testApiKey,
      GEMINI_MODEL: process.env.GEMINI_MODEL || "gemini-3.5-flash",
      CACHE: new MockKV()
    });
    assert.strictEqual(liveRes.status, 200);
    const liveData = await liveRes.json();
    console.log("   Interpreted As:", liveData.interpreted_as);
    console.log("   Title:", liveData.title);
    console.log("   Did You Mean:", liveData.did_you_mean);
    console.log("   Speech Text:", liveData.speech_text ? liveData.speech_text.slice(0, 60) + "..." : "none");
    assert.ok(liveData.interpreted_as);
    assert.ok(liveData.title);
    assert.ok(liveData.speech_text);
    console.log("   ✅ Live 'drapati' resolution succeeded!");
  } else {
    console.log("9. Skipping live Gemini call.");
  }

  console.log("\n✨ All Phase A backend tests passed successfully!\n");
}

runTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
