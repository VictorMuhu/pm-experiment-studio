# PM Vibe Agent Run

> A single-page “run log” builder that turns a messy anomaly investigation into a structured, time-boxed checklist with owners, queries, and an exportable incident-style brief.

**Status:** `draft`
**Complexity:** `intermediate`
**Bucket:** `analytics-debugging`

---

## Goal

A PM using this tool should be able to go from “metric is weird” to a prioritized investigation plan (with concrete data cuts and who to ask) in under 10 minutes, then export a brief they can paste into Slack/Jira/Confluence.

---

## Problem

When a key metric spikes or drops, the PM is often the first responder but doesn’t have a reliable investigation structure. In the moment—usually during a leadership ping (“why is activation down today?”)—they default to checking the same two things (deploys and dashboards), miss entire hypothesis categories (instrumentation drift, segment shifts, external traffic quality), and waste time looping with analysts because the ask is underspecified (“can you look into it?”).

---

## Why This Exists

A static checklist doesn’t adapt to the specific anomaly (direction, magnitude, timing, metric type, recent changes) and it doesn’t produce an artifact that’s immediately usable for coordination. This tool asks for just enough context to rank hypotheses by “fastest to confirm” and “most likely,” then outputs a run plan with explicit queries/data cuts and owner routing so the PM can delegate work cleanly without turning the whole investigation into a meeting.

---

## Target Persona

A product manager at a 30–200 person B2B SaaS company who gets paged in Slack about a sudden KPI movement and needs to coordinate an investigation with an analyst and an on-call engineer without a dedicated data-on-call process.

---

## Use Cases

- A PM sees “Trial starts down 18% since 10am” and needs a structured first-hour investigation plan before the 2pm exec check-in.
- An on-call analyst wants a repeatable checklist that prevents forgetting segmentation cuts (device, source, geo) when triaging an anomaly.
- A PM preparing a post-mortem needs to convert scattered notes (“maybe events broke?”) into an incident-style brief with timestamps, owners, and next checks.
- A team lead wants a consistent handoff: “Here are the three fastest checks and exactly what query/cut to run for each.”

---

## Barebones Wireframe

```
┌───────────────────────────────────────────────────────────────┐
│ PM Vibe Agent Run                                             │
│ Build an anomaly investigation run plan you can paste anywhere │
├───────────────────────────────────────────────────────────────┤
│ INPUT                                                         │
│ Metric: [Activation Rate ▼]  Direction: [Drop ▼]              │
│ Magnitude: [-14%]   Detected at: [2026-03-17 10:20]           │
│ Time window: [Last 24h ▼]  Metric type: [Conversion ▼]        │
│ Recent changes (last 72h):                                    │
│  - [Checkout copy test shipped to 20%]                        │
│  - [iOS build 4.18 released]                                  │
│ Notes / context: [Traffic up from LinkedIn ads…]              │
│ [ Generate Run Plan ]                                         │
├───────────────────────────────────────────────────────────────┤
│ OUTPUT: RUN PLAN                                              │
│ 1) Fast checks (0–15 min)                                     │
│   • Hypothesis | Why likely | Owner | Exact data cut/query     │
│ 2) Deep dives (15–60 min)                                     │
│   • Hypothesis | What would confirm/deny | Next step           │
│ 3) Instrumentation sanity                                     │
│   • Event coverage checks + expected deltas                    │
│ 4) Brief (copy/paste)                                         │
│   • Summary, timeline, top 5 checks, open questions            │
└───────────────────────────────────────────────────────────────┘
```

---

## Product Decisions

- **Run-plan output over “insights”:** The output is a checklist with owners and exact data cuts rather than a narrative explanation. Alternative was a plain-English anomaly summary; chose the run plan because the persona’s failure mode is coordination and missing categories under time pressure.
- **Two time horizons (0–15, 15–60):** Hypotheses are grouped into “fast checks” and “deep dives” instead of a single ranked list. Alternative was a single priority score; chose horizons because it maps to real investigation pacing and avoids false precision.
- **Routing built into each item:** Each hypothesis includes an “owner” (PM / Analyst / Eng / Data Eng) so delegation is explicit. Alternative was leaving ownership implicit; rejected because it causes Slack back-and-forth (“who checks this?”).
- **Minimal but specific inputs:** The form collects direction, magnitude, detection time, metric type, and recent changes, plus optional context. Alternative was a full event taxonomy + segment definitions; rejected because it increases friction in the first-response moment.

---

## Tech Stack

- **Runtime:** Vanilla JavaScript — keeps it zero-build and easy to run from a clean clone.
- **Framework:** none — single-page static tool.
- **AI/API:** none — deterministic hypothesis taxonomy and ranking logic.
- **Styling:** Custom CSS following the `high-contrast-command` style spec.
- **Data:** none — stateless by default.
- **Deployment:** Static hosting (Netlify/Vercel static) or open locally.

---

## How to Run

**Prerequisites:** None.

```bash
# Clone
git clone [repo-url]
cd projects/2026-03-17-pm-vibe-agent-run

# Install
# No install required.

# Run
# Option A: open the HTML file directly
# (double-click src/index.html)

# Option B: serve locally (recommended)
python3 -m http.server 5173
```

**Open:**
- If serving: `http://localhost:5173/src/`
- If opening directly: open `src/index.html` in your browser

---

## Screenshots

Screenshot pending — see screenshots/PENDING.md for capture instructions.

---

## Future Enhancements

- **Custom hypothesis weights per product area:** Let teams tune priors (e.g., “instrumentation breaks often here”). Deferred because it requires persistence and calibration UX.
- **Query snippet templates per warehouse:** Export runnable SQL for BigQuery/Snowflake with parameter placeholders. Deferred because it increases surface area and needs validation against real schemas.
- **Team handoff mode:** Generate a Slack-ready message that splits checks by owner and includes a “reply with results” structure. Deferred to keep V1 focused on the run plan artifact.
- **Lightweight run history:** Save and compare runs for repeated anomalies on the same metric. Deferred because it adds state/storage decisions.

---

## Decision Log

See [decision-log.md](./decision-log.md) for a full record of design and scoping decisions.
