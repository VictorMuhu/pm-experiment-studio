# Decision Log — Fix Verification Run

**Last updated:** 2026-03-16

---

## What This Project Optimized For

- Diagnosability of truncation/quality regressions — at the cost of not being a general-purpose generator
- Repeatability (same inputs, same checks) — at the cost of reduced configurability and personalization
- “Publishable artifact” fidelity (real README/manifest/decision log) — at the cost of higher baseline verbosity and complexity

---

## What Was Intentionally Left Out

| Cut Item | Reason |
|----------|--------|
| Live LLM calls and prompt experimentation UI | The experiment’s failure mode is output packaging and budget behavior; adding a model introduces variance and key management that obscures the signal |
| Saving run history or exporting zip bundles | Persistence and packaging add complexity; copy-out of three files is sufficient to validate the core hypothesis |
| Multiple style selection in V1 | The request is specifically to verify the retro-future directive; sweeping styles is a V2 once the harness is stable |

---

## Major Product Trade-offs

**Single-shot output vs resilient chunking**
Chose to support both a single-shot run and a chunked run. Single-shot means you detect the true “can we do it in one response?” constraint. Chunking would have meant fewer failures but less fidelity to the 8192-token risk. Went with both because the tool needs to both expose the problem and demonstrate a mitigation path.

**Heuristic richness checks vs semantic correctness**
Chose structural and density heuristics (required headings, minimum section length, banned-generic-phrases scan) over semantic evaluation. Heuristics mean some false positives/negatives. Semantic scoring would have meant LLM-based grading, which reintroduces token/cost variability. Went with heuristics because the goal is early warning on truncation and placeholder-y output, not “is this the best possible copy.”

**Local runner vs hosted service**
Chose a local Node runner + lightweight UI over a hosted app. Local means no deployment friction and easy repo integration, but it gives up shareable links and multi-user usage. Went local because the target persona is a repo maintainer validating changes, not an end-user product.

---

## Design Choices Made

- **Results-first hierarchy:** The output view leads with pass/fail, token margin, and completeness before showing the file contents, because the primary task is verification, not editing.
- **File-level cards (README/manifest/decision log):** Outputs are separated into three explicit artifacts with their own checks, because truncation often manifests as “one file is fine, another is cut.”
- **Locked retro-future style:** The UI style is fixed to retro-future so any drift is attributable to implementation, not configuration.

---

## Technical Shortcuts or Constraints

- **Token estimation may be heuristic in V1:** If provider tokenizers aren’t used, estimates can be off; the harness should always report a safety margin assumption.
- **No snapshot/golden-file comparisons:** Without stored expected outputs, the tool detects structural regressions better than subtle copy regressions.
- **No localization or accessibility audits in V1:** UI is functional and styled, but full a11y testing is deferred to keep focus on the generation-validation loop.

---

## Publish Recommendation

**Recommendation:** `Publish`

The concept is specific, testable, and repo-relevant: it verifies a real failure mode (silent truncation/genericization) with measurable checks and produces a clear “pass/fail + diagnostics” outcome. It’s complex enough to be portfolio-worthy without depending on external APIs. Before publishing, the only gating item would be adding a real screenshot from a run with realistic dense content.

---

## What a V2 Would Include

- **CI integration:** Add a GitHub Action that runs the pack and fails when required sections or richness thresholds regress; deferred because it changes repo-wide workflows.
- **Style sweep runner:** Iterate the same pack across all styles to catch style-specific verbosity or component drift; deferred due to expanded scope and runtime.
- **Golden output diffs:** Store canonical outputs and show diffs to pinpoint changes; deferred because it introduces snapshot management overhead.
- **Provider tokenizers:** Plug in model-specific token counting to replace heuristics; deferred because it adds vendor coupling and dependency weight.
