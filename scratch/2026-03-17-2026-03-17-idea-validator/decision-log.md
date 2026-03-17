# Decision Log — Idea Validator

**Last updated:** 2026-03-17

---

## 1. What This Project Optimized For

- **Fast, defensible “go / refine / drop” clarity while the idea is still editable** — at the cost of not being a research repository or long-form memo writer.
- **A repeatable rubric that lets senior stakeholders debate the same variables** — at the cost of being opinionated; ideas that don’t fit the rubric can feel underscored.
- **Time-to-first-insight without setup (no accounts, no keys, no backend)** — at the cost of collaboration features and cross-session history.

---

## 2. What Was Intentionally Left Out

| Cut Item | Reason |
|----------|--------|
| Team workspaces, login, and sharing | Collaboration requires persistence, permissions, and a review workflow; that would dominate v1 scope and distract from the core pressure-test loop. |
| Auto-generated longform PRDs / strategy docs | Produces impressive text but low decision quality; the goal is structured scrutiny and action steps, not narrative output. |
| Market data ingestion (competitor scraping, pricing pages, app store pull) | Adds brittle integrations and creates a false sense of certainty; v1 is about surfacing assumptions that must be validated, not pretending the data is complete. |
| Custom rubric builder | Allowing weight tuning upfront leads to “rigging the score” politics; v1 needs a consistent baseline before making it configurable. |

---

## 3. Major Product Trade-offs

**Deterministic rubric vs. LLM-generated analysis**
Chose a deterministic rubric (editable dimension scores + heuristic flags) over LLM-written critiques. The rubric means consistent behavior and a tool that runs without keys; the LLM approach would have produced richer prose but would also vary run-to-run and risked feeling like “a prompt in a UI.” Went with deterministic scoring because the target moment is a leadership decision where consistency and explainability matter more than creative language.

**Live updates vs. explicit “Evaluate” action**
Chose live updates as inputs change over a single “Run evaluation” button. Live updates create an iterative loop where the user learns how to strengthen the idea; a button-driven flow would encourage one-shot completion and reduce the feeling of a thinking workspace. Went with live updates because the demo moment (scores + verdict shifting) is the product.

**Hybrid input vs. fully structured form**
Chose free text + optional structured fields over a fully structured idea template. Fully structured input would improve scoring reliability but increases friction and makes the tool feel like paperwork. Went with hybrid input because early-stage ideas start messy, and the tool’s job is to tighten them, not block them.

---

## 4. Design Choices Made

The UI uses **`tactile-dashboard`** to feel like a premium internal strategy workspace: dark, quiet contrast; crisp typography; and panels that read like an analyst’s instrument rather than a marketing site. This matches the persona’s expectation for “serious tools” used to make expensive decisions.

- **Pinned verdict panel with reason codes:** The verdict stays visible and includes the few dimension-level drivers (e.g., “Differentiation low + Alternatives strong”). This was chosen over a single label because leaders need the “because” in one glance to socialize the call.
- **Weakness detection as short flags, not paragraphs:** Weaknesses are surfaced as concise, scannable warnings with a one-line rationale. This was chosen over long commentary because the user needs to know where to interrogate the idea next, not read a critique.
- **Expandable depth:** Assumptions and next steps expand as the user fills details, keeping the first screen calm. This was chosen over showing everything at once because density early creates abandonment; depth should be earned by input.

---

## 5. Technical Shortcuts and Constraints

- **No persistence:** All state is in-memory only — USER COST: if the user refreshes the page or closes the tab, their entire evaluation and edits are lost.
- **Heuristic assumption generation (no external data):** Assumptions are generated from deterministic templates + keyword cues — USER COST: nuanced or domain-specific assumptions may be missing, so the user must manually add what the tool doesn’t infer.
- **Fixed scoring rubric and thresholds:** Weights and verdict thresholds are baked in — USER COST: teams with a different strategy (e.g., “we accept high complexity for moats”) will see verdicts that feel overly conservative unless they reinterpret the score.
- **No evidence attachment:** The tool outputs next steps but doesn’t store interview notes or metric links — USER COST: the user must copy outputs elsewhere to track validation progress, increasing the chance the plan isn’t executed.

---

## 6. Publish or Scratch — and Why

**Recommendation:** `Publish`

This clears the bar as a portfolio-grade decision-support prototype because it delivers a real workflow (pressure-test → weaknesses → assumptions → next steps) with a structured output and a credible “strategy tool” feel. It is also intentionally non-chat and non-gimmicky: the value is in the rubric, the information hierarchy, and the live iteration loop. The main quality risk is whether the weakness flags and assumptions feel specific enough across multiple example ideas; if they read generic in practice, it should be held until the heuristics and presets are tightened.

---

## 7. What a V2 Would Include

1. **Exportable one-page brief (Markdown/PDF):** Helps a product lead paste the verdict, risks, and validation plan into a leadership doc in 60 seconds.
2. **Evidence per assumption (notes + links + status):** Helps PMs turn the assumptions list into an execution-ready validation tracker instead of a one-time analysis.
3. **Compare mode (up to 3 ideas):** Helps leadership choose between competing bets using the same rubric, reducing debate driven by narrative strength.
4. **Rubric profiles (company-stage presets):** Helps teams calibrate scoring for “seed-stage speed” vs. “enterprise reliability” without custom weight micromanagement.
