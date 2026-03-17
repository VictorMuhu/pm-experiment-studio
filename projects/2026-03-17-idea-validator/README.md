# Idea Validator

> A structured idea-evaluation workspace that turns a fuzzy product pitch into scored dimensions, explicit assumptions, flagged weaknesses, and a decision-ready verdict.

**Status:** `draft`
**Complexity:** `complex`
**Bucket:** `decision-support`

---

## Goal

Enable a Head of Product or founder to take a single product idea from “sounds good” to a documented go / no-go (or “refine first”) in one sitting, with the rationale captured in a format they can paste into a roadmap or leadership memo.

---

## Problem

In weekly roadmap and leadership review, senior PMs and founders often have to react to an idea that is persuasive but underspecified: the pain isn’t clearly evidenced, differentiation is vague, the real assumptions are implicit, and complexity is hand-waved. The consequence is predictable—time gets committed to discovery or execution on an idea that later collapses under “we already have alternatives,” “the time-to-value is too long,” or “this is crowded,” wasting roadmap capacity and credibility.

---

## Why This Exists

A static checklist or spreadsheet captures scores, but it doesn’t force the “why” behind each score or expose the fragile logic while you’re still writing the pitch. This tool is intentionally interactive: scoring updates as you type, weakness detection runs off the same inputs, and the verdict panel evolves as the narrative becomes more specific—so the user can feel the idea getting stronger (or see it failing) before they spend another week socializing it.

---

## Target Persona

A Head of Product or founder at a 20–200 person B2B SaaS company, prepping for a leadership roadmap review where they need to quickly pressure-test a new idea without a dedicated strategy team or research function on standby.

---

## Use Cases

- A Head of Product takes a VP’s “big bet” suggestion and stress-tests it before agreeing to allocate a squad.
- A founder turns a customer-driven feature request into a decision record to share with sales and customer success.
- A senior PM pressure-tests two competing ideas and walks into planning with a clear “why this, why now” narrative.
- A product lead uses the assumption breakdown to assign targeted discovery tasks (rather than generic “do discovery”).
- A PM uses the weakness flags to rewrite a pitch that currently relies on vague value props (“streamline,” “increase productivity”).

---

## Barebones Wireframe

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ IDEA VALIDATOR                                           [Load example ▾]    │
├───────────────────────────────────────────────┬──────────────────────────────┤
│ LEFT: WORKSPACE                                │ RIGHT: VERDICT PANEL         │
│                                               │                              │
│ 1) Idea Input                                  │ Verdict: Needs refinement     │
│    - Title                                     │ Confidence: 62/100            │
│    - Target user                               │                              │
│    - Problem statement                          │ Top risks (live):            │
│    - Proposed solution                           │ • Crowded market signals     │
│    - “Demo moment” (what user sees first)        │ • Weak differentiation claim │
│                                                 │ • Time-to-value too long     │
│ 2) Evaluation Dimensions (7 sliders + notes)    │                              │
│    Pain intensity      [0..10]  note            │ Recommended next steps:      │
│    Frequency           [0..10]  note            │ 1) Prove pain w/ evidence    │
│    Alternatives        [0..10]  note            │ 2) Define wedge + ICP         │
│    Differentiation     [0..10]  note            │ 3) Reduce first-time setup    │
│    Complexity          [0..10]  note            │                              │
│    Time-to-value       [0..10]  note            │ Dimension summary:            │
│    Business impact     [0..10]  note            │ • Strong: impact, pain        │
│                                                 │ • Weak: diff, alternatives    │
│ 3) Assumption Breakdown (progressive)           │                              │
│    - Must be true (max 6)                       │                              │
│    - Evidence we have / need                    │                              │
│                                                 │                              │
│ 4) Weakness Detection (flags + rewrite prompts) │                              │
│    - Flags: vague value prop / crowded / etc    │                              │
│    - Suggested tightening questions             │                              │
│                                                 │                              │
│ 5) Next Steps (auto + editable)                 │                              │
└───────────────────────────────────────────────┴──────────────────────────────┘
```

---

## Product Decisions

- **Verdict is continuous, not a “Generate” button:** Verdict and risks update as inputs change. Alternative was a single “Evaluate” action; rejected because the real behavior in leadership prep is iterative rewriting, not one-shot scoring.
- **Seven fixed dimensions with forced notes:** Each score has a required short rationale. Alternative was freeform criteria; rejected because teams can’t compare ideas when each evaluation uses a different rubric.
- **Complexity is scored as “delivery risk,” not “engineering effort”:** The dimension is framed to include dependencies, adoption friction, data readiness, and rollout risk. Alternative was an eng-estimate proxy; rejected because the persona often doesn’t have an eng estimate yet.
- **Weakness detection focuses on failure modes that derail roadmap meetings:** Flags are tuned to “crowded market,” “vague differentiation,” and “unclear demo moment.” Alternative was generic copy critique; rejected because polish isn’t the core risk—ambiguity is.

---

## Tech Stack

- **Runtime:** Browser (modern desktop) — optimized for internal-tool speed and zero setup
- **Framework:** none — vanilla HTML/CSS/JS to keep it easily forkable as a static tool
- **AI/API:** none
- **Styling:** Custom CSS following the `executive-monochrome` style spec
- **Data:** none — stateless (example ideas are bundled)
- **Deployment:** Any static hosting (e.g., GitHub Pages / Netlify drop)

---

## How to Run

**Prerequisites:** None.

```bash
# Clone
git clone [repo-url]
cd projects/2026-03-17-idea-validator

# Install (if applicable)
# No install required.

# Run
# Open the file directly
```

**Open:** `src/index.html` in a browser.

---

## Screenshots

![Screenshot](./screenshots/screenshot.png)

*Filled-in evaluation of a realistic B2B SaaS idea with live scoring, weakness flags, and an evolving verdict panel.*

---

## Future Enhancements

- **Evaluation history + comparison:** Save multiple ideas and compare side-by-side. Deferred because it introduces persistence and a “library” UX that risks overshadowing the single-idea workflow.
- **Calibration mode for leadership teams:** Let a leadership team define weighting (e.g., impact > time-to-value) and export a consistent rubric. Deferred because it requires alignment design and validation to avoid political misuse.
- **Evidence attachment:** Link assumptions to interview notes, Zendesk tags, or call snippets. Deferred because integrations and data hygiene are out of scope for a static prototype.
- **Export pack:** One-click export to a decision memo (PDF/Markdown) with scores, assumptions, and top risks. Deferred because formatting/export edge cases are a separate project.

---

## Decision Log

See [decision-log.md](./decision-log.md) for a full record of design and scoping decisions.
