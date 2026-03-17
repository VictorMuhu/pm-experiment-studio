# Decision Log — Idea Validator

**Last updated:** 2026-03-17

---

## 1. What This Project Optimized For

- **Real-time clarity while writing the idea** — at the cost of deep, long-form narrative output. The primary experience is “type → see consequences,” not “submit → receive a report.”
- **Executives aligning on a shared rubric** — at the cost of personalization. The dimensions are intentionally fixed so multiple ideas can be compared without renegotiating criteria every time.
- **Auditable reasoning over ‘smart’ magic** — at the cost of nuance in edge cases. The tool prefers explainable rubric logic and explicit flags so users can disagree productively.

---

## 2. What Was Intentionally Left Out

| Cut Item | Reason |
|----------|--------|
| Saving idea history, accounts, or collaboration | The persona’s highest-value moment is pre-commit triage; adding persistence pulls the product toward a system-of-record with backend complexity and review risk for a V1 prototype. |
| LLM-generated assumptions and critiques | An LLM would make the output feel “impressive” but less trustworthy and harder to debug; V1 keeps the structure deterministic to make the rubric the star and avoid a chat-like experience. |
| Market sizing and financial modeling | Those require user-provided numbers (TAM, pricing, conversion assumptions) that slow the workflow and are frequently speculative at this stage; V1 stays qualitative but structured. |
| Multi-variant idea comparison and portfolio-level ranking | Useful, but it changes the tool from “pressure-test an idea” to “prioritize a portfolio,” adding UI density and requiring careful weighting design. |

---

## 3. Major Product Trade-offs

**Live workspace vs. step-by-step wizard**
Chose a single-page live-updating workspace over a multi-step wizard. The workspace means users can jump between problem framing and scoring as they realize what’s missing. A wizard would have enforced sequencing and could reduce cognitive load, but it would also hide the evolving verdict and make iteration feel slower. Went with the workspace because the target moment is a senior PM rewriting the pitch in real time.

**3-state verdict vs. numeric final score**
Chose “Not worth pursuing / Needs refinement / Strong candidate” with a confidence indicator over a final score out of 100. The 3-state verdict means the output maps to an actual planning decision and avoids fake precision. A numeric score would feel objective but invites gaming the rubric and debating weights instead of addressing the flagged weaknesses. Went with the 3-state verdict because the desired outcome is alignment, not a leaderboard.

**Fixed dimensions vs. customizable rubric**
Chose a fixed set of seven dimensions over letting users add/edit criteria. Fixed dimensions make comparisons consistent across ideas and keep the UI stable. Customization would allow better fit for niche contexts, but it would also turn every use into rubric design work and reduce comparability between stakeholders. Went fixed because the persona is time-constrained and needs a repeatable standard.

---

## 4. Design Choices Made

- **Style identity: `executive-monochrome`** — chosen to feel like an internal strategy workspace: dark background, sharp typography, minimal chrome, and high signal-to-noise. This matches the “senior decision tool” vibe and reduces the “toy app” feel.
- **Sticky verdict panel on the right** — the verdict is always visible so users can see how their edits change the decision, and so meetings can anchor on “what would need to change for this to become a strong candidate.” The alternative was showing the verdict only at the bottom; rejected because it delays the core feedback loop.
- **Weakness flags are phrased as falsifiable critiques, not advice** — e.g., “Differentiation unclear: you described features, not why a buyer would switch.” The alternative was generic tips (“clarify differentiation”); rejected because it doesn’t create productive debate.

---

## 5. Technical Shortcuts and Constraints

- **No persistence:** The app is stateless and does not save ideas — USER COST: if a user refreshes or closes the tab, their work is gone and they must re-enter the idea.
- **Heuristic scoring (no data integrations):** Scores come from a rubric and text heuristics rather than market data or usage telemetry — USER COST: strong ideas in domains with unusual dynamics may be underscored until the user manually encodes context in the structured fields.
- **No collaboration or sharing link:** There is no shareable URL state or export in V1 — USER COST: users must screenshot or manually copy content to bring the verdict into a planning doc or leadership thread.

---

## 6. Publish or Scratch — and Why

**Recommendation:** `Hold`

The concept is portfolio-grade and clearly differentiated from the repo’s existing dependency-risk tool, but it only clears the bar for publishing once the UI is implemented with the `executive-monochrome` style and the live-scoring/weakness flags are demonstrably credible with realistic default ideas. Without the running artifact and a screenshot showing the “weakness detection” moment, it risks reading like a spec rather than a product.

---

## 7. What a V2 Would Include

- **Exportable decision memo (Markdown/PDF):** Produces a clean artifact for roadmap review docs — helps product leads operationalize the output instead of retyping it.
- **Side-by-side idea comparison:** Lets leadership compare two candidates with the same rubric — helps when the decision is “A vs. B” rather than “yes/no.”
- **Assumption validation tracker:** Users can mark assumptions as validated and attach evidence links — helps teams run a lightweight discovery loop over 1–2 weeks.
- **Calibration presets by context:** Adjusts weighting and warnings for enterprise/regulatory/PLG — helps reduce false negatives when time-to-value or complexity norms differ by market.
