# PM Vibe Agent Run

A consistent internal “run log” turns a fuzzy day of PM work into a reviewable narrative you can reuse in standup, 1:1s, and performance notes.

> A single-page run log that converts a PM’s daily notes into a structured “vibe” snapshot: risks, decisions, asks, and an exec-ready update.

**Status:** `draft`
**Complexity:** `intermediate`
**Bucket:** `internal-tooling`

---

## Goal

A PM should be able to paste their messy day notes (Slack snippets, meeting bullets, open questions) and leave with a clean, copy/paste-ready update plus a short “vibe” classification they can compare day to day in under 3 minutes.

---

## Problem

At the end of a heavy coordination day, a PM often has only scattered artifacts (meeting notes, Slack threads, half-written tickets). In the moment they need to post a status update or walk into a leadership sync, the update becomes either too detailed (a wall of bullets nobody reads) or too vague (“tracking risks”), which causes missed asks, unrecorded decisions, and repeated alignment churn the next day.

---

## Why This Exists

A doc template can’t reliably turn noisy notes into the same “shape” every time, and a spreadsheet doesn’t help you separate decisions from risks from asks without doing manual labeling. This tool exists to force a repeatable structure (so the output is scannable and comparable across days) while still accepting the realistic input format PMs actually have: unstructured notes captured under time pressure.

---

## Target Persona

A product manager at a 30–200 person SaaS company who runs cross-functional execution (eng/design/CS) and needs to post a crisp daily update without re-reading every thread or re-litigating what was decided.

---

## Use Cases

- A PM pastes end-of-day notes before posting a #product-eng channel update and needs a clean “Decisions / Risks / Asks / Next 24h” format.
- A PM prepares for a 1:1 with their manager and wants a quick snapshot of what moved, what’s stuck, and what help is needed.
- A PM finishing a release week uses it to convert incident-y notes into a calm, executive-ready update that doesn’t sound reactive.
- A PM joining a project mid-flight uses yesterday’s notes to generate a structured handoff summary for the new owner.

---

## Barebones Wireframe

```
┌────────────────────────────────────────────────────────────────────┐
│ PM Vibe Agent Run                                                   │
│ Date: [ auto ]   Product area: [__________]   Audience: [Exec ▼]    │
├────────────────────────────────────────────────────────────────────┤
│ 1) Paste today’s raw notes                                          │
│ ┌────────────────────────────────────────────────────────────────┐ │
│ │ - Slack: "API rate limits causing retries"                       │ │
│ │ - Sync w/ Eng: agreed to cut scope on audit log export          │ │
│ │ - CS: 2 customers blocked by SSO edge case                      │ │
│ │ - Open question: do we ship behind flag?                         │ │
│ └────────────────────────────────────────────────────────────────┘ │
│ [ Generate Run Snapshot ]                                           │
├────────────────────────────────────────────────────────────────────┤
│ 2) Output (copy-friendly)                                           │
│  VIBE (today): [CALM / TENSE / RISKY]  Confidence: [High/Med/Low]    │
│  Drivers: [1–3 bullets]                                             │
│                                                                    │
│  DECISIONS (locked)                                                 │
│   - ...                                                             │
│  RISKS (watch)                                                      │
│   - ... (owner, next check)                                         │
│  ASKS (help needed)                                                 │
│   - ... (who, by when)                                              │
│  NEXT 24H (commitments)                                             │
│   - ...                                                             │
│  MESSAGE (ready to paste)                                           │
│   [ single formatted block ]                                        │
│  [ Copy message ]  [ Copy decisions ]  [ Export JSON ]              │
└────────────────────────────────────────────────────────────────────┘
```

---

## Product Decisions

- **Output is a fixed four-part structure (Decisions / Risks / Asks / Next 24h):** The alternative was a free-form “summary.” Chose the fixed structure because it maps to the most common update formats and prevents “vague status” that hides asks.
- **A “vibe” label is included but constrained (3 labels + confidence):** The alternative was a 1–10 score or emotion wheel. Chose a small set so it’s fast, consistent day-to-day, and doesn’t feel like mood tracking.
- **Audience selector (Exec / Eng / Cross-functional) influences tone and detail:** The alternative was one generic output. Chose audience-aware output so the tool solves the real moment: posting to different rooms without rewriting.
- **Copy-first deliverables instead of persistence:** The alternative was saving runs and browsing history. Chose copy-first because the core job is “ship an update now,” and persistence creates more UI and data handling than V1 needs.

---

## Tech Stack

- **Runtime:** Vanilla JavaScript — runs as a static page for zero-setup internal use
- **Framework:** none — no build step
- **AI/API:** none — rule-based extraction + small heuristics (deterministic, offline)
- **Styling:** Custom CSS following the `premium-saas` style direction
- **Data:** none — stateless (optional export JSON for manual storage)
- **Deployment:** Any static host (Replit, GitHub Pages, Netlify drop)

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
# Option A: open directly
open src/index.html

# Option B: serve locally (Python)
python3 -m http.server 5173
```

**Open:** If serving locally, http://localhost:5173/src/

---

## Screenshots

![Screenshot](./screenshots/screenshot.png)

*Generated “vibe” snapshot from realistic end-of-day notes, showing categorized outputs plus a paste-ready update block.*

---

## Future Enhancements

- **Run history timeline:** Save snapshots locally and show trends (vibe drivers, recurring risks). Deferred because it introduces persistence and migration concerns beyond V1.
- **Team mode:** Let multiple PMs standardize updates and roll up into a weekly digest. Deferred because it needs identity, sharing, and permissions.
- **Risk follow-up reminders:** Turn “Risks” into dated reminders and checks. Deferred because it requires scheduling and a stronger data model.
- **Custom schemas:** Allow teams to rename sections (e.g., “Blockers” vs “Risks”). Deferred until the default structure proves broadly useful.

---

## Decision Log

See [decision-log.md](./decision-log.md) for a full record of design and scoping decisions.
