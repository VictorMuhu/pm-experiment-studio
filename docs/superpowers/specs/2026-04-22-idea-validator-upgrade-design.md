# Idea Validator Upgrade — Design Spec
**Date:** 2026-04-22
**Sprint:** 2-day focused build
**Status:** Approved, ready for implementation

---

## Context

The Idea Validator (live at `victormuhu.github.io/pm-experiment-studio/projects/2026-03-17-idea-validator/`) is a 5-tab single-page app for evaluating product ideas across 8 dimensions. The UX, architecture, and decision log are solid. The credibility gap is the scoring engine: it grades ideas based on text length, not content quality — a sharp product leader will see through this in 60 seconds.

This upgrade fixes that with a real LLM call, adds proper persistence, and adds shareable evaluation links. The existing frontend is kept almost entirely intact.

**Audience for the demo:** Product leader who specifically asked to see builder skills — how quickly ideas go from conception to prototype with UX in mind.

---

## Design Artifacts

Wireframes saved to repo before implementation began:

- [`docs/design/idea-validator-upgrade/wireframe-01-save-and-share.html`](../../design/idea-validator-upgrade/wireframe-01-save-and-share.html) — Save & Share button placement + loading state (two states)
- [`docs/design/idea-validator-upgrade/wireframe-02-shared-evaluation-view.html`](../../design/idea-validator-upgrade/wireframe-02-shared-evaluation-view.html) — Read-only share view for recipients

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   BROWSER                           │
│  Existing HTML/CSS/JS (5 tabs, all UX intact)       │
│  + async scoring call  + Save & Share button        │
│  + read-only share view                             │
└──────────────┬──────────────────────────────────────┘
               │ HTTPS
┌──────────────▼──────────────────────────────────────┐
│             VERCEL (serverless functions)            │
│                                                     │
│  POST /api/analyze   →  calls OpenAI GPT-4o         │
│  POST /api/save      →  writes to Supabase          │
│  GET  /api/eval/:id  →  reads from Supabase         │
│                                                     │
│  [OPENAI_API_KEY + SUPABASE keys in env vars]       │
└───────┬──────────────────────┬──────────────────────┘
        │                      │
┌───────▼──────┐    ┌──────────▼──────────────────────┐
│  OpenAI API  │    │  Supabase (PostgreSQL)           │
│  GPT-4o      │    │  evaluations table              │
└──────────────┘    └─────────────────────────────────┘
```

**Stack:**
- Frontend: Existing vanilla HTML/CSS/JS (zero new dependencies)
- Backend: Vercel serverless functions (Node.js)
- Database: Supabase (PostgreSQL, free tier)
- AI: OpenAI GPT-4o via `response_format: json_object`
- Deploy: GitHub → Vercel auto-deploy

---

## Data Flows

### Flow 1: Analyze an idea

```
User fills form → clicks "Run Check"
  → app.js sends POST /api/analyze
      { ideaTitle, problem, target, valueProp, solution,
        differentiation, competitors, channels,
        successMetric, constraints, stage }
  → Vercel function builds structured prompt → calls GPT-4o
  → GPT-4o returns JSON:
      { scores: { problemClarity: 82, userSpecificity: 71, ... },
        verdict: "Pursue" | "Refine" | "Pass for now",
        verdictReason: "...",
        dimensionNotes: { problemClarity: "...", ... },
        tags: ["metric-solid", "crowded-space"],
        strongSignals: [...],
        weakAssumptions: [...] }
  → app.js renders Scorecard tab (same render functions as today)
```

Typical latency: 2–3 seconds. On failure: toast error, button re-enables, no data loss.

### Flow 2: Save and share

```
Analysis complete → "Save & Share" button appears in Scorecard header
  → User clicks → app.js sends POST /api/save
      { draft_data, analysis, assumptions, steps }
  → Supabase inserts row → returns UUID
  → app.js copies URL to clipboard:
      https://idea-validator.vercel.app/eval/{uuid}
  → Toast: "Link copied — share it with anyone"

Recipient opens link:
  → app.js detects /eval/:id route on load
  → GET /api/eval/{uuid} → Supabase returns full evaluation
  → Renders read-only view: Scorecard + Assumptions + Next Steps
      (Workspace and Library tabs hidden)
      (Black "Shared evaluation" banner at top)
      ("Try it yourself →" CTA drives new users to tool)
```

---

## Frontend Changes

**What changes in `app.js`:**

1. **`analyzeDraft()` goes async** — becomes a `fetch()` to `/api/analyze`. Returns same JSON shape as today so all downstream render functions are unchanged.
2. **Loading state** — "Run Check" button shows spinner and disables during API call. Scorecard area shows skeleton rows. 8-second timeout triggers error toast.
3. **"Save & Share" button** — appears in Scorecard tab header after successful analysis. One click: POST to `/api/save`, copy URL to clipboard, show toast.
4. **Read-only share view** — on page load, if URL matches `/eval/:id`, fetch evaluation from `/api/eval/:id` and render in read-only mode. Workspace and Library tabs hidden. Readonly banner shown.

**What does NOT change:**
- All CSS and visual styling (zero regressions)
- All 5 tab layouts and UX
- Assumption generation logic (heuristic, stays as-is)
- Next-steps generation logic (heuristic, stays as-is)
- Library tab (localStorage for session history)
- Demo draft restore button
- Export to memo

---

## Backend — Vercel Serverless Functions

### `POST /api/analyze`

- Receives: full draft object (11 fields + stage)
- Builds structured prompt instructing GPT-4o to score 8 dimensions and return exact JSON schema
- Uses `response_format: { type: "json_object" }` for guaranteed parseable output
- Returns: analysis JSON (scores, verdict, notes, tags, signals)
- API key: `OPENAI_API_KEY` from Vercel env vars — never in browser

**Prompt design principle:** The prompt names each dimension explicitly, defines what a high vs. low score means, and specifies the exact JSON shape to return. This makes the scoring transparent and auditable — a strong PM talking point.

### `POST /api/save`

- Receives: `{ draft_data, analysis, assumptions, steps }`
- Inserts one row into Supabase `evaluations` table
- Returns: `{ id: uuid }`
- No auth, no rate limiting (v1 scope)

### `GET /api/eval/:id`

- Receives: UUID from URL param
- Queries Supabase by primary key
- Returns: full evaluation object
- 404 if not found → frontend shows "Evaluation not found" message

---

## Supabase Schema

**Table: `evaluations`**

| column | type | notes |
|---|---|---|
| `id` | UUID | primary key, auto-generated |
| `idea_title` | text | display in share view header |
| `draft_data` | JSONB | all 11 input fields |
| `analysis` | JSONB | full AI scoring result |
| `assumptions` | JSONB | generated assumption array |
| `steps` | JSONB | validation plan array |
| `created_at` | timestamptz | auto |

No user table. No auth. Public read by ID.

---

## Security

**API key handling:**
- `OPENAI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` stored in:
  - `.env.local` for local dev (gitignored, never committed)
  - Vercel dashboard environment variables for production
- Keys are never referenced in frontend code
- Browser network calls only send/receive idea text and scores

**`.gitignore` additions:**
```
.env
.env.local
.env*.local
```

**Share link security:** Evaluations are public by UUID. No personal data is stored (no name, email, or account). Security through obscurity is acceptable for a portfolio demo tool.

---

## Deploy

- Vercel project connects to `github.com/VictorMuhu/pm-experiment-studio`
- Root directory set to `projects/2026-03-17-idea-validator/` in Vercel settings
- Serverless functions live at `projects/2026-03-17-idea-validator/api/` — Vercel picks them up automatically from the project root
- A `vercel.json` file is required at the project root to rewrite `/eval/:id` → `index.html` (so direct URL loads don't 404 on the SPA):
  ```json
  {
    "rewrites": [{ "source": "/eval/:id", "destination": "/index.html" }]
  }
  ```
- Every push to `main` triggers auto-deploy
- Target live URL: auto-assigned by Vercel (e.g. `idea-validator-victormuhu.vercel.app`); can add custom domain later
- Preview URLs auto-generated for feature branches

---

## Two-Day Build Timeline

| Day | Work |
|---|---|
| Day 1 AM | Vercel project setup, `.env.local`, Supabase table creation, `/api/analyze` working locally with real GPT-4o |
| Day 1 PM | Wire `analyzeDraft()` in `app.js` to call the API, loading state, error toast |
| Day 2 AM | `/api/save` + `/api/eval/:id`, share URL logic, read-only view routing in `app.js` |
| Day 2 PM | Deploy to Vercel, end-to-end test with real ideas, polish rough edges |

---

## What Was Intentionally Out of Scope

- Auth / user accounts (not needed for demo)
- Rate limiting (v1, portfolio tool)
- PDF export (existing memo export is sufficient)
- Assumption or next-steps AI upgrade (heuristics work fine, scoring is the credibility gap)
- Mobile responsiveness improvements (desktop-first is acceptable for a leadership demo)
- Multi-idea comparison view (future enhancement)

---

## Talking Points for the Demo

1. **Design before code** — wireframes committed to the repo before implementation started
2. **LLM as a judge** — GPT-4o evaluates the idea; the market is moving this way and this tool is already there
3. **Incremental upgrade** — v1 validated the UX with heuristics; v2 adds real intelligence. That's a PM mindset applied to your own tools.
4. **Secure by default** — API keys in env vars, server-side only, never in browser
5. **Shareable output** — send a link, not a screenshot
