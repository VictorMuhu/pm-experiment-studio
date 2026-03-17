# Decision Log — Design Coach

**Last updated:** 2026-03-17

---

## What This Project Optimized For

- Structured completeness tracking (Clarity Score) — at the cost of not being a freeform whiteboarding tool
- Spatial flow reasoning (pannable canvas with draggable nodes) — at the cost of higher interaction complexity than a flat list
- Explicit tradeoff documentation (interactive sliders) — at the cost of requiring users to engage with each spectrum rather than skipping to implementation

---

## What Was Intentionally Left Out

| Cut Item | Reason |
|----------|--------|
| Persistent storage (database, localStorage) | The experiment validates the interaction model and scoring engine; persistence adds infrastructure scope without changing the core hypothesis |
| Export to Markdown/PDF | Useful for handoff but not required to prove that structured flow analysis improves completeness; deferred to V2 |
| Custom tradeoff creation | Preset tradeoffs validate the slider interaction pattern; user-defined spectrums add form complexity and edge cases |
| Real-time collaboration | Multiplayer editing requires conflict resolution and backend infrastructure that's orthogonal to the single-user clarity workflow |
| AI-generated edge cases | Automated suggestions would change the experiment from "does structured tracking improve coverage?" to "does AI improve coverage?" — different hypothesis |

---

## Major Product Trade-offs

**Weighted composite score vs simple completion percentage**
Chose a weighted Clarity Score (30% node validation, 50% edge case resolution, 20% tradeoff documentation) over a flat "X of Y done" counter. A composite score incentivizes balanced coverage across all dimensions rather than gaming one category. The downside is that the weights are opinionated and may not match every team's priorities. Went with fixed weights because configurability adds UI complexity and the weights reflect a defensible PM best practice (edge cases matter most).

**Node-scoped edge cases vs flat list**
Chose to associate each edge case with a specific flow node so selecting a node filters the inspector to relevant cases. A flat list would have been simpler but loses spatial context — you can't see "which step has the most gaps" at a glance. Went with node-scoping because the canvas is the primary workspace and filtering by selection is the natural interaction.

**Interactive sliders vs static documentation**
Chose sliders that save position to global state over static text labels for tradeoffs. Static labels are simpler but don't force a decision — it's too easy to write "we'll balance both." A slider at 65% toward Security says something concrete. Went with sliders because the point is to make implicit decisions explicit and reviewable.

**Pan/zoom canvas vs auto-layout**
Chose a fully interactive canvas (mouse-drag panning, scroll-wheel zoom, individual node dragging) over an automatic layout algorithm. Auto-layout is easier to implement and always "neat," but PMs need to express flow structure spatially — grouping related steps, separating error branches, emphasizing the happy path. Went with manual positioning because spatial arrangement carries meaning.

---

## Design Choices Made

- **Machined-dark aesthetic:** The UI uses a dark, precision-tooled visual language (subtle borders, monospace labels, muted surfaces) to signal "engineering tool" rather than "creative canvas" — reinforcing that this is about rigor, not brainstorming.
- **Inspector panel as persistent sidebar:** The right panel is always visible (not a drawer or modal) because the primary workflow is canvas + inspector simultaneously — select a node, see its cases, resolve them.
- **Zoom controls as an overlay:** The +/−/Reset controls float over the canvas bottom-right to stay accessible without consuming layout space, following map-UI conventions users already know.
- **Stress Test as a mode toggle:** Rather than always showing failure analysis, it's a deliberate activation — framing it as an intentional review step rather than ambient noise.

---

## Technical Shortcuts or Constraints

- **In-memory state only:** All flow data resets on page reload. This is acceptable for the experiment because the goal is interaction validation, not data durability.
- **Demo flows are hardcoded:** Three preset flows (Onboarding, Checkout, Settings) serve as realistic fixtures. Real usage would require flow creation/deletion UI.
- **Clarity Score weights are fixed:** The 30/50/20 split is not user-configurable. Changing weights would require a settings UI and potentially confuse the scoring mental model.
- **No undo/redo:** Node drags and edge case resolutions are one-way. Undo would require a command history stack, adding complexity for marginal benefit in a review tool.

---

## Publish Recommendation

**Recommendation:** `Publish`

The project demonstrates a complete, interactive product-thinking workflow: flow mapping with spatial control, structured edge-case tracking with severity levels, explicit tradeoff documentation via sliders, a composite quality score, and a stress-test mode for failure analysis. The canvas interactions (pan, zoom, drag) are polished and the inspector panel provides genuine analytical utility. It's complex enough to be portfolio-worthy and specific enough to communicate a clear product thesis.

---

## What a V2 Would Include

- **Persistent storage:** Connect to a database so flows survive reload and can be shared via URL; deferred because it changes the project from a client-side tool to a full-stack app.
- **Flow export:** Generate Markdown or PDF summaries of the entire flow analysis for stakeholder review; deferred to keep V1 focused on the interactive experience.
- **Custom tradeoffs and edge cases:** Let users define their own tradeoff spectrums and add edge cases beyond presets; deferred because presets validate the pattern first.
- **Flow diffing:** Compare two versions of a flow to see what changed (added nodes, resolved cases, shifted tradeoffs); deferred because it requires versioning infrastructure.
- **Team annotations:** Let reviewers add comments to specific nodes or edge cases; deferred because it requires user identity and notification systems.
