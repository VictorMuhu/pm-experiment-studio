# Evaluation Rubric — Product Brief Generator

## Purpose

This rubric is used to score AI-generated product briefs before they are surfaced. It defines what good looks like and provides a consistent quality bar across brief generations.

Score each dimension 1–5. A brief with a total score below 18/25 should be flagged for revision before use.

---

## Scoring Dimensions

### 1. Signal Relevance (1–5)

Does the brief focus on the signals that actually matter, or does it surface noise?

| Score | Description |
|---|---|
| 5 | All themes and observations are grounded in the most important input signals. Nothing irrelevant is surfaced. |
| 4 | Mostly relevant with one minor distraction. |
| 3 | Some important signals are missing or underweighted. Some noise is included. |
| 2 | Key signals are absent. The brief focuses on the wrong things. |
| 1 | The brief does not reflect the actual input signals in any meaningful way. |

---

### 2. Synthesis Quality (1–5)

Does the brief connect signals across input types, or does it just list them separately?

| Score | Description |
|---|---|
| 5 | Cross-signal patterns are clearly identified. The brief reveals connections a human might miss under time pressure. |
| 4 | Some cross-signal connections are made. A few missed. |
| 3 | Signals are present but mostly treated independently. Limited synthesis. |
| 2 | No meaningful synthesis. The brief is effectively a reformatted list of inputs. |
| 1 | Signals are mischaracterized or contradicted. |

---

### 3. Strategic Usefulness (1–5)

Would a PM reading this brief come away with a clearer sense of what to do and why?

| Score | Description |
|---|---|
| 5 | Reading the brief produces clear, grounded direction. The PM does not need to re-derive the insights from scratch. |
| 4 | Mostly useful. One section adds little value. |
| 3 | Some useful content but significant gaps in strategic framing. |
| 2 | The brief is present but not useful. Reads as filler. |
| 1 | The brief is actively misleading or confusing. |

---

### 4. Clarity (1–5)

Is the brief easy to read and understand in under 5 minutes?

| Score | Description |
|---|---|
| 5 | Every sentence is clear, direct, and unambiguous. No jargon, no padding. |
| 4 | Mostly clear with one or two clunky passages. |
| 3 | Readable but wordy or inconsistently structured. |
| 2 | Difficult to skim. Important points are buried. |
| 1 | Incoherent or extremely difficult to read. |

---

### 5. Actionability (1–5)

Do the recommended actions tell the PM what to do next, with enough specificity to act on?

| Score | Description |
|---|---|
| 5 | Recommendations are specific, prioritized, and grounded in the input signals. A PM could hand one to a team tomorrow. |
| 4 | Most recommendations are specific. One is vague. |
| 3 | Recommendations are present but generic. Could apply to any product team. |
| 2 | Recommendations exist but are not grounded in this week's signals. |
| 1 | No actionable recommendations, or they are contradicted by the inputs. |

---

## Total Score Interpretation

| Total | Interpretation |
|---|---|
| 23–25 | Strong brief. Surface as-is. |
| 18–22 | Acceptable. Minor improvements may be warranted but not required. |
| 13–17 | Weak. Flag specific low-scoring sections for a targeted revision pass. |
| Below 13 | Do not surface. Regenerate with a revised prompt. |

---

## What a Weak Brief Looks Like

- Lists signals without connecting them
- Uses generic language ("it's important to address customer feedback") not tied to specific inputs
- Recommendations could have been written without reading the inputs at all
- Key metric movements or experiment outcomes are omitted
- Synthesis section reads like a summary, not an insight

---

## What a Strong Brief Looks Like

- Surfaces a connection across signal types that is not obvious from reading the inputs individually
- Cites specific evidence from the input signals when making claims
- Prioritizes: not everything gets equal weight, and the reasoning for prioritization is visible
- Recommendations are specific enough to assign to a person or add to a sprint
- Identifies what is uncertain or unknown, not just what is known
