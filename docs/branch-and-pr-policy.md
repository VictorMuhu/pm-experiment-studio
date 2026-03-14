# Branch and PR Policy

Lightweight rules for how generated projects move from branch to main.

---

## Branches

All project work happens on a branch. Nothing project-related lands directly on `main`.

**Naming convention:**

| Change type | Branch name |
|-------------|-------------|
| New project | `project/[slug]` |
| Update to existing project | `update/[slug]-[what-changed]` |
| Scratch-to-projects promotion | `publish/[slug]` |
| Docs, scripts, templates, schemas | `meta/[short-description]` |

Examples:
```
project/okr-health-scorer
update/okr-health-scorer-add-screenshot
publish/funnel-drop-hypothesis-engine
meta/update-review-rubric
```

One project per branch. If two projects are generated in the same session, open two PRs.

---

## Commit Messages

Single-line imperative format. Enough context to understand the commit without reading the diff.

**Format:**
```
[Verb] [what] — [one clause of context if needed]
```

**Examples:**
```
Add OKR Health Scorer
Update Funnel Drop Engine — fix hypothesis categorization logic
Promote NPS Verbatim Categorizer to /projects
Add screenshot to Win-Loss Pattern Extractor
Fix manifest slug mismatch in Support Ticket Clusterer
Regenerate project index
```

**Do not:**
- Start with a lowercase letter
- End with a period
- Write `Update files`, `Fix stuff`, `WIP`, or any message that requires reading the diff to understand
- Include AI attribution in the commit message

Squash on merge. The PR title becomes the merge commit message — make it count.

---

## PR Titles

Match the commit message style. The PR title is the merge commit message after squash.

```
Add [Project Name]
Promote [Project Name] to /projects
Update [Project Name] — [one clause describing what changed]
Archive [Project Name]
```

No brackets, no ticket numbers, no emoji unless the repo style evolves to include them.

---

## What Must Be Checked Before Merge

All three must pass. No exceptions for "almost there" or "I'll fix it in a follow-up."

**1. CI passes.**
The `validate-projects` workflow must be green. This covers manifest validation, README section coverage, screenshot presence, and index freshness. If CI is red, the PR is not ready.

**2. Review rubric score is 18/30 or above.**
Score the project using `docs/review-rubric.md` before approving. Record the score and the weakest category in the PR description or in a comment. A score below 18 is not a merge with a note — it is a revision or a scratch routing.

**3. The tool runs.**
Pull the branch locally and run the project from a clean state. Do not merge a tool you have not personally verified runs. A project that looks complete but silently fails is worse than a draft.

---

## When to Reject or Revise

**Revise** when the issues are mechanical and fixable without reconsidering the concept:
- Manifest has missing or invalid fields
- README sections are present but contain placeholder text
- Screenshot is missing or shows an empty/default state
- Decision log entries are shallow but the underlying decisions are sound
- CI fails on a specific, addressable error

**Reject (route to `/scratch`)** when the issues are structural:
- The tool does not solve the stated problem in a usable way
- The problem statement is generic — could describe 10 different tools
- The concept duplicates an existing published project without a different angle
- The demo state contains obviously fake data (`John Smith`, `Item 1`, lorem ipsum)
- Any rubric category scores a 1
- The decision log reads as post-hoc rationalization rather than real decisions

When rejecting, do not close the branch. Update `manifest.json` to `"status": "draft", "publish_recommendation": "scratch"`, move the folder to `/scratch` if it was in `/projects`, add a decision log entry explaining what blocked publication, and close the PR with a note. The work is preserved; the quality bar is maintained.

---

## Direct Push to Main

Acceptable only for:
- Fixing a broken link or typo in a doc file (`docs/`, `README.md`)
- Updating `.gitignore`
- Regenerating the project index after a merge that forgot to (`python scripts/generate_index.py && git add README.md`)

Not acceptable for:
- Any change to a file inside `projects/` or `scratch/`
- Any change to `schemas/`, `scripts/`, `templates/`, or `.github/`
- Anything that would modify a project's manifest, source, or docs

If in doubt, open a `meta/` branch. The overhead is one command and the protection is real.

---

## Summary

```
branch → commit → PR → CI green + rubric ≥ 18 + tool verified → squash merge
```

The steps exist because a portfolio of generated projects is only worth maintaining if the published bar means something. A fast merge of a weak project degrades every other project in the index.
