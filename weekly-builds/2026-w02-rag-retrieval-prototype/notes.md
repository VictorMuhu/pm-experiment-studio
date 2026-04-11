# Notes — 2026-W02

## What I Am Testing This Week

Whether embedding-based retrieval on a small, well-structured knowledge base produces semantically meaningful results without any tuning.

The hypothesis: for a support KB with clear, topic-specific articles, off-the-shelf embeddings (`text-embedding-3-small`) plus cosine similarity search will surface the right KB entries for a given ticket — without keyword overlap — reliably enough to be a useful foundation for a generation layer.

This week is entirely retrieval. No response generation. No agent logic. Just: does the right KB entry come back for a given ticket?

---

## Open Questions

- How much does embedding title + content together actually help vs. content alone? Worth running a controlled comparison before W03.
- Is top-K = 3 the right default, or does the generation layer need more or fewer entries? Should be validated once the response layer is added in W03.
- What happens to retrieval quality as the KB grows? At 8 entries it is easy to eyeball correctness. At 80, formal evaluation is needed.
- Should distance scores be normalised before being passed to a generation layer, or passed as-is so the LLM can reason about confidence?
- Is there a case where a ticket is genuinely ambiguous — could match two equally relevant KB entries — and what should the system do in that case?
- Should ingestion be triggered automatically when the KB changes, or kept as a manual step? Manual is fine for now but will become a friction point in Month 2.
- At what point does a local Chroma store need to become a hosted vector DB? Probably when the KB exceeds a few hundred entries or when multiple systems need to share the index.

---

## Next Iteration Ideas

- Add a formal eval pass: for each of the 5 sample tickets, manually label the correct KB entry and measure whether retrieval returns it in top-3
- Try embedding content-only vs. title + content to quantify the difference
- Add a `metadata` block to the printed output showing query used, model, and distances — useful for debugging when the generation layer is added
- Explore chunking: for longer KB articles, does splitting into paragraphs improve retrieval over full-article embedding?
- Move the Chroma path and model name to a shared `config.py` so `ingest_kb.py` and `retrieve_context.py` do not need to be updated separately
- Test retrieval on edge cases: vague tickets ("it's not working"), frustrated tickets with no specifics, and tickets that span multiple KB categories
- Consider adding a simple re-ranking step after retrieval — cross-encoder or LLM-based — to catch cases where cosine similarity returns a close but wrong result
