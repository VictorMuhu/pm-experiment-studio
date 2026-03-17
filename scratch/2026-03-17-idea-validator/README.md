# Idea Validator

> A real-time idea pressure-test workspace that scores a product concept, surfaces its weakest assumptions, and outputs a clear pursue/refine/pass verdict.

**Status:** `published`
**Complexity:** `complex`
**Bucket:** `decision-support`

---

## Goal

Help a senior PM or founder turn an exciting but underspecified idea into a decision-ready view in under 10 minutes: what’s strong, what’s fragile, what must be true, and the smallest set of next validation steps before allocating roadmap time.

---

## Problem

In early roadmap planning, a PM or founder often greenlights an idea after a persuasive pitch, a single anecdote, or internal enthusiasm—then discovers late (during discovery, design, or build) that the value prop was vague, the market was crowded, the problem frequency was low, or implementation complexity was hidden. The consequence is predictable: weeks of opportunity cost, misaligned stakeholders, and a “why didn’t we catch this earlier?” postmortem that still doesn’t produce a repeatable evaluation habit.

---

## Why This Exists

A static checklist or spreadsheet captures scores, but it doesn’t force coherence between the narrative (who/what/why) and the ratings, and it rarely highlights contradictions as the idea changes. This tool is interactive on purpose: as the user edits the idea, scores and flags update immediately, assumptions are re-derived, and the verdict moves in real time—so the user can feel which edits actually strengthen the case versus merely make it sound better.

---

## Target Persona

A Head of Product or founder at a 20–150 person B2B SaaS company trying to decide whether a new idea deserves a discovery sprint, with limited research bandwidth and high cost-of-delay pressure.

---

## Use Cases

- A Head of Product rewrites a concept pitch from a Slack thread into a decision-ready outline before committing a team to a quarter-level initiative.
- A founder compares two competing “next bets” by pressure-testing each and exporting the risks/assumptions into a board deck.
- An IC PM prepares for a roadmap review by using the weakness flags to pre-empt stakeholder objections (“why us?”, “why now?”, “why will this work?”).
- A product leadership team uses it as a shared rubric during an intake meeting to avoid scoring based purely on seniority or charisma.
- A PM uses the “next steps” actions to convert an ambiguous idea into a 1–2 week validation plan with clear learning goals.

---

## Barebones Wireframe

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ IDEA VALIDATOR                                                               │
│ (dark editorial workspace)                                                   │
├──────────────────────────────────────────────────────────────────────────────┤
│ LEFT: INPUT + DIMENSIONS                             RIGHT: VERDICT PANEL    │
│                                                                              │
│ [Idea title]                                                                 │
│ [Free-text idea narrative ..............................................]    │
│                                                                              │
│ Optional structure:                                                           │
│  - Target user [..................]                                          │
│  - Problem     [..................]                                          │
│  - Solution    [..................]                                          │
│                                                                              │
│ Evaluation dimensions (live):                         ┌───────────────────┐   │
│  Pain intensity         [ 7/10 ]  ▲                   │ VERDICT: REFINE   │   │
│  Frequency              [ 5/10 ]  ▼                   │ Confidence: Med   │   │
│  Existing alternatives   [ 3/10 ]  ! crowded          │ Key risks (3)     │   │
│  Differentiation         [ 4/10 ]  ! vague            │ Next steps (3)    │   │
│  Implementation complexity[ 6/10 ] ! hidden work      └───────────────────┘   │
│  Time to value           [ 5/10 ]                                            │
│  Business impact         [ 6/10 ]                                            │
│                                                                              │
│ WEAKNESS FLAGS (auto)                                                        │
│  - Vague value prop (missing measurable outcome)                             │
│  - Crowded market (multiple named alternatives)                              │
│  - Differentiation claim not evidenced                                       │
│  - Hidden complexity (integrations, permissions, data quality)               │
│                                                                              │
│ ASSUMPTIONS (auto, categorized)                                              │
│  User assumptions        (5)  [expand]                                       │
│  Technical assumptions   (4)  [expand]                                       │
│  Business assumptions    (4)  [expand]                                       │
└──────────────────────────────────────────────────────────────────────────────┘
```

---

## Product Decisions

- **Real-time scoring instead of a “Generate” button:** Scores, flags, and verdict update as the user edits text, so the tool acts like a thinking aid during rewriting. Alternative was a submit-and-render flow; rejected because it encourages dumping text and accepting output rather than iterating toward clarity.
- **Small, explicit dimension set (7) over a comprehensive rubric (15+):** The dimensions were chosen to match the failure modes that derail early bets (pain, frequency, alternatives, differentiation, complexity, time-to-value, impact). Alternative was a broader framework including TAM/SAM/SOM and pricing; rejected because it turns into a strategy doc and slows time-to-first-insight.
- **Weakness flags are phrased as objections, not advice:** Flags read like what a skeptical exec would say (“crowded market”, “unclear differentiation”), so the user can rehearse the review conversation. Alternative was softer coaching language; rejected because it doesn’t create decision pressure.
- **Assumptions are categorized by where they break (user/tech/business):** Categorization routes follow-up work to the right owner (discovery, engineering spike, GTM). Alternative was a single ranked list; rejected because a list hides the type of validation needed.
- **Verdict panel is always visible:** The right rail keeps “so what?” in view while editing. Alternative was placing verdict at the bottom; rejected because users would scroll past the most important output during iteration.

---

## Tech Stack

- **Runtime:** Browser (ES2020) — instant feedback loop with no backend latency
- **Framework:** none — vanilla HTML/CSS/JS to keep the interaction fast and portable
- **AI/API:** none — deterministic heuristics so the tool is usable offline and outputs are explainable
- **Styling:** Custom CSS following the `editorial-elegance` style spec
- **Data:** localStorage for drafts and recent ideas
- **Deployment:** Any static host (Netlify/Vercel/GitHub Pages)

---

## How to Run

**Prerequisites:** None.

```bash
# Clone
git clone https://github.com/<your-org-or-user>/pm-experiment-studio.git
cd pm-experiment-studio/projects/YYYY-MM-DD-idea-validator

# Install
# No install required.

# Run
# Option A: open directly
open src/index.html

# Option B: serve locally (recommended)
python3 -m http.server 5173
```

**Open:**
- If using `python3 -m http.server`: `http://localhost:5173/src/`
- If opening directly: open `src/index.html` in your browser

---

## Screenshots

![Screenshot](./screenshots/screenshot.png)

*The workspace with a realistic B2B SaaS concept loaded, showing live scores, weakness flags, categorized assumptions, and an evolving verdict in the right rail.*

---

## Future Enhancements

- **Side-by-side comparison:** Compare two ideas on the same rubric and show deltas. Deferred because it requires a stronger persistence model and a comparison UI that could overwhelm the single-idea workflow.
- **Evidence attachments per score:** Let users link notes/interview quotes to dimensions (e.g., “frequency”). Deferred because it changes the tool from evaluator to research repository.
- **Custom rubric templates:** Allow teams to weight dimensions differently (e.g., enterprise vs SMB). Deferred to validate the default rubric’s usefulness before adding configuration complexity.
- **Export pack:** One-click export into a one-page “Idea Brief” with risks/assumptions/next steps. Deferred because it needs careful formatting decisions per target medium (Notion, PDF, slides).

---

## Decision Log

See [decision-log.md](./decision-log.md) for a full record of design and scoping decisions.
