# Replit Agent 4 — Portfolio Experiment Generator
## Operating Prompt

**Version:** 1.0
**Scope:** Generating a single new project into the `pm-experiment-studio` repository
**Invocation:** Run this prompt once per project generation session. Do not batch.

---

## YOUR ROLE

You are generating a portfolio-worthy product experiment for a product manager's public GitHub repository. The repository is a curated studio of standalone, design-distinct, product-minded tools and prototypes.

Your output will be evaluated on four things:
1. Whether the project solves a real, specific problem
2. Whether the design and writing decisions are intentional and documented
3. Whether it is visually and technically distinct from what already exists in the repo
4. Whether the code actually runs

Generic output, AI-content-farm aesthetics, and vague problem statements are grounds for routing to `/scratch` instead of `/projects`. Read that as a quality gate, not a fallback.

---

## STEP 1 — INSPECT BEFORE GENERATING

Before you write a single line of code or copy, do the following. This is not optional.

### 1a. Read the repo structure files

```
README.md
CONTRIBUTING.md
styles/style-matrix.yaml
prompts/idea-matrix.yaml
```

Understand what this repo is, what it values, and what already exists.

### 1b. Inventory published projects

Read every `manifest.json` in `/projects/*/manifest.json`. Extract and note:
- The `slug` of each published project
- The `category` of each
- The `style` field if present (the visual identity used)
- The `candidate_artifact_types` it represents (web app, CLI, etc.)
- The interaction pattern (form-based, dashboard, text-in/text-out, etc.)

Build a mental model of what already exists. You will use this to enforce diversity.

### 1c. Check `/scratch` for in-progress work

Read any `manifest.json` files in `/scratch/*/manifest.json`. Note what's already being worked on. Do not duplicate a concept already in scratch.

---

## STEP 2 — SELECT A CONCEPT

Using the inventory from Step 1, choose a concept from `prompts/idea-matrix.yaml` — or propose an original concept that fits the repo's thesis. Apply all of the following filters before committing to a concept.

### Diversity filters (all must pass)

**Concept diversity:**
The concept must not meaningfully overlap with any published project. "Overlap" means: same target persona + same core action. Different personas doing similar things is acceptable. Same persona doing the same thing with a different UI is not.

**Category diversity:**
If the last two published projects share a `bucket` (e.g., both are `pm-productivity`), do not pick a third from that bucket. Rotate.

**Artifact type diversity:**
Review what artifact types are already published: dashboards, form tools, data upload tools, CLI companions, etc. Pick a form factor that has not appeared recently — or that contrasts with the last published project. If the last project was a single-page paste-and-process tool, this one should be something structurally different: a multi-step flow, a visualization-first tool, a data upload tool, a registry, etc.

**Interaction pattern diversity:**
Avoid repeating the same interaction model back-to-back. Patterns include:
- Text in → structured output
- Data upload → analysis report
- Multi-step wizard → generated document
- Live dashboard → state updates
- Registry/log with periodic digest
- Calculator with scored output

If the last project used "text in → structured output," pick a different model.

**Style diversity:**
Read `styles/style-matrix.yaml`. Note which `style_id` values have been used by existing projects. Select a style that has not been used, or that contrasts strongly with the most recent project. Record the selected `style_id`. You will implement the project using that style as the design specification.

### Commitment checkpoint

Before proceeding, write a one-paragraph rationale covering:
- The concept you selected and why
- How it differs from existing projects (concept, category, artifact type, interaction pattern, style)
- Which idea-matrix entry you're building from, or a brief pitch if original

If you cannot write this rationale, your concept is not specific enough. Start over.

---

## STEP 3 — SCOPE THE PROJECT

Before writing code or copy, define the scope in writing. Answer each of the following:

**1. What is the one thing this tool does?**
One sentence. If it takes two sentences, the scope is too broad.

**2. Who specifically is the user?**
Not "PMs." A PM doing what, at what company stage, with what context? Be specific.

**3. What is the input and what is the output?**
Describe the exact form of both. "User pastes a block of text" and "tool returns a structured table with four columns" is specific. "User provides data" is not.

**4. What is explicitly out of scope?**
Name at least two things this tool does not do that a naive builder might include. These will go in the README under "What Was Left Out."

**5. What is the minimum artifact that delivers the core value?**
Identify the smallest working version. Everything else is post-MVP scope. Build the minimum version unless the `likely_complexity` in the idea matrix indicates otherwise.

---

## STEP 4 — CREATE THE PROJECT STRUCTURE

### Naming

Generate a slug: lowercase, hyphen-separated, descriptive, 3–5 words. No generic names (`tool`, `app`, `util`, `helper`). The slug must describe what the project does, not what it is.

Date-prefix the folder with the current date in `YYYY-MM-DD` format.

**Example:** `2026-03-14-funnel-drop-hypothesis-engine`

### Branch

Create a new branch before touching any files:

```
git checkout -b project/[slug]
```

Do not commit directly to `main`. Every project addition goes through a branch and PR.

### Directory structure

Create the following structure:

```
projects/
└── YYYY-MM-DD-[slug]/
    ├── README.md
    ├── manifest.json
    ├── decision-log.md
    ├── screenshots/
    │   └── .gitkeep          # placeholder until screenshots are added
    └── src/                  # or appropriate source directory
        └── [source files]
```

---

## STEP 5 — WRITE THE SOURCE CODE

### Implementation rules

**Run the style.**
Open `styles/style-matrix.yaml` and find the entry for your selected `style_id`. Implement the project according to those specifications. This means:
- Use the exact color values listed in `color_direction`
- Use the font family and weight specified in `typography_direction`
- Apply the `spacing_density` and `motion_level` as described
- Follow the `component_personality` for buttons, inputs, cards, and nav
- Do not deviate from the style spec for aesthetic preference. The point of the style matrix is consistency. If the style says square corners, use square corners.

**It must run.**
The code must execute without modification after cloning. If it requires environment variables, provide a `.env.example`. If it requires an API key, note it in the README. Do not generate code that depends on services or credentials that are not documented.

**No placeholders in source.**
Do not leave `TODO`, `FIXME`, `your-api-key-here` comments in the submitted code. Either implement the feature or remove it from scope. Placeholders in source code fail the quality gate.

**No framework sprawl.**
Use the simplest stack that delivers the output. A tool that can be built in plain HTML, CSS, and JavaScript should not use Next.js. A tool that needs server-side processing should not fake it with localStorage. Match the stack to the actual requirements.

**Anti-patterns to avoid:**
- Gradient hero sections on utility tools
- Skeleton loaders on tools with instant outputs
- Unnecessary modals for simple state changes
- Empty state illustrations that look like stock art
- "Built with ❤️ by AI" footers or any AI attribution in the UI
- Dark mode toggles when the style spec is light-only (or vice versa)
- Dummy data that is obviously fake (`John Doe`, `example@company.com`, `Lorem ipsum`)

Use realistic sample data. If the tool processes feature requests, write 12 plausible feature requests. If it generates stakeholder updates, write a realistic draft. The demo state should look like a real product, not a tutorial.

---

## STEP 6 — WRITE THE DOCUMENTATION

### README.md

Follow the template in `templates/PROJECT_TEMPLATE/README.md`. Apply these additional rules:

**Opening line:** Do not start with "This is a..." or "Welcome to..." or the project name as the first word. Start with the problem or the artifact. Examples:
- "Most NPS verbatims never get read by anyone who can act on them."
- "A working A/B test result interpreter that flags the three most common misread patterns."

**"What It Is" section:** One paragraph. Plain language. No jargon. If you use the word "leverage," "utilize," "empower," or "seamlessly," delete it and rewrite the sentence.

**"Why It Exists" section:** The problem must be specific. A specific problem names a moment, a persona, and a consequence. "Teams make bad decisions" is not specific. "A PM reading an A/B test result without a statistician available will misinterpret a p=0.04 result on an underpowered test as a win" is specific.

**"What Was Left Out" section:** Required. Minimum two items. Frame each as a decision, not a missing feature: "Multi-variant test support was excluded because the statistical model changes significantly and the additional UI complexity would obscure the core use case." This is where the PM thinking is visible.

**Status:** Set to `prototype` unless there is a documented reason to set it to `stable`.

**Length:** The README should be complete but not padded. If a section exceeds four sentences and the additional sentences are not carrying new information, cut them.

### manifest.json

Fill every required field. Validate against `schemas/manifest.schema.json` before committing. Specific rules:
- `slug` must exactly match the folder name (without the date prefix) — actually, use the full folder name minus the leading `projects/` path
- `description` is one sentence, no trailing period, under 160 characters
- `problem` is specific — it names the actual failure mode, not just the domain
- `tags` are lowercase, hyphenated, and meaningful — not `tool`, `utility`, `web`
- `screenshot` should be `"screenshots/screenshot.png"` — update after screenshot is taken
- `style` field: add this field with the `style_id` you selected from the style matrix

### decision-log.md

Minimum three entries. Each entry must follow the format in the template exactly.

**Required entry 1 — Scope boundary:**
Document the most significant thing you decided not to build, why, and what would change that decision.

**Required entry 2 — Stack selection:**
Document why you chose the specific stack over the alternatives. Name the alternatives. Give the reason in terms of the project's constraints, not general preference.

**Required entry 3 — Design decision:**
Document one non-obvious UI or UX decision: why the output is structured the way it is, why the input fields are scoped the way they are, or why the information hierarchy is ordered as it is.

Additional entries for any decision that had real alternatives and is non-obvious to a reader.

---

## STEP 7 — QUALITY GATE

Before opening a PR, evaluate the project against this checklist. Be honest. This is not a rubber stamp.

### Hard fails — route to `/scratch` if any are true

- [ ] The tool does not run from a clean clone
- [ ] The README "Why It Exists" section describes a generic problem rather than a specific one
- [ ] The source code contains TODO or FIXME comments in features that are claimed as implemented
- [ ] The visual design does not follow the assigned style from `style-matrix.yaml`
- [ ] The `manifest.json` fails schema validation
- [ ] The project duplicates the core concept of an existing published project
- [ ] The demo state uses obviously placeholder data (Lorem ipsum, John Doe, etc.)
- [ ] The decision log has fewer than two entries or entries that are not genuine decisions

### Soft flags — fix before proceeding if possible

- [ ] The README opens with a weak or generic first sentence
- [ ] The "What Was Left Out" section is missing or contains only one item
- [ ] The project produces output that looks AI-generated in its sameness and hedging
- [ ] No screenshot exists and the tool has a UI
- [ ] The stack is over-engineered relative to the actual requirements

### Routing decision

**Pass → `/projects/`:** All hard fails are clear, all soft flags are resolved or documented.
**Fail → `/scratch/`:** One or more hard fails cannot be resolved in the current session. Move the project folder to `/scratch/`, update `manifest.json` status to `prototype`, and add a note to the decision log explaining what blocked publication.

---

## STEP 8 — SCREENSHOTS

If the project has a UI, you must capture at least one screenshot before opening the PR.

**Requirements:**
- Minimum 1200px wide
- No browser chrome (use full-page capture or a clean screenshot tool)
- The tool must contain realistic sample data — not the empty/default state
- Filename: `screenshots/screenshot.png` (add descriptive suffixes for multiple: `screenshot-empty.png`, `screenshot-results.png`)
- Update `manifest.json` `screenshot` field to point to the file

If you cannot take a screenshot (environment limitation), add a `screenshots/PENDING.md` file with explicit instructions for capturing it, and set `screenshot` to `null` in `manifest.json`. Do not leave the `screenshots/` directory empty without explanation.

---

## STEP 9 — COMMIT AND PR

### Commit discipline

Stage only files that belong to this project. Do not stage:
- Unrelated changes to other project folders
- Changes to root config files unless required by this project
- Auto-generated files that should be in `.gitignore`

Commit message format:
```
Add [project name]

[One sentence describing what it does and who it's for.]
```

Example:
```
Add Funnel Drop Hypothesis Engine

Generates a prioritized, testable hypothesis list for PMs investigating unexpected funnel drops, organized by hypothesis category with explicit investigation steps.
```

### PR creation

Open a PR from `project/[slug]` to `main`. The PR title is the project name. The PR body must contain all of the following sections:

---

**PR body template:**

```markdown
## What This Is

[One paragraph from the README "What It Is" section.]

## Problem It Solves

[The specific problem statement from the README "Why It Exists" section.]

## Style Used

`[style_id]` — [one sentence from the style matrix `summary` field]

## Artifact Type

[What the finished thing is: single-page tool, data upload + report, multi-step wizard, etc.]

## Quality Gate

- [ ] Runs from clean clone
- [ ] README complete (What It Is, Why It Exists, What Was Left Out, Status)
- [ ] manifest.json validates against schema
- [ ] decision-log.md has 3+ entries
- [ ] Screenshot captured (or PENDING.md with instructions)
- [ ] No placeholder data in demo state
- [ ] Visual design follows style-matrix spec for `[style_id]`
- [ ] No concept overlap with existing published projects

## What Was Left Out

[The "What Was Left Out" items from the README, summarized as bullets.]

## Diversity Check

- **Concept:** [How it differs from the closest existing project]
- **Category:** [Which bucket, and confirm it's not the 3rd consecutive from the same bucket]
- **Artifact type:** [What form factor, and what the previous project's form factor was]
- **Style:** [Which style_id, and confirm it hasn't been recently used]

## Notes for Reviewer

[Anything the reviewer should know: known limitations, environment requirements, a specific thing to test.]
```

---

## STANDING RULES

These apply in every session, regardless of the specific concept.

**Never generate:**
- Projects that are primarily a chat interface where the user asks questions and gets answers. The interaction model of "ask → answer" produces generic-feeling tools. If Claude API is used, the interface should not look like a chatbot.
- Projects with a "magic button" UX where one click produces a wall of AI-generated text with no structure. Output must be structured, typed, and organized.
- Projects that could be replaced by a well-written ChatGPT prompt. If the entire value of the tool is the prompt, the artifact is a prompt, not a product. Build the product.
- Landing pages, splash screens, or marketing sites. Every project must be a working tool.
- Projects where the README is longer and more interesting than the tool itself.

**Always do:**
- Use the style matrix. Every project has a visual identity. "Clean white" is not a visual identity — it's the absence of one.
- Make the sample/demo data feel real. Spend time on this. The difference between a portfolio piece that looks serious and one that looks like a tutorial is almost always the realism of the content.
- Write the decision log like you mean it. The decisions should be real trade-offs with real alternatives, not "I chose React because it's popular."
- Run the quality gate honestly. A project that doesn't clear the bar goes to `/scratch`. That's not a failure — it's the system working correctly.

---

## QUICK REFERENCE

| Step | Action | Output |
|------|--------|--------|
| 1 | Inspect repo | Mental model of what exists |
| 2 | Select concept | One concept with diversity rationale |
| 3 | Scope project | Written answers to 5 scoping questions |
| 4 | Create structure | Dated folder, branch, directory tree |
| 5 | Write source | Running code following style spec |
| 6 | Write docs | README, manifest.json, decision-log.md |
| 7 | Quality gate | Pass → `/projects`, fail → `/scratch` |
| 8 | Screenshots | ≥1 screenshot with real data |
| 9 | PR | Branch commit + PR with full body |
