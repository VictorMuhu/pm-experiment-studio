<!-- GENERATOR INSTRUCTIONS
     Fill each section honestly. Short answers beat padded ones.
     If a section doesn't apply, write one sentence explaining why rather than leaving it blank.
     Delete all HTML comments before publishing.
     This file is for contributors and reviewers — not for the public README.
-->

# Decision Log — [Project Name]

**Last updated:** YYYY-MM-DD

---

## What This Project Optimized For

<!-- One to three things. Be specific about the trade-off implied by each choice.
     "Optimized for X" only means something if it implies "at the cost of Y."
     Example:
     - Speed of output over output completeness — the tool returns a fast, structured result
       rather than a thorough one that requires more user input.
     - Zero-install usability — runs as a static HTML file so there's no setup barrier,
       at the cost of not being able to persist user data between sessions.
     - Readability of output over raw accuracy — results are categorized and labeled for
       a non-technical reader, not optimized for precision.
-->

- [What this optimized for] — at the cost of [what was traded away]
- [What this optimized for] — at the cost of [what was traded away]
- [What this optimized for — optional]

---

## What Was Intentionally Left Out

<!-- List the features or scope items that were considered and cut.
     Each item needs a reason. "Out of scope" is not a reason.
     If it was cut because it would have taken too long: say that.
     If it was cut because it would have changed the target persona: say that.
     If it was cut because the core use case doesn't need it: say that.
-->

| Cut Item | Reason |
|----------|--------|
| [Feature or capability] | [Why it was cut — be specific] |
| [Feature or capability] | [Why it was cut] |
| [Feature or capability] | [Why it was cut] |

---

## Major Product Trade-offs

<!-- 2–4 trade-offs that shaped the project in a meaningful way.
     A trade-off has two real sides — if there was no genuine downside to the choice made,
     it wasn't a trade-off.
     Format: what was chosen, what was given up, why the choice was correct given the constraints.
-->

**[Trade-off 1 title]**
Chose [A] over [B]. [A] means [consequence]. [B] would have meant [other consequence].
Went with [A] because [specific reason tied to persona, use case, or constraint].

**[Trade-off 2 title]**
Chose [A] over [B]. [Reasoning as above.]

**[Trade-off 3 title — optional]**
Chose [A] over [B]. [Reasoning as above.]

---

## Design Choices Made

<!-- Decisions about UX, layout, output structure, or interaction model.
     Only log choices that were non-obvious or had a real alternative.
     Skip choices that had only one reasonable option.
-->

- **[Choice]:** [What was decided and why. One to two sentences.]
- **[Choice]:** [What was decided and why.]
- **[Choice]:** [What was decided and why.]

---

## Technical Shortcuts or Constraints

<!-- Be honest about what was hacked, skipped, or constrained by time or environment.
     This section is not for apologies — it's for accurate documentation so a future
     contributor knows what they're working with.
     Examples of what belongs here:
     - "No error handling on the API call — a failed request shows nothing to the user."
     - "CSS is inline for portability; would need a build step to split into a stylesheet."
     - "LLM output is not validated — malformed JSON from the API will break the renderer."
-->

- **[Shortcut or constraint]:** [What it is and what the implication is for a future contributor.]
- **[Shortcut or constraint]:** [What it is and what the implication is.]
- **[Shortcut or constraint — optional]:** [What it is.]

---

## Publish Recommendation

<!-- A direct judgment call: should this go to /projects or stay in /scratch?
     Pick one: Publish / Hold / Scratch.
     Then write 2–4 sentences explaining the call.
     If Publish: what clears the bar.
     If Hold: what specific thing needs to change before it's ready.
     If Scratch: what the hard fail is.
-->

**Recommendation:** `Publish` | `Hold` | `Scratch`

[Reason for the recommendation. If Hold or Scratch, name the specific thing blocking publication.]

---

## What a V2 Would Include

<!-- 3–5 items. Concrete, not aspirational.
     Each item should be specific enough that a developer could scope it.
     Include why it wasn't in V1 — usually complexity, validation needed, or out of scope for the prototype.
-->

- **[Feature]:** [What it does and why it was deferred from V1.]
- **[Feature]:** [What it does and why it was deferred.]
- **[Feature]:** [What it does and why it was deferred.]
- **[Feature — optional]:** [What it does and why it was deferred.]
