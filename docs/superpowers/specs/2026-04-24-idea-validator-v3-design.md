# Idea Validator V3 — Design Spec
**Date:** 2026-04-24
**Status:** Approved for implementation

---

## Goal

Rebuild the Idea Validator from a form→verdict scorecard into a real-time reasoning stream: the user drafts an idea, picks a critic lens, and watches GPT-4o think through the idea sentence by sentence — each concern and signal grounded back to the exact text that triggered it. The result is auditable AI reasoning, not just a score.

This is a demo-grade rebuild. The bar is bulletproof in a live presentation to hiring managers and peers. Every design decision traces back to the Claude Design prototype (Reasoning Stream — Scenarios, file: `reasoning-stream-scenarios-standalone.html`). Deviations from that prototype require explicit discussion before implementation.

---

## Scope

### V1 (this spec)
- Empty → drafting → streaming → done state arc
- Sentence-level grounding (click a sentence, filter the stream)
- Four lenses: Skeptic / Builder / Buyer / Competitor
- Error state and nothing-found (specificity gap) state
- V3 design language wholesale (OKLCH tokens, Source Serif 4 + Inter + JetBrains Mono)
- Vercel deployment (same project: `2026-03-17-idea-validator`)
- Supabase save/share updated for new data model

### Deferred (V2)
- Diff mode (compare before/after runs)
- Mobile layout (phone frame)
- Investor and Default lenses (dropped — Skeptic/Builder/Buyer/Competitor are tighter)

---

## Architecture

**Stack:** Vite + React SPA + Vercel serverless functions

The frontend is a static Vite + React build. The backend is two Vercel serverless functions: the existing `analyze.js` (kept untouched) and the new `stream.js` (SSE streaming). Vite proxies `/api/*` to the functions during local development.

**Runtime flow:**
1. User fills `IdeaForm`, picks a lens in `LensBar`
2. `App.jsx` transitions state → `streaming`, calls `useStream` hook
3. `useStream` opens a `fetch` POST to `/api/stream`, passes `{ draft, lens }`
4. `/api/stream.js` sends a streaming GPT-4o call, buffers tokens into complete JSON lines, forwards each as an SSE event
5. `useStream` parses events, appends to `thoughts` array in React state
6. `StreamPane` renders thoughts with fade-in animation as they arrive
7. Final SSE event is `type: "verdict"` — state transitions to `done`
8. User can click any sentence in `IdeaForm` to filter `StreamPane` to related thoughts
9. User can switch lens → new stream run against the same draft, no re-entry needed

---

## Project Structure

```
projects/2026-03-17-idea-validator/
├── src/
│   ├── main.jsx
│   ├── App.jsx               # State machine root
│   ├── components/
│   │   ├── IdeaForm.jsx      # Left column — draft input, sentence tagging
│   │   ├── StreamPane.jsx    # Right column — thought stream + verdict
│   │   ├── ThoughtItem.jsx   # Individual thought card
│   │   ├── LensBar.jsx       # Skeptic / Builder / Buyer / Competitor pills
│   │   ├── Verdict.jsx       # Final verdict block (serif score + label + reason)
│   │   └── EmptyState.jsx    # Cold state — invitation copy
│   ├── hooks/
│   │   └── useStream.js      # Network layer — fetch stream, parse NDJSON, dispatch
│   └── tokens.css            # All design tokens (OKLCH, fonts, spacing)
├── api/
│   ├── stream.js             # NEW — SSE streaming endpoint
│   └── analyze.js            # KEEP — untouched
├── index.html
├── vite.config.js
├── vercel.json
└── package.json
```

---

## Backend: `/api/stream.js`

### SSE Setup

```
POST /api/stream
Content-Type: application/json
Body: { draft: DraftObject, lens: "skeptic" | "builder" | "buyer" | "competitor" }

Response headers:
  Content-Type: text/event-stream
  Cache-Control: no-cache
  Connection: keep-alive
```

### Stream Protocol (NDJSON over SSE)

Three event types. One JSON object per `data:` line.

```
// Thought — concern
data: {"type":"thought","category":"concern","text":"The differentiation claim lacks a specific mechanism — 'easier to use' isn't falsifiable without a named comparison.","quote":"easier to use than existing tools"}

// Thought — strength
data: {"type":"thought","category":"strength","text":"Problem is tied to a specific trigger moment with a measurable consequence.","quote":"users abandon checkout on mobile when asked for card details"}

// Verdict — final event, closes stream
data: {"type":"verdict","label":"Refine","score":64,"reason":"Strong problem definition but differentiation and distribution need work before committing roadmap time."}

// Stream closed
data: [DONE]

// Error (stream interrupted mid-way)
data: {"type":"error","message":"Stream interrupted"}

// Nothing found (zero thoughts before verdict)
data: {"type":"nothing"}
```

**Malformed line handling:** If a line fails JSON.parse, skip it and continue. Never crash the stream on a single bad line.

**Abort handling:** If the client disconnects (user hits Stop), catch the abort and close the OpenAI stream cleanly.

### Prompt Design

System prompt swaps the critic persona per lens. The instruction structure is constant:

```
You are [LENS_PERSONA].

Read this product idea carefully. Think aloud — for each claim, assumption, or signal you notice, output one JSON object on its own line. Each object must include:
- "type": "thought"
- "category": "concern" or "strength"
- "text": your observation (1–2 sentences, direct and specific)
- "quote": the exact phrase from the input that triggered this thought

After all thoughts, output one final object:
- "type": "verdict"
- "label": "Pursue", "Refine", or "Pass"
- "score": integer 0–100
- "reason": 2-sentence summary referencing the strongest and weakest signal

Output nothing else. No markdown. No wrapper object. One JSON object per line.
```

### Lens Personas

| Lens | System prompt persona |
|---|---|
| **Skeptic** | A devil's advocate who hunts for unvalidated assumptions, logical gaps, and claims that sound good but aren't falsifiable. You are not trying to kill the idea — you are trying to surface what must be true for it to work. |
| **Builder** | A staff engineer evaluating what it would actually take to ship this. You flag hidden technical complexity, integration risks, data dependencies, and the gap between "solution sketch" and working software. |
| **Buyer** | A skeptical economic buyer who controls the budget. You evaluate whether the ROI story is credible, whether procurement friction is acknowledged, and whether you'd actually sign off on this. |
| **Competitor** | A product lead at the closest substitute. You evaluate why your users wouldn't switch, where the new product's differentiation is weak, and what the incumbent response would be. |

---

## Frontend: State Machine

Lives in `App.jsx`. Five states:

```
empty ──→ drafting ──→ streaming ──→ done
                           │
                         error
                           │
                         nothing
```

**Transitions:**
- `empty → drafting`: any form field receives input
- `drafting → streaming`: user clicks "Pressure-test" CTA
- `streaming → done`: `useStream` receives a `verdict` event
- `streaming → error`: `useStream` receives an `error` event or fetch throws
- `streaming → nothing`: `useStream` receives a `nothing` event
- `done → streaming`: user switches lens or clicks "Re-run" (same draft, new stream)
- `error → streaming`: user clicks "Restart"

**Active sentence state:** `activeSentenceId` (string | null). Set by clicking a sentence in `IdeaForm`. Cleared by clicking again or starting a new run. When set, `StreamPane` filters to thoughts whose `quote` overlaps the active sentence text.

---

## Frontend: Components

### `App.jsx`
Owns: `appState`, `thoughts`, `verdict`, `activeLens`, `activeSentenceId`, `draft`
Renders: `LensBar` + two-column layout (`IdeaForm` left, `StreamPane` / `EmptyState` right)

### `IdeaForm`
- All input fields from the prototype (title, stage, problem, target user, value prop, solution, differentiation, competitors, channels, success metric, constraints)
- On `streaming` or `done` state: wraps field text in `<span data-sentence-id>` spans at sentence boundaries (split on `. ` / `? ` / `! `)
- Sentence hover: `--paper-edge` background tint
- Sentence click: sets `activeSentenceId` in App, visual active state (accent left-border)
- CTA button: "Pressure-test" in `drafting`, "Stop" in `streaming`

### `LensBar`
- Four pills: Skeptic / Builder / Buyer / Competitor
- Mono font, uppercase, 10px
- One active at a time (`aria-pressed`)
- Switching lens from `done` immediately triggers a new stream run
- Switching lens from `drafting` just sets the active lens, no run triggered

### `StreamPane`
- Renders `ThoughtItem` list as thoughts arrive
- Dims non-matching thoughts when `activeSentenceId` is set (opacity 0.25 on non-matches)
- Shows pulsing dot indicator during `streaming` state
- Shows `Verdict` block after final event
- Shows `EmptyState` when `appState === "empty"`

### `ThoughtItem`
- Left border: `--concern` (warm red) for concern, `--strength` (muted green) for strength
- `text`: Source Serif 4, 17px
- `quote` chip: JetBrains Mono, 11px, `--ink-mute` color, italic, sits below the text
- Mount animation: `v3fade` (400ms ease, opacity 0→1, translateY 4px→0)

### `Verdict`
- `label`: Source Serif 4, 400 weight, 38px
- `score`: Source Serif 4, 54px, `--ink`
- `reason`: Source Sans (Inter), `--ink-soft`, 16px
- Top border: 2px solid `--accent`

### `EmptyState`
- Invitation copy: "Pick a lens and describe your idea. Run a check to see what's driving the result."
- Muted, centered in the right column

### `useStream` hook
Exposes: `{ thoughts, verdict, status, stop }`

- Opens `fetch` POST to `/api/stream` with `{ draft, lens }`
- Reads `response.body` as `ReadableStream`, decodes chunks, buffers into lines
- Parses each `data: ` line as JSON
- Dispatches: `thought` → append to `thoughts`; `verdict` → set `verdict`, signal done; `error` → signal error; `nothing` → signal nothing; `[DONE]` → close
- `stop()` calls `abortController.abort()`, transitions state to `done` with whatever thoughts arrived — no verdict is set, `StreamPane` shows a "Stopped" notice in place of the `Verdict` block

---

## Design Tokens (`tokens.css`)

### Color
```css
:root {
  --ink:        oklch(0.22 0.01 75);
  --ink-soft:   oklch(0.42 0.01 75);
  --ink-mute:   oklch(0.62 0.01 75);
  --ink-faint:  oklch(0.82 0.008 75);
  --paper:      oklch(0.985 0.004 85);
  --paper-warm: oklch(0.97 0.008 80);
  --paper-edge: oklch(0.92 0.008 80);
  --rule:       oklch(0.88 0.008 80);
  --accent:     oklch(0.55 0.15 250);
  --concern:    oklch(0.58 0.15 30);
  --strength:   oklch(0.5 0.14 150);
}
```

### Typography
```css
--serif: "Source Serif 4", Georgia, serif;
--sans:  "Inter", system-ui, sans-serif;
--mono:  "JetBrains Mono", ui-monospace, monospace;
```

Usage:
- Serif: verdict label, verdict score, thought text, section titles
- Sans: form labels, help text, buttons, body copy
- Mono: lens pill labels, sentence reference quote chips, streaming indicator

### Spacing Scale (px)
`8 / 12 / 16 / 24 / 32 / 48 / 64 / 96`

### Borders
`border-radius: 2px` everywhere (prototype's subtle roundness)

### Animations
```css
@keyframes v3fade {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes v3pulse {
  0%, 100% { box-shadow: 0 0 0 0 oklch(0.55 0.15 250 / 0.4); }
  50%       { box-shadow: 0 0 0 6px oklch(0.55 0.15 250 / 0); }
}
```

- `v3fade`: applied to each `ThoughtItem` on mount, 400ms ease
- `v3pulse`: applied to streaming indicator dot, 1.4s ease-out infinite

---

## Supabase Data Model Update

The existing `/api/save.js` stores the current v2 analysis object (scores, verdict, dimensionNotes, etc.). For V3 this updates to:

```json
{
  "id": "<uuid>",
  "created_at": "<timestamp>",
  "draft": { ...DraftObject },
  "lens": "skeptic",
  "thoughts": [
    { "type": "thought", "category": "concern", "text": "...", "quote": "..." }
  ],
  "verdict": { "label": "Refine", "score": 64, "reason": "..." }
}
```

The shareable read-only view at `/eval/:id` renders the thoughts + verdict for the saved lens run.

---

## What Does Not Change

- Vercel project name and deployment URL (`2026-03-17-idea-validator.vercel.app`)
- `/api/analyze.js` — kept untouched
- Supabase project and `/api/save.js` + `/api/eval/:id` routes (schema update only, not a rewrite)
- `vercel.json` rewrite rule for `/eval/:id`
- Decision log pattern and repo structure
