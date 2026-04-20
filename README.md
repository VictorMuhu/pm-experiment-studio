# PM Experiment Studio

This is the working lab for PM AI work — not a polished portfolio showroom.

It is intentionally structured to support fast experimentation, progressive refinement, and a clear promotion path into the demo layer. Some work here is rough. That is by design.

---

## What This Repo Is

`pm-experiment-studio` is where ideas are tested, prototypes are built, and systems are explored. Work at every stage of maturity lives here — from raw scratch files to near-complete builds that are close to promotion.

The polished, demo-ready, externally presentable layer is a separate repo: `pm-ai-demo`.

---

## Repository Workflow

```
scratch → weekly-builds → projects → pm-ai-demo
```

| Stage | What It Means |
|---|---|
| `scratch/` | Raw, messy, fast. No quality bar. The point is that something exists. |
| `weekly-builds/` | Structured short builds, one concept at a time, scoped to a week. |
| `projects/` | Larger, multi-component efforts. More complete. Still evolving. |
| `pm-ai-demo` | Only polished, demo-ready, externally presentable work. Separate repo. |

Work does not have to move through every stage. A scratch idea might jump straight to a project, or never leave scratch at all. The pipeline is a guide, not a rule.

---

## Folder Structure

```
pm-experiment-studio/
├── scratch/           # Raw exploration and in-progress ideas
├── weekly-builds/     # Structured weekly experiments and micro-builds
├── projects/          # Promoted builds with multiple components
├── experiments/       # Focused technical investigations (RAG, evals, models, cost)
├── prompts/           # Reusable prompts and prompt assets
├── schemas/           # Structured data definitions and schemas
├── scripts/           # Utility scripts and helpers
├── templates/         # Repeatable project and documentation templates
├── docs/              # Process documentation and meta-notes
├── PORTFOLIO_MAP.md   # Control center: what is in progress, what is promoted
└── README.md
```

See `PORTFOLIO_MAP.md` for the current state of active work and what has been promoted.

---

## Promotion Criteria

A project moves to `pm-ai-demo` only when it has:

- a working system
- a clean README
- architecture documentation
- AI flow documentation
- evaluation or quality bar
- clear trade-offs and failure modes
- a Loom demo link
- a stable demo path

If it does not meet this bar, it stays here.

---

## Project Index

<!-- PROJECT_INDEX_START -->

| Project | Bucket | Complexity | Status | Date |
|---------|--------|------------|--------|------|
| [Fix Verification Run](projects/2026-03-16-fix-verification-run/) | pm-productivity | complex | published | 2026-03-16 |
| [Dependency Risk Radar](projects/2026-03-17-dependency-risk-radar/) | pm-productivity | complex | draft | 2026-03-17 |
| [Design Coach](projects/2026-03-17-design-coach/) | pm-productivity | complex | published | 2026-03-17 |
| [Idea Validator](projects/2026-03-17-idea-validator/) | decision-support | complex | draft | 2026-03-17 |
| [PM Vibe Agent Run](projects/2026-03-17-pm-vibe-agent-run/) | internal-tooling | intermediate | draft | 2026-03-17 |
| [Empirical Ledger — A/B Testing Coach](projects/2026-03-20-ab-testing-coach/) | decision-support | complex | draft | 2026-03-20 |
| [Retention Loop Analyzer](projects/2026-03-21-retention-loop-analyzer/) | analytics-debugging | complex | draft | 2026-03-21 |
| [Product Brief Generator](projects/project-02-product-brief-generator/) | pm-productivity | intermediate | draft | 2026-03-17 |

<!-- PROJECT_INDEX_END -->

---

## Working Rules

- rough ideas start in `scratch/`
- repeatable weekly work belongs in `weekly-builds/`
- larger evolving efforts belong in `projects/`
- focused technical investigations belong in `experiments/`
- only polished, demo-ready work should move to `pm-ai-demo`
