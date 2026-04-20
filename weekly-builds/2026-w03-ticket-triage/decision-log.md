# Decision Log — Support Ticket Triage

**Last updated:** 2026-04-20

---

## What This Project Optimized For

- Routing accuracy over generation quality — the output is a classification object, not prose. At the cost of: a less human-readable output that requires downstream tooling to be useful.
- Controlled schema compatibility with W02 — KB topic uses the exact vocabulary from the W02 retrieval layer. At the cost of: flexibility to capture ticket types outside the vocabulary (remapped to `other`).
- Prompt determinism over flexibility — `temperature: 0` and `response_format: json_object` produce consistent, machine-parseable output. At the cost of: any nuance that might come from sampling.

---

## What Was Intentionally Left Out

| Cut Item | Reason |
|----------|--------|
| Confidence score on classifications | Requires calibration data to be useful; adds output complexity without a validated use case in V1 |
| Batch ticket processing | Single-ticket scope is enough to validate the triage signal; batch adds file I/O complexity without changing the core prompt |
| Draft response generation | That is W04's scope — generating KB-grounded responses belongs in the generation layer, not the routing layer |
| Web UI | CLI is the right interface for a prototype feeding into a pipeline; a UI would add frontend scope without improving the routing logic |

---

## Major Product Trade-offs

**Controlled vocabulary vs. free-text KB topic**
Chose controlled vocabulary over free-text. Controlled vocabulary means novel ticket types fall into `other` instead of a precise topic. Free-text would let the model describe any topic, but the W02 retrieval layer expects category-name strings matching its index — a mismatch breaks the pipeline silently. Went with controlled vocabulary because a known gap (`other` remapping) is easier to monitor and fix than a silent retrieval failure.

**Urgency bias-high rule for ambiguous signals**
Chose to state the bias-high rule explicitly in the prompt rather than leaving urgency scoring to the model's defaults. This means some routine tickets will be over-scored. That is a better failure mode than under-scoring a P4/P5 ticket that sits in the wrong queue. The asymmetry is intentional: false positives are visible and correctable; false negatives on escalation-worthy tickets are not.

**Single model call vs. multi-step classification**
Chose to classify all four fields (urgency, category, kb_topic, summary) in one call rather than separate calls per field. Simpler to implement and test, and the fields are tightly coupled — urgency is partially informed by category. The trade-off is that all fields degrade together if the prompt is off. Acceptable for a prototype; a multi-step approach would make sense if fields needed independent retry logic.

---

## Design Choices Made

- **JSON schema in system prompt alongside `response_format: json_object`:** Removes ambiguity about field names and types without relying solely on the API parameter. Both enforcements together are more reliable than either alone.
- **Category definitions added in v2:** Initial v1 prompt omitted explicit category boundaries. TC3 failed — UI bug classified as `technical` instead of `product`. Adding one-line definitions resolved the ambiguity without changing the output schema.
- **Summary length cap at 20 words:** Long enough to convey the ticket situation; short enough for an agent to read at a glance without re-engaging with the original ticket. Validated against all five test cases.

---

## Technical Shortcuts or Constraints

- **No retry logic on API call:** A failed API request exits with code 1. Acceptable for a prototype; production use would need retry with backoff.
- **`other` fallback for out-of-vocabulary KB topics:** Swallows classification signal silently. A future version should log these as a vocabulary expansion signal rather than discarding them.
- **No `.env.example` documentation in README:** `.env.example` exists in the repo root but is not documented inline. New contributors need to know to create a `.env` from it with `OPENAI_API_KEY`.

---

## Publish Recommendation

**Recommendation:** `Hold`

The code and prompt are prototype-quality and 5/5 offline evals pass. Holding on publish until a terminal capture screenshot is added (the portfolio standard requires at least one visual) and the manifest is fully populated. No functional blockers — this is a documentation gap only.

---

## What a V2 Would Include

- **Confidence signal:** Return a confidence field (low/medium/high) alongside each classification so that uncertain triage outputs can be flagged for human review rather than auto-routed. Deferred because calibration requires a labeled dataset.
- **W02 pipeline integration:** Pipe triage output directly into the W02 retrieval step and return the top KB article alongside the triage brief. Deferred — each weekly build is a discrete prototype; pipeline integration is a W04+ concern.
- **Batch processing:** Accept a JSONL file of tickets and output a JSONL file of triage results. Deferred — single-ticket scope was sufficient to validate the classification logic.
- **Online accuracy measurement:** Compare model classifications against support agent labels on real tickets to measure category accuracy and urgency score deviation. Deferred — no production traffic yet.
