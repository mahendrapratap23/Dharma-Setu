/**
 * Local HTTP test server for Dharma Setu Worker
 * Allows testing POST /api/explain using curl or browser without needing Wrangler installed.
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import worker from "../src/index.js";

// Read .dev.vars if present
const devVars = {};
if (fs.existsSync(".dev.vars")) {
  const content = fs.readFileSync(".dev.vars", "utf8");
  for (const line of content.split("\n")) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      devVars[match[1]] = match[2]?.replace(/^["']|["']$/g, "").trim();
    }
  }
}

// In-memory mock KV store for local test server
const inMemoryStore = new Map();
const mockKV = {
  async get(key) {
    const item = inMemoryStore.get(key);
    if (!item) return null;
    if (item.expiresAt && Date.now() > item.expiresAt) {
      inMemoryStore.delete(key);
      return null;
    }
    return item.value;
  },
  async put(key, value, options) {
    const expiresAt = options?.expirationTtl
      ? Date.now() + options.expirationTtl * 1000
      : null;
    inMemoryStore.set(key, { value, expiresAt });
  }
};

const PORT = process.env.PORT || 8787;
const env = {
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || devVars.GEMINI_API_KEY,
  GEMINI_MODEL: process.env.GEMINI_MODEL || devVars.GEMINI_MODEL || "gemini-2.5-flash",
  ALLOWED_ORIGIN: "*",
  CACHE: mockKV
};

const server = http.createServer(async (req, res) => {
  const url = `http://${req.headers.host || "localhost"}${req.url}`;
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  const body = ["GET", "HEAD"].includes(req.method) ? undefined : Buffer.concat(chunks);

  const webRequest = new Request(url, {
    method: req.method,
    headers: req.headers,
    body
  });

  try {
    const webResponse = await worker.fetch(webRequest, env, {});
    res.statusCode = webResponse.status;
    for (const [key, value] of webResponse.headers.entries()) {
      res.setHeader(key, value);
    }
    const responseBody = await webResponse.arrayBuffer();
    res.end(Buffer.from(responseBody));
  } catch (err) {
    console.error("Local server error:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Internal Server Error", details: String(err) }));
  }
});

server.listen(PORT, () => {
  console.log(`\n🕉️  Dharma Setu local Worker test server running on http://localhost:${PORT}`);
  console.log(`Endpoint: POST http://localhost:${PORT}/api/explain`);
  console.log(`Gemini API Key: ${env.GEMINI_API_KEY ? "CONFIGURED (Active)" : "NOT SET (Mock/Validation mode)"}\n`);
});
