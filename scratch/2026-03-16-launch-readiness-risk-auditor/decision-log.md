# Decision Log — Master Prompt Spec Test

**Last updated:** 2026-03-16

---

## What This Project Optimized For

- Fast “are we ready?” clarity — at the cost of not being a comprehensive launch planning system
- Zero-setup usability (no accounts, no API keys) — at the cost of not saving audit history
- Action routing by functional owner — at the cost of nuanced org-specific workflows and team names

---

## What Was Intentionally Left Out

| Cut Item | Reason |
|----------|--------|
| Multi-variant launch plans (multiple features/programs in one run) | It turns the output into a planning suite; the core use case is a single launch decision and routed checklist. |
| Integrations (Jira/Linear/Asana ticket creation) | Requires auth and data mapping that adds heavy setup; exportable Markdown covers the 80% workflow with minimal friction. |
| “Builder” mode for authoring a full launch plan | Auditing readiness is the urgent moment; planning tools already exist and would dilute the project’s focus. |

---

## Major Product Trade-offs

**Deterministic rubric vs. LLM-generated checklist**
Chose a deterministic rules engine over an LLM call. The rubric means consistent, explainable outputs and no credentials. An LLM would have produced more tailored wording but would add API dependency, variability, and failure modes (rate limits, malformed structure). Went with the rubric because the portfolio goal is a reliably runnable artifact and the user’s primary need is gap detection and routing, not prose.

**Structured launch fields vs. freeform input**
Chose a few required structured fields plus a short feature brief over “paste anything.” The structured approach reduces ambiguity and makes the checklist meaningfully different by launch type and surface. Freeform input would reduce friction but tends to collapse into generic results, recreating the original problem.

**Go/No-Go signal vs. neutral checklist**
Chose to label a small set of items as blockers and compute a readiness score rather than outputting a neutral list. The score risks overconfidence if treated as truth, while a neutral list avoids that. Went with the score because the persona’s failure mode is indecision and last-minute discovery; a clear escalation signal is the point of the tool.

---

## Design Choices Made

- **Blockers are capped and explicit:** The UI shows a small “Blockers” section first (max ~5). This forces prioritization and prevents the tool from becoming a wall of tasks.
- **Checklist grouped by owner:** Items are duplicated into an owner-grouped view so the coordinator can copy/paste directly into team-specific threads without reformatting.
- **Markdown export as a first-class action:** Copy/download controls are placed adjacent to results, because the primary workflow is “generate → paste into doc/slack/ticket,” not “keep this open in a tab.”

---

## Technical Shortcuts or Constraints

- **No persistence:** The tool is stateless; refreshing clears inputs and results. This keeps it deployable as static files but limits longitudinal tracking.
- **Heuristic scoring:** The readiness score is rule-based (weights by surface/launch type) and not calibrated on historical outcomes; it should be treated as a prioritization aid, not a prediction model.
- **No localization/accessibility pass beyond basics:** The initial version targets a single language and assumes desktop usage; a full a11y audit and keyboard-first refinements were deferred.

---

## Publish Recommendation

**Recommendation:** `Publish`

The tool clears the bar if it runs as a static page, produces a structured and non-generic checklist that changes based on inputs, and exports clean Markdown. It’s intentionally narrow (one launch at a time) and the rubric-based approach avoids external dependencies, making it reproducible for reviewers.

---

## What a V2 Would Include

- **Saved runs + delta comparison:** Store audits (local-only or simple backend) and show “what changed since last audit,” deferred due to persistence/auth complexity.
- **Org-specific owner mapping:** Allow renaming owners (e.g., “DevRel” instead of “Marketing”) and adding custom teams, deferred because it complicates the routing model and UI.
- **Evidence attachments per item:** Let users attach links (doc, deck, training) as proof for each checklist item, deferred because it shifts from audit to project management.
