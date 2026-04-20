# Skill Map — Support Ticket Triage

**Build date:** 2026-04-13
**Skill chain used:** Problem Framing → Metric Stack → AI Output Rubric

---

## Skills Applied

| Skill | pm-ai-skills path | How it shaped this build |
|-------|-------------------|--------------------------|
| Problem Framing | `strategy/problem-framing/` | Defined the real problem as agent time spent re-reading tickets to decide urgency and category, not ticket volume. That reframing scoped the output to a structured brief, not a summary. |
| Metric Stack | `analytics/metric-stack/` | Primary metric: time-to-first-response. Leading metric: triage classification accuracy (category match rate). Guardrail: urgency score false-negative rate on escalation-worthy tickets. |
| AI Output Rubric | `evals/ai-output-rubric/` | Defined what a good triage output looks like — correct category, plausible urgency score, KB topic that matches actual KB structure, summary under 20 words. Used to build the offline eval test cases. |

---

## Skill Chain

Problem Framing → Metric Stack → AI Output Rubric — Problem framing defined what to build and what to skip. Metric stack defined what "working" means before a line was written. AI output rubric defined the quality bar for the model output before the prompt existed.

---

## What the Skill System Caught

- Problem framing ruled out building a summarizer — the real job is routing, not summarizing. That changed the output schema from a paragraph to a structured object with a category enum.
- Metric stack forced urgency score to be treated as a guardrail, not just a label. A false negative on a P1 ticket is categorically worse than a false positive. That shaped the prompt to err toward higher urgency when the signal is ambiguous.
- AI output rubric defined KB topic as a category name, not a free-text string — otherwise the downstream retrieval step (W02) cannot use it.

---

## Skills That Should Exist But Don't

- Prompt risk assessment: a skill that systematically identifies prompt injection surface, hallucination failure modes, and guardrail gaps for a given task type. Currently done ad-hoc.

---

## Reusable Learnings to Promote Back into pm-ai-skills

- Triage output schema pattern (urgency / category / KB topic / summary): reusable template for any routing task with a downstream retrieval layer — could live in `execution/`.
