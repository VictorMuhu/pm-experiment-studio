# Decision Log — PM Vibe Agent Run

**Last updated:** 2026-03-17

---

## What This Project Optimized For

- Fast “time-to-a-defensible-call” in a simulated pressure moment — at the cost of not supporting deep data analysis or exploration.
- Reasoning consistency checks (constraints vs action vs plan) — at the cost of allowing fewer open-ended answer formats.
- Coaching value through specific, debatable flags — at the cost of a simpler, deterministic rubric rather than “smart” evaluation.

---

## What Was Intentionally Left Out

| Cut Item | Reason |
|----------|--------|
| Scenario authoring UI (create/edit scenarios in-app) | It would turn the prototype into a content management tool; V1 is about validating the run flow + grading, not building a scenario builder. |
| Persistence (accounts, saved runs, sharing) | Adds privacy decisions and edge-case UX (sync, reset, storage) that don’t change whether the rubric produces useful coaching in a single run. |
| Free-form “write anything” decision input | Makes evaluation subjective and pushes the tool toward generic text critique; structured fields are required to produce comparable, coachable output. |
| Multi-option strategies (e.g., “do A and B”) | Realistic but hard to score transparently; V1 forces a single primary call so mismatch detection is crisp and explainable. |

---

## Major Product Trade-offs

**Deterministic rubric vs AI judging**
Chose a transparent, rule-based grading rubric over an LLM “judge.” The rubric means the tool can explain exactly why a flag exists and stays consistent across users. An LLM judge would have produced richer feedback but would be inconsistent across runs and harder to trust in a calibration setting. Went with the rubric because the persona needs reasoning that stands up in leadership review, not vibes.

**Constraint-first flow vs narrative-first flow**
Chose “declare constraints → choose call → write memo” over “write memo → extract constraints.” Constraint-first makes the common contradiction visible (claiming a constraint, then violating it) and creates a clean grading surface. Narrative-first would feel more natural but would reintroduce post-hoc rationalization and make scoring ambiguous. Went with constraint-first to mimic the leadership question: “What constraints are you operating under?”

**Fixed action menu vs open decision entry**
Chose a fixed set of calls per scenario over a free-text “what would you do?” Fixed calls allow consistent scoring and make the simulator usable for team calibration. Open entry would capture more realistic nuance but would make comparisons unreliable and push the tool toward generic writing critique. Went with fixed calls because the core value is practice + calibration under shared options.

**Time-boxed run vs untimed worksheet**
Chose a visible timer (with start/pause/reset) over an untimed exercise. The timer introduces the same pressure that causes shallow reasoning in real meetings and makes the tool feel like rehearsal, not homework. Untimed would reduce stress but wouldn’t train the “make the call now” muscle. Went with time-boxing because the persona’s real constraint is often time, not knowledge.

---

## Design Choices Made

- **Style identity — `dense-analyst-console`:** This project is intentionally information-dense and correctness-oriented (flags, constraints, rubric categories). The console aesthetic signals “decision ops” rather than “workshop,” matching the persona’s leadership-review context where precision and accountability matter.
- **Two-pane layout (scenario left, controls right):** Kept the scenario visible at all times while writing the memo so users don’t scroll away from constraints and stakeholder quotes. The alternative was a stepper/wizard; rejected because hiding the scenario increases working-memory load and causes superficial rationales.
- **Flags as the primary output, score as secondary:** The results emphasize named contradictions (e.g., “No capacity” vs “ship now”) with concrete rewrite suggestions. The alternative was a leaderboard-like score-first UI; rejected because it encourages gaming the number instead of improving decision quality.

---

## Technical Shortcuts and Constraints

- **No saved runs:** Runs are not persisted to disk or cloud — USER COST: users cannot track improvement over time and must re-enter a memo if they refresh or close the tab.
- **Small, hand-authored scenario set:** V1 ships with a limited library of scenarios — USER COST: users may not find a scenario that matches their domain, reducing perceived relevance after a few repetitions.
- **Heuristic mismatch detection:** Constraint/action mismatches are detected via explicit mappings rather than nuance — USER COST: users will occasionally get a “mismatch” flag they disagree with and must mentally override it instead of the tool adapting.
- **No collaboration features:** There is no way to share a run or compare results in-app — USER COST: teams must resort to screenshots or copy/paste to use it in calibration sessions.

---

## Publish or Scratch — and Why

**Recommendation:** `Hold`

The concept clears the “real problem + structured output” bar and is meaningfully distinct from the existing idea validator (it simulates a timed decision and grades internal coherence rather than scoring an initiative). However, publication should wait until the rubric and scenarios are implemented with realistic content and at least one screenshot demonstrates a full run (constraints selected, memo written, graded flags shown). Without that, it risks reading as a template rather than a working simulator.

---

## What a V2 Would Include

- **Scenario editor with JSON import/export:** Helps product leads tailor scenarios to their org’s metrics and constraints, increasing relevance and repeat usage.
- **Run history + trend view (local-first):** Lets an IC PM see whether they are reducing “mismatch” and “missing owner” flags over time, turning practice into measurable improvement.
- **Calibration mode (same scenario, multiple participants):** Helps a lead surface where the team disagrees (e.g., risk tolerance vs revenue urgency) and align on decision principles.
- **Rubric weight controls with presets:** Helps different org contexts (seed-stage vs enterprise) reflect their real constraint hierarchy while keeping scoring transparent.
