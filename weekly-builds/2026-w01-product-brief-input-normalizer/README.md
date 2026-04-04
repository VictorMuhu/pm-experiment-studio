# 2026-W01: Product Brief Input Normalizer

## Problem

Product teams work from messy, inconsistent inputs. Customer signals come from support tickets, interviews, and NPS comments. Metrics arrive as spreadsheet exports. Experiment notes live in Notion, Confluence, or someone's head.

Before an AI can reason across these signals, they need to be in a consistent, structured format. Right now, they are not.

## Why This Matters

The Product Brief Generator (Project #02) will only be as good as its inputs. If the input layer is inconsistent — different field names, missing values, mixed formats — the synthesis layer will produce unreliable output.

This build establishes the input contract: what structured data looks like before it enters the system.

## Why AI / Why Not AI

**This build does not use AI. That is intentional.**

The normalization problem here is a schema discipline problem, not a reasoning problem. The inputs are structured JSON with predictable fields. Deterministic transformation is more appropriate than an LLM for this step — it is faster, cheaper, more reliable, and easier to test.

AI earns its place in the synthesis layer (Phase 2), where it needs to reason across mixed signals. It does not earn its place here.

## What This Build Does

Takes three types of raw product inputs:

1. **Customer signals** — channel, theme, evidence, severity
2. **Metrics** — metric name, current vs. previous value, trend
3. **Experiment notes** — hypothesis, result, interpretation

Normalizes them into a single structured dictionary and writes a combined output file.

## Inputs

| File | Description |
|---|---|
| `examples/sample_customer_signals.json` | Raw customer signal entries |
| `examples/sample_metrics.json` | Raw metric snapshots |
| `examples/sample_experiment_notes.json` | Raw experiment outcome notes |

## Output Schema

```json
{
  "customer_signals": [
    {
      "channel": "string",
      "theme": "string",
      "evidence": "string",
      "severity": "low | medium | high"
    }
  ],
  "metrics": [
    {
      "metric_name": "string",
      "current_value": "number",
      "previous_value": "number",
      "trend": "up | down | flat"
    }
  ],
  "experiments": [
    {
      "experiment_name": "string",
      "hypothesis": "string",
      "result": "string",
      "interpretation": "string"
    }
  ]
}
```

Output written to: `output/normalized_brief_inputs.json`

## Failure Modes

- **Missing input file** — script raises a readable error and stops; does not silently skip
- **Unexpected field names** — normalization may drop or default fields; documented in code comments
- **Mixed severity values** — script coerces to lowercase; non-standard values pass through with a warning
- **Empty input arrays** — allowed; output section will be an empty list

## What This Unlocks for Project #2

Once this normalization layer is stable, Project #2 can:

- Load a single structured file instead of parsing three different raw formats
- Build the synthesis prompt around a known schema
- Swap in real data sources later without changing downstream logic
- Add validation at the input boundary before any AI call is made

This build is Phase 1 of the Product Brief Generator roadmap.
