# Contributing

This document describes how work is structured in this repo and what the expectations are for adding or promoting a project.

If you're contributing as a collaborator (or reviewing your own work before merging), use this as a checklist, not a style guide.

---

## Repo Structure

```
pm-experiment-studio/
├── projects/          # Published experiments — quality bar required
├── scratch/           # Active or abandoned explorations — no quality bar
├── prompts/           # LLM prompts used in project generation or ideation
├── styles/            # Shared CSS, design tokens, or theme files
├── schemas/           # JSON schemas for manifest.json and other structured files
├── scripts/           # Automation scripts (scaffolding, validation, index generation)
├── docs/              # Meta-documentation: process notes, ADRs, guides
└── templates/         # Starter files for new projects
    └── PROJECT_TEMPLATE/
        ├── README.md
        ├── manifest.json
        └── decision-log.md
```

`/scratch` is deliberately unstructured. The only rule there is that something tangible exists.

`/projects` has a defined structure and a quality bar described below.

---

## Project Folder Naming

Folder names in both `/projects` and `/scratch` must be:

- **Lowercase, hyphen-separated** — `price-sensitivity-tool`, not `PriceSensitivityTool` or `price_sensitivity_tool`
- **Descriptive, not cute** — the name should reflect what the project is, not a clever brand name
- **Stable** — once a project is published, don't rename the folder (it breaks links)

Good: `onboarding-checklist-generator`, `job-fit-scorer`, `feedback-triage-ui`
Bad: `experiment-3`, `test`, `MyApp`, `the-thing`

---

## README Requirements (for `/projects`)

Every project in `/projects` must have a `README.md` that covers:

1. **What it is** — one paragraph, no jargon. What does this do?
2. **Why it exists** — the problem it solves or the question it explores
3. **How to use it** — enough detail that someone unfamiliar can try it
4. **What was intentionally left out** — scope decisions, known limitations
5. **Status** — `prototype`, `stable`, or `archived`

The README must not:
- Open with "This is a project that..."
- Use the phrase "leverages" or "utilizes"
- Spend more than one sentence on the tech stack unless the stack is the point

If the README is longer than it needs to be, cut it.

---

## manifest.json Requirements

Every project in `/projects` must have a `manifest.json`. Use the template in `/templates/PROJECT_TEMPLATE/manifest.json`.

Required fields:

| Field | Description |
|-------|-------------|
| `name` | Display name of the project |
| `slug` | Matches the folder name exactly |
| `status` | `prototype`, `stable`, or `archived` |
| `category` | One of: `tool`, `ui-experiment`, `research`, `data`, `generator`, `other` |
| `description` | One sentence. No period at the end. |
| `problem` | The specific problem this addresses |
| `created` | ISO 8601 date (`YYYY-MM-DD`) |
| `updated` | ISO 8601 date (`YYYY-MM-DD`) |
| `tags` | Array of lowercase strings |
| `has_demo` | Boolean |
| `demo_url` | URL string or `null` |
| `screenshot` | Relative path to screenshot or `null` |

The `schemas/manifest.schema.json` file defines the full schema. Run `scripts/validate.js` to check before opening a PR.

---

## decision-log.md Requirements

The decision log is where the PM thinking lives. It's not a diary — it's a record of decisions made and why.

Each entry should follow this format:

```
## Decision: [short title]
Date: YYYY-MM-DD

**What was decided:** [one sentence]

**Options considered:**
- Option A: [description]
- Option B: [description]

**Why this:** [reasoning — constraints, trade-offs, what was deprioritized]

**What changes this:** [what would cause you to revisit this decision]
```

You don't need an entry for every small choice. Log decisions that:
- Had real alternatives
- Were non-obvious
- Someone might question when reading the project later

---

## Screenshots

Every project that has a UI must include at least one screenshot.

- Store in the project folder as `screenshot.png` (or `screenshot-[descriptor].png` for multiples)
- Minimum width: 1200px
- No browser chrome unless the browser context is relevant
- No placeholder screenshots (a blank page with "coming soon" doesn't count)

Reference the screenshot in `manifest.json` and link it near the top of `README.md`.

---

## What Qualifies for `/projects` vs `/scratch`

A project belongs in `/projects` when all of the following are true:

- [ ] README is complete per the requirements above
- [ ] `manifest.json` is filled out and validates against the schema
- [ ] `decision-log.md` has at least two entries
- [ ] There is a working implementation, demo, or high-fidelity prototype
- [ ] A screenshot exists (if the project has a UI)
- [ ] The project does something specific — it's not a "framework" or "template" or "starter"

If any of these are missing, keep it in `/scratch` and continue working on it there.

---

## Branches and PRs

- Work in a branch named `project/[slug]` for new projects (e.g., `project/job-fit-scorer`)
- Use `fix/[slug]-[issue]` for updates to existing projects
- Use `meta/[description]` for changes to docs, scripts, templates, or schemas

PR descriptions should include:
- What changed
- What was intentionally not changed
- How to verify (run this, look at that)

PRs that touch `/projects` should include a checklist confirming the quality bar items above are met.

Squash merges are preferred to keep history clean. Commit messages should be imperative and specific: `Add job-fit-scorer project`, not `updates`.

---

## Generating New Projects

Use the scaffold script to start a new project:

```bash
node scripts/scaffold.js --name "Your Project Name" --dest scratch
```

This copies `/templates/PROJECT_TEMPLATE` into the appropriate directory with the slug derived from the name. Fill in `manifest.json` and `README.md` before committing.

Once it clears the quality bar, move it to `/projects` and update `manifest.json` accordingly.
