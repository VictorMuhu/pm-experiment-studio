# GitHub PR Test — Static Premium SaaS Decision Simulator

## Goal
Create a very small static web project that looks like a premium SaaS “decision simulator” landing + mini tool, committed on a new branch and opened as a pull request to `main`.

## Problem
Teams frequently need a fast, low-friction way to validate:
- repo workflow (branch → commit → PR)
- static hosting readiness
- UI quality baseline (premium SaaS aesthetic)

## Why This Exists
This project is intentionally tiny to:
- prove the repository automation path (folder structure, required files)
- provide a clean, reviewable PR with minimal surface area
- serve as a reusable template for future decision-simulator experiments

## Target Persona
Product engineers and product designers who want a quick, polished static prototype to test decisions (pricing, rollout, feature tradeoffs) without setting up a full app.

## Use Cases (3)
1. **Feature rollout decision**: Compare “Slow rollout” vs “Fast rollout” and see a qualitative recommendation.
2. **Pricing package choice**: Enter target ARPA + churn sensitivity to decide between “Simple tiers” vs “Usage-based.”
3. **Roadmap tradeoff**: Evaluate “Ship now” vs “Polish more” using confidence and impact inputs.

## Wireframe (ASCII art)
+------------------------------------------------------------+
| github-pr-test                                  [Sign in]  |
|------------------------------------------------------------|
|  Decision Simulator                                         |
|  Make a quick call with a simple scoring model.             |
|                                                            |
|  Scenario: [ Feature Rollout v ]                            |
|                                                            |
|  Inputs                                                     |
|   - Confidence (0-100)     [----|-----]  70                 |
|   - Impact (0-100)         [---|------]  60                 |
|   - Urgency (0-100)        [-----|----]  80                 |
|                                                            |
|  [ Run Simulation ]                                         |
|                                                            |
|  Result                                                     |
|   Recommendation:  "Roll out fast"                          |
|   Rationale: High urgency outweighs moderate impact.        |
+------------------------------------------------------------+

## Tech Stack
- HTML5 (single page)
- CSS3 (premium SaaS styling via variables, gradients, cards)
- Vanilla JavaScript (tiny scoring + UI updates)

## Future Enhancements
- Add multiple decision models (weighted scoring, risk matrix, RICE-lite)
- Save/share scenarios via URL params
- Add accessibility audit + keyboard-first inputs
- Add dark mode toggle + theme tokens
- Add basic analytics events (no PII) for experiment learnings
