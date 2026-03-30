# Retention Loop Analyzer

Most retention work dies in a chart: you can see Day-7 is down, but you can’t see which behavior loop is breaking or what change would tighten it.

> A loop-mapping sandbox that turns a retention loop (trigger → action → reward → return) into an interactive systems diagram with live drop-offs, a loop strength score, and a simple intervention simulator.

**Status:** `draft`
**Complexity:** `complex`
**Bucket:** `customer-experience`

---

## Goal

A growth PM should be able to map one retention loop, pinpoint the weakest transition, and leave with 2–3 concrete interventions (and their projected impact) in under 10 minutes—without opening BI or writing a SQL query.

---

## Problem

A senior PM at a scaling product (Series B–D) often gets pulled into a weekly retention review where the only artifact is a cohort chart and a few funnel cutdowns. In that meeting, the team debates “why” retention moved using anecdotes, because the underlying behavioral loop is implicit. The consequence is predictable: fixes target the wrong step (e.g., “improve onboarding”) while the actual break is later (e.g., weak reward), and weeks of iteration don’t move the curve.

---

## Why This Exists

A spreadsheet can list metrics, but it can’t behave like a system. This tool exists to make retention reasoning tangible: when you change the friction of the action, the reward strength, or the return trigger speed, the loop visibly tightens or breaks and the score updates immediately. That interactivity is the point—it forces the conversation to be about loop mechanics (where users drop and why) instead of abstract metric deltas.

---

## Target Persona

A Growth PM at a 50–500 person consumer or prosumer product who owns retention but doesn’t have a dedicated analyst on-demand for every “why did this change?” question.

---

## Use Cases

- A growth lead maps the “weekly content consumption” loop before a retention deep-dive and uses the weakest transition to focus the meeting on one step.
- A PM tests whether a proposed “better reward” idea is likely to matter more than “reduce friction” by simulating both and comparing projected lift.
- A team onboarding a new PM uses the preloaded loops to align on what “the loop” actually is for their product, not just the KPI definition.

---

## Barebones Wireframe

```
┌─────────────────────────────────────────────────────────────────────┐
│ Retention Loop Analyzer                                             │
│ [Example Loop ▼]  (Social Feed / Marketplace / SaaS)   [Reset]       │
├─────────────────────────────────────────────────────────────────────┤
│ LOOP MAP (interactive)                         INSIGHT PANEL        │
│  (circular diagram)                            - Primary break:     │
│   [Trigger] → [Action] → [Reward] → [Return]     Reward → Return    │
│     ^_____________________________________|     - Diagnosis:        │
│                                               "Loop is too slow"     │
│  Hover/select a node highlights transitions    - Suggested moves:   │
│  Thick line = strong transition               1) Increase reward... │
│  Thin/red line = drop-off                     2) Add return cue...  │
│                                                                     │
├─────────────────────────────────────────────────────────────────────┤
│ PARAMETERS (per step)                           LOOP STRENGTH SCORE │
│ Trigger: cadence, reach                          [ 68 / 100 ]        │
│ Action: friction, time-to-complete               Breakdown:          │
│ Reward: strength, clarity                        - completion rate   │
│ Return: trigger strength, delay                  - frequency         │
│                                                 - loop time          │
│                                                 - reward strength    │
├─────────────────────────────────────────────────────────────────────┤
│ INTERVENTION SIMULATOR                                              │
│ [Reduce action friction -10%] [Increase reward +1] [Faster return]   │
│ Projected: Completion +4.2pp | Return +2.1pp | Score +7             │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Product Decisions

- **Loop-first UI over dashboard-first UI:** The primary surface is a loop diagram with transitions, not a table of metrics. Alternative was a KPI panel with a small diagram; rejected because it repeats the “retention chart without mechanics” failure mode.
- **Score is intentionally explainable:** The Loop Strength Score is a weighted rubric (completion, frequency, loop time, reward strength) with a visible breakdown. Alternative was a black-box “AI score”; rejected because PMs need to defend why a change helps.
- **Preloaded realistic loops as the default state:** The app opens with real-seeming example loops (social feed, marketplace, SaaS). Alternative was an empty canvas; rejected because the first minute matters and empty states hide the intended interaction.
- **Simulation is bounded, not predictive:** Interventions adjust a small set of parameters and show directional projected impact. Alternative was “forecast retention” modeling; rejected because it would require real event data and a more complex statistical model.

---

## Tech Stack

- **Runtime:** JavaScript (browser) — instant feedback and no setup friction for reviewers
- **Framework:** none — vanilla HTML/CSS/JS to keep interaction logic transparent
- **AI/API:** none
- **Styling:** custom CSS following the `brutalist-utility` style spec
- **Data:** none — stateless, with in-memory presets
- **Deployment:** static hosting (any) — works as a single-page tool

---

## How to Run

**Prerequisites:** None.

```bash
# Clone
git clone <repo-url>
cd projects/2026-03-21-retention-loop-analyzer

# Install
# No install required.

# Run
# Option 1: open directly
open src/index.html

# Option 2: serve locally (recommended)
python3 -m http.server 5173
```

**Open:**
- If serving: http://localhost:5173/src/
- If opening directly: `src/index.html`

---

## Screenshots

Screenshot pending — see screenshots/PENDING.md for capture instructions.

---

## Future Enhancements

- **Import event step metrics:** Allow pasting/uploading step conversion data from Amplitude/Mixpanel exports. Deferred because it introduces parsing edge cases and validation work beyond the prototype.
- **Segment compare mode:** Compare the same loop for new vs. returning users (or by acquisition channel). Deferred because it requires a richer data model and doubles UI complexity.
- **Intervention history + shareable snapshots:** Save scenarios and export a “before/after loop” image for reviews. Deferred because persistence and export polish aren’t required to validate the core interaction.

---

## Decision Log

See [decision-log.md](./decision-log.md) for a full record of design and scoping decisions.
