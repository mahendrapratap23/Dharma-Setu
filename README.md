# Dharma Setu (धर्म सेतु)

An AI-powered explorer for Hindu Dharma. Every answer is generated live from the Google Gemini API with strict adherence to Hindu scriptures and authentic traditions.

- **Frontend**: Plain HTML, CSS, and Vanilla JavaScript (mobile-first, zero build step, no frameworks).
- **Backend**: Single Cloudflare Worker handling `/api/explain` with KV caching, per-IP rate limiting, and Gemini structured JSON generation.
- **Hosting**: Cloudflare Workers with Static Assets.

---

## Project Structure

```text
├── public/                 # Static assets served by Cloudflare Workers
│   ├── index.html          # Main application page
│   ├── style.css           # Mobile-first stylesheet
│   └── app.js              # Client logic
├── src/
│   └── index.js            # Cloudflare Worker backend code
├── test/
│   ├── test-worker.mjs     # Automated test suite for backend logic
│   └── server.mjs          # Lightweight local test server for curl testing
├── wrangler.toml           # Cloudflare Worker configuration & bindings
├── package.json            # Node scripts & project metadata
└── README.md               # Setup and deployment documentation
```

---

## Phase 1: Backend Architecture

### Route: `POST /api/explain`

**Request Body:**
```json
{
  "q": "Kya Krishna Ramayan mein hain?",
  "lang": "hinglish",
  "context": "optional previous topic"
}
```

* `q`: 1 to 200 characters string (trimmed).
* `lang`: `"hinglish"` | `"hi"` | `"en"`.
* `context`: Optional context or previous topic name (up to 200 characters).

### Response Schema:
```json
{
  "title": "Krishna aur Ramayan ka Sambandh",
  "type": "concept",
  "summary": "Krishna Ramayan ke mukhya kal mein shamil nahi the...",
  "story": [
    { "tab": "Yuga Antar", "text": "Ram Treta Yuga mein the jabki Krishna Dvapara Yuga mein." }
  ],
  "sources": ["Valmiki Ramayana, Bal Kanda", "Mahabharata, Vana Parva"],
  "real_life": "Dono ko Bhagwan Vishnu ke purnavtar ke roop mein pooja jata hai.",
  "traditions_differ": "Kuch paramparayein inhe ek hi param tattva manti hain.",
  "connections": [
    {
      "name": "Shri Ram",
      "type": "person",
      "relation": "Purva Avatar",
      "source": "Vishnu Purana"
    }
  ],
  "follow_ups": [
    "Treta Yuga aur Dvapara Yuga mein kya antar hai?",
    "Kya Ramji Mahabharat mein aate hain?",
    "Vishnu ke 10 avatar kaun hain?"
  ],
  "confidence": "high"
}
```

### Key Backend Features:
1. **Input Validation**: Rejects invalid query lengths or unsupported languages with HTTP 400.
2. **Abuse Protection**: Per-IP rate limiting (20 requests per minute) stored in KV with HTTP 429 response.
3. **KV Caching**: Key format `cache:<lang>:<normalized(q)>` with a 30-day TTL (`2592000` seconds). Returns `X-Dharma-Cache: HIT`.
4. **Structured Gemini Output**: Invokes `https://generativelanguage.googleapis.com/v1beta/models/{GEMINI_MODEL}:generateContent` using `responseSchema` and system instructions.
5. **Clean Error Handling**: Automatic retry on timeouts and upstream 429/502 errors; never leaks API keys or raw error traces.

---

## How to Test Phase 1

### 1. Run Automated Backend Unit Tests

Run the built-in test suite (tests normalization, validation, CORS, rate limiting, and cache hits):

```bash
node test/test-worker.mjs
```

*(Or `npm test`)*

### 2. Test Live or with cURL using the Local Test Server

Start the test server:

```bash
# Optional: export your Gemini API key to test live generation:
export GEMINI_API_KEY="your-gemini-api-key"

node test/server.mjs
```

In another terminal, test with `curl`:

#### Test A: Health Check
```bash
curl -i http://localhost:8787/api/health
```

#### Test B: Validation (Reject Empty Query -> 400)
```bash
curl -i -X POST http://localhost:8787/api/explain \
  -H "Content-Type: application/json" \
  -d '{"q": "", "lang": "en"}'
```

#### Test C: Validation (Reject Unsupported Language -> 400)
```bash
curl -i -X POST http://localhost:8787/api/explain \
  -H "Content-Type: application/json" \
  -d '{"q": "Ram", "lang": "spanish"}'
```

#### Test D: Live Query (Hinglish)
```bash
curl -i -X POST http://localhost:8787/api/explain \
  -H "Content-Type: application/json" \
  -d '{"q": "Ram", "lang": "hinglish"}'
```

#### Test E: Live Query (Hindi / Devanagari)
```bash
curl -i -X POST http://localhost:8787/api/explain \
  -H "Content-Type: application/json" \
  -d '{"q": "कृष्ण", "lang": "hi"}'
```

---

## Cloudflare Deployment Instructions (For Phase 3)

1. **Install Wrangler**:
   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**:
   ```bash
   wrangler login
   ```

3. **Create KV Namespace for Caching**:
   ```bash
   wrangler kv namespace create CACHE
   ```
   Copy the `id` from the output and paste it into `wrangler.toml`:
   ```toml
   [[kv_namespaces]]
   binding = "CACHE"
   id = "<PASTE_YOUR_KV_ID_HERE>"
   ```

4. **Set Secret Gemini API Key**:
   ```bash
   wrangler secret put GEMINI_API_KEY
   ```
   Paste your Google Gemini API key when prompted.

5. **Deploy**:
   ```bash
   wrangler deploy
   ```
