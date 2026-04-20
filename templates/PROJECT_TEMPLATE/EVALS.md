<!-- GENERATOR INSTRUCTIONS
     Only use this file if the project has an AI layer or is an experiment with
     a measurable success hypothesis. Delete it for static tools with no model output.
     Delete all HTML comments before publishing.
     The evals/ai-output-rubric/ skill in pm-ai-skills is the reference for quality dimensions.
-->

# Evals — [Project Name]

**Last updated:** YYYY-MM-DD

---

## Evaluation Philosophy

<!-- One paragraph. What does "this works" mean for this specific build?
     Frame it in terms of the user outcome, not the model output.
     Example: "This works if a support agent can use the generated draft with zero or
     one edit 80% of the time. Raw factual accuracy is not the bar — usability is."
-->

[Define what "working" means for this build. Tie it to a user action or outcome, not a model metric.]

---

## Quality Dimensions Evaluated

<!-- Check each dimension that applies. Add a one-liner for what "good" looks like here.
     Delete rows that don't apply.
-->

| Dimension | What "good" looks like in this build | Applies? |
|-----------|--------------------------------------|----------|
| Relevance | Output directly addresses the user input without drift | ☐ Yes / ☐ No |
| Groundedness | Claims are traceable to the input context, not hallucinated | ☐ Yes / ☐ No |
| Format adherence | Output matches the specified structure or schema | ☐ Yes / ☐ No |
| Completeness | Output covers the required elements without gaps | ☐ Yes / ☐ No |
| Concision | Output is no longer than the task requires | ☐ Yes / ☐ No |
| Actionability | Output produces a clear next action for the user | ☐ Yes / ☐ No |
| Safety | Output does not surface harmful or inappropriate content | ☐ Yes / ☐ No |
| [Custom dimension] | [What good looks like] | ☐ Yes / ☐ No |

---

## Offline Eval (Pre-Ship)

<!-- Test cases run before the build was published or used with real users.
     Minimum 5 cases for any AI build that goes public.
     Include the input, expected output (or expected output shape), actual output, and pass/fail.
     This section can be a table or a numbered list — pick whatever fits.
-->

### Test Cases

| # | Input | Expected | Actual | Pass? |
|---|-------|----------|--------|-------|
| 1 | [Input] | [Expected output or behavior] | [What happened] | ✓ / ✗ |
| 2 | [Input] | [Expected] | [Actual] | ✓ / ✗ |
| 3 | [Input] | [Expected] | [Actual] | ✓ / ✗ |
| 4 | [Edge case] | [Expected] | [Actual] | ✓ / ✗ |
| 5 | [Failure case] | [Expected] | [Actual] | ✓ / ✗ |

### Offline Summary

**Pass rate:** [X / 5]
**Key finding:** [What the offline eval revealed — one sentence.]
**Blockers to ship:** [What failed and whether it was fixed, deferred, or accepted as a known gap.]

---

## Online Eval (Post-Ship / User Behavior)

<!-- Signals observable once real users interact with the build.
     For prototypes: describe what you would measure if this went to production.
     For shipped tools: report what actually happened.
     Delete rows that don't apply.
-->

| Signal | Target | Actual / Proxy |
|--------|--------|----------------|
| Acceptance rate (user took the output with no or minor edit) | [Target %] | [Actual or "not yet measured"] |
| Edit rate (significant changes before use) | [Target %] | [Actual or "not yet measured"] |
| Rejection rate (user discarded output entirely) | [Target %] | [Actual or "not yet measured"] |
| Time to complete task vs. baseline | [Target reduction] | [Actual or "not yet measured"] |
| [Custom signal] | [Target] | [Actual] |

---

## Failure Analysis

<!-- Document specific output failures encountered during testing or use.
     Not hypothetical risks — actual failures you observed.
     Each row: what the input was, what went wrong, and what the fix or accepted risk is.
-->

| Failure | Input that triggered it | Root cause | Fix or accepted risk |
|---------|------------------------|------------|----------------------|
| [Failure type] | [Input] | [Why it happened] | [What was done or why it was accepted] |
| [Failure type] | [Input] | [Why it happened] | [Fix or accepted risk] |

---

## Eval Conclusion

<!-- One paragraph. Given the offline and online results, what is your verdict?
     Is this ready to publish, ready for limited use, or needs iteration?
     Name one thing you would change in V2 based specifically on eval findings.
-->

[Overall verdict on the build quality. What evals showed, and what V2 would fix first.]
