# Decision Log — Idea Validator

**Last updated:** 2026-03-17

---

## What This Project Optimized For

- **Live “thinking feedback” while rewriting an idea** — at the cost of using a simpler, heuristic-based evaluator instead of deeper analysis that would require a backend or human facilitation.
- **Executive-ready clarity (objections, risks, and next steps) over motivational coaching** — at the cost of a harsher tone that may feel less friendly to junior users.
- **Explainable outputs (why a flag triggered) over black-box intelligence** — at the cost of not using an LLM to generate more nuanced assumptions or industry-specific insights.

---

## What Was Intentionally Left Out

| Cut Item | Reason |
|----------|--------|
| Team-level weighting and configurable rubrics | Configuration makes every output debatable (“your weights are wrong”) and adds UI complexity that dilutes the default, opinionated pressure-test experience. |
| Market sizing (TAM/SAM/SOM) and financial modeling | Those require domain data and assumptions that are usually the *next* step; including them would turn a 10-minute pressure test into a strategy doc workflow. |
| Collaboration features (comments, sharing, review workflows) | Multi-user workflows require auth, storage, and permissions; that scope would dominate the build without improving the single-user decision moment this prototype targets. |

---

## Major Product Trade-offs

**Deterministic rubric vs AI-generated critique**
Chose deterministic scoring + rule-based flags over LLM-generated evaluation. Deterministic rules mean the user can learn and trust the system (“it flagged this because I didn’t name an outcome or differentiation”), while LLM critique would be more nuanced but harder to validate and more likely to feel generic. Went with deterministic rules because the core use case is a repeatable internal habit, not a one-off brainstorm.

**Always-visible verdict vs “results after completion”**
Chose a persistent right-rail verdict panel over a bottom-of-page results section. The persistent panel means every edit is connected to a decision outcome, but it risks anchoring users too early. Went with the right rail because the persona is making a time-boxed prioritization call and benefits from fast convergence, not open-ended exploration.

**Seven dimensions vs a comprehensive framework**
Chose seven high-signal dimensions over a larger list (e.g., feasibility, viability, desirability sub-dimensions; compliance; pricing; channels). Seven keeps cognitive load manageable and lets the tool be used mid-meeting, but it will miss domain-specific considerations. Went with seven because the job is to catch the most common early-stage failure modes, not to replace full discovery.

---

## Design Choices Made

The tool uses **`editorial-elegance`** to feel like a premium internal strategy workspace: dark, typographically intentional, and calm under scrutiny—closer to a founder’s memo than a dashboard. That tone supports the persona’s context (high-stakes decisions, low patience for gimmicks) and makes the weakness flags read as serious, not gamified.

- **Objection-style weakness flags:** Flags are phrased like stakeholder pushback (“crowded market”, “unclear differentiation”, “hidden complexity”) so the user can immediately stress-test the pitch. This was chosen over “tips” language because the user is preparing for real evaluation, not learning product basics.
- **Expandable assumption sections with counts:** Assumptions are collapsed by default with counts (e.g., “User assumptions (5)”) to keep the page scannable while still signaling depth. This was chosen over showing everything at once because the primary value is in the *weakest* areas, not in reading a wall of text.

---

## Technical Shortcuts or Constraints

- **localStorage instead of a backend**: Drafts and recent ideas persist per browser only; switching devices or clearing storage loses history.
- **Heuristic scoring based on text signals**: The evaluator uses structured inputs and keyword/coverage rules (e.g., named alternatives, measurable outcomes, integration hints). This is explainable but can mis-score edge cases or highly technical products.
- **No model calibration dataset**: There’s no labeled “good/bad ideas” training set, so the scoring scale is directional rather than statistically validated; it’s designed to drive discussion, not claim predictive accuracy.

---

## Publish or Scratch — and Why

**Recommendation:** `Publish`

This clears the bar as a portfolio-grade decision-support tool because it demonstrates a specific failure mode, an opinionated interaction model (real-time pressure testing), and outputs that are structured and explainable rather than “AI text.” The design direction is intentional (editorial, minimal, serious), and the workflow is credible for a Head of Product moment: it produces a verdict, the objections behind it, and the smallest validation steps to de-risk the bet.

---

## What a V2 Would Include

- **Idea comparison view (two-up + delta narrative):** Helps product leaders choose between competing bets by showing where one idea wins and what assumptions differ.
- **Evidence links per dimension and flag:** Lets users attach interview notes, metrics, or competitor screenshots to justify scores, making the output reviewable and less opinion-driven.
- **Exportable one-page “Idea Brief”:** Produces a shareable artifact (verdict, scores, risks, assumptions, next steps) that can be dropped into a roadmap review doc without rewriting.
- **Team rubric presets (SMB vs enterprise, PLG vs sales-led):** Lets orgs apply consistent evaluation standards across squads while keeping the default rubric as the baseline.
