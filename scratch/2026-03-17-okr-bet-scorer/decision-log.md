# Decision Log — OKR Bet Scorer

**Last updated:** 2026-03-17

---

## What This Project Optimized For

- Fast, defensible pre-meeting prep — at the cost of not capturing all the nuance that comes from deeper analytics or stakeholder interviews.
- Explainability in a planning room — at the cost of a “smart” narrative output; every point in the score can be traced to an input field and weight.
- Balanced OKR coverage visibility — at the cost of treating initiatives as discrete items rather than modeling dependencies and sequencing across the quarter.

---

## What Was Intentionally Left Out

| Cut Item | Reason |
|----------|--------|
| Multi-quarter roadmap planning (H2, annual) | The core failure mode happens in quarter planning syncs; multi-quarter introduces different decision criteria (option value, sequencing) and would dilute the rubric. |
| Automatic scoring from free-text initiative descriptions | Would push the product toward an “LLM judge,” which creates trust and consistency issues; the goal is a structured checklist that forces the PM to make the mapping explicit. |
| Cost/ROI modeling (revenue impact, CAC, LTV) | Requires assumptions many PMs can’t justify in the moment; the tool is for alignment and coverage first, not business case authoring. |
| Dependency mapping and critical path | Adds graph UI complexity and turns the tool into a planning system; V1 is a scoring worksheet meant to be used in minutes. |

---

## Major Product Trade-offs

**Rubric scoring vs narrative assessment**
Chose a weighted rubric with visible sub-scores over narrative “alignment explanations.” A rubric means users can challenge the inputs/weights and still keep the output useful; narrative output would feel persuasive but be hard to audit in a contentious roadmap meeting. Went with the rubric because the persona needs something they can defend in 30 seconds per initiative.

**Two complementary outputs vs a single prioritized list**
Chose to generate both (1) an initiative ranking and (2) an OKR coverage view. A single ranking optimizes for “what to do next,” but it fails at revealing uncovered OKRs, which is the most expensive surprise mid-quarter. Went with dual outputs because the planning sync needs both prioritization and portfolio coverage in the same artifact.

**Primary OKR requirement vs many-to-many mapping only**
Chose “one primary OKR + optional secondary OKRs” over fully symmetric many-to-many mapping. Requiring a primary OKR forces clarity about the bet’s purpose; the downside is it can oversimplify initiatives that truly span objectives. Went with a primary anchor because it matches how roadmap trade-offs are argued and decided in practice.

**Allow ‘Keep anyway’ vs force OKR mapping for every bet**
Chose to allow an explicit non-OKR category (reliability/compliance/infra) with a required reason over forcing every bet to map to an OKR. Allowing it risks teams overusing the escape hatch; forcing mapping encourages dishonest or hand-wavy alignment. Went with “Keep anyway” because the real-world alternative to forcing alignment is people making up alignment in the room.

---

## Design Choices Made

- **Style direction: `dense-analyst-console`:** The interface is intentionally data-dense and text-forward to match the planning context (lots of items, quick scanning, minimal visual decoration). This style supports side-by-side input/output, compact tables, and “operator console” clarity, which fits a PM preparing for a high-stakes meeting.
- **Split-pane layout (inputs left, outputs right):** Chose a constant visible results pane instead of a separate “results page.” The alternative (single column with results below) makes it harder to iterate and compare changes; split-pane supports the common workflow of adjusting one initiative field and immediately seeing ranking/coverage effects.
- **Flags are first-class, not buried in tooltips:** Orphans, uncovered OKRs, and “indirect metric link” show as explicit flags and counters. The alternative was subtle badges; rejected because the point is to surface uncomfortable truths early, not hide them behind hover states.
- **Sub-score breakdown per initiative:** Each total score is decomposed (Alignment, Metric Link, Confidence, Effort penalty) so disagreements become specific (“we disagree that this is indirect”) rather than philosophical (“your ranking is wrong”).

---

## Technical Shortcuts or Constraints

- **localStorage instead of a backend:** Enables zero-setup use and quick iteration, but data is device/browser-specific and can be lost if storage is cleared; it’s not suitable for team collaboration.
- **No authentication or roles:** Keeps the tool single-user and frictionless, but it can’t support shared planning workflows or audit trails.
- **Simple deterministic scoring (no statistical calibration):** Weights are product-chosen defaults, not empirically learned; the score is a conversation starter, not a guarantee of outcome.

---

## Publish or Scratch — and Why

**Recommendation:** `Publish`

This clears the bar as a portfolio artifact because it addresses a specific planning failure mode (orphan bets and uncovered OKRs), produces structured outputs that are immediately usable in a roadmap sync, and avoids the “LLM magic button” anti-pattern by using an explainable rubric. The main quality risk is whether the default scoring weights feel credible across different teams; however, the tool remains valuable even if teams adjust weights because the forced mapping and coverage view are the core value.

---

## What a V2 Would Include

1. **CSV import/export for OKRs and initiatives:** Lets a PM start from the spreadsheet they already have and share the scored output back to stakeholders without manual re-entry.
2. **Saved scenarios with diff view:** Enables comparing “lean roadmap” vs “big roadmap” and seeing which option improves OKR coverage or reduces orphan work, which helps in exec reviews.
3. **Custom weight editor with presets:** Supports different quarter types (growth vs efficiency) and makes the rubric adjustable without editing code, improving adoption across teams.
4. **Contribution sizing per initiative (expected lift range):** Helps catch overcommitment by showing when the portfolio claims more lift than the OKR target requires, useful for PMs working closely with analytics.
