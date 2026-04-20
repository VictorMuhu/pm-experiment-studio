# Project 01 — Customer Support Copilot

## Problem

Support agents answering repetitive tickets spend significant time searching a knowledge base manually. When that KB has dozens or hundreds of articles, finding the right one is slow and inconsistent. Two agents answering the same ticket may pull different sources and produce different quality responses.

At scale, this creates cascading problems: slower response times, inconsistent answer quality, high cognitive load on agents, and customers left waiting longer than necessary.

## Monthly Goal

Build a grounded, workflow-first support copilot that:
1. Understands and structures incoming ticket content
2. Retrieves relevant KB context for a given ticket using semantic search
3. Generates a suggested response grounded in that context
4. Evaluates response quality with an explicit rubric

This is not an autonomous agent. The copilot assists agents — it does not decide for them.

---

## Month 1 Completion Summary

Month 1 is complete. The system now demonstrates a full first-pass AI support workflow:

**ticket understanding → retrieval → grounded generation → evaluation**

Each layer was built and validated independently before the next was added. This sequencing was intentional: it made failure modes visible at the layer where they originate, rather than hiding them inside end-to-end output.

The pipeline is a strong v1 — not a production system. It validates the core architecture and surfaces the right problems to solve in Month 2.

---

## Weekly Plan

| Week | Focus | Status |
|---|---|---|
| W01 | Structured understanding — extract ticket fields reliably using function calling | Complete |
| W02 | Retrieval prototype — embed KB, retrieve top-K for sample tickets | Complete |
| W03 | Generation layer — use retrieved context to draft a grounded response | Complete |
| W04 | Evaluation — score response quality with a rubric-based evaluator | Complete |

---

## Iterations

### W01 — Structured Ticket Understanding

Built a structured extraction layer that normalizes raw, unstructured support ticket inputs into a consistent schema. Used function calling for reliable field extraction — the structured output becomes the input contract for the retrieval and generation layers downstream.

The normalization problem is a schema discipline problem, not a reasoning problem. Using function calling over free-text extraction makes the output deterministic and auditable.

### W02 — Retrieval Prototype

Built and tested an embedding-based retrieval prototype across 5 sample support tickets.

**Results:**
- Top-1 retrieval was correct in all 5 cases
- Secondary results (ranks 2 and 3) were sometimes less precise — loosely related articles surfaced through word overlap rather than genuine relevance
- The clearest failure: a permissions ticket returned the billing portal article at rank 2 because both reference "Admin"

This validates the retrieval foundation while exposing a clear next problem: ranking precision at positions 2 and 3.

**Why this sequencing mattered:** Validating retrieval independently meant that when generation was added in W03, retrieval quality was a known quantity, not a confounding variable.

### W03 — Grounded Response Generation

Connected ticket context and retrieved KB content into a generation step that drafts a suggested support response. Used prompt guardrails to reduce hallucination — the model was explicitly instructed to stay within the retrieved context and not invent steps not present in the KB.

Key finding: prompt design matters more than model capability at this stage. The difference between a grounded response and a hallucinated one was largely determined by how clearly the prompt separated what the model was allowed to reason from versus what it was supposed to generate.

### W04 — Response Evaluation

Added a lightweight evaluation layer that scores generated responses across four dimensions: relevance, groundedness, completeness, and actionability. Each dimension is scored 1–5 with a short justification. Output is a structured dict, not prose.

Key finding: the evaluator reliably catches the most dangerous failure mode — a response that sounds confident and fluent but is not grounded in the retrieved context. That catch is the point. Without evaluation, that failure is invisible.

---

## What Broke / What I Learned

**W01:** Structured extraction is most valuable as an input contract. The downstream retrieval and generation steps are cleaner when ticket structure is normalized upfront. Function calling produced more reliable field extraction than a free-text prompt instructed to return JSON.

**W02:** Retrieval at rank 1 was strong. Retrieval at ranks 2 and 3 showed noise from word overlap. This matters because grounded generation passes the full context window to the model — irrelevant secondary context enters the prompt and can degrade response quality even when the top result is correct.

**W03:** Prompt guardrails work, but they require explicit wording. "Use only the provided context" is not enough — the model needs to know what "using context" means in practice (cite steps, not invent them). Iterating on grounding instructions was the highest-leverage prompt work in this build.

**W04:** "Looks good" is not a quality bar. The evaluator surfaced cases where a response was fluent and polite but scored 2/5 on groundedness because it routed the user to a resource not mentioned in the KB. That failure would have been invisible without a scoring step. Evaluation is not optional infrastructure — it is how you know whether the system is working.

---

## Failure Modes

- **Vague or multi-topic tickets** — tickets that mix multiple issues (billing + access + product bug) degrade both retrieval precision and response completeness; the system handles well-scoped tickets better
- **Retrieval drift in lower-ranked results** — even when top-1 retrieval is correct, lower-ranked irrelevant context can still pollute the generation prompt; ranking quality is a core system risk, not just a retrieval-layer concern
- **Overconfident generation when context is weak** — when retrieved context is partially relevant, the model can generate confident-sounding responses that fill gaps with plausible but ungrounded steps
- **Evaluator variance** — LLM-based rubric scoring introduces variance; the same response scored in two separate runs can differ by 0.5–1.0 on ambiguous dimensions; the evaluator is a signal, not a ground truth
- **Context insufficiency** — the KB may not fully answer the question; the system must recognise this and route appropriately rather than fabricate an answer

---

## Why This Is a Workflow, Not an Agent

The Month 1 flow is fully enumerable: normalize input → retrieve context → generate response → evaluate. Every run follows the same path. There is no decision-making about what to do next, no tool selection, no dynamic branching based on intermediate results.

The main bottlenecks this month were retrieval precision, grounded generation quality, and evaluation consistency. None of those are orchestration problems. Adding agentic tool selection before those layers are stable would increase system complexity without improving the thing most likely to break.

Agentic patterns introduce value when the system needs to decide what step to take based on intermediate results — for example, routing a low-confidence retrieval result to escalation rather than generation. That decision has not been reached yet. The right time to introduce agent patterns is when the workflow is stable and the question becomes what the system should do with a high-quality response.

---

## What This Unlocks Next

Month 1 creates the foundation for meaningful Month 2 improvements:

- **Stronger retrieval ranking** — re-ranking with a cross-encoder or distance threshold filtering at ranks 2 and 3 to reduce context pollution
- **Confidence-aware response handling** — surface retrieval confidence scores so low-confidence cases can be escalated or flagged before generation
- **Better evals** — a more adversarial test set (tickets with no KB match, ambiguous issues, multi-part questions) would stress-test the pipeline beyond the clean sample set used in Month 1
- **Workflow vs agent decision** — once retrieval and generation are stable, evaluate whether introducing conditional routing (escalate / draft / auto-send) warrants an agent pattern, based on real bottlenecks rather than architecture preference
