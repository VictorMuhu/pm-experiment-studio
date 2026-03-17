# Decision Log — PM Vibe Agent Run

**Last updated:** 2026-03-17

---

## 1. What This Project Optimized For

A PM at a 30–200 person SaaS company at 5:30pm who needs to paste a day’s messy notes and leave with a copy/paste-ready update (Decisions, Risks, Asks, Next 24h) they can post in Slack in 2 minutes — this tool optimizes for that moment, not for long-term project documentation or team-wide reporting.

---

## 2. What Was Intentionally Left Out

| Cut Item | Reason |
|----------|--------|
| Run history / saved logs | Saving runs changes the product into a logbook (data model, storage, browsing UI). V1 is designed for “produce an update now,” so persistence was cut to keep the interaction fast and privacy-simple. |
| Integrations (Slack/Jira/Notion) | Pulling from tools would require auth flows and fragile mappings; it also shifts the user from “paste what you have” to “connect systems,” which is a different adoption barrier than the end-of-day moment. |
| Sentiment analysis on text | True sentiment inference is noisy and can feel invasive; the goal is a lightweight operational classification (“vibe”) grounded in explicit drivers, not a mood detector. |
| Team rollups / weekly digest | Rollups require multiple contributors, identity, and deduping across projects. That’s valuable but not necessary to prove the core output format is useful for one PM. |

---

## 3. Major Product Trade-offs

**Deterministic extraction vs LLM generation**
Chose deterministic heuristics (keyword + pattern-based labeling) over an LLM. Deterministic means consistent structure and predictable failures. An LLM would have produced nicer prose but would also introduce variability and “hallucinated” certainty. Went with deterministic because the user is copying output into real comms and needs trust that every bullet came from their input.

**Fixed schema vs customizable sections**
Chose a fixed four-section schema over user-defined sections. Fixed schema means the output is comparable day-to-day and users learn the shape quickly. Customization would have made onboarding harder and created bikeshedding (“what do we call this section?”). Went with fixed because the target moment is time pressure, not tailoring.

**Audience selector vs single universal output**
Chose an audience selector that changes tone/detail over one universal update. Audience switching adds a control and branching logic, but avoids rewriting the same update for execs vs engineers. Went with audience selection because the real failure is duplicated effort and mismatched detail level in different rooms.

---

## 4. Design Choices Made

- **Style direction: `premium-saas`:** Chosen to make the artifact feel like an internal enterprise console (credible, calm, readable), which matches a PM posting updates to leadership and cross-functional channels.
- **Copy-first layout with a dedicated “Message (ready to paste)” block:** The alternative was only structured sections. The message block exists because the user’s next action is almost always “paste into Slack/email,” and removing formatting work is the main value.
- **Drivers required for the vibe label:** The alternative was letting users label vibe without justification. Requiring 1–3 drivers makes the vibe actionable (what caused it) and reduces the risk of the label feeling like subjective mood tracking.

---

## 5. Technical Shortcuts and Constraints

- **Heuristic classifier:** Uses keyword/pattern rules to sort sentences into Decisions/Risks/Asks/Next 24h — USER COST: ambiguous lines can land in the wrong bucket and the PM must manually edit before posting.
- **No persistence:** The app does not save runs between sessions — USER COST: if the tab is closed before copying/exporting, the snapshot is lost.
- **No entity resolution (owners/dates):** Owners and due dates are inferred only when explicitly written — USER COST: the tool won’t magically add “who” or “by when,” so asks/risks may remain incomplete unless the user includes those details.

---

## 6. Publish or Scratch — and Why

**Recommendation:** `Hold`

This clears the “specific problem + structured output” bar and is meaningfully different from the repo’s recent PM productivity and decision-simulator tools, but it should be held until the style spec is correctly applied and the demo state includes realistic sample notes that demonstrate all four categories plus the audience toggle. The publish gate for this repo expects the visual identity to be intentional and the default view to look like a real internal workflow, not a blank tool.

---

## 7. What a V2 Would Include

- **Saved run history with comparisons:** Helps a PM show trends (recurring risks/asks) across a week and reuse language in weekly stakeholder notes.
- **Inline editing + “completeness checks”:** Flags missing owner/date for asks and risks, helping execution-focused PMs ship updates that actually prompt action.
- **Team digest builder:** Lets a product lead combine multiple PM run snapshots into a single weekly rollup with deduped risks and consolidated asks.
- **Integration import (optional):** Pulls today’s Jira changes or incident notes to reduce manual paste, specifically benefiting PMs who already track work in tickets but struggle to summarize it.
