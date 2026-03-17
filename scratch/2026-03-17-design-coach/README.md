# Design Coach

> A blueprint-style flow builder that surfaces missing edge cases, tradeoffs, and failure modes while you map a feature’s user journey.

**Status:** `draft`
**Complexity:** `simple`
**Bucket:** `gtm-workflow`

---

## Goal

Help a PM or designer turn a fuzzy “we should build X” into a review-ready flow map that explicitly covers the non-happy paths (empty, failure, permission, partial completion) in under 15 minutes.

---

## Problem

During design reviews, teams often present a happy-path flow and discover the hard questions live: “What if the user has no data?”, “What if the payment fails?”, “What if they don’t have permission?”, “What happens if they abandon mid-way?”. The result is rework, unclear ownership (“is this UX or backend?”), and flows that ship without the states users actually hit.

---

## Why This Exists

A doc checklist can remind you that edge cases exist, but it can’t tell you which ones are missing from the specific flow you just drew, or where the gaps are. An interactive flow map that tracks required scenario coverage per step can flag omissions in context (at the node where it matters), which is exactly how design review feedback happens.

---

## Target Persona

A PM or product designer at a 30–300 person SaaS company preparing a design review for a new onboarding or checkout flow, operating without a dedicated UX ops or QA partner to pressure-test edge cases ahead of time.

---

## Use Cases

- A PM sketches an onboarding flow before a cross-functional review and uses the surfaced gaps list to assign owners (design vs. eng vs. data).
- A designer maps a settings change flow and quickly checks whether every step has an empty state and a recoverable failure state.
- A PM rewrites a “simple” checkout flow after the tool highlights missing retry paths on payment failure.
- A team lead uses the clarity score as a lightweight gate: “No review until the flow is ≥80% covered for edge/failure scenarios.”

---

## Barebones Wireframe

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Design Coach                                                                 │
│ [Template: Onboarding ▾] [New Flow]                            Clarity: 72% │
├──────────────────────────────────────────────────────────────────────────────┤
│ FLOW CANVAS (left)                         │ NODE INSPECTOR (right)          │
│                                            │                                 │
│  (1) Landing                               │ Node: (3) Create workspace       │
│      └─continue→ (2) Sign up               │ Actor: User                      │
│                  └─success→ (3) Create ws  │ Primary outcome: Workspace made  │
│                  └─fail→    (2a) Error     │                                 │
│                                            │ Coverage                         │
│  [ + Add step ]                            │  [✓] Happy path                  │
│                                            │  [ ] Empty state                 │
│                                            │  [ ] Failure state               │
│                                            │  [✓] Permission / auth           │
│                                            │  [ ] Partial completion          │
│                                            │  [ ] Retry / recovery            │
│                                            │                                 │
│                                            │ Edge cases suggested             │
│                                            │ - No team name entered           │
│                                            │ - Invite sent but email bounces  │
│                                            │ - Workspace creation times out   │
│                                            │                                 │
│                                            │ Tradeoffs (toggles)              │
│                                            │ [x] Speed vs control             │
│                                            │ [ ] Simplicity vs flexibility    │
│                                            │ [x] Automation vs manual         │
│                                            │                                 │
│                                            │ Failure modes                     │
│                                            │ - Network drop mid-submit         │
│                                            │ - Duplicate workspace slug        │
│                                            │                                 │
│                                            │ [Mark scenarios complete]         │
└──────────────────────────────────────────────────────────────────────────────┘

Bottom bar: Gaps detected
- Missing: Empty state on 4 nodes
- Missing: Retry path on 2 nodes
- Missing: Failure handling on 3 nodes
```

---

## Product Decisions

- **Scenario coverage is per-node, not global:** Each step has explicit scenario checkboxes (empty/failure/permission/partial/retry) so gaps are localized to where the decision is made. Alternative was a single checklist for the whole flow; rejected because it doesn’t tell you which step is missing what.
- **Edge case suggestions are deterministic, not LLM-generated:** Suggestions come from a curated ruleset keyed to common step types (form submit, auth, payment, invite, save). Alternative was calling an LLM to “generate edge cases”; rejected because generic text output feels untrustworthy in a design review and introduces setup friction (API keys).
- **Clarity score is a transparency-first rubric:** The score is computed from visible coverage and known required transitions (e.g., if “failure” is checked, a failure transition must exist). Alternative was a black-box “AI score”; rejected because users need to defend the score in review.
- **Templates ship with realistic flows:** Onboarding/checkout/settings templates provide a fast start and demonstrate the intended level of detail. Alternative was a blank canvas only; rejected because it increases time-to-first-insight and makes the tool feel like a diagram app.

---

## Tech Stack

- **Runtime:** Browser (vanilla JavaScript) — keeps it zero-install and easy to review
- **Framework:** None — single-page app with small modules
- **AI/API:** None — deterministic rules engine for edge cases and scoring
- **Styling:** Custom CSS following the `mobile-ambient` style direction
- **Data:** None — in-memory state only (prototype)
- **Deployment:** Static files (any static host)

---

## How to Run

**Prerequisites:** None.

```bash
# Clone
git clone [repo-url]
cd projects/2026-03-17-design-coach

# Install
# No install required.

# Run
# Option A: open directly
open src/index.html

# Option B: serve locally (recommended)
python3 -m http.server 5173
```

**Open:**
- If using a server: http://localhost:5173/src/
- If opening directly: `src/index.html`

---

## Screenshots

Screenshot pending — see screenshots/PENDING.md for capture instructions.

---

## Future Enhancements

- **Export to review doc (Markdown):** Generate a design-review-ready artifact (flow summary + gaps + decisions). Deferred because export formatting adds surface area beyond the core demo loop.
- **Branch visualization for transitions:** Render failure/retry branches more explicitly (mini-map or swimlanes). Deferred to keep the canvas implementation simple in V1.
- **Custom step types + rule authoring:** Let teams define their own step types (e.g., “KYC check”) and edge-case rules. Deferred because it requires a UI for rule management and validation.
- **Persist flows locally:** Save/load flows from localStorage with versioning. Deferred because persistence adds states (migration, conflicts) that distract from the review workflow.

---

## Decision Log

See [decision-log.md](./decision-log.md) for a full record of design and scoping decisions.
