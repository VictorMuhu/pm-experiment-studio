# Repo Operations

Operating guide for weekly use. Covers structure, project standards, tooling commands, publish decisions, PR workflow, and pre-merge review.

For scoring criteria, see [review-rubric.md](./review-rubric.md).

---

## Repo Structure

```
pm-experiment-studio/
├── projects/          # Published work. Quality bar enforced.
├── scratch/           # In-progress and exploratory. No bar.
├── prompts/           # Reusable LLM prompts and the idea matrix.
├── styles/            # style-matrix.yaml — 12 visual identities.
├── schemas/           # JSON schema for manifest.json validation.
├── scripts/           # Validation, scaffolding, index generation.
├── templates/         # Starter files copied by the scaffold script.
├── docs/              # This file and other process documentation.
└── .github/workflows/ # CI — validate-projects.yml runs on PRs.
```

**`/projects` vs `/scratch`:** The only structural difference is that `/projects` is validated in CI and indexed in the README. A project moves from `/scratch` to `/projects` when it clears the quality bar. The bar is: runs from clone, README complete, manifest valid, screenshot exists, decision log has real entries. When in doubt, it stays in scratch.

---

## What a Generated Project Looks Like

Each project is a self-contained folder:

```
projects/YYYY-MM-DD-project-slug/
├── README.md           # 12 required sections (see templates/PROJECT_TEMPLATE/README.md)
├── manifest.json       # Metadata — validated against schemas/project-manifest.schema.json
├── decision-log.md     # Design and scope decisions, not a changelog
├── screenshots/        # At least one .png/.jpg/.webp with real data visible
└── src/                # Source code (or equivalent)
```

**Folder naming:** date-prefixed, slug-suffixed — `2026-03-14-okr-health-scorer`. The `slug` field in `manifest.json` must match the part after the date prefix.

**manifest.json required fields:** `name`, `slug`, `date_created`, `bucket`, `persona`, `problem_statement`, `complexity`, `artifact_type`, `style_direction`, `stack`, `status`, `publish_recommendation`, `tags`. See the schema for allowed enum values.

**README required sections:** Goal, Problem, Why This Exists, Target Persona, Use Cases, Barebones Wireframe, Product Decisions, Tech Stack, How to Run, Screenshots, Future Enhancements, Decision Log.

---

## Running Validation

Requires Python 3.9+. No packages to install.

```bash
# Validate all projects
python scripts/validate_repo.py

# Validate one project by slug
python scripts/validate_repo.py --project okr-health-scorer

# Strict mode — warnings become errors (same as CI)
python scripts/validate_repo.py --strict

# No ANSI color (for piping or logging)
python scripts/validate_repo.py --no-color
```

**Output levels:**
- `[ERR]` — must fix before publishing. CI will fail.
- `[WARN]` — should fix. Fails CI in strict mode.
- `[OK]` / `[INFO]` — no action needed.

**What it checks:** required files, all 13 manifest fields, enum values, slug/folder match, date format, cross-field consistency (`status` ↔ `publish_recommendation`, `has_demo` ↔ `demo_url`), screenshot path existence, placeholder detection, README section coverage, duplicate slugs, and diversity patterns (same bucket or style 3+ times in a row).

---

## Regenerating the Project Index

The README contains a generated table between two HTML comment markers. After adding, updating, or archiving any project:

```bash
python scripts/generate_index.py
```

Preview without writing:

```bash
python scripts/generate_index.py --dry-run
```

Sort by a different field:

```bash
python scripts/generate_index.py --sort bucket    # group by area
python scripts/generate_index.py --sort name      # alphabetical
python scripts/generate_index.py --sort complexity
```

CI will fail if a PR touches `/projects` but the index in `README.md` wasn't regenerated. Run the above command locally and commit the result before pushing.

---

## Publish vs Scratch

**Publish (`/projects`)** when all of the following are true:
- The tool runs from a clean clone
- `manifest.json` validates without errors
- All 12 README sections are present and filled (no placeholder text)
- At least one screenshot exists with realistic data visible
- `decision-log.md` has at least two genuine entries — decisions with real alternatives, not observations
- The review rubric score is 18/30 or above with no category scoring a 1

**Scratch (`/scratch`)** when any of the following are true:
- The tool doesn't run, or requires undocumented setup
- The problem statement is generic enough to apply to 10 different tools
- The concept duplicates an existing published project without a meaningfully different angle
- The decision log entries are post-hoc rationalizations rather than real decisions
- The demo state uses placeholder data (Lorem ipsum, John Doe, sequential numbers)

When routing to scratch, update `manifest.json`:
```json
"status": "draft",
"publish_recommendation": "scratch"
```

Add one entry to `decision-log.md` naming what blocked publication and what would change it. This keeps the work recoverable.

**Archiving:** Change `status` to `"archived"` in `manifest.json`. Add a note to the project README. Do not delete — archived projects remain in the index with strikethrough formatting and are part of the record.

---

## PR Workflow

```bash
# 1. Create a branch
git checkout -b project/okr-health-scorer

# 2. Scaffold (if starting fresh)
node scripts/scaffold.js --name "OKR Health Scorer" --dest scratch

# 3. Build the project, fill in README and manifest, take screenshots

# 4. Move to /projects when ready (or keep in /scratch if not yet cleared)
mv scratch/okr-health-scorer projects/2026-03-14-okr-health-scorer

# 5. Run validation
python scripts/validate_repo.py --strict

# 6. Regenerate the index
python scripts/generate_index.py

# 7. Stage and commit
git add projects/2026-03-14-okr-health-scorer README.md
git commit -m "Add OKR Health Scorer"

# 8. Open a PR against main
```

**PR title:** the project name.

**PR body:** use the template in `prompts/replit-master-prompt.md` — it includes the diversity check, quality gate checklist, and "What Was Left Out" section. Don't skip this; it's what makes the PR reviewable.

**Merging:** squash merge to keep history clean. Commit message: `Add [Project Name]` with one sentence describing what it does and who it's for.

---

## Reviewing a Generated Project Before Merging

Use [review-rubric.md](./review-rubric.md) to score the project across six categories (originality, usefulness, polish, visual distinctiveness, PM clarity, demo-worthiness) on a 1–5 scale.

**Score thresholds:**

| Score | Action |
|-------|--------|
| 24–30 | Merge to `/projects` |
| 18–23 | Merge with a note in the decision log about the weak category |
| 12–17 | Hold — fix the lowest-scoring categories first, stay in `/scratch` |
| Below 12 | Scratch — document what failed, don't delete |

**Hard blocks — route to scratch regardless of score:**
- Any category scores a 1
- Tool doesn't run
- Demo state has placeholder data
- Problem statement is generic

**Quick check for AI-generated sameness** (fast scan before scoring):
- Does the README "Why This Exists" section name a specific failure mode, or describe a general category of problem?
- Does the decision log show a moment where the builder changed their mind?
- Does the sample data look like something a real user might have typed?
- Does the visual design follow the declared `style_direction`, or does it look like default framework output?

If any of these fail the smell test, read more carefully before merging.

---

## Scripts Reference

| Script | Language | Run with |
|--------|----------|----------|
| `scripts/validate_repo.py` | Python 3.9+ | `python scripts/validate_repo.py` |
| `scripts/generate_index.py` | Python 3.9+ | `python scripts/generate_index.py` |
| `scripts/scaffold.js` | Node.js | `node scripts/scaffold.js --name "..."` |
| `scripts/build-index.js` | Node.js | `node scripts/build-index.js` |
| `scripts/validate.js` | Node.js | Legacy — use `validate_repo.py` instead |

Full flags and options are documented in the `--help` output and in each script's header comment.

---

## Pre-push Checklist

Run this before opening any PR that touches `/projects`:

```bash
python scripts/validate_repo.py --strict --no-color \
  && python scripts/generate_index.py --no-color \
  && git diff --exit-code README.md \
  && echo "Ready to push."
```

If all three pass, CI will pass.
