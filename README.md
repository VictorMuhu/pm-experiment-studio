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

_No published projects yet._

Run `node scripts/scaffold.js` to start one, or see `prompts/idea-matrix.yaml` for project seeds.

<!-- PROJECT_INDEX_END -->

---

## Working Rules

- rough ideas start in `scratch/`
- repeatable weekly work belongs in `weekly-builds/`
- larger evolving efforts belong in `projects/`
- focused technical investigations belong in `experiments/`
- only polished, demo-ready work should move to `pm-ai-demo`
