# Roadmap — Product Brief Generator

## Overview

This project is built in phases. Each phase is independently testable and produces a usable artifact before the next phase begins.

Current status: Phase 1 in progress.

---

## Phase 1: Input Normalization

**Goal:** Establish a stable, validated input contract before any AI is introduced.

**Deliverables:**
- Normalization script that accepts customer signals, metrics, and experiment notes
- Output schema: `normalized_brief_inputs.json`
- Sample input files for development and testing
- Documented failure modes

**Done when:** Running the script against sample inputs produces clean, consistent output with no silent failures.

**Where:** `weekly-builds/2026-w01-product-brief-input-normalizer/`

**Status:** In progress

---

## Phase 2: Signal Synthesis

**Goal:** Use an LLM to reason across normalized inputs and produce a structured synthesis — themes, patterns, anomalies, cross-signal connections.

**Deliverables:**
- Synthesis prompt (v1)
- Structured synthesis output schema
- Manual evaluation of synthesis quality against sample inputs
- Documented failure modes

**Done when:** The synthesis output reliably surfaces the most important themes and connections from a sample input set, and the output is consistent enough to feed the next phase.

---

## Phase 3: Product Brief Generation

**Goal:** Turn the synthesis output into a structured, readable product brief.

**Deliverables:**
- Brief generation prompt
- Output format: Markdown product brief with defined sections
- End-to-end test: raw inputs → normalized inputs → synthesis → brief
- At least 3 example briefs generated from sample data

**Done when:** A full brief can be generated end-to-end from sample inputs with no manual intervention between steps.

---

## Phase 4: Evaluation and Scoring

**Goal:** Add a quality gate so that weak briefs are flagged before being surfaced.

**Deliverables:**
- Evaluation rubric implemented as a scoring pass (see `evals/rubric.md`)
- Revision prompt for targeted improvement of low-scoring sections
- Threshold defined: what score is acceptable for surfacing vs. requiring revision

**Done when:** The system can detect a weak brief, flag the specific weak sections, and produce an improved version after a revision pass.

---

## Phase 5: Demo Polish and Promotion Readiness

**Goal:** Bring the project to the promotion bar for pm-ai-demo.

**Deliverables:**
- Clean, minimal demo interface (simple web UI or CLI with readable output)
- Clean README (external-facing, not internal lab docs)
- Architecture documentation finalized
- AI flow documentation finalized
- Loom demo walkthrough recorded
- Stable end-to-end demo path documented
- All promotion criteria from `PORTFOLIO_MAP.md` met

**Done when:** The project can be promoted to pm-ai-demo with no further structural work required.
