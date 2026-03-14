# PM Experiment Studio

A curated collection of product experiments — each one designed, scoped, and shipped as a standalone artifact.

This is not a portfolio of work done at companies. It's a record of how I think about products: what problems are worth solving, what trade-offs get made in early-stage design, and what it looks like to move from a fuzzy idea to something testable.

---

## Thesis

Most product thinking lives in slide decks, Notion pages, or people's heads. It rarely ships as something you can actually look at, use, or critique.

This repo is my attempt to change that ratio. Each project here starts with a real problem, goes through explicit design and scoping decisions, and ends as a working (or nearly working) artifact — a tool, a prototype, a micro-app, or a structured experiment.

The standard isn't "production-ready." It's "would I be able to explain every decision I made, and would those decisions hold up to scrutiny?"

---

## What Lives Here

### `/projects`

Published experiments. These have:
- A clear problem statement
- A documented set of design decisions
- A working implementation or high-fidelity prototype
- A manifest with metadata
- A decision log that captures what was considered and why things landed where they did

Each project folder is self-contained. You can read the README and understand what it is, why it exists, and what it's not trying to be.

### `/scratch`

Work in progress, abandoned ideas, and rough explorations. No quality bar. The rule for scratch is that something exists — it's not just an idea. If there's nothing to look at, it doesn't belong here either.

Scratch exists so that the bar for starting something is low, and the bar for moving it to `/projects` is meaningful.

---

## The Quality Bar

A project graduates from `/scratch` to `/projects` when it meets all of the following:

- [ ] The problem is clearly stated in one paragraph
- [ ] The core design decisions are documented in `decision-log.md`
- [ ] There is something to see or use (not just a description)
- [ ] The `manifest.json` is complete
- [ ] A screenshot or demo link exists

Work that's "mostly done" stays in scratch until it clears the bar. The point is that `/projects` should be something you'd actually share with someone.

---

## The PM Angle

Product management is fundamentally about deciding what to build, why, and in what order — under uncertainty and with real constraints. Most PM artifacts (PRDs, roadmaps, OKRs) are internal documents that don't translate well to public work.

These experiments are a way to make that thinking visible. Each one is a small bet: here is a problem I found interesting, here is how I scoped it to be tractable, here is what I learned building it.

If the thinking is sharp, it should show in the decisions — not in how the README is written.

---

## Project Index

<!-- PROJECT_INDEX_START -->

_No published projects yet._

Run `node scripts/scaffold.js` to start one, or see `prompts/idea-matrix.yaml` for project seeds.

<!-- PROJECT_INDEX_END -->

---

## Stack Notes

Projects here span tools and tech depending on what fits the problem. There's no house stack. Decisions about tooling are documented in each project's manifest.

---

## Structure

```
pm-experiment-studio/
├── projects/          # Published experiments (quality bar cleared)
├── scratch/           # In-progress and exploratory work
├── prompts/           # Reusable LLM prompts used in project generation
├── styles/            # Shared design tokens, CSS, or theme files
├── schemas/           # JSON schemas for manifests and structured data
├── scripts/           # Automation: scaffolding, validation, index generation
├── docs/              # Process documentation, ADRs, meta-notes
├── templates/         # Starter templates for new projects
└── README.md
```

---

## License

MIT. See [LICENSE](./LICENSE).
