# Notes — 2026-W04

## What I Am Testing This Week

Whether a rubric-based LLM evaluator produces consistent, useful scores across a range of response quality levels — specifically, whether it reliably distinguishes a strong, grounded response from a plausible-sounding but weak one.

The hypothesis: a single LLM call with a structured rubric prompt and `response_format: json_object` will produce stable, differentiated scores across the four dimensions (relevance, groundedness, completeness, actionability) without requiring few-shot examples or complex prompting.

This week is entirely evaluation. No generation, no retrieval changes. Just: does the evaluator produce meaningful scores for responses that are clearly good, partially weak, and clearly bad?

---

## What Failure Modes I Am Watching For

**Over-scoring fluent but weak responses.** The most common failure mode in rubric-based LLM evaluation: a response that sounds confident and well-formed scores 4s across the board even when it is not grounded in the retrieved context. If all three example cases score above 3.5 average, the rubric is not discriminating enough.

**Groundedness inflation.** If the model cannot reliably compare the response against the retrieved context (as opposed to general knowledge), groundedness scores will be unreliable. A response that invents plausible-sounding steps not in the KB should score 1-2 on groundedness, not 3-4.

**Tautological justifications.** Short justifications that describe the score ("This response is relevant because it addresses the ticket") rather than explaining it ("Response answers the login question but ignores the mentioned error code"). These are a prompt quality issue.

**Score collapse on the generic case.** The weak/generic response case should score noticeably lower on actionability and groundedness. If it scores similarly to the strong case, the rubric needs sharper definitions.

---

## What I Learned From the First Runs

- The evaluator correctly assigns the highest average to the strong response and the lowest to the generic one. The rubric discriminates as expected across the three quality levels.
- Groundedness is the most sensitive dimension. The partially grounded case (Case 2) scores lower on groundedness than on relevance — which is the right call, because the response addresses the right topic but introduces steps not present in the KB.
- The generic response (Case 3) scores lowest on actionability. A vague "we'll look into it" reply with no concrete steps correctly gets a 1-2, even though it sounds polite.
- Justifications are functional but lean descriptive. They identify what is missing but do not always cite the specific gap. Prompt iteration could improve this.

---

## Next Iteration Ideas

- **Add a confidence field to the output.** Low-confidence evaluations (where two dimensions diverge sharply, e.g., high relevance + low groundedness) could be flagged for human review rather than auto-used as a tuning signal.
- **Test with W02 real retrieval output.** All examples this week use hand-written retrieved context. Running the evaluator on actual W02 retrieval output would reveal whether retrieval quality affects evaluation consistency.
- **Try stricter groundedness wording.** Current prompt instructs the model to check if the response is "based on the retrieved context." Testing a stricter version ("only information explicitly present in the context below is permitted") may reduce groundedness inflation.
- **Add a pass/fail threshold.** Rather than reporting raw scores, define a minimum acceptable average (e.g., 3.5) and return a `passes: true/false` field. This turns evaluation output into a routing signal — responses below threshold get escalated rather than sent.
- **Batch evaluation runner.** Run all three example cases in sequence and print a comparison table. Useful for prompt iteration and regression testing.
