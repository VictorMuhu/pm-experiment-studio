# Decision Log — Retention Loop Analyzer

**Last updated:** 2026-03-21

---

## 1. What This Project Optimized For

A Growth PM in a weekly retention review who needs to point to one specific broken loop transition and leave with 2–3 intervention options (with directional impact) — this tool optimizes for that moment, not for full-fidelity analytics or statistically rigorous forecasting.

---

## 2. What Was Intentionally Left Out

| Cut Item | Reason |
|----------|--------|
| Importing real event streams (Amplitude/Mixpanel APIs) | Would require auth flows, schema mapping, and data cleaning; that setup burden would kill “open and reason in 2 minutes,” which is the core portfolio moment. |
| Multi-loop ecosystems (loops influencing each other) | Adds graph complexity and a harder mental model; the MVP needs one loop with a strong “tighten/break” demo interaction. |
| Statistical retention forecasting (confidence intervals, seasonality, counterfactuals) | Without real historical data and a validated model, forecasts would look authoritative but be misleading; the prototype keeps simulation bounded and explainable. |
| Collaboration and persistence (saving scenarios, sharing links) | Requires storage and state management; deferred to keep the tool runnable from a clean clone as a static app. |

---

## 3. Major Product Trade-offs

**Explainable rubric score vs. “smart” opaque score**
Chose a weighted, visible rubric (completion, frequency, loop time, reward strength) over an opaque “AI loop health” score. The rubric means the score can be debated and tuned. The opaque option would have felt magical but would not be defensible in a leadership discussion. Went with the rubric because the target moment is a meeting where the PM needs to explain why the loop is weak.

**Single-loop focus vs. end-to-end retention journey**
Chose one loop per workspace over modeling an entire journey map with many branches. One loop means tight interaction and immediate feedback. The journey model would be more complete but would turn into a dashboard/flowchart exercise without a clear “what do I change next?” moment. Went with single-loop focus because the demo needs clarity and a decisive breakpoint.

**Parameter-based simulator vs. data-driven intervention modeling**
Chose a parameter slider model (friction, reward strength, return delay) over fitting a model from historical events. Parameters are fast and deterministic, but less “real.” Data-driven modeling would be more accurate but requires integration work and assumptions that the prototype can’t validate. Went with parameters because it keeps the simulator responsive and interpretable.

---

## 4. Design Choices Made

- **Style choice: `brutalist-utility`:** The sharp, utilitarian look signals “internal tool” and keeps attention on structure and deltas (drop-offs, score changes) rather than decoration. It fits a senior PM audience that values clarity and direct manipulation.
- **Loop diagram as the primary canvas:** The loop is always visible and central, with transitions encoded by thickness and color so breakpoint detection is readable without reading numbers. The alternative (numbers first, diagram second) would recreate the typical analytics failure mode.
- **Insight panel is diagnosis-first, not recommendation-first:** The panel leads with “Primary break” and a one-line diagnosis (e.g., “Loop is too slow”) before listing interventions. The alternative (a list of suggested fixes) would feel generic and reduce trust because users can’t see what the tool observed.

---

## 5. Technical Shortcuts and Constraints

- **Heuristic projections:** Simulator impacts are computed from simple formulas rather than learned from real data — USER COST: projected lift is directional and may disagree with what the company’s data would show.
- **No persistence:** Loops and scenarios are not saved between sessions — USER COST: a PM must screenshot or re-enter changes to reuse them in the next meeting.
- **Fixed loop schema:** The model assumes exactly four stages (trigger → action → reward → return) — USER COST: products with meaningful multi-step activation or post-reward behaviors can’t be represented without flattening nuance.

---

## 6. Publish or Scratch — and Why

**Recommendation:** `Publish`

This clears the bar if the shipped artifact delivers one unmistakable demo moment: adjusting a parameter visibly changes the loop (tightens/breaks), updates the score with an explainable breakdown, and calls out the weakest transition with a specific diagnosis. It’s not a generic dashboard: the loop canvas is the product. The main risk is over-promising “impact” without data; the UI copy and README will frame projections as directional to avoid misleading confidence.

---

## 7. What a V2 Would Include

- **CSV import for step metrics:** Lets a PM paste real step conversion rates and time-between-events from an export — improves credibility for teams that already have the data.
- **Segment compare view:** Shows two loops side-by-side (e.g., paid vs. organic) — helps growth leads identify which transition differs by segment.
- **Scenario library + shareable snapshot export:** Save “current vs. proposed” and export a single image for doc decks — helps PMs carry the artifact into leadership reviews without live tooling.
- **Multi-node action stage:** Allow the “action” to be 2–4 sub-steps with individual friction/drop-offs — helps B2B products where value realization is not a single action.
