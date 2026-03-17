# Idea Validator

> A live-scoring product idea pressure-test that turns a rough pitch into an explicit verdict, assumptions list, and validation plan.

**Status:** `draft`
**Complexity:** `complex`
**Bucket:** `pm-productivity`

---

## Goal

Help a Head of Product or founder reach a defensible “commit / refine / drop” decision in under 10 minutes by forcing the idea through the same evaluation dimensions every time, with risks and weak assumptions made explicit.

---

## Problem

In early roadmap planning (or right after a loud customer request), teams often commit to an idea while the reasoning is still fuzzy: the value proposition is vague, differentiation is assumed, and complexity is underestimated. The result is predictable—weeks of design and engineering time get spent discovering basic unknowns (who actually has this pain, what they do today, what it would take to ship something credible), and by the time the gaps surface the team is already socially committed.

---

## Why This Exists

A checklist or doc template can remind you what to consider, but it can’t continuously reflect the consequences of your own inputs. This tool behaves like a thinking workspace: as you clarify the user, the pain, and the solution, it updates scores, flags fragile areas, and forces a concrete verdict based on an explicit rubric—so alignment is driven by shared structure, not whoever argues best in the meeting.

---

## Target Persona

A Head of Product or founder at a 20–200 person B2B SaaS company deciding whether a new idea deserves roadmap time, without a dedicated strategy or research function to sanity-check it.

---

## Use Cases

- A founder writes a one-paragraph idea from a sales call and uses the verdict + risk flags to decide whether it’s a discovery track item or a hard “no.”
- A PM preps for roadmap review and uses the assumptions breakdown to assign validation owners (research, eng spike, pricing check) before the meeting.
- A product lead compares two competing initiatives by scoring them with the same rubric to reduce “whoever tells the best story” bias.
- A team takes an idea that feels exciting but vague and uses the weakness flags to rewrite the value prop and differentiation in plain language.
- A PM turns the suggested next steps into a 1-week validation plan (interviews, prototype test, metric definition) instead of immediately drafting a PRD.

---

## Barebones Wireframe

```
┌───────────────────────────────────────────────────────────────────────────────┐
│ IDEA VALIDATOR                                                               │
│ (editorial dark workspace)                                                   │
├───────────────────────────────────────────────┬───────────────────────────────┤
│ IDEA INPUT                                    │ VERDICT PANEL (sticky)        │
│ [Idea title]                                  │ Verdict: Needs refinement      │
│ [Free-text: the pitch]                        │ Confidence: Medium             │
│ Optional structure (expand):                  │ Top risks:                      │
│  - Target user                                │  - Differentiation unclear      │
│  - Problem                                    │  - Hidden integration work      │
│  - Proposed solution                          │ Next steps (3):                 │
│                                               │  1) 5 interviews: [who]         │
│ EVALUATION DIMENSIONS (live scoring)           │  2) Prototype test: [task]      │
│  Pain intensity        [1–5]  rationale        │  3) Define metric: [metric]     │
│  Frequency            [1–5]  rationale        │                               
│  Existing alternatives [1–5]  notes           │                               
│  Differentiation      [1–5]  pressure test    │                               
│  Implementation cost  [1–5]  complexity flags │                               
│  Time to value        [1–5]  onboarding notes │                               
│  Business impact      [1–5]  impact route     │                               
│
│ ASSUMPTIONS (auto-extracted)                  │                               
│  User assumptions      (list)                 │                               
│  Technical assumptions (list)                 │                               
│  Business assumptions  (list)                 │                               
│
│ WEAKNESS DETECTION (highlighted callouts)      │                               
│  - Vague value prop (show why)                │                               
│  - Crowded market (what you’d be compared to) │                               
│  - Unclear differentiation (what’s missing)   │                               
│  - Hidden complexity (where it likely hides)  │                               
└───────────────────────────────────────────────┴───────────────────────────────┘
```

---

## Product Decisions

- **Live-scoring over “Generate report” button:** Scores update as the user edits the idea so the tool feels like a thinking surface. Alternative was a single submit action; rejected because it encourages performative copywriting instead of iterative clarity.
- **Explicit rubric dimensions (7) instead of an open-ended critique:** The tool forces consistent comparisons across ideas. Alternative was freeform “strengths/weaknesses” output; rejected because it’s too easy to agree with and too hard to argue about.
- **Verdict is a 3-state outcome with confidence, not a numeric “final score”:** The decision moment is binary in real planning (“do we spend time?”), and the confidence communicates uncertainty. Alternative was a weighted score out of 100; rejected because it invites false precision.
- **Assumptions categorized by user/technical/business:** This mirrors how teams validate (research, engineering spike, go-to-market/pricing). Alternative was a single assumptions list; rejected because it doesn’t route ownership.
- **Weakness detection focuses on four common failure modes:** Vague value prop, crowded market, unclear differentiation, hidden complexity. Alternative was “detect everything”; rejected because breadth makes the demo feel generic and reduces trust.

---

## Tech Stack

- **Runtime:** Vanilla JavaScript — immediate interaction, no build step
- **Framework:** None — single-page static app for easy repo portability
- **AI/API:** None in V1 — rubric + heuristics are deterministic and auditable
- **Styling:** Custom CSS implementing the `executive-monochrome` style direction
- **Data:** None — stateless (example ideas are bundled in the UI)
- **Deployment:** Static hosting (GitHub Pages / Netlify drop)

---

## How to Run

**Prerequisites:** None.

```bash
# Clone
git clone <repo-url>
cd projects/2026-03-17-idea-validator

# Install
# No install required.

# Run
# Option A: open directly
open src/index.html

# Option B: serve locally (recommended)
python3 -m http.server 5173
```

**Open:** If using the server, visit `http://localhost:5173/src/`.

---

## Screenshots

Screenshot pending — see screenshots/PENDING.md for capture instructions.

---

## Future Enhancements

- **Team comparison mode:** Score two ideas side-by-side with shared weighting presets. Deferred because it adds UI density and needs validation that single-idea flow is valuable first.
- **Calibration presets:** “B2B enterprise,” “PLG,” “regulated,” etc., that adjust weighting and warnings. Deferred because it requires research to avoid cargo-cult heuristics.
- **Exportable decision memo:** One-click export to a structured markdown memo (verdict, scores, assumptions, next steps). Deferred to keep V1 focused on the interactive workspace.
- **Assumption evidence tracking:** Let users mark assumptions as validated and attach notes/links. Deferred because it introduces persistence and likely a backend.

---

## Decision Log

See [decision-log.md](./decision-log.md) for a full record of design and scoping decisions.
