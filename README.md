# Dharma Setu (धर्म सेतु)

An AI-powered mobile-first explorer for Hindu Dharma powered by a **hybrid of Wikipedia and Google Gemini**. Every query is verified and grounded against Wikipedia's encyclopedic knowledge before being enriched by Google Gemini (`gemini-3.5-flash`) with scripture citations (Valmiki Ramayana, Ramcharitmanas, Mahabharata, Puranas), interactive SVG Connection Maps, and voice narration. Cached globally using Cloudflare Workers KV for ultra-fast response times.

---

## Hybrid Search Architecture (Wikipedia + Gemini)

1. **Parallel Execution**: On search, the frontend dispatches `GET /api/wiki` and `POST /api/explain` concurrently.
2. **Instant Wikipedia Grounding Card**:
   - Resolves misspellings and phonetic transliterations (e.g. `drapati` -> `Draupadi`) using MediaWiki fuzzy title search.
   - Fetches authentic page summaries (preferring Hindi extract from `hi.wikipedia.org` when language is `hi` or `hinglish`).
   - Renders at the top with thumbnail (tap for interactive Lightbox modal), title, 2–3 line clamped extract, "Read more on Wikipedia" link, and standard CC BY-SA attribution.
   - **Image Rule**: Real photos/artwork display exclusively for `person`, `place`, or `scripture` topics; concepts, events, and traditions (`concept`, `event`, `tradition`) display the sacred rotating mandala placeholder.
3. **AI Scripture Synthesis**:
   - Below the Wikipedia card, Gemini delivers authenticated scriptural commentary, episodic story tabs, dynamic SVG relationship graphs, and daily life practices.
   - Gemini prompt is strictly grounded with Wikipedia reference context to avoid factual drift.
   - Skeletons stream smoothly while AI synthesizes results.
4. **Distinct Source Badges**:
   - `Wikipedia ke anusaar` vs `Dharma Setu AI`.
5. **30-Day KV Caching**:
   - Both Wikipedia summaries (`wiki:<lang>:<query>`) and Gemini explanations (`explain:<lang>:<query>`) are cached in Cloudflare Workers KV for 30 days (`2,592,000` seconds).

---

## Endpoints

- `GET /api/wiki?q=...&lang=...`: Returns `{ found: true, title, extract, imageUrl, pageUrl, wikiLang }` or `{ found: false }`.
- `POST /api/explain`: Body `{ q, lang, context?, wiki_context? }`. Returns structured JSON with title, type, summary, story, connections, sources, and real_life.

---

## Project Structure

```text
├── public/                 # Static Assets (served by Cloudflare Workers Assets)
│   ├── index.html          # Semantic HTML5 markup, Lightbox modal, Turnstile hook
│   ├── style.css           # Mobile-first stylesheet (Wikipedia card, Dark Indigo & Light Cream)
│   ├── app.js              # Vanilla JS app, parallel fetch, Lightbox, SVG network graph, i18n
│   └── favicon.svg         # Sacred glowing Diya SVG favicon
├── src/
│   └── index.js            # Cloudflare Worker backend (Wikipedia MediaWiki API, KV cache, Gemini)
├── test/
│   ├── test-worker.mjs     # Automated backend unit test suite
│   └── server.mjs          # Local HTTP test server with static asset serving
├── wrangler.toml           # Cloudflare deployment config & KV bindings
├── package.json            # Node scripts
└── README.md               # Beginner deploy guide & verification test list
```

---

## Local Development & Testing

### 1. Run Backend Automated Unit Tests
```bash
npm test
# Or: node test/test-worker.mjs
```

### 2. Run Local Development Server
```bash
npm run serve:test
# Or: node test/server.mjs
```
Open **http://localhost:8787/** in your browser.

---

## Deployment Guide (Beginner Step-by-Step)

Follow these steps to deploy Dharma Setu to your Cloudflare account.

### Step 1: Install Wrangler Globally
If you haven't installed Cloudflare Wrangler, open your terminal and run:
```bash
npm install -g wrangler
```

### Step 2: Login to Cloudflare
Authenticate Wrangler with your Cloudflare account:
```bash
wrangler login
```
*A browser window will open asking you to authorize Wrangler. Click **Allow**.*

---

### Step 3: Create the KV Cache Namespace
Create a dedicated KV namespace for caching responses and rate limiting:
```bash
wrangler kv namespace create CACHE
```

The command will output something like this:
```text
🌀 Creating namespace with title "dharma-setu-CACHE"
✨ Success!
Add the following to your wrangler.toml:
[[kv_namespaces]]
binding = "CACHE"
id = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
```

---

### Step 4: Paste KV ID into `wrangler.toml`
Open `wrangler.toml` in your editor and replace `REPLACE_WITH_KV_NAMESPACE_ID` with the `id` from Step 3:

```toml
[[kv_namespaces]]
binding = "CACHE"
id = "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6"
```

---

### Step 5: Store Your Secret Gemini API Key
Store your Gemini API key securely in Cloudflare's encrypted secret store (this is never committed or exposed to users):
```bash
wrangler secret put GEMINI_API_KEY
```
When prompted:
```text
✔ Enter a secret value: ****************************************
```
Paste your Gemini API key and hit **Enter**.

---

### Step 6: Verify Environment Variables in `wrangler.toml`
Ensure `wrangler.toml` has your desired settings:
```toml
[vars]
GEMINI_MODEL = "gemini-3.5-flash"
ALLOWED_ORIGIN = "*"
```
*(If you want to restrict requests to your own domain, replace `"*"` with `"https://yourdomain.com"`).*

---

### Step 7: Deploy to Cloudflare
Deploy the Worker and static assets in a single command:
```bash
wrangler deploy
```

Once deployment completes, Wrangler will print your live deployment URL:
```text
Uploaded 4 files (4.2 KiB)
Published dharma-setu (0.42 sec)
  https://dharma-setu.<your-subdomain>.workers.dev
Current Deployment ID: 12345678-abcd-ef01-2345-6789abcdef01
```

Visit the `workers.dev` URL on your phone or computer to start using Dharma Setu live!

---

## How to Add a Custom Domain (Later)

To run Dharma Setu on your custom domain (e.g., `dharmasetu.org` or `dharma.yourdomain.com`):

1. Go to the [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. In the left navigation, click **Compute (Workers) > Workers & Pages**.
3. Select **dharma-setu**.
4. Click the **Settings** tab, then select **Domains & Routes**.
5. Under **Custom Domains**, click **Add Custom Domain**.
6. Enter your domain or subdomain (e.g., `dharma.yourdomain.com`) and click **Add Custom Domain**.
7. Cloudflare will automatically provision an SSL/TLS certificate and route traffic.

---

## Cloudflare Turnstile Bot Protection (Optional Hook)

A hook point is already prepared:
1. **Frontend**: In `public/index.html`, uncomment the `<script src="https://challenges.cloudflare.com/turnstile/v0/api.js">` tag and the `#cf-turnstile-container` div with your sitekey.
2. **Backend**: In `src/index.js`, uncomment the Turnstile verification block in `handleExplain`.
3. Add your secret key:
   ```bash
   wrangler secret put TURNSTILE_SECRET_KEY
   ```

---

## Checklist: Manual Tasks Required by You

Here is the exact list of things you must do manually to deploy:

| Item | Action Required | Status |
| :--- | :--- | :--- |
| **Cloudflare Account** | Run `wrangler login` to authorize your Cloudflare account. | Required |
| **Create KV Namespace** | Run `wrangler kv namespace create CACHE` and copy the returned ID. | Required |
| **Update `wrangler.toml`** | Paste the KV ID into `[[kv_namespaces]] id = "..."`. | Required |
| **Set Gemini Secret** | Run `wrangler secret put GEMINI_API_KEY` and enter your Gemini API key. | Required |
| **Deploy** | Run `wrangler deploy`. | Required |
| **Custom Domain** | *(Optional)* Add custom domain under Cloudflare Workers Settings. | Optional |

---

## Phone Testing Checklist (360px – 430px)

Use this checklist to test the app on a mobile device:

- [ ] **Viewport & Layout**: Page loads without horizontal scrolling on 360–430px width.
- [ ] **Tap Targets**: All buttons, chips, tabs, and inputs are easily tappable with one thumb ($\ge 44\text{px}$).
- [ ] **Search Box**: Fast search submission via either "Khojein" or Enter key.
- [ ] **Diya Loader**: Glowing Diya flame animation and rotating sacred phrases appear while waiting for results (2–5 seconds).
- [ ] **Stacked Cards**:
  - [ ] Hero card displays title, color-coded type badge, and clear summary.
  - [ ] Story tabs are swipeable/tappable with smooth crossfade.
  - [ ] Interactive SVG Connection Map renders center topic and orbital nodes.
  - [ ] Tapping a map node opens the Bottom Sheet drawer with relation and scripture source.
  - [ ] Tapping "Iske bare mein jaanein" navigates to that topic and displays `← Peeche` breadcrumb.
  - [ ] Scripture citations are listed under "Granthon mein".
  - [ ] Daily relevance shown under "Real life mein".
  - [ ] Differing traditions note shown neutrally if applicable.
  - [ ] Follow-up questions work when clicked.
- [ ] **Sticky Search Bar**: Bottom search bar stays reachable at the bottom of the screen while scrolling results.
- [ ] **Share / Copy**: Native share sheet opens on mobile (or copies link with toast message).
- [ ] **Theme Switching**: Sun/Moon toggle switches between Dark Indigo and Cream modes; selection persists after reload.
- [ ] **Language Switching**: Hinglish, Hindi (हिंदी), and English correctly translate UI labels and content.
- [ ] **Shareable URL**: URLs like `/?q=Hanuman&lang=hi` load directly into the query results.

---

## Hybrid Search Test List

Test these specific queries to verify the complete Wikipedia + Gemini hybrid workflow:

| Query | What It Tests | Expected Wikipedia Result | Image / Media | Expected AI Result |
| :--- | :--- | :--- | :--- | :--- |
| **`drapati`** | Fuzzy typo resolution & transliteration | Resolves to **Draupadi** (द्रौपदी in Hindi) | Raja Ravi Varma portrait (Lightbox zoom works) | "Maine samjha: Draupadi", Mahabharata Sabhaparva context |
| **`draupadi`** | Canonical topic lookup | Direct match **Draupadi** with summary | Portrait thumbnail with Lightbox preview | Full Panchali narrative, 5 Pandavas connections |
| **`Ram`** | Disambiguation handling (`Ram` -> `Rama`) | Matches **Rama** (राम) from Itihasa | Adhyatma Ramayana / classical deity art | Valmiki Ramayana & Ramcharitmanas citations |
| **`Hanuman`** | Deity lookup & Hindi extraction | Matches **Hanuman** (हनुमान) | Deity artwork thumbnail | Sundarkand references, Panchamukha relations |
| **`Ayodhya`** | Place type (`place`) | Matches holy city **Ayodhya** (अयोध्या) | City/temple image (allowed for `place` type) | Ram Janmabhoomi, Sarayu river, Kosala kingdom map |
| **`Ekadashi`** | Concept/tradition (`concept`/`tradition`) | Matches **Ekadashi** (एकादशी) observance | **Mandala Placeholder** (No photo per Rule 4) | 24 Ekadashis, Nirjala/Harivasara rules, Padma Purana |
| **`Diwali`** | Event/festival (`event`/`tradition`) | Matches **Diwali** (दीपावली) festival | **Mandala Placeholder** (No photo per Rule 4) | Rama's return to Ayodhya, Lakshmi Puja traditions |

