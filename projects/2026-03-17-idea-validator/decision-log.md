# Decision Log — Idea Validator

**Last updated:** 2026-03-17

---

## What This Project Optimized For

- Decision-readiness in one sitting — at the cost of long-term tracking; the tool is built to get from pitch to verdict quickly rather than maintain an idea backlog.
- Forcing specificity over persuasion — at the cost of being “pleasant” for the idea owner; the UX pushes the user into concrete claims (ICP, evidence, demo moment) even when that reveals weakness.
- Executive scan-ability — at the cost of completeness; the verdict panel favors a few high-signal risks and next steps rather than an exhaustive critique.

---

## What Was Intentionally Left Out

| Cut Item | Reason |
|----------|--------|
| Multi-idea library, tagging, and search | Turns the artifact into a backlog manager; the core value is the evaluation moment, not cataloging ideas. |
| Collaborative commenting / multi-rater consensus | Requires identity, permissions, and conflict resolution UI; also changes the persona from “solo prep” to “meeting facilitation.” |
| AI-generated rewrites of the pitch | Would push the tool toward generic text generation; the product intent is to expose weak logic, not to produce nicer wording. |
| Custom weighting / configurable rubric | Adds politics and setup overhead; V1 needs a stable baseline rubric to validate usefulness before enabling customization. |
| Export to PDF/Notion/Jira | Export formatting becomes the work; V1 is validated if the user can copy/paste the structured outputs without dedicated export flows. |

---

## Major Product Trade-offs

**Live, evolving verdict vs. “Evaluate” action**
Chose an always-on verdict panel over a single evaluate button. Always-on means the user sees consequences of vague inputs immediately, which can feel harsh and “judgy.” A button-based flow would feel safer but would encourage one-shot usage and reduce iteration. Went with always-on because the persona’s real workflow is rewriting before a review, not generating a final report once.

**Fixed rubric vs. bring-your-own criteria**
Chose seven fixed dimensions over fully custom criteria. Fixed dimensions risk mismatching a niche idea (e.g., platform bets) and can under-score unconventional plays. Custom criteria would increase adoption friction and destroy comparability across ideas. Went with fixed because the tool is meant to be a repeatable decision aid for senior leaders, not an open-ended framework builder.

**Notes required per score vs. pure numeric scoring**
Chose to pair every score with a short rationale rather than allow numeric-only scoring. Required notes add typing overhead and can slow completion. Numeric-only would be faster but would fail the “defensible decision” requirement when the score is challenged in leadership review. Went with notes because the output must survive pushback (“why is differentiation a 4?”).

**Heuristic weakness detection vs. research-grade analysis**
Chose straightforward, transparent heuristics (keyword and structure checks) rather than trying to infer “market crowdedness” or “value clarity” from external data. Heuristics can be wrong and may over-flag. External data analysis would require APIs, credentials, and a heavier UX. Went with heuristics because the goal is to trigger sharper thinking, not to claim objective market truth.

---

## Design Choices Made

- **Style identity (`executive-monochrome`):** A dark, editorial workspace reduces visual noise and matches the “internal strategy tool” vibe—more like a leadership memo than a consumer app. It supports long-form reading and deliberate scoring, which is the emotional tone of the persona’s work.
- **Persistent right-hand verdict panel:** The verdict is always visible so the user can feel whether edits are moving the idea toward “Strong candidate” or merely polishing weak fundamentals. The alternative was placing verdict at the bottom; rejected because it encourages filling the form without reflecting on decision impact.
- **Progressive disclosure by readiness:** Assumptions and weakness detection expand after basic idea fields are present (title, ICP, problem, demo moment). The alternative was showing everything at once; rejected because it creates a blank-dashboard feeling and overwhelms users at the moment they need momentum.
- **Dimension wording tuned for decision meetings:** “Time-to-value” and “Alternatives” are framed as leadership questions (“how fast does the buyer feel it?” “what do they do today?”) rather than analytical labels, so the output can be read aloud in a roadmap review without translation.

---

## Technical Shortcuts or Constraints

- **No persistence layer:** All work stays in memory and resets on refresh — USER COST: the user loses their evaluation if they reload the page or accidentally close the tab.
- **Heuristic weakness detection (no external data):** Flags rely on text cues and simple rules — USER COST: the tool may miss a real market risk or flag a “crowded” signal that the user knows is actually differentiated, requiring manual judgment.
- **No authentication / sharing:** There’s no link-sharing or team access — USER COST: to share the result, the user must copy/paste or screenshot, which reduces adoption for teams that want async alignment.
- **Desktop-first layout:** Optimized for a wide viewport with a side panel — USER COST: on smaller screens the verdict panel will stack and feel less like an “executive cockpit,” making it harder to scan while editing.

---

## Publish or Scratch — and Why

**Recommendation:** `Publish`

This clears the bar as a portfolio-grade decision-support artifact because it has a specific failure mode (persuasive-but-underspecified ideas consuming roadmap capacity) and a structured, non-generic interaction model (live rubric scoring + assumption forcing + weakness flags + evolving verdict). The design direction is intentionally “executive workspace,” which supports the target persona and differentiates it from prior command/analyst-console tools in the repo. The key publish risk is over-promising on weakness detection; as long as the UI frames flags as prompts (not facts), it remains credible.

---

## What a V2 Would Include

- **Saved evaluations + comparison view:** Let a product leader compare two ideas before planning (impact: reduces “recency bias” and makes trade-offs explicit across options).
- **Team calibration mode (weights + definitions):** A leadership team can define what “10/10 business impact” means for their context (impact: increases consistency across PMs and reduces argument over scoring semantics).
- **Evidence links per assumption:** Attach a call snippet, Zendesk trend, or experiment result to each assumption (impact: turns “belief” into a traceable decision record that survives scrutiny).
- **Export to decision memo (Markdown/PDF):** One structured artifact for leadership review and async sharing (impact: reduces the overhead of rewriting outputs into decks/docs).
