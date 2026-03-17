# Master Prompt Spec Test

> A scope-aware launch readiness audit that turns a launch brief into a scored go/no-go view plus an exportable checklist by owner.

**Status:** `draft`
**Complexity:** `simple`
**Bucket:** `gtm-workflow`

---

## Goal

A PM/PMM should be able to identify the top launch risks and the exact blocking items (by functional owner) in under 5 minutes, then export a checklist they can paste into a doc or ticket.

---

## Problem

In the final week before a launch, a PM or PMM is usually reconciling “we’re basically ready” updates across eng, marketing, sales, and support, but the checklist everyone copied is generic and incomplete—so predictable gaps (support not trained, pricing page mismatched, docs not published, rollback unclear) surface late, in the go/no-go meeting, when fixes are expensive and coordination is chaotic.

---

## Why This Exists

A static launch checklist can’t adapt to the launch’s specific risk surface (internal tool vs public API vs billing change) or reliably highlight what is truly blocking; this tool forces a small set of structured inputs that meaningfully change the audit, then produces a routed, owner-labeled checklist and a go/no-go score so the coordinator can escalate the right gaps without re-authoring a new doc every time.

---

## Target Persona

A PMM at a 50–500 person B2B SaaS company coordinating a GA feature launch across eng, marketing, sales, and support, without a dedicated launch ops function to keep readiness documentation consistent.

---

## Use Cases

- A PMM sanity-checks readiness 72 hours before launch and uses the “blocking” list to drive a short go/no-go meeting.
- A PM runs the audit right after scope is finalized to generate the initial cross-functional launch checklist by owner.
- A support lead asks “are we ready?” and the PMM shares an exportable checklist with explicit training/doc dependencies.
- A sales enablement manager uses the output to confirm the deck, objection handling, and pricing references align with the release.

---

## Barebones Wireframe

```
┌──────────────────────────────────────────────────────────────┐
│ LAUNCH READINESS AUDIT                                       │
│  Launch type: (Internal / Beta / GA)                         │
│  Change surfaces: [ UI ] [ API ] [ Billing ] [ Security ]    │
│  Audience: (Existing users / New users / Enterprise)         │
│  Rollout: (All at once / Phased / By segment)                │
│  Feature brief (5–10 sentences)                              │
│  [ Run audit ]                                               │
├──────────────────────────────────────────────────────────────┤
│ RESULTS                                                      │
│  Readiness: 72/100  |  Go/No-Go: NO-GO (3 blockers)          │
│                                                              │
│  BLOCKERS (must fix)                                         │
│   - Support: No macros/training plan for new workflow        │
│   - Eng: No rollback criteria for billing impact             │
│   - Docs: API docs not updated for new error codes           │
│                                                              │
│  RECOMMENDED (should fix)                                    │
│   - Marketing: Pricing page copy lacks eligibility rules     │
│   - Sales: Objection handling missing for procurement        │
│                                                              │
│  CHECKLIST BY OWNER (expanders)                              │
│   [Engineering ▾] [Marketing ▾] [Sales ▾] [Support ▾] ...    │
│                                                              │
│  [ Copy as Markdown ]  [ Download .md ]                      │
└──────────────────────────────────────────────────────────────┘
```

---

## Product Decisions

- **Scope-aware inputs, not a freeform prompt:** The tool uses a small set of structured fields (launch type, surfaces, audience, rollout) plus a short brief. Alternative was “paste anything” only; chose structure because the core value is that outputs differ meaningfully by risk surface, and freeform inputs don’t reliably drive distinct checklists.
- **Go/No-Go with explicit blockers:** Output includes a score and a blocker count. Alternative was a checklist-only export; chose scoring because launch coordination fails when everything is treated as equal priority, and the persona needs a quick escalation artifact.
- **Owner-routed checklist as the default view:** Checklist items are grouped by owner (Eng, Support, Sales, Marketing, Docs/Security). Alternative was a single prioritized list; chose owner grouping because coordination is mostly about routing, and prioritization without routing still creates follow-up work.
- **Export is Markdown-first:** Copy/download produces Markdown that pastes cleanly into Google Docs/Notion/Jira descriptions. Alternative was PDF; chose Markdown because it’s lowest-friction in real launch workflows and avoids a heavier rendering stack.

---

## Tech Stack

- **Runtime:** Vanilla JS — runs as a static page with no build step
- **Framework:** none — plain HTML/CSS/JS
- **AI/API:** none — uses a deterministic rubric and rules engine to keep it runnable with no credentials
- **Styling:** Custom CSS following the `mobile-ambient` style spec
- **Data:** none — stateless (no storage)
- **Deployment:** Any static hosting (GitHub Pages / Netlify drop)

---

## How to Run

**Prerequisites:** None.

```bash
# Clone
git clone https://github.com/<your-org-or-user>/pm-experiment-studio.git
cd pm-experiment-studio/projects/2026-03-16-launch-readiness-risk-auditor

# Install
# No install required.

# Run
# Option A: open directly
open src/index.html

# Option B: serve locally (optional)
python3 -m http.server 8000
```

**Open:** If using a server, go to `http://localhost:8000/src/`.

---

## Screenshots

Screenshot pending — see screenshots/PENDING.md for capture instructions.

---

## Future Enhancements

- **Company-specific rubric toggles:** Add switches like “SOC2 constraints” or “regulated industry” that change blocker thresholds. Deferred because it needs validation of the base rubric before adding variants.
- **Saved audits and delta view:** Store runs and show what changed since last week. Deferred because it requires persistence/auth, which breaks the zero-setup constraint.
- **Calendar-backed timeline view:** Convert checklist into a backward-planned schedule from launch date. Deferred because timeline UX adds complexity and would distract from the core readiness audit.

---

## Decision Log

See [decision-log.md](./decision-log.md) for a full record of design and scoping decisions.
