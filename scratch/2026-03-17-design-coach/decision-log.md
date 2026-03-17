# Decision Log — Design Coach

**Last updated:** 2026-03-17

---

## What This Project Optimized For

- **“Review readiness” in one sitting** — at the cost of deep modeling. The tool is designed so a PM can walk into a design review with a flow map and a concrete gaps list, even if the flow model is simplified.
- **Trustworthy, auditable outputs** — at the cost of generative novelty. Edge cases and the clarity score are based on visible rules and checkable criteria so a team can agree (or disagree) with it in the moment.
- **Time-to-first-insight from templates** — at the cost of full blank-slate flexibility. Preloaded flows demonstrate what “good coverage” looks like and let users see gap surfacing immediately.

---

## What Was Intentionally Left Out

| Cut Item | Reason |
|----------|--------|
| Real-time collaboration / multi-user cursors | Collaboration changes the product into a team whiteboard; the V1 goal is a personal pre-review tool that runs locally with no backend. |
| LLM-generated edge cases and writeups | LLM output tends to be generic and hard to defend; this tool’s core value is pinpointing specific missing states tied to the exact nodes drawn. |
| Export to Figma/Miro/PNG | Export adds format-specific complexity and a second “sharing” workflow; V1 validates whether the gap surfacing loop is valuable before investing in distribution. |
| Unlimited custom schema for nodes (fields, validation rules, APIs) | A full spec editor becomes a PRD tool; V1 focuses on flow completeness (states + transitions + recovery), not detailed implementation requirements. |

---

## Major Product Trade-offs

**Deterministic rules engine vs. AI generation**
Chose a deterministic, template-backed rules engine over an LLM. The rules engine means suggestions are consistent and explainable, but it can’t invent domain-specific edge cases. An LLM would have produced richer text, but would require API keys and would often generate plausible-sounding noise that weakens credibility in a design review.

**Per-node scenario coverage vs. a single global checklist**
Chose per-node coverage indicators (empty/failure/permission/partial/retry) over a single checklist for the whole flow. Per-node coverage makes gaps actionable (“missing retry on Payment step”), but adds UI density. A global checklist is simpler, but it fails in the exact moment users need help: identifying where the flow breaks.

**Simple canvas layout vs. full diagramming features**
Chose a constrained, linear-first flow layout with lightweight branching over freeform dragging, alignment tools, and connector routing. The constrained layout keeps the tool implementable and readable, but it limits diagram expressiveness. Full diagramming would be more flexible, but it would turn V1 into a generic diagram tool rather than a completeness coach.

---

## Design Choices Made

- **Style identity: `mobile-ambient`** — chosen to create a calm, systems-like workspace where density feels intentional rather than heavy. For design review prep, the UI should feel like a product surface (structured, legible, quiet), not a playful canvas.
- **Split-pane “canvas + inspector” layout** — the right inspector is always visible so selecting a node immediately exposes coverage toggles and suggested edge cases. Alternative was modal-based editing; rejected because it hides context and makes gap-fixing feel like a separate mode.
- **Gaps are shown as counts plus specific callouts** — the bottom “Gaps detected” bar provides a quick status summary, while node-level badges highlight exactly where issues exist. Alternative was a long report; rejected because the primary workflow is iterative fixing while viewing the map.

---

## Technical Shortcuts and Constraints

- **No persistence:** All flow work stays in memory only — USER COST: if the user refreshes the page or closes the tab, the flow is lost and must be recreated.
- **Rule coverage is limited to known step types:** Suggestions rely on recognizing step patterns (auth/form/payment/invite) — USER COST: for unusual domain flows (e.g., compliance/KYC), the tool will under-suggest edge cases and the clarity score will look artificially low or unhelpful.
- **Simplified transition model:** Transitions are represented as named links without full condition logic — USER COST: complex branching requirements (multi-condition routing, time-based states) can’t be represented, so teams may still miss gaps that depend on nuanced conditions.

---

## Publish or Scratch — and Why

**Recommendation:** `Hold`

The concept is publish-worthy because it solves a real pre-review failure mode with a structurally different interaction pattern (canvas + inspector + rubric scoring) and avoids the “prompt wrapper” trap. It should only be published once the demo experience is implemented end-to-end: templates loaded, node selection updates the inspector, gap surfacing is visible, and at least one screenshot captures a realistic flow with highlighted missing states. Without those, it risks reading like an idea rather than a working tool.

---

## What a V2 Would Include

- **Export a “Design Review Packet” (Markdown):** Produces a shareable artifact (flow summary, decisions, uncovered gaps) for PMs and designers who need async review before a meeting.
- **Local save/load with versions:** Lets users iterate across days and compare clarity score deltas; helps teams treat completeness as an evolving checklist rather than a one-time exercise.
- **Branch-first visualization mode:** Adds clearer rendering for failure/retry branches so teams can spot missing recovery paths at a glance in review.
- **Team rule packs:** Allows org-specific step types and edge-case rules (e.g., “enterprise SSO”, “SCIM provisioning”) so suggestions match the product’s real risk surface.
