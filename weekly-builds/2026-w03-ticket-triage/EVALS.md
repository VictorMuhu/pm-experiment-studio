# Evals — Support Ticket Triage

**Last updated:** 2026-04-13

---

## Evaluation Philosophy

This works if the triage output is usable by a support agent without re-reading the ticket. The bar is routing accuracy, not prose quality. A correct category + plausible urgency + valid KB topic means the agent can act. A wrong category or a missed P4/P5 urgency means the ticket goes to the wrong queue or sits too long. That is the failure mode this eval is designed to catch.

---

## Quality Dimensions Evaluated

| Dimension | What "good" looks like in this build | Applies? |
|-----------|--------------------------------------|----------|
| Relevance | Category and KB topic match the ticket content | Yes |
| Groundedness | Urgency score is traceable to signals in the ticket, not assumed | Yes |
| Format adherence | Output is valid JSON with all four required fields | Yes |
| Completeness | All four fields present — urgency, category, kb_topic, summary | Yes |
| Concision | Summary is under 20 words | Yes |
| Actionability | Agent can route the ticket without reading the original | Yes |
| Safety | No — not a risk surface for this task type | No |

---

## Offline Eval (Pre-Ship)

### Test Cases

| # | Input summary | Expected | Actual | Pass? |
|---|--------------|----------|--------|-------|
| TC1 | Duplicate billing charge, order number provided | category: billing, urgency: 3–4, kb: billing-refund | category: billing, urgency: 4, kb: billing-refund | ✓ |
| TC2 | Account locked, client demo in 30 min | category: account, urgency: 4–5, kb: account-access | category: account, urgency: 5, kb: account-access | ✓ |
| TC3 | CSV export button broken in two browsers | category: product, urgency: 2–4, kb: product-* | category: product, urgency: 4, kb: product-bug | ✓ (fixed in v2) |
| TC4 | Webhook firing 70% of the time, cause unknown | category: technical, urgency: 3–5 (ambiguous → bias high) | category: technical, urgency: 4, kb: technical-integration | ✓ |
| TC5 | General question about JSON export, not urgent | category: product, urgency: 1–2 | category: product, urgency: 1, kb: product-feature-request | ✓ |

### Offline Summary

**Pass rate:** 5 / 5 (after one prompt iteration)
**Key finding:** Without explicit category definitions, the model classified a UI bug (TC3) as `technical` instead of `product`. Adding one-line boundary definitions in the system prompt resolved the issue without changing the output schema.
**Blockers to ship:** None. TC3 failure was fixed in v2 before the 5/5 run.

---

## Online Eval (Post-Ship / User Behavior)

| Signal | Target | Actual / Proxy |
|--------|--------|----------------|
| Category accuracy vs. human label | ≥ 90% match | Not yet measured — prototype only |
| Urgency score within ±1 of human label | ≥ 85% | Not yet measured |
| KB topic usable by W02 retrieval layer | 100% in vocabulary | Enforced in code — `other` fallback if out of vocab |
| Agent routes without re-reading ticket | Qualitative target | Not yet measured |

---

## Failure Analysis

| Failure | Input that triggered it | Root cause | Fix or accepted risk |
|---------|------------------------|------------|----------------------|
| `technical` returned instead of `product` for a UI bug | "CSV export button doesn't do anything" | Prompt had no explicit boundary between product (UI) and technical (API/integration) | Fixed in v2: added one-line category definitions to system prompt |
| `kb_topic` could return out-of-vocabulary value | Any ticket with an unusual issue type | Model not strictly constrained to enum at inference time | Accepted: code validates and remaps to `other`. Logged as signal for KB vocabulary expansion. |

---

## Eval Conclusion

The build is prototype-ready. 5/5 offline test cases pass after one prompt iteration. The single failure (TC3 category misclassification) revealed a genuine ambiguity in the category taxonomy that would have caused routing errors in production — catching it pre-ship is the point of running evals. V2 would add a confidence signal to the output so that low-confidence classifications can be flagged for human review rather than auto-routed.
