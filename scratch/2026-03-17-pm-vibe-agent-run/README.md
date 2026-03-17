# PM Vibe Agent Run

> A structured, timed decision simulator that forces a PM to make a call with incomplete info, then grades the reasoning against the constraints they claimed.

**Status:** `draft`
**Complexity:** `intermediate`
**Bucket:** `decision-support`

---

## Goal

A PM should be able to produce a defensible decision memo in under 10 minutes (call + rationale + risks + next steps), and immediately see where their reasoning contradicts their own stated constraints.

---

## Problem

In real roadmap and incident-adjacent decisions, PMs often have to decide before the data is clean: sales says “this is blocking renewals,” support says “it’s noisy but not urgent,” and engineering says “we can’t take on more risk this sprint.” The failure mode is not “bad ideas” — it’s mismatched reasoning: the PM claims a constraint (e.g., “reliability first” or “no eng capacity”) but then chooses an action that violates it, which gets exposed late in the leadership review as “this doesn’t add up.”

---

## Why This Exists

A static template (doc or spreadsheet) doesn’t create pressure, doesn’t force explicit constraint selection, and doesn’t check internal consistency. This simulator makes the constraint trade-offs explicit up front, time-boxes the decision to mimic the actual moment, and then evaluates whether the chosen action, risks, and next steps are coherent with the constraints the PM said they were operating under.

---

## Target Persona

A PM at a 30–300 person B2B SaaS company who is expected to make fast trade-offs in weekly prioritization or escalation reviews, without a dedicated analyst or strategy partner to sanity-check the reasoning.

---

## Use Cases

- A PM runs a 7-minute “on-the-spot” scenario before a roadmap review to practice making a call that holds up under questioning.
- A product lead uses it in a team calibration session to compare how different PMs reason under the same constraints.
- An IC PM uses it after an ambiguous stakeholder request to draft a tighter decision memo that anticipates objections.
- A PM uses it during onboarding to learn the organization’s default trade-offs (risk vs growth vs support load) through repeated scenarios.

---

## Barebones Wireframe

```
┌────────────────────────────────────────────────────────────────────┐
│ PM VIBE AGENT RUN                                                  │
│ Dense analyst console style                                        │
├────────────────────────────────────────────────────────────────────┤
│ LEFT: SCENARIO (read-only)                 RIGHT: RUN CONTROLS     │
│ ┌───────────────────────────────┐         ┌─────────────────────┐ │
│ │ Scenario: “Renewal Escalation” │         │ Timer: 07:00        │ │
│ │ Company stage, metrics, notes  │         │ [Start Run]         │ │
│ │ Stakeholder quotes             │         │ [Pause] [Reset]     │ │
│ └───────────────────────────────┘         └─────────────────────┘ │
│                                                                    │
│ STEP 1 — Declare constraints (required)                            │
│ [ ] No eng capacity this sprint                                    │
│ [ ] Reliability risk unacceptable                                  │
│ [ ] Must show customer-facing progress in 2 weeks                  │
│ [ ] Revenue retention priority                                     │
│ [ ] Support load is the bottleneck                                 │
│  + “Other constraint” (short text)                                 │
│                                                                    │
│ STEP 2 — Choose a call (pick one)                                  │
│ ( ) Ship a minimal mitigation now (behind a flag)                   │
│ ( ) Do discovery + commit next sprint                              │
│ ( ) Say no; offer workaround + timeline                            │
│ ( ) Escalate for capacity trade (swap priorities)                  │
│                                                                    │
│ STEP 3 — Decision memo (structured fields)                         │
│ Rationale (3 bullets max)                                          │
│ Top risks (2) + mitigations                                        │
│ Next 48 hours plan (3 actions)                                     │
│ What you need from others (owners)                                 │
│                                                                    │
│ [Grade Run]                                                        │
├────────────────────────────────────────────────────────────────────┤
│ RESULTS                                                            │
│ Score: 72/100  |  Flags: 3                                         │
│ - Constraint mismatch: “No eng capacity” vs “ship mitigation”       │
│ - Missing owner: risk mitigation has no team                         │
│ - Next steps not testable: “monitor closely”                         │
│                                                                    │
│ Suggestions (tight, actionable)                                    │
│ - Replace with: “Define success metric for mitigation by Friday…”   │
└────────────────────────────────────────────────────────────────────┘
```

---

## Product Decisions

- **Constraint-first flow:** The run starts by selecting constraints before picking an action. Alternative was to pick an action first and justify later. Chose constraint-first because the common failure mode is post-hoc rationalization that doesn’t survive leadership scrutiny.
- **Fixed action set per scenario:** Each scenario offers 4 pre-defined calls. Alternative was free-form “what would you do?” Chose fixed calls so grading can be consistent and so different PMs can be compared on reasoning, not writing style.
- **Structured memo fields with caps:** Rationale is capped at 3 bullets and the 48-hour plan at 3 actions. Alternative was an open text box. Chose caps to mimic real-time decision moments and prevent “more text” from masquerading as clarity.
- **Mismatch flags over generic scoring:** Output emphasizes “flags” tied to the user’s declared constraints, not just a total score. Alternative was a single composite score. Chose flags because the goal is coaching: show exactly what would get challenged in review.

---

## Tech Stack

- **Runtime:** Vanilla JavaScript — keeps the prototype fast and portable with no build step.
- **Framework:** none — the UI is a single-page console layout with deterministic logic.
- **AI/API:** none — scoring uses a transparent rubric so users can understand and debate it.
- **Styling:** Custom CSS following the `dense-analyst-console` style spec.
- **Data:** none — runs are ephemeral; no accounts or persistence in V1.
- **Deployment:** Static hosting (GitHub Pages or Netlify drop).

---

## How to Run

**Prerequisites:** None.

```bash
# Clone
git clone <repo-url>
cd projects/2026-03-17-pm-vibe-agent-run

# Install
# No install required.

# Run
# Serve locally (recommended)
python3 -m http.server 5173
```

**Open:** http://localhost:5173

---

## Screenshots

![Screenshot](./screenshots/screenshot.png)

*Scenario view with a timed run in progress and a graded result showing constraint-mismatch flags and concrete next-step rewrites.*

---

## Future Enhancements

- **Scenario editor + import/export JSON:** Let leads author org-specific scenarios. Deferred because it adds validation/UI complexity that distracts from proving the grading model.
- **Run history with deltas:** Save runs locally and show improvement over time. Deferred because persistence creates edge cases (storage limits, reset flows) not needed for V1.
- **Team calibration mode:** Compare multiple participants’ runs on the same scenario and aggregate the top flags. Deferred because it implies multi-user sharing and a clearer privacy model.
- **Rubric tuning knobs:** Allow a lead to weight constraints (e.g., “reliability > revenue”). Deferred because it needs careful UX to avoid making the tool feel like “choose your own score.”

---

## Decision Log

See [decision-log.md](./decision-log.md) for a full record of design and scoping decisions.
