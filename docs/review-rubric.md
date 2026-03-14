# Project Review Rubric

Use this before merging a generated project from a branch into `main`.
Score each category 1–5 using the anchors below. Total the score. Apply the threshold.

This is a judgment tool, not a checklist. The scores are inputs to a decision, not the decision itself.

---

## Scoring Categories

### 1. Originality

Does this project address a problem in a way that isn't immediately obvious? Is the angle on the problem or the solution shape interesting enough to make someone think "I haven't seen that before"?

| Score | Anchor |
|-------|--------|
| 1 | Indistinguishable from the first Google result for the problem. Could be a Notion template or a well-written ChatGPT prompt. |
| 2 | Recognizable format (paste-and-process, scored output) with nothing distinctive about the problem selection or framing. |
| 3 | Addresses a real problem in a reasonable way. Nothing wrong with it, but nothing surprising either. |
| 4 | Either the problem selection is sharp and underserved, or the solution shape is genuinely different from how others have approached it. |
| 5 | You'd share this with someone specifically because of the angle. The framing itself teaches something. |

---

### 2. Usefulness

Would a real person with the stated target persona actually reach for this in their workflow? Not "could someone use it" — "would they?"

| Score | Anchor |
|-------|--------|
| 1 | Addresses a problem that doesn't actually exist or is solved adequately by existing tools the target persona already has. |
| 2 | Addresses a real problem but requires more setup or behavior change than the value warrants. |
| 3 | Useful for the stated persona in the stated scenario. Would get used once or twice before being forgotten. |
| 4 | Solves a recurring pain with enough specificity that the persona would return to it. Saves meaningful time or avoids a known mistake. |
| 5 | The kind of tool you immediately want to add to a team's shared toolbox. Fills a specific gap no existing tool covers well. |

---

### 3. Polish

Does the project feel finished within its stated scope? Polish doesn't mean perfect — it means intentional. A simple tool can be polished. A complex tool can be unpolished.

| Score | Anchor |
|-------|--------|
| 1 | Broken, visually incoherent, or clearly unfinished. Demo state has placeholder data or blank outputs. |
| 2 | Runs, but rough edges are visible throughout: inconsistent spacing, unstyled error states, no loading feedback, sample data is obviously fake. |
| 3 | Works correctly. Looks like someone built it with care. No obvious embarrassments. |
| 4 | Tight. The scope was well-chosen and the execution fills that scope cleanly. Output formatting is considered. Edge cases are handled or explicitly noted. |
| 5 | Looks like it could ship. Every surface the user touches has been thought about. The constraints are features, not apologies. |

---

### 4. Visual Distinctiveness

Does this look like a considered design choice, or like the default output of whatever framework was used? The style should feel deliberate — not necessarily beautiful, but chosen.

| Score | Anchor |
|-------|--------|
| 1 | Unstyled HTML or default framework styles. No visible design decisions were made. |
| 2 | Styled, but the style is generic — could be any SaaS tool from the last five years. Nothing distinguishes it visually. |
| 3 | Clearly follows a visual direction. The style is consistent even if not distinctive. |
| 4 | The visual identity is recognizable and intentional. You could describe the style in a sentence and someone could picture it. |
| 5 | The visual style reinforces the product's purpose. A dense analyst tool looks dense. An editorial tool looks editorial. Style and function are aligned. |

*Reference: the `style_direction` field in `manifest.json` should tell you what the target was. Score against that intent.*

---

### 5. PM Clarity

Is the thinking visible? Can you read the README and decision log and understand what the PM considered, what was chosen, and why? This category scores the artifact's intellectual honesty, not its prose quality.

| Score | Anchor |
|-------|--------|
| 1 | The README describes what the tool does but not why it exists. No decisions are documented. |
| 2 | There's a problem statement but it's generic. Decision log exists but entries are shallow ("chose React because it's popular"). |
| 3 | Problem is specific. At least two genuine decisions are documented with real alternatives and reasoning. |
| 4 | The "What Was Left Out" section reveals deliberate scope thinking. The decision log shows a PM who understood the trade-offs at the time of building. |
| 5 | Reading the project documentation teaches you something about the problem space. The reasoning is tight enough that you'd want to argue with some of it. |

---

### 6. Demo-Worthiness

Could you pull this up in a 30-second screen share and have it make a clear impression? This is not about whether it's impressive — it's about whether it communicates quickly and clearly.

| Score | Anchor |
|-------|--------|
| 1 | Requires lengthy explanation before anything makes sense. No screenshot. Output is a wall of text. |
| 2 | The tool is understandable once explained, but doesn't communicate on its own. |
| 3 | You could show it and someone would understand what it does within 15 seconds. |
| 4 | Visually clear. The demo state (sample data, output structure) immediately shows the value. A non-technical viewer gets it. |
| 5 | You'd want to include this in a portfolio without qualification. The screenshot alone carries the story. |

---

## Scoring Summary

| Category | Score (1–5) |
|----------|-------------|
| Originality | |
| Usefulness | |
| Polish | |
| Visual Distinctiveness | |
| PM Clarity | |
| Demo-Worthiness | |
| **Total** | **/30** |

---

## Publish Threshold

| Score | Recommendation |
|-------|----------------|
| 24–30 | **Publish.** Strong work. Merge to `/projects`. |
| 18–23 | **Publish with reservations.** Acceptable if no single category scored below 2. Note what's weak in the decision log. |
| 12–17 | **Hold.** Identify the lowest-scoring categories and fix them before publishing. Move to `/scratch` in the meantime. |
| Below 12 | **Scratch.** Ship to `/scratch`. Document what failed so the concept isn't abandoned — just the current execution. |

**Hard overrides — scratch regardless of total score:**

- Any category scores a 1
- The tool does not run from a clean clone
- The demo state contains placeholder text or obviously fake data
- The problem statement is generic enough to apply to 10 different tools

---

## Reasons to Send to /scratch

Route to `/scratch` instead of `/projects` if any of the following are true. These are not recoverable with a quick fix.

**Conceptual:**
- The problem is real but the tool doesn't actually solve it — it describes the problem in output form
- The target persona would never use this interface to solve this problem (wrong form factor, wrong context)
- The concept duplicates something already in `/projects` without adding a meaningfully different angle

**Execution:**
- The source code has logic errors that produce wrong output on the stated use case
- The tool requires a backend, API key, or service that isn't documented or set up
- The design doesn't follow the declared `style_direction` and looks like no style was chosen at all

**Documentation:**
- The decision log entries are post-hoc rationalizations rather than real decisions ("I chose to keep it simple" is not a decision)
- The README "Why This Exists" section could have been written by someone who never tried to solve the problem
- "What Was Left Out" is absent or contains only one item with no stated reason

**Signal:**
- You feel uncertain whether you'd show this to a PM you respect
- You're tempted to add a caveat when describing the project out loud

If you route something to `/scratch`, update `manifest.json`:
```json
"status": "draft",
"publish_recommendation": "scratch"
```
And add one entry to the decision log explaining what specifically blocked publication and what would change it.

---

## Signs a Project Feels "Too AI-Generated"

These are patterns that signal the content was produced without real product judgment — regardless of what tool generated it. They erode the portfolio's credibility faster than a mediocre project would.

**In the README:**
- The problem statement uses phrases like "teams often struggle with" or "many organizations face challenges around" — corporate filler that doesn't name a specific failure mode
- "What Was Left Out" lists things that were obviously never considered, not things that were considered and cut
- The opening sentence of any section restates the section heading ("The goal of this project is to...")
- The tech stack justification says something was chosen because it is "powerful," "flexible," or "widely used"
- Future enhancements are aspirational rather than specific ("add AI-powered insights," "support more platforms")

**In the decision log:**
- Every decision has three alternatives that are strawmen — obviously worse, never seriously considered
- The "why this" reasoning matches the decision so perfectly it reads like it was written after the decision was made
- No decision acknowledges a genuine cost or downside of the path chosen

**In the tool itself:**
- Sample data uses full names (`John Smith`, `Acme Corp`, `example@company.com`), sequential numbers (`Item 1`, `Item 2`, `Item 3`), or lorem ipsum
- Output sections are padded to feel complete: "Summary," "Key Insights," "Recommendations," "Next Steps" — a structure optimized for looking thorough rather than being useful
- Buttons are labeled "Analyze," "Generate," or "Submit" with no specificity about what will happen
- The tool outputs confident-sounding text for any input, including nonsense input, without degrading gracefully
- Every output section has exactly the same amount of content regardless of the input

**In the design:**
- The color palette is indigo-on-white with no variation or reason
- Card shadows are identical across all elements regardless of elevation or importance
- The empty state has a centered illustration and an encouraging headline ("Let's get started!")
- Icon choices are decorative rather than functional — present on every label, meaningless on most

**The overall smell test:**
If you read the README and decision log and cannot identify a single moment where the author changed their mind, pushed back on the obvious answer, or acknowledged a real constraint — the project was probably generated without reflection and reviewed without rigor.

A good generated project should be indistinguishable from a project a thoughtful person built with assistance. The tells listed above are not about AI — they're about the absence of editorial judgment applied to AI output.
