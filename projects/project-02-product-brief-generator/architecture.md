# Architecture — Product Brief Generator

## Overview

The Product Brief Generator is a multi-layer workflow system. Each layer has a distinct responsibility and can be developed, tested, and replaced independently.

---

## System Components

```
[Input Sources]
      │
      ▼
[Input Normalization Layer]
      │
      ▼
[Synthesis Layer]
      │
      ▼
[Recommendation Layer]
      │
      ▼
[Formatting / Output Layer]
      │
      ▼
[Evaluation Layer]
      │
      ▼
[Output: Product Brief]
```

---

## Layer Descriptions

### Input Normalization Layer

**Responsibility:** Take raw, inconsistent product inputs and convert them into a stable, validated schema before any AI processing occurs.

- Accepts: customer signals, metrics, experiment notes
- Outputs: `normalized_brief_inputs.json`
- Implementation: deterministic Python script (no AI)
- Status: built in 2026-W01 weekly build

See: `weekly-builds/2026-w01-product-brief-input-normalizer/`

---

### Synthesis Layer

**Responsibility:** Reason across the normalized inputs to identify themes, patterns, anomalies, and connections across signal types.

- Accepts: normalized inputs
- Outputs: synthesized signal summary (themes, patterns, flags)
- Implementation: LLM call with structured prompt
- Key challenge: surfacing cross-signal patterns (e.g. a metric drop that correlates with a specific customer theme and a failed experiment)

---

### Recommendation Layer

**Responsibility:** Generate prioritized recommended actions grounded in the synthesized signals.

- Accepts: synthesized signal summary
- Outputs: list of recommended actions with reasoning
- Implementation: LLM call, likely chained from synthesis output
- Key constraint: recommendations must be traceable to specific input signals — no free-floating assertions

---

### Formatting / Output Layer

**Responsibility:** Assemble the final brief in a readable, structured format.

- Accepts: synthesis output + recommendation output
- Outputs: final product brief (Markdown or JSON)
- Sections: customer themes, metric movements, experiment insights, risks, recommended actions
- Implementation: template-driven with LLM fill-in or full LLM assembly

---

### Evaluation Layer

**Responsibility:** Score the generated brief against a quality rubric before surfacing it to the PM.

- Accepts: final product brief
- Outputs: rubric scores + flags for weak sections
- Implementation: rubric-based LLM evaluation or rule-based scoring
- Status: rubric defined in `evals/rubric.md`

---

## Future Connectors

These are not in scope for the current lab phase but represent natural integration points:

| Connector | Description |
|---|---|
| Support / CRM | Pull customer signals directly from Zendesk, Intercom, or similar |
| Analytics | Pull metric snapshots from Mixpanel, Amplitude, or Looker |
| Experiment platform | Pull experiment results from LaunchDarkly, Statsig, or similar |
| Slack | Post brief summary to a product channel on a weekly schedule |
| Docs | Write brief to Notion, Confluence, or Google Docs |

---

## Design Principles

- Each layer is independently testable
- No layer depends on the implementation details of another layer — only on its output schema
- The normalization layer is always deterministic; AI is introduced only where reasoning is required
- Failure at any layer should be surfaced clearly, not silently swallowed
