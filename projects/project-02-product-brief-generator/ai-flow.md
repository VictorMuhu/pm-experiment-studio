# AI Flow — Product Brief Generator

## Overview

This document describes how data moves through the system and where AI is applied.

Not every step requires AI. The principle is: use deterministic logic where structure and schema are sufficient; use AI where reasoning across mixed signals is required.

---

## Step 1: Ingest / Load Inputs

**Type:** Deterministic

Load the three raw input files:
- `sample_customer_signals.json`
- `sample_metrics.json`
- `sample_experiment_notes.json`

No intelligence required at this step. Just file loading and basic validation.

---

## Step 2: Normalize Inputs

**Type:** Deterministic

Run the normalization script to convert raw inputs into the stable schema:

```json
{
  "customer_signals": [...],
  "metrics": [...],
  "experiments": [...]
}
```

Output: `normalized_brief_inputs.json`

This step enforces schema consistency, coerces field values, and surfaces missing or malformed data before any AI call is made. See the W01 weekly build for implementation.

---

## Step 3: Synthesize Signals

**Type:** AI (LLM)

This is the first step where AI is applied.

The normalized inputs are passed to an LLM with a structured synthesis prompt. The model is asked to:

- Identify the top 2-3 customer themes across all signals
- Flag metric movements that are notable (directional change, magnitude, cross-signal correlation)
- Extract the key insight from each experiment
- Surface connections across signal types (e.g. a metric drop that matches a recurring customer complaint)

Output: a structured synthesis object with themes, metric observations, experiment takeaways, and cross-signal flags.

---

## Step 4: Draft Brief Sections

**Type:** AI (LLM)

Using the synthesis output, the model drafts each section of the product brief:

- **Customer themes** — top patterns with supporting evidence
- **Metric movements** — what changed, how much, what it might mean
- **Experiment insights** — what was learned, what is still open
- **Risks** — what could be going wrong, what is uncertain
- **Recommended actions** — prioritized, with reasoning tied to specific signals

Each section is drafted with explicit grounding in the synthesis output — the model should not introduce claims that are not traceable to the input signals.

---

## Step 5: Evaluate Usefulness

**Type:** AI or rule-based (TBD)

The drafted brief is scored against the evaluation rubric in `evals/rubric.md`.

Dimensions: signal relevance, synthesis quality, strategic usefulness, clarity, actionability.

If scores fall below threshold on any dimension, the weak sections are flagged for revision.

---

## Step 6: Revise Output

**Type:** AI (LLM), conditional

If evaluation flags weak sections, a revision pass is triggered with specific instructions: "This section lacks actionability — revise to include a concrete recommended next step."

Revision is targeted, not a full regeneration of the brief.

---

## Why This Is Not Just Templating

A template approach would fill fixed slots with content: "Here are this week's top 3 customer complaints. Here are the metrics that moved."

The value of the AI synthesis step is not formatting — it is reasoning.

The model is asked to do things a template cannot:

- Connect a metric drop to a pattern in customer signals that no individual human might have linked
- Identify that two experiments with different outcomes share an underlying assumption worth questioning
- Distinguish between signals that are noise and signals that are early indicators of a larger pattern
- Generate recommendations that are specific to the combination of signals this week, not generic PM advice

The brief produced by this system should not look the same every week. It should look different because the inputs are different, and the reasoning across those inputs is different.

A template produces consistency of format. This system aims for consistency of quality.
