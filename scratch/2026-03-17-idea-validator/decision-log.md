# Decision Log — Idea Validator

**Last updated:** 2026-03-17

---

## What This Project Optimized For

- **Decision traceability for exec-level conversations** — at the cost of flexibility: the rubric is intentionally fixed so the outcome can be compared across ideas and reused in leadership discussion.
- **Fast, structured “first-pass” rigor** — at the cost of completeness: the tool is designed to produce a credible verdict quickly, not to replace discovery work, research, or financial modeling.
- **Low-friction workshop usability** — at the cost of persistence: it runs as a static tool so a PM can open it in a meeting without setup, even though it doesn’t save state by default.

---

## What Was Intentionally Left Out

| Cut Item | Reason |
|----------|--------|
| Multi-user collaboration (comments, assignments, shared links) | Requires identity, storage, and permissions; that shifts the project from “decision tool” to “workflow system” and would dominate scope. |
| Full ROI model (LTV/CAC, pricing scenarios, confidence intervals) | Adds false precision early; most teams don’t have inputs ready at the idea stage, and the tool would encourage spreadsheet theater. |
| Market/competitor database integration | Would require external data sources and ongoing curation; V1 focuses on prompting the user to state differentiation explicitly rather than “outsourcing” it. |
| Custom rubric builder | Increases debate about the rubric itself and reduces comparability across ideas; V1 is intentionally opinionated to force momentum. |

---

## Major Product Trade-offs

**Opinionated rubric vs. configurable framework**
Chose a fixed set of seven dimensions over user-defined dimensions. A fixed rubric means users can compare idea briefs across time and across teams. A configurable rubric would fit more contexts but would turn every use into a meta-discussion about scoring categories. Went with fixed because the target persona needs a repeatable decision mechanism in planning cycles.

**Live-updating verdict vs. “generate verdict” action**
Chose a verdict panel that updates continuously as the user edits. Live updates make the scoring model feel inspectable and encourage iteration (“what score change flips the verdict?”). A generate button would create a single dramatic output moment and reduce learning. Went with live updates to keep the tool from feeling like an AI slot machine.

**Rule-driven weakness flags vs. LLM critique**
Chose deterministic weakness detection based on score patterns and common signatures (e.g., low differentiation + high alternatives → crowded market risk). Rule-driven flags are consistent and easier to trust in exec contexts. LLM critique can be more nuanced but often becomes generic and ungrounded without company context. Went with rules to keep the tool credible and repeatable without external dependencies.

---

## Design Choices Made

- **Visual identity: `executive-monochrome`** — the dark, editorial workspace aesthetic is meant to feel like an internal strategy surface (not a consumer app), matching the Head of Product/founder context where credibility and focus matter more than friendliness.
- **Sticky verdict side panel with “reasons” bullets** — the panel doesn’t just show a label; it shows 2–3 concise rationale bullets and top risks so the user can screenshot or paste it into a planning doc without rewriting.
- **Progressive disclosure for cognitive pacing** — the tool reveals Assumptions and Weakness Detection only after core idea input and baseline scoring exist, mirroring how a real review conversation unfolds and reducing abandonment from an intimidating full-page rubric.

---

## Technical Shortcuts and Constraints

- **No persistence layer:** All inputs live in memory only — USER COST: if the user refreshes the page or closes the tab, the entire evaluation is lost unless they copied/exported the brief.
- **Heuristic weakness detection:** Flags are based on score thresholds and a small set of pattern rules — USER COST: nuanced cases (e.g., low differentiation but strong distribution advantage) may be incorrectly flagged as “crowded market” unless the user captures that nuance in evidence notes.
- **No user authentication or sharing:** The tool is single-user by design — USER COST: a PM cannot send a link that preserves the filled evaluation to a teammate; they must export/copy the brief and share it manually.

---

## Publish or Scratch — and Why

**Recommendation:** `Publish`

This clears the bar as a portfolio-grade decision-support artifact because the interaction is structured, deterministic, and geared toward a specific exec moment: pre-commitment roadmap triage. The design intent (executive strategy workspace, progressive disclosure, verdict traceability) is integral to the product, not decoration. The remaining risk is execution quality: the weakness rules and sample ideas must feel sharp and realistic; if the demo content reads generic, the project should be held until the examples and flags are tightened.

---

## What a V2 Would Include

- **Saved evaluations with versioning:** Let users save an idea brief, revisit it after discovery, and see what changed — helps teams avoid re-litigating old decisions and makes learning visible.
- **Side-by-side idea comparison:** Compare two idea briefs with score deltas and risk deltas — helps Heads of Product make trade-offs explicit during quarterly planning.
- **Calibration profiles (weighting + thresholds):** Provide presets like “enterprise expansion,” “platform investment,” and “self-serve growth” — helps the same rubric fit different strategic modes without users inventing their own dimensions.
- **Export packs (Markdown + one-slide summary):** Generate an exec-ready brief plus a single-slide format — helps founders and product leaders reuse the output directly in planning decks.
