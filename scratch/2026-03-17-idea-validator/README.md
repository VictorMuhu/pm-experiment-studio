# Idea Validator

> A live-scoring idea pressure-test workspace that turns a fuzzy product concept into a scored verdict, explicit assumptions, and a concrete validation plan.

**Status:** `draft`
**Complexity:** `complex`
**Bucket:** `customer-experience`

---

## Goal

Help a Head of Product or founder go from “this sounds promising” to an explicit decision — **Strong candidate / Needs refinement / Not worth pursuing** — with the top fragile assumptions and the next 3–5 validation actions in under 10 minutes.

---

## Problem

In early roadmap shaping, teams often commit to an idea after a single enthusiastic conversation. The PM then writes a PRD, engineering starts sizing, and only later do the hard questions surface: the user pain is vague, alternatives are good enough, differentiation is thin, complexity is hidden, and “impact” is wishful. The consequence is predictable: weeks of roadmap time get burned before anyone can clearly explain *why this idea should win*.

---

## Why This Exists

A static checklist can remind you what to ask, but it doesn’t **force trade-offs** or make contradictions visible. This tool is interactive by design: as you tighten the target user, sharpen the problem statement, or admit a crowded alternative set, the scoring and verdict adjust immediately and the “weakness flags” get louder. The output isn’t “a paragraph of feedback” — it’s a structured artifact you can paste into a decision memo or leadership thread: dimension scores, key assumptions by type, fragility hotspots, and a next-step plan.

---

## Target Persona

A Head of Product or founder at a 20–200 person B2B SaaS company deciding whether a customer-facing idea deserves roadmap time, without a dedicated research team or strategy function to pressure-test it.

---

## Use Cases

- A founder drafts a new “premium tier” concept the night before planning and needs a defensible go/no-go recommendation with the top risks called out.
- A PM pre-reads an incoming sales-sourced feature request and wants to quickly separate “big customer asked” from “strong product bet.”
- A product leader aligns two stakeholders who disagree by making the disagreement explicit (pain vs. differentiation vs. complexity) instead of debating vibes.
- A team turns a half-baked idea into a sharper v1 by iterating until the verdict moves from “Needs refinement” to “Strong candidate.”
- A PM prepares a validation sprint by generating a short list of concrete actions (interviews, prototype tests, metric definition) tied to the weakest assumptions.

---

## Barebones Wireframe

```
┌───────────────────────────────────────────────────────────────────────────────┐
│ IDEA VALIDATOR                                               Verdict: ▣ Needs │
│                                                               refinement      │
│                                                                               │
│ [Idea]                                                                         │
│ ┌───────────────────────────────────────────────────────────────────────────┐ │
│ │ Free-text idea (2–6 sentences)                                            │ │
│ └───────────────────────────────────────────────────────────────────────────┘ │
│  Structured fields (optional)
│  Target user: [..................]   Problem: [.............................]
│  Proposed solution: [.......................................................]
│                                                                               │
│ [Scores] (updates live)                                                       │
│  Pain intensity      ▣▣▣▣▢  72     Existing alternatives ▣▣▣▣▣  38 (crowded)   │
│  Frequency           ▣▣▣▢▢  58     Differentiation       ▣▣▢▢▢  45           │
│  Time to value       ▣▣▣▣▢  66     Implementation       ▣▣▣▢▢  52           │
│  Business impact     ▣▣▣▣▢  70     Complexity risk       ▣▣▣▣▢  61           │
│                                                                               │
│ [Weakness Flags] (KEY DEMO MOMENT)                                            │
│  ! Value prop is vague (outcome not measurable)                               │
│  ! Market looks crowded; differentiation claim is feature-level               │
│  ! Hidden complexity: permissions + audit logs implied by the workflow         │
│                                                                               │
│ [Assumptions]                                                                 │
│  User assumptions:      - ...   - ...                                         │
│  Technical assumptions: - ...   - ...                                         │
│  Business assumptions:  - ...   - ...                                         │
│                                                                               │
│ [Next steps]                                                                  │
│  1) Run 5 interviews with [persona] testing [pain + current workaround]       │
│  2) Prototype test the workflow in Figma and measure time-to-first-value      │
│  3) Define success metric + guardrail metric before building                  │
└───────────────────────────────────────────────────────────────────────────────┘
```

---

## Product Decisions

- **Live scoring instead of a “Generate analysis” button:** Scores and flags update as inputs change so the user can iterate toward clarity. Alternative was a single analysis run; rejected because it creates a one-shot “AI answer” vibe and discourages deliberate refinement.
- **Dimension set is fixed and explicit:** The rubric is intentionally constrained (pain, frequency, alternatives, differentiation, complexity, time-to-value, business impact) so two leaders can compare ideas consistently. Alternative was customizable dimensions; rejected for v1 because it adds setup work and makes outputs incomparable across ideas.
- **Weakness flags are phrased as decision blockers, not advice:** Flags are written like a reviewer’s objections (“value prop is vague”, “crowded market”, “hidden complexity”) so they can be copy/pasted into a decision memo. Alternative was generic improvement tips; rejected because it doesn’t surface the *reason to say no*.
- **Assumptions are categorized (user/technical/business):** The tool routes uncertainty to the right validation method (interviews vs. spike vs. pricing test). Alternative was a single list; rejected because it leads to unfocused validation plans.
- **Verdict panel is persistent and conservative:** The verdict sits in a side panel and is intentionally hard to reach “Strong candidate” without clarity in differentiation and validation plan. Alternative was a neutral summary; rejected because the core job is a go/no-go recommendation.

---

## Tech Stack

- **Runtime:** Browser (vanilla JS) — instant interaction, no setup barrier for an internal-tool feel
- **Framework:** none — avoids framework overhead; this is a single, stateful workspace
- **AI/API:** none (v1 rubric-based heuristics) — keeps the tool deterministic and runnable from a clean clone
- **Styling:** Custom CSS following the `executive-monochrome` style direction (dark, editorial, high-clarity typography)
- **Data:** none — stateless with preloaded example ideas
- **Deployment:** Static (GitHub Pages / Netlify drop)

---

## How to Run

**Prerequisites:** None.

```bash
# Clone
git clone [repo-url]
cd projects/[folder-name]

# Install
# No install required.

# Run
# Option 1: open directly
open src/index.html

# Option 2: serve locally (recommended)
python3 -m http.server 5173
```

**Open:** If using a server: `http://localhost:5173/src/`

---

## Screenshots

Screenshot pending — see screenshots/PENDING.md for capture instructions.

---

## Future Enhancements

- **Idea comparison mode:** Save multiple evaluations and compare side-by-side across the same rubric. Deferred because it adds persistence and data model complexity beyond the v1 “single workspace” goal.
- **Calibration profiles (B2B vs. PLG vs. Enterprise):** Slightly different weighting and flag thresholds by context. Deferred until the base rubric is validated with real usage.
- **Exportable decision memo:** One-click export to a structured Markdown memo for leadership review. Deferred to avoid turning v1 into a document generator before the on-screen artifact is proven.
- **Optional LLM-assisted assumption suggestions:** Generate additional assumptions and alternative sets from the idea text. Deferred because it requires API keys and robust output validation to avoid brittle or hallucinated artifacts.

---

## Decision Log

See [decision-log.md](./decision-log.md) for a full record of design and scoping decisions.
