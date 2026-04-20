# Roadmap Tradeoff Engine

Most roadmap debates collapse into "we like it" vs "we’re scared" because nobody can show what *must* be cut when capacity tightens.

> A constraint-driven roadmap decision engine that selects an initiative set under capacity and explains, in plain language, what changed and why.

**Status:** `draft`
**Complexity:** `intermediate`
**Bucket:** `customer-experience`

---

## Goal

Help a product leader produce a defensible *selected vs excluded* initiative set under a real engineering capacity limit, with a readable explanation layer that makes the tradeoffs explicit in under 10 minutes.

---

## Problem

In quarterly planning at a 50–300 person B2B SaaS company, a PM/Head of Product often receives a list of 8–15 initiatives with rough estimates and noisy stakeholder pressure. When engineering capacity is lower than the ask, the team defaults to negotiation and gut feel: initiatives get cut without a consistent rationale, and the follow-up question (“why this and not that?”) turns into a prolonged debate that burns the meeting.

---

## Why This Exists

A spreadsheet can rank items, but it can’t reliably answer the real planning question: “given *this* capacity and *this* risk posture, what is the best *set* of bets—and what exactly got displaced?” This tool behaves like a simplified optimization engine (knapsack-style selection) and pairs it with an explanation panel that updates live as constraints change, so the decision is inspectable, not just a score.

---

## Target Persona

A Head of Product at a 50–300 person B2B SaaS company preparing for a roadmap tradeoff meeting, operating with imperfect estimates and a fixed engineering capacity for the quarter.

---

## Use Cases

- A product leader lowers capacity from 60 to 45 points mid-meeting and needs to show which initiatives drop out and the specific reason each was displaced.
- A PM compares a conservative plan (risk-averse) vs an aggressive plan (risk-tolerant) to align with leadership’s appetite before the roadmap review.
- A CX-focused PM tests whether "enterprise permissions" is still worth funding once a "billing system upgrade" becomes mandatory.

---

## Barebones Wireframe

```
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│ Roadmap Tradeoff Engine                                                                    │
│ Capacity: [====|-----] 48 pts    Timeline: [ Q3 only ▾ ] (optional)   Strategy: (●) Cons  ○ Agg │
├───────────────────────────────┬────────────────────────────────┬──────────────────────────┤
│ INITIATIVES (editable list)    │ SELECTED SET (Scenario A/B)     │ DECISION EXPLANATIONS     │
│ ┌───────────────────────────┐ │ ┌──────────── Scenario A ────┐ │ ┌────────────────────────┐│
│ │ Onboarding redesign       │ │ │ Included: 5 initiatives     │ │ │ For selected item       ││
│ │ Impact 8  Effort 13       │ │ │ Total effort: 48/48         │ │ │ - Included because ...  ││
│ │ Conf 0.7 Risk 0.3 Align 9 │ │ │ Total adj. impact: 32.4     │ │ │ - Tradeoff notes ...    ││
│ └───────────────────────────┘ │ └─────────────────────────────┘ │ └────────────────────────┘│
│ [ + Add initiative ]          │ ┌──────────── Scenario B ────┐ │ ┌────────────────────────┐│
│                               │ │ (Different capacity/stance) │ │ │ For excluded items      ││
│                               │ │ Diff: +X / -Y initiatives   │ │ │ - Excluded because ...  ││
│                               │ └─────────────────────────────┘ │ │ - Displaced by ...      ││
│                               │                                  │ └────────────────────────┘│
└───────────────────────────────┴──────────────────────────────────┴──────────────────────────┘

Interaction:
- Changing capacity instantly recomputes selection.
- Clicking an initiative highlights its inclusion/exclusion reasons.
- Scenario A vs B shows what changed and why.
```

---

## Product Decisions

- **Optimization is set-based, not ranked:** The engine selects the best *portfolio* under a capacity constraint (knapsack-style) rather than sorting by a single score. Alternative was a prioritization table; rejected because it fails the “what gets displaced?” question.
- **Explicit penalties for confidence and risk:** Impact is adjusted by confidence and risk to reflect “expected value” style thinking. Alternative was pure impact maximization; rejected because it produces plans that look good on paper but are brittle in execution.
- **Explanation panel is first-class UI:** The right column is dedicated to “why included/excluded,” updated live. Alternative was a single “results” list; rejected because without an explanation layer the tool becomes a black box and won’t survive stakeholder scrutiny.
- **Two scenarios only (A vs B):** Scenario comparison is constrained to two side-by-side states for clarity. Alternative was unlimited scenarios; rejected because it turns into a planning tool instead of a decision engine.

---

## Tech Stack

- **Runtime:** Browser (static)
- **Framework:** None — vanilla HTML/CSS/JS to keep it portable and fast to load
- **AI/API:** None
- **Styling:** Custom CSS following the `executive-monochrome` style spec
- **Data:** None — in-memory state only (seeded initiatives for the demo)
- **Deployment:** Any static host (GitHub Pages, Netlify Drop)

---

## How to Run

**Prerequisites:** None.

```bash
# Clone
git clone [repo-url]
cd projects/2026-04-10-roadmap-tradeoff-engine

# Install
# No install required.

# Run
# Option 1: open directly
# open src/index.html

# Option 2: serve locally (recommended)
python3 -m http.server 5173
```

**Open:** `http://localhost:5173/src/`

---

## Screenshots

![Screenshot](./screenshots/screenshot.png)

*Scenario A vs Scenario B with capacity tightened, showing which initiatives were displaced and the explanation panel for a selected excluded initiative.*

---

## Future Enhancements

- **Dependencies and sequencing:** Model prerequisites (e.g., "billing upgrade" blocks "self-serve trials") and quarter-by-quarter sequencing. Deferred because dependency graphs add substantial UI and algorithm complexity beyond the core demo.
- **Multiple resource types:** Separate constraints for backend, frontend, design, and data. Deferred because it requires a multi-dimensional optimization model and more complex effort inputs.
- **Timeline realism:** Add partial delivery/phaseability and deadlines (e.g., compliance date). Deferred because it changes the problem from knapsack to scheduling.
- **Exportable decision memo:** Generate a one-page narrative (“what we’re doing, what we cut, and why”) for leadership. Deferred to keep V1 focused on the live decision interaction.

---

## Decision Log

See [decision-log.md](./decision-log.md) for a full record of design and scoping decisions.
