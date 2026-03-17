# Idea Validator

> A real-time idea pressure-test workspace that scores a product concept, surfaces fragile assumptions, and produces an explicit “pursue / refine / drop” verdict with next-step validation actions.

**Status:** `draft`
**Complexity:** `complex`
**Bucket:** `decision-support`

---

## Goal

Enable a senior PM or founder to turn a fuzzy idea into a documented go/no-go recommendation in under 15 minutes, with explicit scores, named assumptions, and concrete validation next steps they can delegate.

---

## Problem

In roadmap planning, a Head of Product or founder often green-lights an idea after a compelling narrative, a loud stakeholder, or a single anecdote. The failure mode shows up later as “we built the thing but adoption didn’t materialize,” because the team never wrote down what had to be true (pain, frequency, differentiation, time-to-value) and therefore never validated it before committing design and engineering time.

---

## Why This Exists

A static checklist or spreadsheet captures criteria, but it doesn’t behave like a thinking partner: it won’t reflect how improving one part of an idea (clearer target user) should immediately change downstream risk flags (differentiation, time-to-value, complexity). This tool keeps an always-visible verdict panel and live-updating weakness detection so the user can iterate on phrasing and positioning and instantly see which assumptions became stronger or more fragile, producing a decision artifact that’s easier to defend in a leadership meeting than “gut feel + a doc.”

---

## Target Persona

A Head of Product or founder at a 20–200 person B2B SaaS company trying to decide whether an idea deserves roadmap time, operating without a dedicated research team and needing a crisp rationale that aligns leadership quickly.

---

## Use Cases

- A Head of Product pastes a stakeholder-proposed idea 30 minutes before triage to determine whether it’s “refine” or “drop,” and why.
- A founder rewrites an idea’s value proposition and target user live during a strategy session to see how differentiation and time-to-value scores shift.
- An IC PM converts a vague “we should add AI” suggestion into explicit assumptions and a validation plan they can run in a week.
- A product trio (PM/Design/Eng) uses the weakness flags to preemptively identify hidden complexity before committing to discovery.
- A PM uses the output as an appendix in a one-pager to show which risks were accepted vs. mitigated.

---

## Barebones Wireframe

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ IDEA VALIDATOR                                               [Load example ▼]│
├──────────────────────────────────────────────────────────────────────────────┤
│ Left: Thinking Workspace (scroll)                 Right: Verdict Side Panel   │
│                                                                              │
│ [Idea Title]                                                                 │
│ [Free-text Idea Narrative.................................................]  │
│                                                                              │
│ Optional Structure                                                          │
│  Target user [........................]   Problem [........................] │
│  Proposed solution [......................................................] │
│                                                                              │
│ Evaluation Dimensions (live)                                                 │
│  Pain intensity        [0..5 slider]   + rationale line                       │
│  Frequency             [0..5 slider]   + rationale line                       │
│  Existing alternatives [0..5 slider]   + rationale line                       │
│  Differentiation       [0..5 slider]   + rationale line                       │
│  Impl. complexity      [0..5 slider]   + rationale line                       │
│  Time to value         [0..5 slider]   + rationale line                       │
│  Business impact       [0..5 slider]   + rationale line                       │
│                                                                              │
│ Assumption Breakdown (auto-updates)                                          │
│  User assumptions      - bullet list (editable tags)                          │
│  Technical assumptions - bullet list                                          │
│  Business assumptions  - bullet list                                          │
│                                                                              │
│ Weakness Detection (key moment)                                              │
│  Flags: “vague value prop”, “crowded market”, “unclear wedge”, “hidden cost” │
│  Each flag includes: why + what to clarify next                              │
│                                                                              │
│ Next Steps                                                                    │
│  Recommended validation actions grouped by: 24h / 1 week / pre-build          │
└──────────────────────────────────────────────────────────────────────────────┘

Right panel:
┌──────────────────────────────┐
│ VERDICT: Needs refinement     │
│ Confidence: Medium            │
│ Score summary radar/stack     │
│ Top risks (3)                 │
│ Strong signals (2)            │
│ Decision note (copy)          │
└──────────────────────────────┘
```

---

## Product Decisions

- **Verdict is always visible in a side panel:** The verdict updates continuously as the user edits inputs. Alternative was a “Generate report” button; chose live updates because the core behavior is iterative rewriting and calibration during planning conversations.
- **Scores are dimension-specific (pain, frequency, differentiation, etc.), not a single “idea score”:** Alternative was one composite score only; chose per-dimension scoring because it makes disagreement productive (teams can argue about “frequency” without conflating it with “impact”).
- **Weakness Detection is phrased as flags with “what to clarify next,” not critique:** Alternative was a long narrative assessment; chose flags because this is used under time pressure and needs actionable prompts rather than prose.
- **Assumptions are categorized (user/technical/business) and shown as a checklist-like list:** Alternative was a flat list; chose categories because it routes follow-up work to the right owner (research vs. engineering spike vs. pricing/GTM).
- **Preloaded realistic examples are first-class:** Alternative was an empty first-run state; chose examples because senior users calibrate faster by editing something credible than by starting from a blank canvas.

---

## Tech Stack

- **Runtime:** Browser (JavaScript) — runs locally with instant feedback
- **Framework:** none — vanilla HTML/CSS/JS to keep the interaction snappy and portable
- **AI/API:** none — rubric-based scoring and rule-driven weakness flags to keep outputs deterministic and reviewable
- **Styling:** Custom CSS following the `executive-monochrome` style spec
- **Data:** none — stateless, sample ideas are embedded JSON
- **Deployment:** Static hosting (e.g., GitHub Pages) or open `index.html`

---

## How to Run

**Prerequisites:** None.

```bash
# Clone
git clone [repo-url]
cd projects/YYYY-MM-DD-idea-validator

# Install
# No install required.

# Run
# Option 1: open directly
open src/index.html

# Option 2: serve locally (recommended)
python3 -m http.server 5173
```

**Open:** If serving, open `http://localhost:5173/src/`.

---

## Screenshots

![Screenshot](./screenshots/screenshot.png)

*An example B2B SaaS idea (“Slack-first renewal risk alerts”) showing live dimension scores, weakness flags, categorized assumptions, and an updating verdict side panel.*

---

## Future Enhancements

- **Calibration mode (team voting):** Let multiple reviewers score dimensions and show variance. Deferred because it requires persistence and identity to be meaningful.
- **Evidence links per assumption:** Attach interview notes, screenshots, or metrics references to each assumption. Deferred because it adds storage and a more complex information model.
- **Idea comparison view:** Compare 3–5 ideas side-by-side with deltas and top risks to support roadmap sorting. Deferred to validate single-idea depth before adding portfolio-level workflows.
- **Custom rubric templates:** Allow teams to tailor dimensions (e.g., regulated industries, platform bets). Deferred because it expands configuration UI and reduces out-of-the-box clarity.

---

## Decision Log

See [decision-log.md](./decision-log.md) for a full record of design and scoping decisions.
