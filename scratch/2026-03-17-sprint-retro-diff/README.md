# Sprint Retro Diff

> A two-sprint comparison worksheet that turns velocity, scope-change events, and blocker notes into a “what likely moved the needle” summary you can paste into a retro doc.

**Status:** `draft`
**Complexity:** `intermediate`
**Bucket:** `analytics-debugging`

---

## Goal

A delivery-focused PM should be able to compare the last two sprints and walk into retro with (1) a defensible explanation for the velocity delta and (2) a short list of process changes to keep/stop/try next.

---

## Problem

In retros, teams compare “Sprint 23 felt bad” vs “Sprint 24 felt better” using scattered artifacts: a velocity chart, a few Jira comments about scope churn, and someone’s memory of blockers. The result is a fuzzy narrative where the team over-credits whatever changed most recently (new ceremonies, WIP limits, on-call rotation) and under-credits the boring-but-real drivers (scope churn, mid-sprint priority swaps, unplanned work).

---

## Why This Exists

A spreadsheet can show totals (points committed vs done), but it doesn’t force a consistent accounting of *why* the delta happened or separate “we delivered less because we added work” from “we delivered less because we were blocked.” This tool uses a fixed, explicit rubric to translate two sprints’ operational signals (velocity + scope-change events + blocker time) into a retro-ready attribution summary with assumptions called out, so the team can argue about the right thing.

---

## Target Persona

A product manager at a 30–150 person product org running two-week sprints, who has to facilitate retro without a dedicated analytics/ops partner and needs a credible story that won’t get immediately challenged by engineering leads.

---

## Use Cases

- A PM prepares for Friday retro and wants to explain why the team completed 18 points vs 27 last sprint without turning the meeting into a blame session.
- A delivery manager tests whether a new “no mid-sprint adds” policy actually reduced churn compared to the prior sprint.
- A PM and EM disagree on whether on-call interruptions were the main driver of a miss; they use the same rubric to align on what the data supports.
- A team tries a process change (mid-sprint bug triage lane) and wants a quick “did it help or just feel better?” check before doubling down.

---

## Barebones Wireframe

```
┌────────────────────────────────────────────────────────────────────────────┐
│ Sprint Retro Diff                                                          │
│ Compare two consecutive sprints and generate a retro-ready delta narrative  │
├────────────────────────────────────────────────────────────────────────────┤
│ STEP 1 — Sprint A (previous)                    STEP 2 — Sprint B (current)│
│ [ Sprint name ] [ dates ]                       [ Sprint name ] [ dates ]  │
│ [ Committed pts ] [ Done pts ]                  [ Committed pts ] [ Done ] │
│ [ Team days ] [ On-call days ]                  [ Team days ] [ On-call ]  │
│                                                                            │
│ Scope-change log (structured rows)                                          │
│  + Add row: [day#] [added pts] [removed pts] [reason tag] [note]           │
│ Blockers (rows)                                                             │
│  + Add row: [day#] [hours] [type tag] [note]                               │
│                                                                            │
│ [ Generate retro diff ]                                                     │
├────────────────────────────────────────────────────────────────────────────┤
│ RESULTS (copy/paste)                                                        │
│ 1) Delta snapshot (table)                                                   │
│ 2) What changed (ranked drivers with evidence)                               │
│ 3) Candidate process changes to keep/stop/try (based on driver patterns)    │
│ 4) Assumptions + questions to confirm                                        │
│ [ Copy as Markdown ]   [ Download JSON ]                                     │
└────────────────────────────────────────────────────────────────────────────┘
```

---

## Product Decisions

- **Two-sprint comparison only:** The tool compares Sprint A vs Sprint B (consecutive) instead of trending across many sprints. Alternative was a multi-sprint dashboard; chose two-sprint diff because retros happen sprint-to-sprint and teams need a focused narrative, not a reporting system.
- **Structured scope-change rows vs freeform notes:** Scope changes are entered as rows with added/removed points + a reason tag. Alternative was a single text box; chose rows because the core failure mode is “we argue from vibes,” and structured rows make churn quantifiable.
- **Ranked drivers with “evidence snippets”:** Output shows a ranked list (e.g., “scope added mid-sprint increased by +12 pts”) with the specific rows that support it. Alternative was a plain summary paragraph; chose evidence snippets so an EM can audit the claim quickly.
- **Explicit assumptions section:** The report always includes assumptions (e.g., “1 day on-call reduces capacity by 0.5 dev-day”). Alternative was hiding the math; chose explicit assumptions to prevent false precision and to invite calibration.

---

## Tech Stack

- **Runtime:** Vanilla JavaScript — fast iteration and runs locally without setup
- **Framework:** none — single-page static app
- **AI/API:** none
- **Styling:** Custom CSS following the `playful-consumer` style spec
- **Data:** none — stateless (optional export only)
- **Deployment:** Static hosting (GitHub Pages or Netlify drop)

---

## How to Run

**Prerequisites:** None.

```bash
# Clone
git clone https://github.com/<your-org-or-user>/pm-experiment-studio.git
cd pm-experiment-studio/projects/YYYY-MM-DD-sprint-retro-diff

# Install
# No install required.

# Run
# Option 1: open the file directly
# (double-click src/index.html)

# Option 2: serve locally (recommended)
python3 -m http.server 5173
```

**Open:** If serving locally, http://localhost:5173/src/

---

## Screenshots

Screenshot pending — see screenshots/PENDING.md for capture instructions.

---

## Future Enhancements

- **Jira CSV import:** Map a Jira sprint export into committed/done + scope changes automatically. Deferred because parsing varies by Jira setup and needs real-user validation.
- **Capacity calibration:** Let teams set a capacity model (on-call factor, meeting load, part-time members). Deferred because it adds configuration overhead that could reduce adoption.
- **“Process change experiment” tracker:** Save multiple diffs over time and tag them to specific interventions. Deferred because persistence implies a backend or at least local storage + versioning.
- **Confidence meter:** Compute a “how explainable is the delta?” score based on coverage of scope/blocker inputs. Deferred because it risks over-indexing the team on a number before the rubric is proven.

---

## Decision Log

See [decision-log.md](./decision-log.md) for a full record of design and scoping decisions.
