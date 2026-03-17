# Decision Log — Idea Validator

**Last updated:** 2026-03-17

---

## What This Project Optimized For

- **Iterative clarity while rewriting an idea** — at the cost of deep analytics; the experience is tuned for rapid “edit → see what broke” loops rather than long-term tracking.
- **Decision defensibility in a leadership meeting** — at the cost of personalization; outputs are deterministic and rubric-driven so the user can explain “why the tool said this.”
- **Low-friction, single-session use** — at the cost of collaboration and history; the tool is designed to be useful without accounts, setup, or saved projects.

---

## What Was Intentionally Left Out

| Cut Item | Reason |
|----------|--------|
| Saving idea history, accounts, and team workspaces | The target moment is pre-commit triage; adding persistence introduces auth, data modeling, and privacy decisions that would dominate V1 without improving the core “pressure-test one idea now” workflow. |
| LLM-based generation of assumptions and critique | Deterministic outputs are easier to trust and debate in a strategy setting; LLM variability would create “why did it say that?” friction and require prompt/version management to be credible. |
| Multi-idea portfolio ranking and roadmap sorting | Ranking requires shared baselines, weighting, and governance; V1 focuses on depth (one idea) so teams can agree on what needs validation before any ranking discussion. |
| Industry-specific rubrics (e.g., fintech, healthcare) | A configurable rubric UI would reduce the tool’s immediacy; V1 uses a general B2B SaaS rubric and validates usefulness before adding specialization. |

---

## Major Product Trade-offs

**Live updates vs. explicit “Generate” step**
Chose live scoring and flags over a single generate button. Live updates mean the user can treat the tool as a thinking workspace and see cause/effect immediately. A generate step would have been simpler and more predictable, but it would push the workflow toward “one-shot output,” which is exactly how teams keep their initial vague framing unchallenged.

**Deterministic rubric vs. AI critique**
Chose rule-driven scoring/flags over LLM-driven analysis. Deterministic logic means the user can understand what input changed the verdict and can reproduce results across sessions. AI critique would produce richer language, but it would also create inconsistency and make it harder to use the output as a decision artifact.

**Dimension scores with rationales vs. a single composite score**
Chose multiple dimension scores and a transparent roll-up over one overall score. The multi-score approach makes trade-offs explicit (e.g., high impact but slow time-to-value) and encourages targeted refinement. A single score would be easier to compare across ideas, but it would hide the actual disagreement and invite gaming.

**Side-panel verdict vs. bottom-of-page summary**
Chose a persistent verdict panel over a summary at the end. The side panel keeps the “so what” visible during the entire evaluation, which mirrors how senior PMs run meetings. A bottom summary would be cleaner, but it would encourage users to skim inputs and jump straight to a conclusion.

---

## Design Choices Made

- **Style system: `executive-monochrome`** — a dark, editorial, low-chrome workspace so the tool feels like strategy software (not a consumer app or a KPI dashboard). The monochrome constraint supports seriousness and keeps attention on language quality, flags, and decisions.
- **Weakness Detection as compact “flags” with a next-question** — each flag is paired with “what to clarify next” so the user leaves with an action, not just criticism. The alternative was a critique paragraph; rejected because it’s harder to scan and harder to turn into a meeting agenda.
- **Assumptions grouped by owner domain (user/technical/business)** — grouping makes routing obvious: user assumptions become interview prompts, technical assumptions become spikes, business assumptions become pricing/GTM checks. The alternative was ordering by severity only; rejected because severity without ownership still delays action.

---

## Technical Shortcuts and Constraints

- **No persistence layer:** All work lives in-memory only — USER COST: if the user refreshes the page or switches devices, the idea, scores, and notes are lost and must be re-entered.
- **Rubric-based scoring instead of evidence-based modeling:** Scores are derived from user inputs and rules, not from real market data — USER COST: ideas in niche markets (or with unconventional moats) can be underscored unless the user manually encodes that nuance in the structured fields.
- **No collaboration or multi-rater aggregation:** Only one person’s scoring is represented at a time — USER COST: teams can’t capture disagreement quantitatively (variance), so consensus-building still requires a separate conversation/document.

---

## Publish or Scratch — and Why

**Recommendation:** `Publish`

This clears the bar as a portfolio-grade decision-support prototype because it produces a structured, defensible artifact (dimension scores, explicit assumptions, weakness flags, verdict, and next steps) with a distinct interaction model (live-updating workspace + persistent verdict panel). The biggest known limitation is lack of persistence, but it’s an intentional trade-off aligned to the “triage right now” moment. The deterministic rubric keeps outputs credible and reviewable, which is important for an internal strategy feel.

---

## What a V2 Would Include

- **Multi-rater review mode:** Collect scores from 3–7 stakeholders and show variance by dimension — helps Heads of Product identify where disagreement is real vs. rhetorical.
- **Assumption-to-evidence linking:** Attach notes, metrics snapshots, and interview quotes to each assumption — helps PMs turn the output into a living decision record rather than a one-time assessment.
- **Idea comparison set:** Compare multiple ideas with consistent weighting and highlight which risks are unique vs. systemic — helps planning teams make trade-offs during quarterly prioritization.
- **Configurable rubric templates:** Allow different organizations to adjust dimensions and weightings (e.g., platform bets vs. feature bets) — helps the tool fit different strategy contexts without rewriting the UI.
