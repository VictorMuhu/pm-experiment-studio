# Fix Verification Run

> A stress-test harness that generates a style-driven “project pack” (README + manifest + decision log) in one run, so you can verify rich file output without hitting the 8192-token ceiling.

**Status:** `draft`
**Complexity:** `complex`
**Bucket:** `pm-productivity`

---

## Goal

Prove that the style-matrix directives can reliably produce multiple long-form, high-fidelity artifacts (with real content density) while staying under the 8192-token limit, and make failures diagnosable in under 2 minutes.

---

## Problem

When a generator tries to output a full project (README, manifest, decision log, plus style compliance notes) in one response, it can silently truncate or compress content to avoid the 8192-token limit—resulting in broken files, missing sections, or generic filler that looks “fine” until someone tries to publish it.

---

## Why This Exists

A checklist can’t catch partial outputs, style drift, or “looks complete but missing constraints” failures. This tool produces a deliberately content-heavy, style-specific project pack and then validates that every required section exists, meets minimum richness heuristics (length, structure, specificity), and fits within the configured token budget—turning a fuzzy prompt-quality concern into a repeatable, measurable run.

---

## Target Persona

A PM or builder maintaining a portfolio repo at a small team (or solo) who needs high-confidence, repeatable generation runs without babysitting output truncation or manually diffing files.

---

## Use Cases

- A maintainer runs a “verification pack” before merging changes to prompts or style-matrix rules.
- A contributor tests whether a new style direction (retro-future) still yields complete, non-generic artifacts.
- A PM validates that complex projects can be generated as multi-file outputs without losing required sections.
- A reviewer reproduces a suspected truncation issue using a known heavy-content fixture.

---

## Barebones Wireframe

```
┌───────────────────────────────────────────────────────────────┐
│ Fix Verification Run                                          │
│ Token budget: [ 8192 ]  Output mode: [ Multi-file pack ▼ ]    │
├───────────────────────────────────────────────────────────────┤
│ 1) Scenario (choose one)                                      │
│   (•) “Complex pack” (README+manifest+decision log)           │
│   ( ) “Style compliance pack” (UI spec + components)          │
│   ( ) “Worst-case copy” (dense sample data)                   │
│                                                               │
│ 2) Style direction                                            │
│   Style ID: [ retro-future ] (locked)                         │
│                                                               │
│ 3) Generate                                                   │
│   [ Run generation ]   [ Run with chunking ]                  │
├───────────────────────────────────────────────────────────────┤
│ RESULTS                                                       │
│ Token estimate: 7,430     Safety margin: 762                  │
│ Files produced: 3/3       Required sections: 100%             │
│ Richness checks: PASS     Style checks: PASS                  │
│                                                               │
│ README.md          ✅  View | Copy                            │
│ manifest.json      ✅  View | Copy                            │
│ decision-log.md    ✅  View | Copy                            │
│                                                               │
│ Diagnostics                                                   │
│ - Missing sections: none                                      │
│ - Overlong sections: none                                     │
│ - Generic-language flags: 1 ("seamless")                       │
└───────────────────────────────────────────────────────────────┘
```

---

## Product Decisions

- **Pack-first verification (not prompt preview):** The output is a full project pack (README + manifest + decision log) rather than a single “sample” so truncation shows up as broken deliverables. Alternative was a single combined preview; rejected because it hides file-level failure modes.
- **Measurable heuristics over subjective review:** The tool checks for required headings, minimum section density, and “generic language” flags. Alternative was manual review; rejected because regressions would slip through during busy review cycles.
- **Retro-future style is locked for this experiment:** The style direction is fixed to retro-future to validate the style-matrix pipeline end-to-end. Alternative was style selection; rejected because variability obscures whether failures are budget- or style-driven.
- **Two run modes (single-shot vs chunked):** A chunked mode is included to prove a mitigation path if single-shot fails. Alternative was only single-shot; rejected because the experiment needs a clear next action when it breaks.

---

## Tech Stack

- **Runtime:** Node.js 20+ — straightforward file generation + validation scripts
- **Framework:** none — a small static UI plus a local Node runner to keep scope tight
- **AI/API:** none — this experiment is about verifying output structure and token budgeting, not model quality
- **Styling:** Custom CSS following the `retro-future` style direction
- **Data:** none — stateless runs, output copied out
- **Deployment:** local run (npm scripts); optional static hosting for the UI

---

## How to Run

**Prerequisites:** Node.js 20+.

```bash
# Clone
git clone [repo-url]
cd projects/[folder-name]

# Install
npm install

# Run
npm run dev
```

**Open:** http://localhost:5173

---

## Screenshots

![Screenshot](./screenshots/screenshot.png)

*Results view showing a passing “complex pack” run with token margin, file completeness, and diagnostics.*

---

## Future Enhancements

- **CI token-regression gate:** Run the pack in GitHub Actions and fail PRs when richness or completeness drops. Deferred because it requires repo-wide CI conventions.
- **Configurable style sweep:** Run the same pack across all styles to detect style-specific verbosity issues. Deferred because it expands runtime and review surface.
- **More precise token counting:** Use provider-specific tokenization to replace heuristic estimates. Deferred because it introduces model/vendor coupling.
- **Golden-file diffs:** Store canonical outputs and show diffs for regressions. Deferred because the repo currently optimizes for standalone projects, not snapshot testing.

---

## Decision Log

See [decision-log.md](./decision-log.md) for a full record of design and scoping decisions.
