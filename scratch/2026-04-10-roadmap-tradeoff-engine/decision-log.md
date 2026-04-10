# Decision Log — Roadmap Tradeoff Engine

**Last updated:** 2026-04-10

---

## 1. What This Project Optimized For

A Head of Product in a quarterly roadmap tradeoff meeting needs to tighten capacity from “what we want” to “what we can ship,” and leave with a selected set, an excluded set, and a plain-language reason for each exclusion they can read out loud — this tool optimizes for that moment, not for long-term backlog management or comprehensive portfolio reporting.

---

## 2. What Was Intentionally Left Out

- **Initiative dependency modeling:** Cut because once dependencies exist the selection engine becomes less intuitive (and the UI needs dependency editing + visualization). V1 is about capacity-driven tradeoffs, not sequencing.
- **Multi-team/resource constraints (FE/BE/Design/Data):** Cut because multi-constraint optimization changes the mental model and requires users to provide much more effort detail than they usually have at planning time.
- **Persistence, users, and collaboration:** Cut because saving scenarios and sharing plans pushes the product toward a planning system (auth, storage, permissions). V1 is a portable decision artifact, not a system of record.
- **“Mandatory” initiatives and fixed commitments:** Considered but cut to avoid turning the interaction into constraint bookkeeping. In V1, users can simulate “mandatory” by setting very high strategic alignment and low risk, but the UI won’t enforce it.

---

## 3. Major Product Trade-offs

**Optimization realism vs explainability**
Chose a simplified knapsack-style selection with adjustable penalties over a more realistic model (dependencies, sequencing, multi-resource constraints). The simplified model means the selection logic is inspectable and users can predict changes. The realistic model would better mirror actual delivery planning but would make “why did this drop?” harder to explain in-meeting. Went with simplified optimization because the persona’s pain is argument resolution, not schedule construction.

**Expected-impact adjustment vs pure impact maximization**
Chose to adjust impact using confidence and risk (so the engine prefers expected value) over maximizing raw impact. The adjustment means some high-impact bets fall out under conservative strategy, which matches how leaders actually behave under scrutiny. Pure impact maximization would produce brittle plans that are hard to defend when questioned about uncertainty.

**Two scenarios (A/B) vs unlimited scenarios**
Chose a fixed A/B comparison over an unlimited scenario library. A/B forces a clear “current plan vs alternative posture” narrative and keeps the UI legible. Unlimited scenarios would encourage users to treat the tool like a backlog/planning workspace and would dilute the core demo moment (tighten capacity → see what drops and why).

---

## 4. Design Choices Made

- **Style ID: `executive-monochrome`:** Selected because this tool is meant to be used in a leadership planning context where visual novelty is a liability; monochrome, high-contrast hierarchy makes the output feel like an internal decision memo rather than a consumer app.
- **Three-column information architecture:** Initiatives on the left, selected set in the center, explanations on the right. This mirrors the meeting flow: (1) inspect inputs, (2) see the resulting plan, (3) answer “why” without scrolling or switching views.
- **Click-to-explain interaction:** Clicking an initiative locks the explanation panel onto that item (included or excluded). The alternative was a general summary explanation only; rejected because stakeholders challenge specific cuts (“why not enterprise permissions?”) and the tool must answer at item-level.

---

## 5. Technical Shortcuts and Constraints

- **In-memory state only:** Scenarios and edits are not persisted — USER COST: if the page is refreshed, all edits and scenario comparisons are lost.
- **Coarse optimization approach (discrete effort points):** Effort is treated as integer points and the engine searches within that discretized space — USER COST: initiatives with very close “true” costs can flip in/out based on rounding, which can feel jumpy at low capacities.
- **No robust estimate uncertainty modeling:** Risk/confidence are simple penalties, not distributions or ranges — USER COST: users cannot represent “this could be 5–13 points” and may feel the engine is overly certain about borderline choices.

---

## 6. Publish or Scratch — and Why

**Recommendation:** `Publish`

This concept clears the bar if the implementation truly behaves like a decision engine: capacity changes must recompute a set (not just reorder), and the explanation panel must state displacement reasons that map to the selected alternatives (e.g., “excluded because X had lower adjusted impact per point than Y under conservative strategy”). The project is also distinct from the existing `idea-validator` (go/no-go on a single idea) by focusing on *portfolio selection under capacity* with scenario comparison. It should be held only if the explanation layer ends up generic (“low score”) or if the engine degenerates into a sorted list.

---

## 7. What a V2 Would Include

1. **Dependencies + sequencing (“must come before”):** Helps Heads of Product avoid selecting incompatible sets and generates a deliverable order that matches reality.
2. **Multi-resource constraints (FE/BE/Design):** Helps product leaders model the most common real bottleneck mismatch (e.g., backend capacity is fine, design is not).
3. **Commitments and “must-do” work categories:** Helps teams reserve capacity for compliance, reliability, and platform work without gaming alignment scores.
4. **Exportable decision memo:** Helps a PM paste a clean “selected, excluded, rationale, and scenario delta” artifact into a planning doc or leadership email.
