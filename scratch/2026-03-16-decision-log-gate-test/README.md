# Decision Log Gate Test

> A small gating harness that detects “template-y” decision logs (placeholders, bracket prompts, vague trade-offs) and returns a publish vs. scratch recommendation with specific fixes.

**Status:** `published`
**Complexity:** `intermediate`
**Bucket:** `customer-experience`

---

## Goal

A CX ops lead should be able to paste a draft decision log and get a clear pass/fail verdict in under 60 seconds, with actionable reasons that explain what would block publication.

---

## Problem

When a repo relies on decision logs to prove product judgment, reviewers waste time on logs that are mostly template text (“[Trade-off 1 title]”, “out of scope”, “kept it simple”) and only discover it late in review. The failure mode is a PR that looks “complete” structurally but contains non-decisions, which undermines trust in the portfolio and causes inconsistent publish/scratch routing.

---

## Why This Exists

A static checklist can tell you what sections exist, but it can’t reliably flag the subtle failure mode of “content that technically fills the template but communicates no real trade-off.” This tool makes the gate concrete by scoring decision-log specificity (real nouns, reasons tied to persona, and falsifiable trade-offs) and producing a reviewer-friendly diff of what to rewrite.

---

## Target Persona

A PM running a portfolio repo (or a CX ops lead maintaining internal standards) who needs consistent, repeatable quality gates without reading every submission line-by-line.

---

## Use Cases

- A repo maintainer pastes a contributor’s decision-log draft to see if it’s publishable before spending time on code review.
- A contributor runs their decision log through the gate to learn what “real decisions” look like before opening a PR.
- A reviewer uses the flagged reasons as PR feedback bullets (“replace placeholders,” “name an alternative,” “tie to persona constraint”).
- A maintainer calibrates standards by comparing two logs (one real, one template-like) and ensuring only the real one passes.

---

## Barebones Wireframe

```
┌──────────────────────────────────────────────────────────────┐
│ Decision Log Gate Test                                       │
│ Style: dense-analyst-console                                 │
├──────────────────────────────────────────────────────────────┤
│ INPUT                                                       │
│ [ Paste decision-log.md content here…                    ]   │
│ [ Run Gate ]   [ Load “Template-like” Example ] [ Clear ]    │
├──────────────────────────────────────────────────────────────┤
│ RESULTS                                                     │
│ Verdict:  SCRATCH  |  Score: 42/100                          │
│ Blocking issues (hard fails):                                │
│  - Placeholder tokens detected: "[Trade-off 1 title]"         │
│  - Generic reasons: "out of scope" (no constraint named)     │
│  - No concrete persona constraint referenced                 │
│                                                             │
│ Quality signals (soft):                                      │
│  - Trade-offs mention alternatives? 1/3                      │
│  - Cut items have specific reasons? 0/3                      │
│                                                             │
│ Fix list (copy/paste ready):                                 │
│  1) Replace bracket placeholders with real titles             │
│  2) For each cut item, add "because" tied to the use case     │
│  3) Add one constraint sentence (time, privacy, no backend)   │
└──────────────────────────────────────────────────────────────┘
```

---

## Product Decisions

- **Hard-fail on placeholders and template markers:** The gate fails immediately if it finds bracket placeholders, “lorem ipsum,” or instructions text. Alternative was to merely subtract points; rejected because placeholder content is a known quality hard stop.
- **Verdict + reasons over a single numeric score:** The tool outputs a clear routing recommendation (Publish vs. Scratch) plus the specific blocking checks. Alternative was score-only; rejected because a reviewer needs defendable reasons, not a number.
- **Checks tuned for “decision-ness,” not grammar:** The heuristics prioritize alternatives, consequences, and persona constraints. Alternative was readability metrics; rejected because a well-written log can still be content-free.
- **One-screen, paste-and-run flow:** The interaction is intentionally minimal to fit maintainer workflow. Alternative was a multi-step wizard; rejected because gating should be faster than reviewing the PR.

---

## Tech Stack

- **Runtime:** Vanilla JavaScript — fast iteration and easy to run locally without setup
- **Framework:** none — static single-page tool
- **AI/API:** none — deterministic heuristics so the gate is consistent and doesn’t require keys
- **Styling:** Custom CSS following the `dense-analyst-console` style spec
- **Data:** none — stateless by default (no persistence)
- **Deployment:** Static hosting (GitHub Pages / Netlify drop)

---

## How to Run

**Prerequisites:** None.

```bash
# Clone
git clone [repo-url]
cd projects/[folder-name]

# Install (if applicable)
No install required.

# Run
# Option A: open the file directly
# Option B: serve locally (recommended)
python3 -m http.server 5173
```

**Open:** `http://localhost:5173` (or open `index.html` directly).

---

## Screenshots

Screenshot pending — see screenshots/PENDING.md for capture instructions.

---

## Future Enhancements

- **Repo-aware calibration mode:** Load all project decision logs and show baseline distributions. Deferred because it requires file system access or a build step.
- **Inline “rewrite suggestions” panel:** Provide example rewrites for each failed check. Deferred to avoid turning the tool into a writing assistant instead of a gate.
- **Configurable standards:** Let maintainers adjust thresholds and banned phrases per repo. Deferred because a fixed rubric is better for early consistency.

---

## Decision Log

See [decision-log.md](./decision-log.md) for a full record of design and scoping decisions.
