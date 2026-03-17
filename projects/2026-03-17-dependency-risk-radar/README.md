# Dependency Risk Radar

> A paste-and-triage dependency risk report that turns a `package.json` or `requirements.txt` into a prioritized upgrade/due-diligence checklist.

**Status:** `draft`
**Complexity:** `complex`
**Bucket:** `pm-productivity`

---

## Goal

Help a PM or tech lead produce a defensible “what could go wrong if we upgrade/switch vendors?” dependency triage in under 10 minutes by surfacing maintenance signals, security exposure, and adoption momentum per package.

---

## Problem

Right before a major platform upgrade or a vendor switch, teams discover too late that “it’s just a version bump” hides real risk: an abandoned transitive dependency, a library with active CVEs, or a widely-used package whose ecosystem is healthy but whose current version is lagging. The failure mode is a PM or IC doing due diligence from scattered sources (GitHub, npm/PyPI, CVE databases) and ending up with an unprioritized list that doesn’t tell engineering what to fix first.

---

## Why This Exists

A static checklist can tell you what to look for, but not do the cross-referencing. This tool’s value is that it normalizes multiple signals (maintenance recency, known vulnerabilities, usage trend proxies) into a single triage view with a risk tier and a “next action” per dependency, so a non-security specialist can route work (upgrade, replace, accept risk, or investigate) without building a one-off spreadsheet every time.

---

## Target Persona

A PM or tech lead at a 50–500 person B2B SaaS company preparing a major framework/runtime upgrade (or vendor switch) without a dedicated AppSec partner available for every review.

---

## Use Cases

- A PM pastes the repo’s `package.json` before committing to a “React 18 + build tooling refresh” quarter and needs a shortlist of packages likely to break or slow the effort.
- A tech lead evaluating a vendor SDK replacement uses it to identify risky/abandoned libraries embedded in the current integration.
- An engineering manager preparing a dependency upgrade sprint uses the risk tiers to split work into “must do now” vs “monitor.”
- A PM doing post-incident follow-up checks whether the incident’s dependency had known CVEs or clear “stale maintenance” signals that were missed.

---

## Barebones Wireframe

```
┌──────────────────────────────────────────────────────────────────────┐n│ Dependency Risk Radar                                                 │
│ Style: high-contrast-command (keyboard-first, terminal-like clarity)   │
├──────────────────────────────────────────────────────────────────────┤
│ INPUT                                                                 │
│ [Tabs]  package.json  |  requirements.txt                             │
│                                                                      │
│ [Paste area]                                                         │
│                                                                      │
│ Options:                                                             │
│  [ ] Include devDependencies                                         │
│  [ ] Include transitive (if lockfile pasted)  (disabled in v1)       │
│  Registry: (auto) npm / PyPI                                         │
│                                                                      │
│ [ Generate Radar ]                                                   │
├──────────────────────────────────────────────────────────────────────┤
│ TRIAGE SUMMARY                                                       │
│  High: 3   Medium: 7   Low: 12   Unknown: 4                          │
│  "Top 5 to look at first" (risk + usage weight)                       │
├──────────────────────────────────────────────────────────────────────┤
│ TABLE (sortable)                                                     │
│ Package | Current | Latest | Last release | CVEs | Trend | Tier | Next│
│ ------- | ------- | ------ | ------------ | ---- | ----- | ---- | ----│
│ axios   | 0.27.2  | 1.6.7  | 18d          | 0    | ↑     | Low  | Upgrade|
│ request | 2.88.2  | —      | 6y           | 2    | ↓     | High | Replace|
│ ...                                                                  │
├──────────────────────────────────────────────────────────────────────┤
│ DETAIL DRAWER (on row click)                                         │
│ Signals: maintenance, security, adoption                             │
│ Evidence links: GitHub repo, npm/PyPI page, CVE refs                 │
│ "Decision note" field (local only) + Copy triage markdown            │
└──────────────────────────────────────────────────────────────────────┘
```

---

## Product Decisions

- **Risk tiers are evidence-backed, not “smart”:** The tool assigns High/Medium/Low/Unknown based on explicit thresholds (e.g., last release age + CVE presence) and shows the signals used. Alternative was an opaque score; rejected because due diligence needs explainability.
- **Output is triage-first (Next Action column):** Each dependency gets a recommended next step (Upgrade / Replace / Investigate / Accept) so the table can be turned into a work queue. Alternative was only surfacing raw metrics; rejected because it still forces the user to decide per row.
- **Two input modes (package.json vs requirements.txt) instead of “upload anything”:** Constraining inputs reduces parsing ambiguity and keeps the mental model clear. Alternative was auto-detecting many formats (lockfiles, poetry, pipenv); rejected for v1 because parsing edge cases would dominate the build.
- **Unknown is a first-class tier:** If signals can’t be fetched (private repo, rate limits), the tool doesn’t guess; it flags Unknown and suggests what to check manually. Alternative was falling back to “Low”; rejected because it hides risk.

---

## Tech Stack

- **Runtime:** Node.js 20 + TypeScript — needed for server-side API aggregation and consistent parsing
- **Framework:** Express + Vite (vanilla TS client) — minimal backend for fetch + a fast static front-end build
- **AI/API:** None — the output is deterministic and explainable
- **Styling:** Custom CSS implementing `high-contrast-command` style direction
- **Data:** None — stateless per run; optional local-only “decision notes” stored in browser memory (not persisted)
- **Deployment:** Local run (prototype); can be deployed to any Node host after adding env vars

---

## How to Run

**Prerequisites:** Node.js 20+

```bash
# Clone
git clone [repo-url]
cd projects/[folder-name]

# Install
npm install

# Configure
cp .env.example .env
# Add:
# - GITHUB_TOKEN (optional but recommended) for higher rate limits
# - OSV_API_BASE (optional; defaults to https://api.osv.dev)

# Run
npm run dev
```

**Open:** http://localhost:5173

---

## Screenshots

![Screenshot](./screenshots/screenshot.png)

*Triage table showing a mixed-risk dependency set from a realistic `package.json`, with top issues highlighted and evidence links visible in the detail drawer.*

---

## Future Enhancements

- **Lockfile support (transitive graph):** Pull in `package-lock.json` / `poetry.lock` to surface risky transitive dependencies. Deferred because dependency graph parsing and deduplication adds significant complexity beyond the core “direct deps triage” loop.
- **Org policy overlays:** Allow a simple policy file (e.g., “no GPL”, “min maintenance recency”) that changes tiers and next actions. Deferred because it needs validation on what policies are common across teams.
- **Export formats:** Export to CSV/Jira-ready markdown with owner assignment hints. Deferred because the prototype should validate the table schema first.
- **Rate-limit and caching layer:** Cache registry lookups to avoid repeated calls across runs. Deferred because it introduces persistence and cache invalidation decisions.

---

## Decision Log

See [decision-log.md](./decision-log.md) for a full record of design and scoping decisions.
