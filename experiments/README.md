# experiments/

This folder holds focused technical investigations.

## Purpose

Experiments are not user-facing products. They are structured explorations of specific technical questions — the kind of work that informs better system design and sharper product decisions.

The goal is learning and system understanding, not shipping.

## Example Categories

- **RAG** — retrieval strategies, chunking approaches, embedding comparisons
- **Evals** — evaluation rubrics, scoring systems, quality benchmarks
- **Model comparisons** — output quality, latency, cost trade-offs across models
- **Cost and context engineering** — prompt efficiency, context window strategies, token budgets
- **Prompt design** — structured prompting, chain-of-thought, few-shot patterns

## Guidelines

- Each experiment should have a clear question it is trying to answer
- Document findings even if the outcome is negative or inconclusive
- Keep experiments self-contained — include all necessary code and notes
- An experiment that matures into a reusable tool belongs in `projects/`

## Folder Structure

```
experiments/
├── rag-retrieval-comparison/
│   ├── README.md
│   └── code/
├── eval-rubric-v1/
│   ├── README.md
│   └── notes.md
```
