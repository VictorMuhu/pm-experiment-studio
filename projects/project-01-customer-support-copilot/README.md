# Project 01 — Customer Support Copilot

## Problem

Support agents answering repetitive tickets spend significant time searching a knowledge base manually. When that KB has dozens or hundreds of articles, finding the right one is slow and inconsistent. Two agents answering the same ticket may pull different sources and produce different quality responses.

At scale, this creates cascading problems: slower response times, inconsistent answer quality, high cognitive load on agents, and customers left waiting longer than necessary.

## Monthly Goal

Build a grounded, workflow-first support copilot that:
1. Retrieves relevant KB context for a given ticket using semantic search
2. Generates a suggested response grounded in that context
3. Evaluates response quality with an explicit rubric
4. Surfaces failure modes clearly at each layer

This is not an autonomous agent. The copilot assists agents — it does not decide for them.

## Weekly Plan

| Week | Focus | Status |
|---|---|---|
| W01 | Input normalization — structure messy product inputs for downstream use | Complete |
| W02 | Retrieval prototype — embed KB, retrieve top-K for sample tickets | Complete |
| W03 | Generation layer — use retrieved context to draft a grounded response | Planned |
| W04 | Evaluation — score response quality with a rubric-based evaluator | Planned |

## Iterations

### W01 — Input Normalization

Built a deterministic Python script that normalizes three raw input types — customer signals, metrics, and experiment notes — into a single structured JSON schema. No AI used at this step. The normalization problem is a schema discipline problem, not a reasoning problem.

Established the input contract that W02 and downstream builds load from.

### W02 — Retrieval Prototype

Built and tested an embedding-based retrieval prototype across 5 sample support tickets.

**Results:**
- Top-1 retrieval was correct in all 5 cases
- Secondary results (ranks 2 and 3) were sometimes less precise — loosely related articles surfaced through word overlap rather than genuine relevance
- The clearest failure: a permissions ticket returned the billing portal article at rank 2 because both reference "Admin"

This validates the retrieval foundation while exposing a clear next problem: ranking precision at positions 2 and 3.

## What Broke / What I Learned

**W02:** Retrieval at rank 1 was strong. Retrieval at ranks 2 and 3 showed noise from word overlap. This matters because grounded generation passes the full context window to the model — irrelevant secondary context enters the prompt and can degrade response quality even when the top result is correct.

This reinforced the sequencing decision: validate retrieval in isolation before adding generation. Had generation been added first, ranking noise would have been invisible inside the response and harder to diagnose.

## Failure Modes

- **Retrieval miss** — if the correct KB entry is not retrieved, the generation layer has no good material to reason from; response quality degrades significantly
- **Ranking noise** — even when top-1 retrieval is correct, lower-ranked irrelevant context can still pollute the generation prompt; retrieval ranking quality is a core system risk, not just a retrieval-layer concern
- **Context insufficiency** — the KB may not fully answer the question; the system must recognise this and route appropriately rather than fabricate an answer
- **Evaluation subjectivity** — LLM-based scoring of response quality introduces variance; rubric design and calibration matter

## Agent vs Workflow Design

This project is deliberately workflow-first. Each build in the monthly plan follows a fixed, deterministic sequence. There is no tool selection, no planning loop, no self-directed action.

**Why:** The failure modes in this system are retrieval failures and generation failures — not orchestration failures. Adding agentic tool selection before those layers are stable would increase system complexity without improving the thing most likely to break.

W02 test results confirmed this position. The main bottleneck is retrieval ranking precision at positions 2 and 3. That is a retrieval problem. Solving it with better embeddings, re-ranking, or distance thresholds is the right move. Adding a planning layer on top of noisy retrieval would hide the problem, not fix it.

Agent patterns will be evaluated once retrieval and generation are stable and the question becomes: what should the system do with a high-quality response? (Route to agent? Auto-send? Escalate?) That decision has not been reached yet.

## What This Unlocks

A validated retrieval foundation means W03 can focus entirely on the generation layer without re-litigating infrastructure decisions. The embedding model, Chroma schema, and input contract are settled. The W03 build starts with a known-good retrieval system underneath it.

Once generation is added, W04 can evaluate end-to-end quality with a rubric — giving the full pipeline an explicit quality signal that informs whether the system is ready for any kind of real-world use.
