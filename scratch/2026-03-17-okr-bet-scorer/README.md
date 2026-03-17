# OKR Bet Scorer

> A scoring worksheet that checks each roadmap initiative against this quarter’s OKRs and flags misalignment and “orphan” bets before the planning sync.

**Status:** `draft`
**Complexity:** `simple`
**Bucket:** `customer-experience`

---

## Goal

A PM should be able to take 6–15 candidate roadmap initiatives and, in under 10 minutes, produce a ranked list showing (1) which bets clearly support the quarter’s OKRs, (2) which are weakly justified, and (3) which OKRs have no meaningful coverage.

---

## Problem

In quarterly planning, a PM often walks into the roadmap sync with a list of “good ideas” and a separate OKR doc, but no explicit mapping between them. Under time pressure, teams rationalize alignment in the room (“it helps retention somehow”), which leads to orphan initiatives getting funded and at least one OKR quietly going uncovered until mid-quarter.

---

## Why This Exists

A spreadsheet can map initiatives to OKRs, but it doesn’t force the two checks that usually get skipped: (1) whether the initiative has a measurable contribution path to an OKR metric, and (2) whether the OKR coverage is balanced (not five initiatives on one OKR and zero on another). This tool makes those checks explicit, scores them consistently, and produces two artifacts planners actually use: a prioritized bet list and an OKR coverage view.

---

## Target Persona

A PM at a 30–200 person SaaS company preparing a quarterly roadmap proposal, with OKRs already set but limited time for analytics deep-dives before a leadership planning meeting.

---

## Use Cases

- A PM imports last quarter’s OKRs and a draft initiative list the night before the roadmap review to catch orphaned bets early.
- A product lead uses it to compare two competing roadmap versions by seeing which one improves OKR coverage without adding vague “strategic” work.
- A PM and designer run it during initiative shaping to tighten the measurable link to the OKR metric before writing a PRD.
- A PM flags one initiative as “keep anyway” but documents the rationale (e.g., reliability debt) so the trade-off is explicit in the sync.

---

## Barebones Wireframe

```
┌──────────────────────────────────────────────────────────────────┐
│ OKR BET SCORER                                                    │
│ Dense analyst console: left = inputs, right = outputs              │
├───────────────────────────────┬──────────────────────────────────┤
│ OKRs (this quarter)           │ Results                           │
│ [ + Add OKR ]                 │ ┌──────────────────────────────┐ │
│  O1: Improve onboarding ...   │ │ Initiative Ranking            │ │
│     Metric: Activation D7 %   │ │ 1) “Self-serve SSO setup”     │ │
│  O2: Reduce support load ...  │ │    Score 82 (Strong)          │ │
│     Metric: Tickets / acct    │ │    Covers: O2, O3             │ │
│                               │ │    Flags: none                │ │
│ Initiatives / Bets            │ │ 2) “New billing emails”       │ │
│ [ + Add initiative ]          │ │    Score 46 (Weak)            │ │
│  B1: Self-serve SSO setup     │ │    Flags: metric mismatch     │ │
│      Effort (pts): 5          │ └──────────────────────────────┘ │
│      Confidence: Med          │                                  │
│      Primary OKR: O2          │ ┌──────────────────────────────┐ │
│      Secondary OKRs: O3       │ │ OKR Coverage                 │ │
│      Contribution: High/Med   │ │ O1: 1 bet (weak)             │ │
│      Metric link: Direct/Ind  │ │ O2: 3 bets (2 strong)        │ │
│      Evidence note: ...       │ │ O3: 0 bets  ⚠ uncovered      │ │
│                               │ └──────────────────────────────┘ │
│ [ Score bets ] [ Load sample ]│ ┌──────────────────────────────┐ │
│                               │ │ Orphan / Risk Flags          │ │
│                               │ │ - 2 bets have no OKR mapped  │ │
│                               │ │ - 1 bet: “Indirect metric”   │ │
│                               │ └──────────────────────────────┘ │
└───────────────────────────────┴──────────────────────────────────┘
```

---

## Product Decisions

- **Score is explainable, not “smart”:** The score is a weighted rubric (coverage, metric link, confidence, effort) with visible sub-scores. Alternative was an LLM-generated rationale; chose rubric so teams can disagree with weights without debating opaque output.
- **Two outputs, not one:** Results include both a ranked initiative table and an OKR coverage grid. Alternative was only ranking; rejected because the most common planning miss is an uncovered OKR, which ranking alone doesn’t reveal.
- **Primary + secondary OKR mapping:** Each initiative can map to one primary OKR and optional secondary OKRs. Alternative was many-to-many only; rejected because planning conversations need a single “what this is for” anchor.
- **“Keep anyway” override with reason:** Initiatives can be marked as intentionally non-OKR (e.g., reliability, compliance) and excluded from orphan counts. Alternative was forcing every bet to map; rejected because it encourages dishonest mapping.

---

## Tech Stack

- **Runtime:** Vanilla JavaScript — fast iteration and easy static hosting
- **Framework:** none — single-page tool with no build step
- **AI/API:** none
- **Styling:** Custom CSS following the `dense-analyst-console` style spec
- **Data:** localStorage — optional persistence of OKRs/initiatives in the browser
- **Deployment:** Static hosting (e.g., Netlify drop or GitHub Pages)

---

## How to Run

**Prerequisites:** None.

```bash
# Clone
git clone [repo-url]
cd projects/[folder-name]

# Install (if applicable)
# No install required.

# Run
# Option 1: open directly
open src/index.html

# Option 2: serve locally (recommended)
python3 -m http.server 8080
```

**Open:** If serving locally, open http://localhost:8080/projects/[folder-name]/src/ (or navigate to src/index.html).

---

## Screenshots

![Screenshot](./screenshots/screenshot.png)

*Score view with realistic quarterly OKRs and a 10-initiative draft roadmap, showing ranked bets, uncovered OKRs, and orphan flags.*

---

## Future Enhancements

- **Weight presets by strategy:** Add presets like “Growth quarter” vs “Efficiency quarter” to change rubric weights. Deferred because it needs validation that the default weights match most planning teams.
- **CSV import/export:** Allow copy/paste or CSV upload for initiatives and OKRs. Deferred to keep V1 zero-setup and avoid file parsing edge cases.
- **Scenario compare:** Save two scoring runs and diff changes in coverage and ranking. Deferred because it requires a more explicit data model and persistence UI.
- **Per-OKR target sizing:** Add a field for expected OKR contribution (%) per bet to catch over-commitment. Deferred because it increases estimation burden and can reduce adoption.

---

## Decision Log

See [decision-log.md](./decision-log.md) for a full record of design and scoping decisions.
