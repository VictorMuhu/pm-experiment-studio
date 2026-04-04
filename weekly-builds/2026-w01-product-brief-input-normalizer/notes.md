# Notes — 2026-W01

## What I Am Testing This Week

Whether a simple, schema-enforced normalization layer is enough to make messy product inputs usable for AI synthesis.

The hypothesis: the hardest part of building the Product Brief Generator is not the AI call — it is getting the inputs into a consistent enough shape that the AI has something reliable to reason over. If I can lock that down deterministically, the synthesis layer becomes dramatically simpler.

This week focuses entirely on the normalization step, not the AI step.

---

## Open Questions

- Should severity be enum-enforced at ingest or left flexible for now?
- Is the three-category split (signals, metrics, experiments) the right one, or will there be a fourth input type I am not anticipating?
- Where does qualitative data that does not fit neatly into any of the three categories go? (e.g. competitive intel, stakeholder comments)
- At what point does normalization become complex enough to warrant a schema validation library rather than raw Python?
- Should the output file include metadata — timestamp, source file names, record counts — to make downstream debugging easier?

---

## Next Iteration Ideas

- Add a validation pass that checks required fields before writing output (fail loudly instead of silently)
- Add a `metadata` block to the output with run timestamp and input record counts
- Explore whether a fourth input type is needed: `strategic_context` (OKRs, product bets, company priorities)
- Try running the normalized output through a simple summarization prompt to see if Phase 2 is as straightforward as expected
- Consider making the schema a separate JSON Schema file in `schemas/` so it can be reused across the project
