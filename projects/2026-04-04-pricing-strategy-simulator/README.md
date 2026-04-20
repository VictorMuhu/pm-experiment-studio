# Pricing Strategy Simulator

Teams pick pricing in a meeting, not in a model—then find out weeks later that conversion collapsed, revenue didn’t grow, or the “wrong” segment signed up.

> A strategy simulator for testing pricing tier structures against segment behavior and funnel tradeoffs—so you can compare strategies and leave a pricing review with a defensible decision.

**Status:** `draft`
**Complexity:** `simple`
**Bucket:** `internal-tooling`

---

## Goal

Enable a PM or growth lead to define two plausible pricing strategies, simulate segment-level conversion changes, and compare the revenue vs adoption tradeoffs in under 10 minutes—without building a spreadsheet model from scratch.

---

## Problem

In a pricing review, a PM at a Series A–C SaaS company often has to react to opinions (“Enterprise will pay more,” “We should add a mid-tier,” “Competitor X charges $49”) without a shared model of how price changes affect conversion by segment. The consequence is a pricing decision that “sounds right” in the room but later shows up as a drop in self-serve adoption, a surge in low-LTV customers, or stalled revenue growth that can’t be explained.

---

## Why This Exists

A spreadsheet can calculate revenue for a single plan, but it doesn’t make tradeoffs obvious while people are debating structure (tier boundaries, feature gates, usage limits) and segment reactions. This tool is built as an interactive decision system: it keeps the pricing model, segment assumptions, and funnel math connected so that changing one lever immediately updates conversion mix, ARPU, and total revenue—and makes strategy A vs B comparison legible enough to support an actual decision.

---

## Target Persona

A Growth PM (or founder) at a 20–300 person B2B SaaS company preparing for a pricing review, operating without a dedicated pricing analyst and needing a fast, explainable model that shows adoption vs monetization tradeoffs by segment.

---

## Use Cases

- A Growth PM proposes moving the Pro tier from $29 → $39 and needs to show leadership what conversion drop would be required to make the change a bad idea.
- A founder debates adding a mid-tier and uses the simulator to see whether it captures value-seeking users or just cannibalizes Pro.
- A PM considering feature gating (e.g., “SSO only on Business”) checks whether it improves revenue while pushing price-sensitive users to churn.
- A team compares a “simple 2-tier” strategy vs a “3-tier with usage limits” strategy before updating the pricing page.

---

## Barebones Wireframe

```
┌───────────────────────────────────────────────────────────────────────────┐
│ Pricing Strategy Simulator                                  [Compare: OFF] │
├───────────────────────────────┬───────────────────────────────────────────┤
│ LEFT: Strategy Builder        │ RIGHT: Live Simulation Output             │
│                               │                                           │
│ [Scenario dropdown]           │ KPIs                                      │
│  - SaaS (default)             │  - Total revenue / mo                     │
│  - Marketplace                │  - Conversions / mo                        │
│  - Subscription               │  - ARPU                                    │
│                               │  - Segment mix                             │
│ Strategy A                    │                                           │
│  Tiers table                  │ Charts                                    │
│   - Tier name                 │  [Stacked bar: conversions by segment]     │
│   - Price (slider)            │  [Line or bars: revenue by tier]           │
│   - Feature toggles           │  [Funnel summary: visits → trials → paid]  │
│   - Usage limits              │                                           │
│                               │ Decision Panel                             │
│ Segment assumptions           │  - Flags (e.g., "Too expensive for core")  │
│  - Price-sensitive (weight)   │  - Notes (what changed, why it matters)    │
│  - Value-seeking (weight)     │                                           │
│  - Enterprise (weight)        │                                           │
│                               │                                           │
├───────────────────────────────┴───────────────────────────────────────────┤
│ Compare Mode (when ON): Strategy A vs Strategy B                           │
│  - KPI deltas + "wins" badges (Revenue winner / Adoption winner)           │
└───────────────────────────────────────────────────────────────────────────┘
```

---

## Product Decisions

- **Segment response is explicit and editable:** The simulator exposes per-segment price sensitivity (and segment weights) instead of hiding them in “magic” formulas. Alternative was a black-box score; chose explicit knobs so a team can debate assumptions rather than argue about outputs.
- **Comparison is A vs B (not unlimited scenarios):** The tool focuses on a direct decision moment: “which of these two strategies should we ship?” Alternative was saving many scenarios; chose A/B because it keeps the workflow tight and avoids building persistence/versioning.
- **Decision Panel outputs short, typed verdicts:** The tool surfaces a few concrete flags (e.g., “Undermonetizing high-value users”) instead of long narratives. Alternative was a text-heavy explanation; chose flags because pricing reviews need clear callouts and fast scanning.
- **Preloaded realistic scenarios (SaaS / marketplace / subscription):** The tool ships with three starting points so it’s usable immediately. Alternative was a blank builder; chose preloads because pricing structure is hard to start from zero and demo realism matters.

---

## Tech Stack

- **Runtime:** Browser (ES modules) — runs as a static tool with no backend
- **Framework:** none — vanilla HTML/CSS/JS to keep it portable and fast to open
- **AI/API:** none
- **Styling:** Custom CSS following the `playful-consumer` style spec
- **Data:** none — stateless (in-memory only)
- **Deployment:** Any static host (GitHub Pages / Netlify Drop)

---

## How to Run

**Prerequisites:** None.

```bash
# Clone
git clone [repo-url]
cd projects/2026-04-04-pricing-strategy-simulator

# Install
# No install required.

# Run
# Option 1: open directly
# (double-click src/index.html)

# Option 2: serve locally (recommended)
python3 -m http.server 5173
```

**Open:**
- If using the server: http://localhost:5173/src/
- If opening directly: open `src/index.html` in your browser

---

## Screenshots

![Screenshot](./screenshots/screenshot.png)

*Comparison mode showing Strategy A vs Strategy B for a B2B SaaS example with segment mix, revenue, and adoption tradeoffs updated after a Pro price change.*

---

## Future Enhancements

- **Scenario saving + share links:** Save Strategy A/B and share a URL for async review. Deferred because it requires persistence (localStorage export/import or backend) and complicates the “open and use instantly” constraint.
- **Confidence ranges:** Show revenue/conversion as ranges when assumptions are uncertain. Deferred because it requires probabilistic modeling and a more complex UI for explaining variance.
- **Cannibalization modeling:** Explicitly model upgrades/downgrades between tiers. Deferred because it needs customer lifecycle state, not just top-of-funnel conversion.
- **Seat-based + usage-based hybrids:** Support pricing with seats *and* usage tiers. Deferred because it expands the model and would distract from the core demo moment.

---

## Decision Log

See [decision-log.md](./decision-log.md) for a full record of design and scoping decisions.
