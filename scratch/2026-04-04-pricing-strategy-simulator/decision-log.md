# Decision Log — Pricing Strategy Simulator

**Last updated:** 2026-04-04

---

## 1. What This Project Optimized For

A Growth PM walking into a 45-minute pricing review who needs to compare two concrete pricing strategies, tweak a few tier/feature levers live, and leave with a clear “adoption vs revenue” call they can defend on one slide — this tool optimizes for that moment, not for long-term pricing analytics, forecasting accuracy, or CRM-grade segmentation.

---

## 2. What Was Intentionally Left Out

| Cut Item | Reason |
|----------|--------|
| Saving scenario history (accounts, projects, versioning) | Adds persistence + auth decisions and turns a “bring it into the meeting” prototype into a product surface area; would slow time-to-first-simulation which is the core value. |
| True price elasticity estimation from data | Requires real datasets and statistical fitting; for the prototype, the goal is to make assumptions explicit and comparable, not to claim empirical accuracy. |
| Multi-variant comparison (A/B/C/D) | The decision moment is typically “ship the current proposal vs the alternative”; supporting many variants would require scenario management UI and would dilute the core A vs B clarity. |
| Upgrade/downgrade cannibalization between tiers | Modeling movement across tiers needs lifecycle state and retention; V1 focuses on first-order acquisition conversion + segment mix because that’s the demo moment. |
| Taxes, discounts, annual prepay, coupons | Real-world pricing ops details are important but would clutter the surface and distract from structure/segment tradeoffs; best added after validating the simulator’s usefulness. |

---

## 3. Major Product Trade-offs

**Explainable knobs vs “smart” black box**
Chose explicit segment weights and price sensitivity controls over an opaque “AI-generated” recommendation. Explicit knobs mean users can disagree with assumptions and still trust the mechanics. A black box would feel impressive but would be hard to defend in a real review because no one can explain why the recommendation changed.

**A/B comparison vs scenario library**
Chose a tight Strategy A vs Strategy B comparison over a library of saved scenarios. A/B means the UI can dedicate space to deltas and “winner” flags (revenue vs adoption) without turning into a dashboard. A scenario library would be more powerful but would require persistence, navigation, and naming/versioning conventions.

**First-order funnel simulation vs lifecycle model**
Chose to model visits → paid (and segment split) over full LTV and churn dynamics. Funnel-only simulation is fast and interactive, which supports meeting usage. A lifecycle model would be more realistic, but it would require many more assumptions and would reduce confidence because outputs would appear precise without being grounded.

---

## 4. Design Choices Made

- **Style used: `playful-consumer`:** This style was selected by rotation; to keep it credible for an “executive tool,” the design uses playful-consumer color/typography in a restrained way (high-signal layout, calm spacing, minimal ornament) so it still feels like a serious internal artifact rather than a marketing page.
- **Decision Panel is a fixed, scannable block:** The tool surfaces 3–5 short verdicts (e.g., “Too expensive for core segment”) that update immediately. This was chosen over a long explanation so a PM can read it aloud in a meeting and use it as the discussion anchor.
- **Outputs prioritize deltas over absolutes in compare mode:** When comparison is on, the UI emphasizes changes (Δ revenue, Δ conversion, segment mix shift) instead of repeating full KPI cards twice. Alternative was duplicating two full dashboards; rejected because it makes it harder to see what actually changed.

---

## 5. Technical Shortcuts and Constraints

- **Deterministic simulation model:** Uses a simplified formula to translate price/feature gating into segment conversion changes — USER COST: results can feel “too clean,” and a user may over-trust the numeric output if they don’t sanity-check assumptions.
- **No persistence:** Strategies reset on refresh/close — USER COST: users must re-enter changes if they want to revisit a prior discussion or share the exact setup asynchronously.
- **No sensitivity analysis tooling:** V1 does not sweep ranges automatically — USER COST: users have to manually drag sliders to understand breakpoints, which makes “how robust is this?” harder to answer.

---

## 6. Publish or Scratch — and Why

**Recommendation:** `Publish`

This clears the bar if the shipped prototype delivers the core demo moment: adjusting a tier (price or gate) immediately changes conversion, revenue, and segment distribution, and compare mode makes the tradeoff legible. The concept is distinct from existing repo projects (pricing decision simulation rather than PRD analysis, dependency risk, or A/B test interpretation), and the artifact is a structured internal tool (builder + live outputs + decision panel) rather than a text generator.

---

## 7. What a V2 Would Include

- **Saved strategies with shareable links:** Lets a PM send “Strategy A/B” to finance or sales for async review; reduces rework and makes the simulator usable across multiple meetings.
- **Break-even and threshold callouts:** Automatically identifies “price where revenue peaks” and “price where adoption falls below target” for each segment; helps a growth lead quickly see safe operating ranges.
- **Lifecycle add-on module (optional):** Adds churn/retention and a simple LTV view for teams that need more than top-of-funnel; helps founders judge whether monetization changes are worth slower acquisition.
- **Tier migration modeling:** Estimates upgrades/downgrades when tier boundaries shift; helps PMs avoid accidental cannibalization when introducing a mid-tier.
