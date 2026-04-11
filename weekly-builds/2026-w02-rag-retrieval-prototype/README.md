# 2026-W02: RAG Retrieval Prototype

## Problem

Support agents answering tickets spend significant time searching a knowledge base manually. When that KB has dozens or hundreds of articles, finding the right one for a given ticket is slow and inconsistent. Two agents answering the same ticket may pull different sources, producing different quality responses.

Before a support copilot can draft grounded responses, it needs a reliable way to retrieve the right context automatically. Without this, any generation layer will hallucinate or produce generic answers that erode user trust.

## Why This Matters

This build is Phase 1 of the Customer Support Copilot — the retrieval foundation that every downstream step depends on.

Retrieval is not a detail. It is the first decision the system makes. If the wrong KB entries surface for a given ticket, the generation layer has no good material to reason from. Fixing bad retrieval after the fact means reworking the layer that everything else is built on.

Getting retrieval right first — before adding generation, tool calls, or agent orchestration — is the correct sequencing decision.

## Why AI

The core problem here is semantic matching, not keyword matching. A ticket that says "I can't get into my account" should match a KB article titled "Login Troubleshooting Guide" even though the words do not overlap. That requires embedding-based similarity search, not a `grep` or SQL `LIKE` query.

AI earns its place here specifically because the matching problem is semantic, not syntactic.

## Why Not a Simpler Approach

Keyword search (BM25, full-text search) fails when ticket language and KB language diverge — which happens constantly in real support environments. Users describe problems in their own words; KB articles are written by product or documentation teams. Embeddings bridge that gap.

A lookup table or rules-based router would require manually mapping every possible phrasing to a KB entry. That does not scale and breaks on edge cases.

## Why This Is a Workflow, Not an Agent

This build follows a fixed, deterministic sequence:

1. Load knowledge base entries from JSON
2. Embed each entry using OpenAI embeddings
3. Store embeddings in a local Chroma collection
4. Given a support ticket, embed the query
5. Retrieve the top-K most semantically similar KB entries
6. Print results

There is no decision-making at any step. The system does not choose which tool to call, does not plan a sequence of actions, and does not respond differently based on intermediate results. Every ticket follows the same path.

That is a workflow. An agent would decide how to act — this system just retrieves.

## Why Not Agents Yet

This problem has an enumerable flow. Given a ticket, find the most relevant KB entries. That is a single, well-defined operation with a clear input and output.

Retrieval quality is the bottleneck. If the embeddings and similarity search are not returning the right KB entries, adding an agent layer on top does not fix that — it hides it. The right move is to validate retrieval quality first, in isolation, before adding any layer that consumes its output.

Adding function calling or tool selection at this stage would introduce non-determinism before the foundation is proven. It would also make it harder to debug retrieval failures: is the agent choosing the wrong tool, or is the retrieval itself poor? Keeping this step simple and deterministic makes the failure surface narrow and observable.

Agent patterns belong in a later build, when retrieval is stable and the system needs to decide how to act on retrieved context — draft a response, escalate, ask a clarifying question, or route to a human.

## What I Built

A two-script retrieval pipeline:

- **`ingest_kb.py`** — loads the knowledge base, embeds each entry using `text-embedding-3-small`, and stores embeddings in a local Chroma collection
- **`retrieve_context.py`** — takes a query string, embeds it, queries Chroma for the top-K most similar KB entries, and returns results with titles, distances, and content
- **`run_demo.py`** — CLI demo that loads a sample support ticket, runs retrieval, and prints the results alongside a note on why retrieval quality matters

## Inputs

| File | Description |
|---|---|
| `examples/knowledge_base.json` | 8 fictional KB articles covering common support topics |
| `examples/support_tickets.json` | 5 fictional support tickets used to test retrieval |

## Output

Results are printed to stdout. Chroma stores the embedding index at `output/chroma_store/` after ingestion.

No generated responses are produced in this build. Output is retrieved context only.

## Data / Context Strategy

Knowledge base entries are embedded as `{title}\n\n{content}` to give the embedding model richer signal than content alone. Titles carry categorical meaning that helps the similarity search.

Support tickets are queried as `{subject} {body}` for the same reason — combining both fields gives the embedding a more complete picture of the user's problem.

Top-K is set to 3. This is a deliberate starting point: enough context for a generation layer to reason from without flooding the prompt. It should be tuned against real retrieval quality once tested on a broader set of tickets.

## Failure Modes

- **Missing `.env` or `OPENAI_API_KEY`** — script raises a readable error and stops; does not silently continue with no key
- **Knowledge base file missing** — `FileNotFoundError` raised with the expected path
- **Chroma collection not yet built** — `retrieve_context.py` will fail if `ingest_kb.py` has not been run first; error is surfaced directly
- **Ticket index out of range** — `run_demo.py` raises an `IndexError` with the available range
- **Embedding model deprecation** — model name is defined in one place per script; changing it requires updating two files (a future refactor should centralise this in a shared config)

## What I Learned

Retrieval quality is sensitive to how documents are prepared for embedding. Embedding title plus content together consistently outperformed content-only in informal testing — the title gives the model categorical context that the content body sometimes buries.

Distance scores from Chroma are not always intuitive. A lower distance means higher similarity, but the absolute values depend on the embedding model and data. Ranking by distance is more meaningful than interpreting raw scores as confidence percentages.

Chroma's `PersistentClient` is straightforward for a local prototype but requires a full rebuild when the KB changes. A production system would need incremental ingestion rather than full re-embed on every update.

## What This Unlocks for Month 1

With retrieval working, W03 can focus on the generation layer: taking the retrieved KB entries as context and using an LLM to draft a grounded response to the ticket. That step is meaningfully simpler now because the input contract is clear — a ticket plus a set of retrieved KB entries — and retrieval quality has been validated independently before generation is added.

This build also establishes the embedding model and Chroma schema that W03 and W04 will build on, so those builds do not need to re-decide the retrieval infrastructure.
