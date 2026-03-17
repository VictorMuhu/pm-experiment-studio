# Decision Log — Idea Validator

**Last updated:** 2026-03-17

---

## 1. What This Project Optimized For

- **Fast, defensible go/no-go clarity for senior decision-makers** — at the cost of not being a flexible “framework builder” where every team can customize dimensions and weights.
- **Iterative refinement while writing** (tight feedback loop between wording and verdict) — at the cost of deep, model-generated narrative analysis that would require API calls and introduce latency.
- **A decision artifact you can paste into a roadmap or leadership thread** (scores + flags + assumptions + next steps) — at the cost of long-form explanation and edge-case nuance.

---

## 2. What Was Intentionally Left Out

| Cut Item | Reason |
|----------|--------|
| Persistence (save/load idea evaluations, history, collaboration) | Adds a data model, storage choices, and trust questions (where does sensitive strategy data live?) that would distract from validating the rubric and interaction model. |
| Custom dimensions and weight sliders | Makes results incomparable across ideas and invites “gaming the score,” which defeats the goal of pressure-testing. |
| LLM-generated analysis and competitor discovery | Requires API keys and robust validation of structured outputs; also risks producing generic-sounding text that feels like a prompt wrapper instead of a decision tool. |
| Multi-idea portfolio prioritization | A different job (portfolio selection vs. single idea pressure test) and would require persistence plus normalization across vastly different bets. |

---

## 3. Major Product Trade-offs

**Deterministic rubric vs. generative intelligence**
Chose a rubric-driven, heuristic-based evaluator over an LLM-first analyzer. A rubric means repeatable scores and predictable outputs. An LLM-first approach would have produced richer prose and potentially better assumption coverage but would also introduce latency, key management, and “AI voice” sameness. Went with the rubric because the persona needs a tool they can trust in a high-stakes decision meeting and the repo requires it to run from a clean clone.

**Single-page workspace vs. multi-step wizard**
Chose a single-page “thinking workspace” with expanding sections over a step-by-step wizard. The workspace supports back-and-forth editing without feeling like a form submission. A wizard would enforce structure but would slow down senior users who already know where the weak points are. Went with the workspace because the desired interaction is live pressure-testing, not completion.

**Conservative verdict thresholds vs. feel-good scoring**
Chose conservative thresholds that make “Strong candidate” harder to reach, especially when differentiation and validation plan are weak. This means some good ideas will initially score “Needs refinement,” which can feel harsh. The alternative is optimistic scoring that reinforces intuition. Went conservative because the failure mode being addressed is premature commitment, not lack of confidence.

---

## 4. Design Choices Made

The project uses **`executive-monochrome`** because the intended vibe is a high-stakes internal strategy surface: minimal color, high typographic contrast, and an editorial rhythm that supports careful reading rather than dashboard scanning.

- **Persistent verdict side panel:** The verdict stays visible while editing so users feel the consequence of each clarification (“tighten target user” → verdict stabilizes). Alternative was placing the verdict at the bottom; rejected because the tool’s job is decision-making, and burying the decision reduces the “pressure-test” effect.
- **Weakness flags as the primary “moment” above assumptions:** Flags appear immediately after scores because they represent decision blockers. Alternative was leading with assumptions; rejected because assumption lists are easy to ignore, while flags create urgency and direct the next steps.
- **Expandable depth rather than showing everything at once:** The UI reveals assumptions and next steps after the user provides enough idea detail to avoid empty, generic output. Alternative was showing all sections by default; rejected because it makes the tool feel like a long checklist and increases cognitive load.

---

## 5. Technical Shortcuts and Constraints

- **No LLM-assisted extraction:** Assumptions and weakness flags are derived from deterministic heuristics and the user’s structured fields — USER COST: if the user writes only vague free text, the tool will miss nuanced assumptions they *could* have discovered with a richer, model-driven read.
- **No persistence layer:** The evaluation exists only in the current browser session — USER COST: the user cannot save an idea for later or share a link; they must copy/paste the output if they want to keep it.
- **Fixed rubric and thresholds:** Dimensions and scoring weights are hard-coded — USER COST: ideas that are genuinely strong but don’t map cleanly to the rubric (e.g., platform reliability work) may be underscored and feel “unfair” without a way to adapt the model.

---

## 6. Publish or Scratch — and Why

**Recommendation:** `Publish`

This clears the portfolio bar if the UI delivers on the “executive workspace” feel and the demo data is realistic: it solves a specific failure mode (premature commitment), produces a structured decision artifact, and avoids the banned “chat/prompt wrapper” interaction. The key risk is credibility: if the weakness flags read generic or the scoring feels arbitrary, it will look like a toy. The publish quality bar is: consistent rubric logic, sharp copy in flags/next-steps, and a screenshot showing a believable idea with non-trivial trade-offs.

---

## 7. What a V2 Would Include

1. **Save + compare multiple ideas:** Lets product leaders evaluate 3–10 candidate bets and see which ones fail on differentiation vs. complexity, improving planning conversations.
2. **Exportable decision memo (Markdown):** Generates a clean artifact for leadership review (scores, flags, assumptions, next steps) so the output travels beyond the tool.
3. **Calibration profiles and weighting presets:** Adds presets like “PLG”, “Enterprise”, and “Regulated” so the rubric matches the business context and reduces false negatives.
4. **Optional LLM-assisted assumption expansion (guardrailed):** Suggests additional assumptions and alternative sets from the idea text to catch blind spots, while keeping the core rubric deterministic for trust.
