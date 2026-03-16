# Decision Log — Decision Log Gate Test

**Last updated:** 2026-03-16

---

## What This Project Optimized For

- Fast, defensible routing decisions (Publish vs. Scratch) — at the cost of nuance, because the primary user needs a quick gate more than a perfect assessment.
- Deterministic, repeatable results — at the cost of “smart” interpretation, because an LLM-based judge would vary across runs and require API keys.
- Actionable feedback a contributor can fix in one pass — at the cost of completeness, because the tool focuses on the most common decision-log failures rather than grading writing quality broadly.

---

## What Was Intentionally Left Out

| Cut Item | Reason |
|----------|--------|
| LLM-based semantic evaluation (“does this trade-off make sense?”) | Would require keys, introduce nondeterminism, and shift the tool from a gate to an opinionated reviewer. |
| Repo scanning / bulk analysis of all decision logs | Requires file-system access (or a build step) and increases scope beyond the core paste-and-check workflow. |
| Auto-rewriting or generating better decision logs | Risks becoming a “write my decision log” tool rather than enforcing a standard of real product thinking and ownership. |
| Scoring code quality or README quality | The explicit purpose is the decision-log gate; bundling other checks would dilute the signal and create a sprawling “PR grader.” |

---

## Major Product Trade-offs

**Deterministic heuristics vs. model judgment**
Chose a rules/heuristics rubric over an LLM judge. Heuristics mean consistent outcomes and no dependency on external services. An LLM would likely catch more subtle fluff, but would also be harder to calibrate, harder to reproduce, and would fail in offline or no-key environments. Went with heuristics because the persona needs consistency and low friction more than maximum recall.

**Binary routing recommendation vs. detailed scoring report**
Chose an explicit “Publish / Scratch” verdict with blocking reasons over a long analytics report. The verdict forces clarity for reviewers and contributors. A detailed report could be more “objective,” but it invites debate over points instead of rewriting the content. Went with the verdict because the workflow is fundamentally a gate.

**Hard fails for template markers vs. “just lower the score”**
Chose to treat bracket placeholders and instruction text as automatic blockers. Making them just a penalty could allow a technically passing score with obvious template leftovers, which is exactly the failure mode this tool is designed to prevent. Went with hard fails because those markers signal the content is not reviewable yet.

**Stateless tool vs. saving history**
Chose no persistence by default. Saving history would help maintainers track improvements over time, but it introduces privacy concerns (decision logs can contain internal info) and adds complexity. Went stateless because the primary use case is quick, one-off checks.

---

## Design Choices Made

The UI uses `dense-analyst-console` because the primary user behaves like an internal reviewer: they want compact information density, clear hierarchy, and minimal decoration. The style supports a “console” feel where the output reads like a gate report rather than a consumer app.

- **Results structured as “Verdict → Blocking issues → Soft signals → Fix list”:** This order mirrors reviewer workflow: decide first, then justify, then coach. An alternative was a score-first dashboard; rejected because it encourages arguing about the number rather than fixing the content.
- **Show exact matched snippets for failures (e.g., the placeholder token found):** This reduces ambiguity and makes feedback copy/pasteable into PR comments. The alternative was generic error messages; rejected because contributors often don’t know what triggered the fail.
- **One primary action (“Run Gate”) with optional example loader:** Keeps the interaction lightweight for maintainers while still making the tool demonstrable with realistic bad/good samples. The alternative was a multi-step wizard; rejected because gating should not feel like filling out a form.

---

## Technical Shortcuts or Constraints

- **Regex/keyword detection for “template-ness”:** This will miss some low-effort content that doesn’t use obvious markers, and it may flag edge cases where brackets are legitimately used. Cost: occasional false negatives/positives that require human judgment.
- **No markdown parsing into an AST:** The tool treats the input as plain text. Cost: it can’t reliably verify section presence by heading structure if the author formats creatively.
- **No persistence (no localStorage by default):** A page refresh loses the pasted content. Cost: slightly more friction for reviewers comparing multiple drafts in one session.

---

## Publish or Scratch — and Why

**Recommendation:** `Publish`

This meets the quality bar as a portfolio artifact because it has a specific failure mode, a crisp persona, and produces a structured, reviewer-ready output that changes a real workflow (routing + actionable feedback). It avoids the “prompt-wrapper” trap by being deterministic and rubric-based rather than generative. The main limitation is heuristic coverage, but that’s acceptable for a gate whose purpose is to catch the most common and most harmful template-content failures.

---

## What a V2 Would Include

- **Configurable rubric file (JSON/YAML):** Lets maintainers tune banned phrases, thresholds, and required signals per repo, improving fit for different standards.
- **Section-aware parsing:** Detects whether required sections exist and whether each has minimum specificity, helping contributors fix the right section instead of guessing.
- **Batch compare mode (two logs side-by-side):** Helps maintainers calibrate and explain standards by contrasting a “fails” log with a “passes” log and showing the deltas.
- **Optional local-only save slots:** Lets a reviewer store 3–5 drafts in the browser for comparison without introducing a backend, improving iteration speed during review.
