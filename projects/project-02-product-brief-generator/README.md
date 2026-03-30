# Project #02: Product Brief Generator

**Status:** In Progress — Lab Phase
**Stage:** projects/ (not yet demo-ready)

---

## Problem

Product managers synthesize a lot of signals every week: customer complaints, metric shifts, experiment outcomes, strategic context. Most of that synthesis happens informally — in people's heads, in Slack threads, in hastily written weekly updates.

The output is inconsistent. Important signals get dropped. Themes get missed. Recommendations lack grounding.

The Product Brief Generator is an attempt to make that synthesis process structured, repeatable, and AI-assisted.

---

## User

A product manager working from mixed, messy weekly inputs who needs a consistent, structured brief to inform prioritization and communication.

This is a tool for thinking, not a tool for publishing. The audience is the PM themselves, not stakeholders.

---

## Why AI

The synthesis step — turning customer signals, metric movements, and experiment outcomes into a coherent set of themes, risks, and recommendations — requires reasoning across heterogeneous inputs.

A static template cannot do this. A lookup table cannot do this. An LLM that understands context and can reason across multiple signal types can.

---

## Why Not a Simpler Approach

A simple approach would be: copy-paste signals into a document, write a summary manually.

The problem with that approach is consistency. Under time pressure, signals get dropped. Framing drifts. The quality of the brief depends on how much time the PM had that week, not on the quality of the underlying signals.

The goal is a system where the quality floor is high even when the PM is busy.

---

## What the System Will Do

1. Accept three input types: customer signals, metric snapshots, experiment notes
2. Normalize inputs into a consistent schema (handled by the W01 weekly build)
3. Synthesize signals into themes, patterns, and anomalies
4. Draft a structured product brief with specific sections
5. Score the brief against a quality rubric
6. Surface the output for PM review and editing

---

## Inputs

| Input | Description |
|---|---|
| Customer signals | Channel, theme, evidence, severity |
| Metrics | Metric name, current vs. previous value, trend |
| Experiment notes | Hypothesis, result, interpretation |

---

## Output

A structured product brief containing:

- Top customer themes (with supporting evidence)
- Important metric movements (with context)
- Experiment insights (what worked, what did not, what is unclear)
- Risks and open questions
- Recommended actions (prioritized, with reasoning)

---

## Why This Is a Workflow System

This is not a content generator that takes a prompt and returns formatted text.

It is a multi-step system with:
- an input normalization layer
- a synthesis layer that reasons across signal types
- a structured output format
- an evaluation layer that scores output quality
- a feedback loop that can improve over time

The distinction matters because each layer can be tested, improved, and replaced independently.

---

## Failure Modes

- **Garbage in, garbage out** — if input signals are low quality, the brief will be too. The normalization layer raises the floor but does not fix bad data.
- **False confidence** — an AI-generated brief that sounds authoritative but misses a critical signal is worse than no brief at all. The eval layer exists to catch this.
- **Theme collapse** — related signals may be incorrectly merged into one theme, hiding important nuance.
- **Recommendation hallucination** — the AI may generate plausible-sounding recommendations that are not grounded in the input signals.
- **Context blindness** — without strategic context (OKRs, current bets, constraints), recommendations may be technically accurate but strategically irrelevant.

---

## Future Build Plan

See `roadmap.md` for the phased plan.

This project is in active lab development. It is not ready for promotion to pm-ai-demo.
