# Idea Validator

> A live-scoring idea pressure-test that turns a raw product concept into a structured risk profile, assumption list, and a clear pursue / refine / drop verdict.

**Status:** `draft`
**Complexity:** `simple`
**Bucket:** `gtm-workflow`

---

## Goal

Enable a PM or founder to pressure-test a product idea in under 10 minutes and walk away with (1) a defensible verdict, (2) the 5–8 assumptions that must be proven, and (3) the next validation actions to run this week.

---

## Problem

In early roadmap planning, teams often commit to ideas after a single excited conversation: the value prop stays vague, differentiation is assumed, complexity is underestimated, and “we’ll validate later” never happens. The failure shows up weeks later as a build that’s hard to ship, hard to sell, or solves a problem that isn’t frequent enough—after time has already been spent aligning stakeholders and allocating engineering capacity.

---

## Why This Exists

Static checklists don’t work because the hard part isn’t remembering dimensions—it’s forcing consistency and trade-offs while the idea is still fluid. This tool keeps a single visible verdict panel that updates as the inputs change, so the user can iteratively tighten the idea (target user, problem, differentiation) and immediately see which risks are being reduced and which remain structural blockers.

---

## Target Persona

A Head of Product or founder at a 20–200 person B2B SaaS company trying to decide whether a new idea deserves roadmap time, operating without a dedicated research team and needing a crisp rationale to share with leadership.

---

## Use Cases

- A founder sanity-checks a partner-requested feature before promising it on a call.
- A PM turns a fuzzy “we should add AI” suggestion into a concrete set of assumptions and validation steps before kickoff.
- A product lead compares three candidate bets using the same rubric to avoid “who argued best” decisions.
- A PM identifies why an idea feels exciting but fragile (e.g., crowded market + unclear differentiation) and rewrites the concept to address it.
- A team uses the assumptions list as the agenda for a one-week discovery sprint.

---

## Barebones Wireframe

```
┌───────────────────────────────────────────────────────────────────────┐
│ IDEA VALIDATOR                                                        │
│ [Idea presets ▼]                                   Verdict: NEEDS REFINEMENT
│                                                                       │
│ LEFT: Thinking workspace                           RIGHT: Verdict panel
│ ┌───────────────────────────────┐                 ┌───────────────────┐
│ │ Idea (free text)              │                 │ Overall score 62  │
│ │ [multiline input…]            │                 │ • Pain: 7/10      │
│ └───────────────────────────────┘                 │ • Frequency: 5/10 │
│ ┌───────────────────────────────┐                 │ • Differentiation │
│ │ Optional structure            │                 │   : 4/10          │
│ │ Target user [____]            │                 │ • Complexity: 6/10│
│ │ Problem    [____]             │                 │ • Time-to-value   │
│ │ Solution   [____]             │                 │   : 5/10          │
│ └───────────────────────────────┘                 └───────────────────┘
│                                                                       │
│ ┌───────────────────────────────────────────────────────────────────┐ │
│ │ EVALUATION DIMENSIONS (live sliders + notes)                       │ │
│ │ Pain ▓▓▓▓▓▓▓░░░   Frequency ▓▓▓▓▓░░░░░  Alternatives ▓▓▓▓▓▓▓░░░    │ │
│ │ Differentiation ▓▓▓▓░░░░░░   Complexity ▓▓▓▓▓▓░░░░   Time-to-value │ │
│ │ Business impact ▓▓▓▓▓▓▓░░░                                        │ │
│ └───────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│ ┌───────────────────────────────────────────────────────────────────┐ │
│ │ WEAKNESS DETECTION (flags + why)                                   │ │
│ │ ! Vague value prop — missing measurable outcome                    │ │
│ │ ! Crowded market — likely switching costs / incumbents             │ │
│ │ ! Hidden complexity — dependencies implied by solution             │ │
│ └───────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│ ┌───────────────────────────────────────────────────────────────────┐ │
│ │ ASSUMPTIONS (generated + categorized)                              │ │
│ │ User assumptions | Technical assumptions | Business assumptions    │ │
│ └───────────────────────────────────────────────────────────────────┘ │
│                                                                       │
│ ┌───────────────────────────────────────────────────────────────────┐ │
│ │ NEXT STEPS (validation actions)                                    │
│ │ • 5 interviews with [persona] focused on [pain + frequency]        │
│ │ • Prototype test: can they reach value in <10 min?                 │
│ │ • Define success metric + leading indicators                        │
│ └───────────────────────────────────────────────────────────────────┘
└───────────────────────────────────────────────────────────────────────┘
```

---

## Product Decisions

- **Verdict is always visible (side panel):** The tool keeps the evolving verdict and overall score pinned while the user edits inputs. Alternative was a bottom “Generate verdict” section; rejected because it encourages one-shot completion instead of iterative tightening.
- **Hybrid input (free text + optional structure):** Users can paste a raw idea, but the tool nudges clarity via optional fields (target user, problem, solution). Alternative was fully structured input; rejected because it blocks the “capture the messy thought” moment.
- **Dimension scoring is explicit and editable:** Scores are surfaced per dimension with short explanations so users can disagree and adjust. Alternative was hidden weighting / opaque scoring; rejected because leaders need to defend (and debate) the rationale.
- **Weakness detection prioritizes common failure modes:** Flags focus on vague value props, crowded markets, unclear differentiation, and hidden complexity. Alternative was a long checklist of dozens of risks; rejected because it dilutes the demo moment and reduces actionability.
- **Next steps are validation actions, not build tasks:** Outputs recommend interviews, prototype tests, and metric definitions. Alternative was “roadmap next steps”; rejected because the persona’s constraint is uncertainty, not execution planning.

---

## Tech Stack

- **Runtime:** Vanilla JavaScript — instant interaction and zero build step
- **Framework:** none — single-page static app
- **AI/API:** none — deterministic rubric + heuristics for a reliable demo without keys
- **Styling:** Custom CSS following the `tactile-dashboard` style spec
- **Data:** none — stateless; presets are in-source JSON
- **Deployment:** Static hosting (GitHub Pages or Netlify drop)

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
# Option A: open the file directly
open src/index.html

# Option B: serve locally (recommended)
python3 -m http.server 8080
```

**Open:**
- If serving: http://localhost:8080/src/
- If opening directly: `src/index.html`

---

## Screenshots

![Screenshot](./screenshots/screenshot.png)

*A filled evaluation using a realistic B2B SaaS idea preset, showing live dimension scores, weakness flags, categorized assumptions, and the pinned verdict panel.*

---

## Future Enhancements

- **Compare mode (2–3 ideas side-by-side):** Show diffs in risk profile and why one idea wins. Deferred because it adds multi-entity state and UI complexity beyond the single-idea workflow.
- **Evidence mode:** Allow attaching links/notes per assumption (interview snippets, metrics). Deferred because it implies persistence and collaboration, which adds backend scope.
- **Rubric tuning:** Let teams adjust weights per strategy (e.g., “time-to-value matters most”). Deferred to keep the tool opinionated and consistent for v1.
- **Export brief (Markdown):** Generate a one-page idea memo with verdict, assumptions, and next steps. Deferred because the core value is the live pressure-test loop; export can come after.

---

## Decision Log

See [decision-log.md](./decision-log.md) for a full record of design and scoping decisions.
