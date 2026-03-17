# Decision Log — Sprint Retro Diff

**Last updated:** 2026-03-17

---

## What This Project Optimized For

- **Retro-ready time-to-first-insight** — at the cost of not being a full historical analytics view across many sprints.
- **Argument-resistant outputs (auditable evidence)** — at the cost of requiring structured input rows instead of “just paste notes.”
- **Facilitator usability for a non-ops PM** — at the cost of a simplified capacity model that won’t fit every team’s reality.

---

## What Was Intentionally Left Out

| Cut Item | Reason |
|----------|--------|
| Multi-sprint trend charts and forecasting | The use case is a single retro; adding trends pushes the tool toward BI and invites debates about long-term seasonality instead of actionable sprint fixes |
| Direct Jira/Linear integration | Auth, field mapping, and differing workflow schemas would dominate build effort and distract from validating the core rubric |
| Storage, team workspaces, and history | Persistence changes the project from a standalone experiment to an internal system with account/state complexity; export is enough for the retro doc workflow |
| “AI-generated retro summary” prose | The goal is structured attribution and evidence, not a wall of text that feels ungrounded; teams need to trust the math and inputs |

---

## Major Product Trade-offs

**Structured inputs vs. low-friction notes**
Chose structured scope-change and blocker rows over a single freeform notes box. Structured rows mean the output can quantify churn and interruption cost and cite specific events. A notes box would be faster to fill but would recreate the same failure mode (vibes + selective memory). Went with structured rows because the persona is preparing for a meeting where claims will be challenged.

**Two-sprint diff vs. multi-sprint analytics**
Chose a strict Sprint A vs Sprint B comparison over a dashboard across multiple sprints. The diff format means the tool can answer “what changed since last retro?” clearly, but it gives up pattern detection across quarters. Went with the diff because retros are a recurring cadence and the primary decision is what to adjust next sprint.

**Simple capacity model vs. precise capacity accounting**
Chose a minimal set of capacity inputs (team days + on-call days) over modeling meetings, PTO per person, pairing load, and spillover work. The simple model is easy to complete and explain, but it can misattribute some delta to “unexplained.” Went with simple inputs because a tool that requires perfect capacity data won’t be used five minutes before retro.

**Ranked drivers with assumptions vs. “neutral” reporting**
Chose to rank likely drivers (scope churn, blocker hours, commitment delta) and state assumptions explicitly rather than only presenting raw tables. Ranking risks disagreement with the ordering, but it creates an actual facilitation artifact. Went with ranking because the job-to-be-done is producing a narrative scaffold, not just showing numbers.

---

## Design Choices Made

- **Style identity — `playful-consumer`:** The retro moment is emotionally loaded; a friendly, light visual system reduces defensiveness and makes the artifact feel like a facilitator tool rather than a performance evaluation report.
- **Wizard flow (Step 1 Sprint A → Step 2 Sprint B → Results):** This prevents users from jumping to interpretation before inputs are complete. The alternative was a single long form; rejected because users would partially fill it and still expect a coherent output.
- **Evidence-first ranking cards:** Each “driver” card includes the computed impact, the specific input rows that triggered it, and a one-line “question to confirm.” The alternative was a single narrative paragraph; rejected because it’s hard to challenge or refine without seeing what the tool used.

---

## Technical Shortcuts or Constraints

- **No persistence layer:** All data lives in memory until the user exports — USER COST: if the tab refreshes or the browser crashes, they must re-enter the sprint data.
- **Heuristic attribution math (rubric-based, not statistical):** Driver impacts use simple arithmetic (points added/removed, blocker hours converted to capacity) — USER COST: teams with a different “points-to-time” reality may see a ranking that feels wrong unless they adjust the assumptions.
- **No input validation beyond basic number checks:** The tool won’t detect contradictory entries (e.g., negative blocker hours, scope removed > committed) — USER COST: a user can accidentally produce a misleading report and only notice when it gets questioned in retro.
- **No automated data import:** Users manually enter scope and blocker events — USER COST: the tool is less useful for teams that don’t already track scope-change events and blocker time in a consistent way.

---

## Publish or Scratch — and Why

**Recommendation:** `Publish`

The concept is specific (two-sprint retro attribution), the interaction model is distinct (wizard → structured report with evidence), and it doesn’t depend on external credentials. The quality bar to publish is a working rubric with realistic sample data that produces a report a PM could paste into a retro doc without editing. If the rubric reads as arbitrary in practice, it should be held until the assumptions and driver ranking logic are tightened.

---

## What a V2 Would Include

- **Jira/Linear import mapping:** Auto-populate committed/done and detect scope-change events from ticket adds/removes — impact: makes the tool usable for teams who won’t manually log churn.
- **Assumption presets + calibration:** Let users choose presets (e.g., “on-call day = 0.3/0.5/0.7 capacity”) and save them — impact: reduces debate about the model and increases trust in the ranking.
- **Coverage meter + missing-data prompts:** Detect when blocker coverage is thin (e.g., zero blocker entries but a large velocity drop) and prompt specific follow-ups — impact: turns “unexplained delta” into actionable data collection for next sprint.
- **Export formats for common retro docs:** One-click export blocks for Confluence and Notion — impact: reduces friction from “insight” to “shared artifact” in the team’s actual workflow.
